import { env } from "cloudflare:workers";
import { buildContactEmail, validateContact, MAX_BODY_BYTES } from "../../../src/lib/contact-message";
import { sendContactEmail } from "../../../src/lib/resend";
import { checkRateLimit, clientKeyFromRequest, type RateLimitBinding } from "../../../src/lib/rate-limit";

interface ContactEnv {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_RATELIMIT?: RateLimitBinding;
}

const SUCCESS_MESSAGE = "Mensagem enviada com sucesso.";
const GENERIC_ERROR = "Não foi possível enviar a mensagem. Tente novamente.";
const RATE_LIMIT_MESSAGE =
  "Muitas tentativas em um curto período. Aguarde um instante e tente novamente.";

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

/**
 * Loga apenas um resumo técnico, sem incluir a mensagem ou dados pessoais
 * completos do visitante. Nunca registra o valor de `RESEND_API_KEY`.
 */
function logFailure(context: string, detail?: string): void {
  console.error(`[contact] ${context}${detail ? ` :: ${detail}` : ""}`);
}

/** Retorna os nomes (não valores) das variáveis de ambiente ausentes. */
function missingEnvVars(config: ContactEnv): string[] {
  const missing: string[] = [];
  if (!config.RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!config.CONTACT_TO_EMAIL) missing.push("CONTACT_TO_EMAIL");
  if (!config.CONTACT_FROM_EMAIL) missing.push("CONTACT_FROM_EMAIL");
  return missing;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const config = env as unknown as ContactEnv;

    // Configuração ausente é falha de servidor (500), não do visitante.
    // Logamos apenas os NOMES das variáveis ausentes, nunca seus valores.
    const missing = missingEnvVars(config);
    if (missing.length > 0) {
      logFailure("missing_env", `ausentes=[${missing.join(", ")}]`);
      return json({ ok: false, message: GENERIC_ERROR }, 500);
    }

    // Rate limiting distribuído (quando a binding estiver configurada).
    const rate = await checkRateLimit(config.CONTACT_RATELIMIT, clientKeyFromRequest(request));
    if (!rate.allowed) {
      return json({ ok: false, message: RATE_LIMIT_MESSAGE }, 429);
    }

    // Limita o tamanho do corpo antes de interpretar.
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return json({ ok: false, message: "Requisição muito grande." }, 400);
    }

    let raw: string;
    try {
      raw = await request.text();
    } catch {
      return json({ ok: false, message: "Requisição inválida." }, 400);
    }
    if (raw.length > MAX_BODY_BYTES) {
      return json({ ok: false, message: "Requisição muito grande." }, 400);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return json({ ok: false, message: "Requisição inválida." }, 400);
    }

    const validation = validateContact(parsed);
    if (!validation.ok) {
      return json({ ok: false, message: validation.message }, validation.status);
    }

    // `from` usa o remetente verificado (CONTACT_FROM_EMAIL). O e-mail do
    // visitante vai apenas como `reply_to`, montado em buildContactEmail.
    const email = buildContactEmail(validation.data);
    const result = await sendContactEmail(
      {
        apiKey: config.RESEND_API_KEY!,
        from: config.CONTACT_FROM_EMAIL!,
        to: config.CONTACT_TO_EMAIL!,
      },
      email,
    );

    if (!result.ok) {
      logFailure("send_failed", result.internalError);
      if (result.status === 429) {
        return json({ ok: false, message: RATE_LIMIT_MESSAGE }, 429);
      }
      // 5xx do provedor = indisponibilidade (502); 4xx = configuração nossa (500).
      return json({ ok: false, message: GENERIC_ERROR }, result.status);
    }

    return json({ ok: true, message: SUCCESS_MESSAGE }, 200);
  } catch (error) {
    // Rede de segurança: nenhuma exceção inesperada deve vazar stack/credencial.
    logFailure("unhandled", error instanceof Error ? error.message : "unknown");
    return json({ ok: false, message: GENERIC_ERROR }, 500);
  }
}

/** Métodos não suportados retornam 405 com o header Allow. */
export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({ ok: false, message: "Método não permitido." }),
    { status: 405, headers: { "Content-Type": "application/json; charset=utf-8", Allow: "POST" } },
  );
}

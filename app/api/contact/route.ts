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
 * completos do visitante.
 */
function logFailure(context: string, detail?: string): void {
  console.error(`[contact] ${context}${detail ? ` :: ${detail}` : ""}`);
}

export async function POST(request: Request): Promise<Response> {
  const config = env as unknown as ContactEnv;

  // Configuração ausente é falha de servidor, não do visitante.
  if (!config.RESEND_API_KEY || !config.CONTACT_TO_EMAIL || !config.CONTACT_FROM_EMAIL) {
    logFailure("missing_env", "RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL");
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

  const email = buildContactEmail(validation.data);
  const result = await sendContactEmail(
    {
      apiKey: config.RESEND_API_KEY,
      from: config.CONTACT_FROM_EMAIL,
      to: config.CONTACT_TO_EMAIL,
    },
    email,
  );

  if (!result.ok) {
    logFailure("send_failed", result.internalError);
    if (result.status === 429) {
      return json({ ok: false, message: RATE_LIMIT_MESSAGE }, 429);
    }
    return json({ ok: false, message: GENERIC_ERROR }, result.status >= 500 ? 502 : 502);
  }

  return json({ ok: true, message: SUCCESS_MESSAGE }, 200);
}

/** Métodos não suportados retornam 405 com o header Allow. */
export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({ ok: false, message: "Método não permitido." }),
    { status: 405, headers: { "Content-Type": "application/json; charset=utf-8", Allow: "POST" } },
  );
}

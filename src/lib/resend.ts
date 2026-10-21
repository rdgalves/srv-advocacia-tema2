/**
 * Cliente mínimo para a API HTTP do Resend, baseado em `fetch`, sem SDK.
 * Distingue falha de credencial/integração de aceitação do provedor.
 */
import type { BuiltEmail } from "./contact-message";

export interface ResendConfig {
  apiKey: string;
  from: string;
  to: string;
}

export interface SendEmailResult {
  /** `true` apenas quando o Resend aceitou o envio (HTTP 2xx com id). */
  ok: boolean;
  /** Id da mensagem retornado pelo Resend quando aceito. */
  id?: string;
  /** Status HTTP agregado para o cliente da API (não exposto ao visitante). */
  status: number;
  /** Mensagem interna para log; nunca exposta ao navegador. */
  internalError?: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Envia o e-mail de contato via Resend.
 *
 * @param fetchImpl permite injetar um fetch mockado nos testes.
 */
export async function sendContactEmail(
  config: ResendConfig,
  email: BuiltEmail,
  fetchImpl: typeof fetch = fetch,
): Promise<SendEmailResult> {
  let response: Response;
  try {
    response = await fetchImpl(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        reply_to: email.replyTo,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
  } catch (error) {
    return {
      ok: false,
      status: 502,
      internalError: `resend_fetch_failed: ${
        error instanceof Error ? error.message : "unknown"
      }`,
    };
  }

  if (response.ok) {
    let id: string | undefined;
    try {
      const data = (await response.json()) as { id?: string };
      id = data?.id;
    } catch {
      // Corpo inesperado, mas status 2xx: tratamos como aceito mesmo assim.
    }
    return { ok: true, id, status: 200 };
  }

  // Erros de credencial/limite/validação do provedor não vazam ao visitante.
  let detail = "";
  try {
    detail = await response.text();
  } catch {
    // ignore
  }

  // 401/403 = credencial; 429 = limite; demais 4xx = requisição; 5xx = provedor.
  const mappedStatus = response.status === 429 ? 429 : response.status >= 500 ? 502 : 502;

  return {
    ok: false,
    status: mappedStatus,
    internalError: `resend_rejected status=${response.status} detail=${detail.slice(0, 200)}`,
  };
}

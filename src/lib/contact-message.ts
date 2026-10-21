/**
 * Lógica de domínio do formulário de contato: validação, limites e montagem
 * do e-mail. Mantida isolada do runtime do Cloudflare Workers para que possa
 * ser testada diretamente com `node --test` sem depender de bindings.
 */

/** Campos aceitos pelo formulário de contato. */
export interface ContactFields {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
}

/** Limites máximos de cada campo (em caracteres). */
export const FIELD_LIMITS = {
  name: 120,
  email: 200,
  phone: 40,
  company: 160,
  subject: 160,
  message: 4000,
} as const;

/** Nome do campo honeypot (deve permanecer vazio para humanos). */
export const HONEYPOT_FIELD = "website";

/** Tamanho máximo, em bytes, do corpo bruto aceito pela API. */
export const MAX_BODY_BYTES = 16 * 1024;

export type ValidationResult =
  | { ok: true; data: ContactFields }
  | { ok: false; status: 400; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

/**
 * Valida e normaliza os dados recebidos do formulário.
 *
 * - Verifica campos obrigatórios (nome, e-mail, assunto, mensagem).
 * - Valida o formato do e-mail.
 * - Aplica limites de tamanho por campo.
 * - Checa o honeypot: se preenchido, trata como spam e rejeita.
 */
export function validateContact(input: unknown): ValidationResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, status: 400, message: "Requisição inválida." };
  }

  const raw = input as Record<string, unknown>;

  // Honeypot: bots tendem a preencher todos os campos. Humanos não veem este.
  if (asString(raw[HONEYPOT_FIELD]).trim().length > 0) {
    return { ok: false, status: 400, message: "Não foi possível enviar a mensagem." };
  }

  const fields: ContactFields = {
    name: asString(raw.name).trim(),
    email: asString(raw.email).trim(),
    phone: asString(raw.phone).trim(),
    company: asString(raw.company).trim(),
    subject: asString(raw.subject).trim(),
    message: asString(raw.message).trim(),
  };

  const required: Array<keyof ContactFields> = ["name", "email", "subject", "message"];
  for (const key of required) {
    if (fields[key].length === 0) {
      return { ok: false, status: 400, message: "Preencha todos os campos obrigatórios." };
    }
  }

  if (!EMAIL_PATTERN.test(fields.email)) {
    return { ok: false, status: 400, message: "Informe um e-mail válido." };
  }

  for (const key of Object.keys(FIELD_LIMITS) as Array<keyof typeof FIELD_LIMITS>) {
    if (fields[key].length > FIELD_LIMITS[key]) {
      return {
        ok: false,
        status: 400,
        message: "Um dos campos excede o tamanho permitido.",
      };
    }
  }

  return { ok: true, data: fields };
}

/** Escapa caracteres especiais de HTML para impedir injeção. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface BuiltEmail {
  subject: string;
  html: string;
  text: string;
  replyTo: string;
}

/** Monta assunto, corpo HTML e texto simples do e-mail institucional. */
export function buildContactEmail(fields: ContactFields): BuiltEmail {
  const subject = `[Site SRV Advocacia] Novo contato - ${fields.subject}`;

  const rows: Array<[string, string]> = [
    ["Nome", fields.name],
    ["E-mail", fields.email],
    ["Telefone", fields.phone || "Não informado"],
    ["Empresa", fields.company || "Não informada"],
    ["Assunto", fields.subject],
  ];

  const detailRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b726b;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(
          label,
        )}</td><td style="padding:6px 0;color:#121712;font-size:14px;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const messageHtml = escapeHtml(fields.message).replace(/\r?\n/g, "<br />");

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#dfe2dc;padding:32px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d3d8d2;">
      <tr>
        <td style="background:#121712;padding:24px 28px;">
          <p style="margin:0;color:#8fb59f;text-transform:uppercase;letter-spacing:.16em;font-size:11px;">Salomão Rezende Veloso Advocacia</p>
          <p style="margin:8px 0 0;color:#ffffff;font-size:20px;">Novo contato pelo site</p>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            ${detailRows}
          </table>
          <p style="margin:24px 0 8px;color:#6b726b;text-transform:uppercase;letter-spacing:.12em;font-size:11px;">Mensagem</p>
          <div style="color:#121712;font-size:14px;line-height:1.6;">${messageHtml}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px;border-top:1px solid #e4e8e3;color:#9aa09a;font-size:12px;">
          Responda diretamente a este e-mail para falar com ${escapeHtml(fields.name)}.
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "Novo contato pelo site — Salomão Rezende Veloso Advocacia",
    "",
    `Nome: ${fields.name}`,
    `E-mail: ${fields.email}`,
    `Telefone: ${fields.phone || "Não informado"}`,
    `Empresa: ${fields.company || "Não informada"}`,
    `Assunto: ${fields.subject}`,
    "",
    "Mensagem:",
    fields.message,
  ].join("\n");

  return { subject, html, text, replyTo: fields.email };
}

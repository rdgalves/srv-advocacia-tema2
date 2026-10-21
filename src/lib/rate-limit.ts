/**
 * Rate limiting para o formulário de contato.
 *
 * Em produção no Cloudflare Workers usamos uma binding nativa de Rate Limiting
 * (`CONTACT_RATELIMIT`), que é distribuída e não depende de memória local do
 * isolate. Quando a binding não está configurada, o limitador degrada de forma
 * segura (não bloqueia), e a proteção fica a cargo do honeypot e da validação.
 *
 * Ver README para como habilitar a binding de Rate Limiting.
 */

/** Binding de Rate Limiting do Cloudflare (unsafe/ratelimit). */
export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface RateLimitResult {
  allowed: boolean;
  /** `false` quando nenhum limitador distribuído está ativo. */
  enforced: boolean;
}

/**
 * Consulta o limitador para a chave informada (ex.: IP do visitante).
 * Qualquer erro no limitador resulta em "permitido" para não derrubar o envio.
 */
export async function checkRateLimit(
  binding: RateLimitBinding | undefined,
  key: string,
): Promise<RateLimitResult> {
  if (!binding || typeof binding.limit !== "function") {
    return { allowed: true, enforced: false };
  }

  try {
    const { success } = await binding.limit({ key });
    return { allowed: success, enforced: true };
  } catch {
    return { allowed: true, enforced: false };
  }
}

/** Deriva uma chave de rate limit a partir dos headers da requisição. */
export function clientKeyFromRequest(request: Request): string {
  const headers = request.headers;
  const ip =
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  return `contact:${ip}`;
}

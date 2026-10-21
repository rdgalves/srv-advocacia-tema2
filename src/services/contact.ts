export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  /** Honeypot: deve permanecer vazio. Preenchido apenas por bots. */
  website?: string;
};

export type ContactResponse = { ok: boolean; message: string };

/**
 * Envia os dados do formulário para a API de contato (`POST /api/contact`).
 * Retorna sucesso somente quando a API confirma o aceite do provedor.
 */
export async function sendContact(payload: ContactPayload): Promise<ContactResponse> {
  let response: Response;
  try {
    response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
  }

  let data: Partial<ContactResponse> | null = null;
  try {
    data = (await response.json()) as Partial<ContactResponse>;
  } catch {
    data = null;
  }

  if (!response.ok || !data?.ok) {
    throw new Error(
      data?.message ?? "Não foi possível enviar a mensagem. Tente novamente.",
    );
  }

  return { ok: true, message: data.message ?? "Mensagem enviada com sucesso." };
}

export type ContactPayload = { name: string; email: string; phone?: string; company?: string; subject: string; message: string };

export async function sendContact(_payload: ContactPayload) {
  // Serviço isolado para futura integração com endpoint de contato.
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { ok: true };
}

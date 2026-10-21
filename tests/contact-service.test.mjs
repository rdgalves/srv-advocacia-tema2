import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import { sendContact } from "../src/services/contact.ts";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const payload = {
  name: "Ana Souza",
  email: "ana@example.com",
  subject: "Dúvida",
  message: "Mensagem de teste.",
};

test("sendContact retorna sucesso quando a API confirma o aceite", async () => {
  let captured;
  globalThis.fetch = async (url, init) => {
    captured = { url, init };
    return new Response(JSON.stringify({ ok: true, message: "Mensagem enviada com sucesso." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const result = await sendContact(payload);
  assert.equal(result.ok, true);
  assert.equal(result.message, "Mensagem enviada com sucesso.");
  assert.equal(captured.url, "/api/contact");
  assert.equal(captured.init.method, "POST");
  assert.deepEqual(JSON.parse(captured.init.body), payload);
});

test("sendContact lança erro quando a API retorna ok:false", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ ok: false, message: "Preencha todos os campos obrigatórios." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });

  await assert.rejects(sendContact(payload), /campos obrigatórios/);
});

test("sendContact lança erro em caso de 429 (rate limit)", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ ok: false, message: "Muitas tentativas." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });

  await assert.rejects(sendContact(payload), /Muitas tentativas/);
});

test("sendContact lança erro de conexão quando o fetch falha", async () => {
  globalThis.fetch = async () => {
    throw new Error("network down");
  };

  await assert.rejects(sendContact(payload), /conectar ao servidor/);
});

test("sendContact lança erro genérico quando a resposta não é JSON", async () => {
  globalThis.fetch = async () =>
    new Response("<html>502</html>", { status: 502, headers: { "Content-Type": "text/html" } });

  await assert.rejects(sendContact(payload), /Não foi possível enviar a mensagem/);
});

test("sendContact não limpa nem confirma em caso de servidor 500", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ ok: false, message: "Não foi possível enviar a mensagem. Tente novamente." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

  await assert.rejects(sendContact(payload), /Tente novamente/);
});

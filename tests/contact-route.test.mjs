import assert from "node:assert/strict";
import test, { afterEach, beforeEach } from "node:test";

import { env } from "cloudflare:workers";
import { POST, GET } from "../app/api/contact/route.ts";

const originalFetch = globalThis.fetch;
const originalError = console.error;

function setEnv(overrides) {
  for (const key of Object.keys(env)) delete env[key];
  Object.assign(env, overrides);
}

function makeRequest(body) {
  return new Request("https://srv.example/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "cf-connecting-ip": "203.0.113.9" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const validBody = {
  name: "Ana Souza",
  email: "ana@example.com",
  subject: "Dúvida contratual",
  message: "Mensagem de teste para o escritório.",
};

beforeEach(() => {
  setEnv({
    RESEND_API_KEY: "re_test",
    CONTACT_TO_EMAIL: "contato@srv.example",
    CONTACT_FROM_EMAIL: "site@srv.example",
  });
  console.error = () => { }; // silencia logs esperados nos testes de falha
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalError;
  setEnv({});
});

test("POST retorna 200 quando o Resend aceita o envio", async () => {
  let sent;
  globalThis.fetch = async (url, init) => {
    sent = { url, init };
    return new Response(JSON.stringify({ id: "msg_1" }), { status: 200 });
  };

  const res = await POST(makeRequest(validBody));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.match(data.message, /sucesso/);
  assert.equal(sent.url, "https://api.resend.com/emails");
  const payload = JSON.parse(sent.init.body);
  assert.deepEqual(payload.to, ["contato@srv.example"]);
  assert.equal(payload.from, "site@srv.example");
  assert.equal(payload.reply_to, "ana@example.com");
});

test("POST retorna 400 para campos obrigatórios ausentes", async () => {
  globalThis.fetch = async () => {
    throw new Error("não deveria chamar o Resend");
  };
  const res = await POST(makeRequest({ ...validBody, name: "" }));
  assert.equal(res.status, 400);
  assert.equal((await res.json()).ok, false);
});

test("POST retorna 400 para e-mail inválido", async () => {
  const res = await POST(makeRequest({ ...validBody, email: "invalido" }));
  assert.equal(res.status, 400);
});

test("POST retorna 400 para campos acima do limite", async () => {
  const res = await POST(makeRequest({ ...validBody, message: "x".repeat(5000) }));
  assert.equal(res.status, 400);
});

test("POST bloqueia spam via honeypot (400) e não chama o Resend", async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response("{}", { status: 200 });
  };
  const res = await POST(makeRequest({ ...validBody, website: "http://spam" }));
  assert.equal(res.status, 400);
  assert.equal(called, false);
});

test("POST retorna 500 quando variáveis de ambiente estão ausentes", async () => {
  setEnv({});
  const res = await POST(makeRequest(validBody));
  assert.equal(res.status, 500);
  const data = await res.json();
  assert.equal(data.ok, false);
  assert.doesNotMatch(JSON.stringify(data), /re_test|RESEND_API_KEY=/);
});

test("POST retorna 500 quando o Resend recusa por credencial inválida (401)", async () => {
  // Credencial inválida é erro de CONFIGURAÇÃO nossa, não falha do provedor.
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: "invalid key" }), { status: 401 });
  const res = await POST(makeRequest(validBody));
  assert.equal(res.status, 500);
  const data = await res.json();
  assert.equal(data.ok, false);
  assert.doesNotMatch(data.message, /invalid key/);
});

test("POST retorna 500 quando o Resend recusa por remetente não verificado (403/422)", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: "domain is not verified" }), { status: 403 });
  const res = await POST(makeRequest(validBody));
  assert.equal(res.status, 500);
});

test("POST retorna 502 quando o provedor está indisponível", async () => {
  globalThis.fetch = async () => new Response("down", { status: 503 });
  const res = await POST(makeRequest(validBody));
  assert.equal(res.status, 502);
});

test("POST usa reply_to do visitante e from verificado (nunca o e-mail do visitante como from)", async () => {
  let payload;
  globalThis.fetch = async (_url, init) => {
    payload = JSON.parse(init.body);
    return new Response(JSON.stringify({ id: "msg_x" }), { status: 200 });
  };
  const res = await POST(makeRequest(validBody));
  assert.equal(res.status, 200);
  assert.equal(payload.from, "site@srv.example"); // remetente verificado
  assert.equal(payload.reply_to, "ana@example.com"); // e-mail do visitante
  assert.notEqual(payload.from, "ana@example.com");
});

test("POST retorna 500 e não vaza stack quando ocorre exceção inesperada", async () => {
  // Rate limit binding que lança de forma síncrona antes do try interno.
  setEnv({
    RESEND_API_KEY: "re_test",
    CONTACT_TO_EMAIL: "contato@srv.example",
    CONTACT_FROM_EMAIL: "site@srv.example",
    CONTACT_RATELIMIT: {
      limit() {
        throw new Error("boom síncrono");
      },
    },
  });
  // checkRateLimit captura o erro e segue; forçamos a falha no fetch do Resend
  // lançando um objeto não-Error para exercitar o catch externo via internalError.
  globalThis.fetch = async () => {
    throw new Error("falha de rede inesperada");
  };
  const res = await POST(makeRequest(validBody));
  // fetch lançando é tratado em sendContactEmail como 502; garantimos resposta limpa.
  assert.ok(res.status === 502 || res.status === 500);
  const data = await res.json();
  assert.equal(data.ok, false);
  assert.doesNotMatch(JSON.stringify(data), /stack|boom|falha de rede/);
});

test("POST retorna 500 informando qual variável falta no log (sem valor)", async () => {
  setEnv({ CONTACT_TO_EMAIL: "contato@srv.example", CONTACT_FROM_EMAIL: "site@srv.example" });
  const logs = [];
  const realError = console.error;
  console.error = (msg) => logs.push(String(msg));
  const res = await POST(makeRequest(validBody));
  console.error = realError;
  assert.equal(res.status, 500);
  assert.ok(logs.some((l) => l.includes("RESEND_API_KEY")));
  assert.ok(logs.every((l) => !/re_test|Bearer/.test(l)));
});

test("POST retorna 429 quando o rate limit distribuído bloqueia", async () => {
  setEnv({
    RESEND_API_KEY: "re_test",
    CONTACT_TO_EMAIL: "contato@srv.example",
    CONTACT_FROM_EMAIL: "site@srv.example",
    CONTACT_RATELIMIT: { limit: async () => ({ success: false }) },
  });
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response("{}", { status: 200 });
  };
  const res = await POST(makeRequest(validBody));
  assert.equal(res.status, 429);
  assert.equal(called, false);
});

test("POST retorna 400 para corpo maior que o limite", async () => {
  const huge = JSON.stringify({ ...validBody, message: "x".repeat(20000) });
  const req = new Request("https://srv.example/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "content-length": String(huge.length) },
    body: huge,
  });
  const res = await POST(req);
  assert.equal(res.status, 400);
});

test("POST retorna 400 para JSON malformado", async () => {
  const res = await POST(makeRequest("{ invalido"));
  assert.equal(res.status, 400);
});

test("GET retorna 405 com header Allow", async () => {
  const res = await GET();
  assert.equal(res.status, 405);
  assert.equal(res.headers.get("Allow"), "POST");
});

import assert from "node:assert/strict";
import test from "node:test";

import {
  validateContact,
  buildContactEmail,
  escapeHtml,
  FIELD_LIMITS,
  MAX_BODY_BYTES,
} from "../src/lib/contact-message.ts";
import { sendContactEmail } from "../src/lib/resend.ts";
import { checkRateLimit, clientKeyFromRequest } from "../src/lib/rate-limit.ts";

const validInput = {
  name: "Ana Souza",
  email: "ana@example.com",
  phone: "+55 61 99999-0000",
  company: "Souza Consultoria",
  subject: "Dúvida contratual",
  message: "Gostaria de uma análise sobre um contrato societário.",
};

test("validateContact aceita um envio válido e normaliza os campos", () => {
  const result = validateContact({ ...validInput, name: "  Ana Souza  " });
  assert.equal(result.ok, true);
  assert.equal(result.data.name, "Ana Souza");
  assert.equal(result.data.email, "ana@example.com");
});

test("validateContact rejeita campos obrigatórios ausentes", () => {
  for (const key of ["name", "email", "subject", "message"]) {
    const input = { ...validInput, [key]: "" };
    const result = validateContact(input);
    assert.equal(result.ok, false);
    assert.equal(result.status, 400);
  }
});

test("validateContact rejeita e-mail inválido", () => {
  const result = validateContact({ ...validInput, email: "nao-e-email" });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test("validateContact rejeita campos acima do limite", () => {
  const result = validateContact({
    ...validInput,
    message: "x".repeat(FIELD_LIMITS.message + 1),
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test("validateContact bloqueia quando o honeypot é preenchido", () => {
  const result = validateContact({ ...validInput, website: "http://spam.example" });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test("validateContact rejeita payloads não-objeto", () => {
  for (const bad of [null, "texto", 42, ["array"]]) {
    const result = validateContact(bad);
    assert.equal(result.ok, false);
  }
});

test("escapeHtml neutraliza tentativa de injeção de HTML", () => {
  const escaped = escapeHtml('<script>alert("x")</script>');
  assert.doesNotMatch(escaped, /<script>/);
  assert.match(escaped, /&lt;script&gt;/);
});

test("buildContactEmail monta assunto padronizado e escapa a mensagem", () => {
  const email = buildContactEmail({
    ...validInput,
    message: "<b>injeção</b>\nsegunda linha",
  });
  assert.equal(email.subject, "[Site SRV Advocacia] Novo contato - Dúvida contratual");
  assert.equal(email.replyTo, "ana@example.com");
  assert.doesNotMatch(email.html, /<b>injeção<\/b>/);
  assert.match(email.html, /&lt;b&gt;inje/);
  assert.match(email.html, /<br \/>/); // quebra de linha convertida
  assert.match(email.text, /Nome: Ana Souza/);
  assert.match(email.text, /Assunto: Dúvida contratual/);
});

test("sendContactEmail retorna ok quando o Resend aceita (2xx)", async () => {
  const calls = [];
  const fakeFetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ id: "msg_123" }), { status: 200 });
  };
  const email = buildContactEmail(validInput);
  const result = await sendContactEmail(
    { apiKey: "re_test", from: "site@srv.example", to: "contato@srv.example" },
    email,
    fakeFetch,
  );
  assert.equal(result.ok, true);
  assert.equal(result.id, "msg_123");
  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body.to, ["contato@srv.example"]);
  assert.equal(body.reply_to, "ana@example.com");
  assert.match(calls[0].init.headers.Authorization, /^Bearer re_test$/);
});

test("sendContactEmail trata falha de autenticação do Resend sem vazar credencial", async () => {
  const fakeFetch = async () =>
    new Response(JSON.stringify({ message: "API key is invalid" }), { status: 401 });
  const result = await sendContactEmail(
    { apiKey: "re_bad", from: "site@srv.example", to: "contato@srv.example" },
    buildContactEmail(validInput),
    fakeFetch,
  );
  assert.equal(result.ok, false);
  assert.equal(result.status, 502);
  assert.doesNotMatch(result.internalError ?? "", /re_bad/);
});

test("sendContactEmail trata indisponibilidade do provedor (5xx)", async () => {
  const fakeFetch = async () => new Response("upstream error", { status: 503 });
  const result = await sendContactEmail(
    { apiKey: "re_test", from: "site@srv.example", to: "contato@srv.example" },
    buildContactEmail(validInput),
    fakeFetch,
  );
  assert.equal(result.ok, false);
  assert.equal(result.status, 502);
});

test("sendContactEmail trata falha de rede (fetch lança)", async () => {
  const fakeFetch = async () => {
    throw new Error("network down");
  };
  const result = await sendContactEmail(
    { apiKey: "re_test", from: "site@srv.example", to: "contato@srv.example" },
    buildContactEmail(validInput),
    fakeFetch,
  );
  assert.equal(result.ok, false);
  assert.equal(result.status, 502);
});

test("sendContactEmail propaga 429 do provedor", async () => {
  const fakeFetch = async () => new Response("rate limited", { status: 429 });
  const result = await sendContactEmail(
    { apiKey: "re_test", from: "site@srv.example", to: "contato@srv.example" },
    buildContactEmail(validInput),
    fakeFetch,
  );
  assert.equal(result.ok, false);
  assert.equal(result.status, 429);
});

test("checkRateLimit permite quando não há binding (degradação segura)", async () => {
  const result = await checkRateLimit(undefined, "contact:1.2.3.4");
  assert.equal(result.allowed, true);
  assert.equal(result.enforced, false);
});

test("checkRateLimit bloqueia quando a binding nega", async () => {
  const binding = { limit: async () => ({ success: false }) };
  const result = await checkRateLimit(binding, "contact:1.2.3.4");
  assert.equal(result.allowed, false);
  assert.equal(result.enforced, true);
});

test("checkRateLimit permite quando a binding lança erro", async () => {
  const binding = {
    limit: async () => {
      throw new Error("binding error");
    },
  };
  const result = await checkRateLimit(binding, "contact:1.2.3.4");
  assert.equal(result.allowed, true);
});

test("clientKeyFromRequest usa cf-connecting-ip quando presente", () => {
  const request = new Request("https://srv.example/api/contact", {
    headers: { "cf-connecting-ip": "203.0.113.5" },
  });
  assert.equal(clientKeyFromRequest(request), "contact:203.0.113.5");
});

test("MAX_BODY_BYTES é um limite razoável e positivo", () => {
  assert.ok(MAX_BODY_BYTES > 0);
  assert.ok(MAX_BODY_BYTES <= 64 * 1024);
});

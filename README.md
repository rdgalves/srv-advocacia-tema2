# Salomão Rezende Veloso Advocacia

Site institucional contemporâneo desenvolvido com React, TypeScript, Vite/vinext e Tailwind CSS, preparado para Cloudflare Workers e Sites.

## Executar localmente

Requer Node.js 22.13 ou superior.

```bash
npm install
npm run dev
```

## Gerar o build

```bash
npm run build
```

## Publicar

O build gera a saída compatível com Cloudflare em `dist/`. O projeto também contém `.openai/hosting.json` para publicação pelo Sites.

## Atualizar conteúdo

- Dados institucionais, contato e endereço: `src/config/site.ts`.
- Profissionais: adicione ou altere registros em `src/data/lawyers.ts`.
- Áreas de atuação: edite `src/data/practiceAreas.ts`.
- Publicações: edite `src/data/articles.ts`. A estrutura já separa metadados como título, slug, categoria, resumo, imagem, autor e tempo de leitura; pode ser migrada para Markdown/CMS futuramente.

## Formulário de contato (envio real de e-mails)

O formulário de contato envia e-mails de verdade através do [Resend](https://resend.com).
O fluxo é: `app/site-client.tsx` → `src/services/contact.ts` → `POST /api/contact`
(`app/api/contact/route.ts`) → API HTTP do Resend. O destinatário é fixo e
definido por variável de ambiente; o visitante nunca controla para quem o
e-mail vai. O endereço informado pelo visitante entra apenas como `reply_to`.

### Variáveis de ambiente

| Variável             | Descrição                                                        |
| -------------------- | ---------------------------------------------------------------- |
| `RESEND_API_KEY`     | Chave privada de API do Resend. Secreta, nunca exposta no cliente. |
| `CONTACT_TO_EMAIL`   | Endereço fixo que recebe as mensagens do formulário.             |
| `CONTACT_FROM_EMAIL` | Remetente autenticado em um domínio verificado no Resend.        |

Nenhuma delas usa o prefixo `NEXT_PUBLIC_`, portanto permanecem apenas no
servidor e não são embutidas no bundle do navegador.

### 1. Criar conta e API Key no Resend

1. Crie uma conta em [resend.com](https://resend.com).
2. Em **API Keys**, gere uma chave com permissão de envio (`Sending access`).
3. Guarde o valor com segurança — ele só é exibido uma vez.

### 2. Verificar o domínio remetente

1. No painel do Resend, vá em **Domains** e adicione o domínio usado em
   `CONTACT_FROM_EMAIL` (ex.: `srveloso.adv.br`).
2. O Resend exibirá os registros DNS a configurar no seu provedor de DNS:
   - Registros **SPF** e **DKIM** (TXT/CNAME) para autenticar o envio.
   - Opcionalmente, um registro **DMARC** (TXT) para política de autenticação.
   - Um registro **MX** apenas se você for usar o domínio para receber e-mails
     pelo Resend (não é necessário só para enviar).
3. Aguarde a propagação e confirme que o domínio aparece como **Verified**.
   Enquanto o domínio não estiver verificado, o Resend recusa os envios.

> Para testes rápidos, o Resend oferece o remetente `onboarding@resend.dev`,
> que envia somente para o e-mail da própria conta. Para produção, use um
> domínio verificado.

### 3. Configurar o ambiente local

```bash
cp .env.example .env.local
```

Preencha `.env.local` com os valores reais. O vinext carrega `.env.local`
automaticamente em `npm run dev`. Esse arquivo é ignorado pelo Git.

### 4. Configurar os secrets em produção (Cloudflare Workers)

As variáveis devem existir no runtime do Worker. Use secrets do Wrangler:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CONTACT_TO_EMAIL
npx wrangler secret put CONTACT_FROM_EMAIL
```

No runtime, a route handler lê esses valores via
`import { env } from "cloudflare:workers"` — a forma recomendada pelo vinext
para acessar bindings e secrets no Cloudflare Workers. Não é usado
`process.env` em produção.

> **Publicação pelo OpenAI Sites:** configure as três variáveis como secrets do
> ambiente de produção pelo painel de hospedagem. Sem elas, a API responde
> `500` com mensagem genérica e nenhum e-mail é enviado.

### 5. Proteção contra spam e rate limiting (opcional, recomendado)

A API já aplica, independentemente do frontend:

- Validação de todos os campos no backend.
- Limite de tamanho por campo e do corpo da requisição.
- Escape de HTML dos dados do visitante.
- Campo honeypot invisível (`website`): se preenchido, a requisição é rejeitada.

Para rate limiting **distribuído** (não baseado em memória do isolate),
configure uma binding de Rate Limiting do Cloudflare chamada
`CONTACT_RATELIMIT`. Adicione ao `wrangler.jsonc` (ou à config de bindings):

```jsonc
{
  "ratelimits": [
    {
      "binding": "CONTACT_RATELIMIT",
      "namespace_id": "1001",
      "simple": { "limit": 5, "period": 60 }
    }
  ]
}
```

Se a binding não existir, o limitador degrada de forma segura (não bloqueia) e a
proteção fica a cargo do honeypot e da validação. Quando presente, envios acima
do limite recebem resposta `429`.

### 6. Testar o formulário

- **Local:** rode `npm run dev`, abra `/contato`, preencha e envie. Com
  `.env.local` configurado, o e-mail chega em `CONTACT_TO_EMAIL`.
- **Automatizado:** `npm test` roda build + testes (com mocks, sem envio real).

### 7. Verificar falhas de envio

- A API retorna JSON padronizado: `{ ok, message }`.
- Códigos: `200` aceito pelo provedor, `400` dados inválidos, `405` método não
  permitido, `429` limite excedido, `500`/`502` falha interna ou do provedor.
- Em falha, o backend registra apenas um resumo técnico (`[contact] ...`), sem
  a mensagem nem os dados pessoais completos. Verifique os logs do Worker
  (`wrangler tail` em produção, ou o terminal em dev).
- Falhas comuns: `RESEND_API_KEY` inválida (`401` no Resend → `502` ao cliente),
  domínio não verificado, ou `CONTACT_FROM_EMAIL` fora do domínio verificado.

> **Importante:** a API só retorna sucesso quando o Resend **aceita** o envio.
> Aceitação pelo provedor não é o mesmo que entrega na caixa postal — a entrega
> final depende de reputação de domínio, SPF/DKIM/DMARC e filtros do
> destinatário. Confirme a entrega enviando para uma caixa real e verificando o
> painel do Resend (status de entrega/bounce).

## Observações

Os nomes adicionais da equipe, textos editoriais e indicadores numéricos desta primeira versão são conteúdo de demonstração e devem ser revisados antes da publicação oficial.

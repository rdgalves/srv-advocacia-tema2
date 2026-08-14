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

## Observações

Os nomes adicionais da equipe, textos editoriais e indicadores numéricos desta primeira versão são conteúdo de demonstração e devem ser revisados antes da publicação oficial. O formulário de contato simula o envio em `src/services/contact.ts` e está preparado para uma integração futura.

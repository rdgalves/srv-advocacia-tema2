// Loader de testes:
// 1. Resolve o especificador virtual `cloudflare:workers` para um stub local,
//    permitindo importar a route handler sob `node --test`.
// 2. Resolve imports relativos sem extensão (convenção do bundler) para `.ts`,
//    já que o resolver ESM do Node exige extensão explícita.
import { access } from "node:fs/promises";

const STUB_URL = new URL("./cloudflare-workers-stub.mjs", import.meta.url).href;

async function exists(url) {
  try {
    await access(new URL(url));
    return true;
  } catch {
    return false;
  }
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "cloudflare:workers") {
    return { url: STUB_URL, shortCircuit: true };
  }

  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL) {
    const hasKnownExt = /\.(ts|tsx|mjs|cjs|js|json)$/.test(specifier);
    if (!hasKnownExt) {
      const base = new URL(specifier, context.parentURL);
      for (const ext of [".ts", ".tsx"]) {
        const candidate = new URL(base.href + ext);
        if (await exists(candidate)) {
          return { url: candidate.href, shortCircuit: true };
        }
      }
    }
  }

  return nextResolve(specifier, context);
}

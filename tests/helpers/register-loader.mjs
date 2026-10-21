// Registra o loader de testes via a API `register` (forma recomendada,
// evita o aviso de depreciação de `--experimental-loader`).
import { register } from "node:module";

register("./loader.mjs", import.meta.url);

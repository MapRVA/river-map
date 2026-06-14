import fs from "fs";
import { build } from "esbuild";

await build({
  entryPoints: ["index.js"],
  bundle: true,
  format: "esm",
  outdir: "dist",
  alias: {
    "node:events": "node-events",
  },
  define: {
    process: "{ 'env': {}, 'browser': true, 'version': '' }",
  },
});

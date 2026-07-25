/**
 * Build a gzip+Function loader for deploying admin-api via MCP when the
 * full TypeScript source exceeds practical tool payload limits.
 *
 * Usage: node scripts/i18n/build-admin-api-loader.mjs
 * Then deploy scripts/i18n/_admin_api_loader.ts as index.ts via deploy_edge_function.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");

const root = path.resolve(import.meta.dirname, "../..");
const entry = path.join(root, "supabase/functions/admin-api/index.ts");
const outJs = path.join(root, "scripts/i18n/_admin_api_min.js");
const outLoader = path.join(root, "scripts/i18n/_admin_api_loader.ts");

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  minify: true,
  format: "esm",
  platform: "neutral",
  target: "esnext",
  outfile: outJs,
  external: [
    "jsr:@supabase/functions-js/edge-runtime.d.ts",
    "https://esm.sh/@supabase/supabase-js@2"
  ]
});

let source = fs.readFileSync(outJs, "utf8");
source = source.replace(/\.join\(`\r?\n`\)/g, '.join("\\n")');
fs.writeFileSync(outJs, source);

const b64 = zlib.gzipSync(Buffer.from(source), { level: 9 }).toString("base64");
const loader = `import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const b64=${JSON.stringify(b64)};
const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
const ds=new DecompressionStream("gzip");
const stream=new Blob([bin]).stream().pipeThrough(ds);
let code=await new Response(stream).text();
code=code.replace(/import"jsr:[^"]+";/,"");
code=code.replace(/import\\{createClient as (\\w+)\\}from"[^"]+";/,"const $1=createClient;");
new Function("createClient", code)(createClient);
`;

fs.writeFileSync(outLoader, loader);
console.log(
  JSON.stringify({
    sourceBytes: source.length,
    loaderBytes: loader.length,
    prepare: source.includes("prepare_media_upload"),
    replace: source.includes("replace_media_placement"),
    outLoader
  })
);

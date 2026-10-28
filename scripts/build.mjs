// =============================================================
//  JS STORE: etapa de build (roda na Vercel a cada deploy)
//  - copia o site para dist/
//  - completa endereços absolutos (prévia do WhatsApp/Instagram, canonical)
//  - gera robots.txt e sitemap.xml (com os produtos, se o Supabase estiver ligado)
//  - renova a versão do cache do app (sw.js) a cada deploy
//  Domínio próprio: defina SITE_URL nas variáveis de ambiente da Vercel.
// =============================================================
import { cp, mkdir, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, "dist");
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const SITE = (process.env.SITE_URL || (host ? `https://${host}` : "http://localhost:8080")).replace(/\/$/, "");
const SKIP = new Set(["dist", "scripts", ".git", ".github", "supabase", "node_modules", "README.md", "vercel.json", ".gitignore", ".vercel"]);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
for (const f of await readdir(ROOT)) if (!SKIP.has(f)) await cp(join(ROOT, f), join(OUT, f), { recursive: true });

// páginas: endereço canônico e prévia com endereço completo
const pages = { "index.html": "/", "loja.html": "/loja", "produto.html": null, "trocas.html": "/trocas", "privacidade.html": "/privacidade" };
for (const [file, path] of Object.entries(pages)) {
  const p = join(OUT, file);
  let html; try { html = await readFile(p, "utf8"); } catch { continue; }
  html = html.replace(/(property="og:image" content=")\/(?!\/)/g, `$1${SITE}/`);
  const extra = [
    path !== null ? `<link rel="canonical" href="${SITE}${path}">` : "",
    path !== null ? `<meta property="og:url" content="${SITE}${path}">` : "",
    `<meta property="og:type" content="website">`, `<meta property="og:locale" content="pt_BR">`, `<meta property="og:site_name" content="JS STORE">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ].filter(Boolean).join("\n");
  html = html.replace("</title>", `</title>\n${extra}`);
  await writeFile(p, html);
}

// robots.txt
await writeFile(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE}/sitemap.xml\n`);

// sitemap.xml (produtos vêm do Supabase, se estiver configurado em assets/js/config.js)
const urls = [["/", "daily", "1.0"], ["/loja", "daily", "0.9"], ["/loja?f=novidades", "daily", "0.8"], ["/loja?f=promo", "daily", "0.7"], ["/trocas", "yearly", "0.3"], ["/privacidade", "yearly", "0.3"]];
try {
  const cfg = await readFile(join(ROOT, "assets/js/config.js"), "utf8");
  const url = (cfg.match(/SUPABASE_URL\s*=\s*"([^"]*)"/) || [])[1];
  const key = (cfg.match(/SUPABASE_ANON_KEY\s*=\s*"([^"]*)"/) || [])[1];
  if (url && key) {
    const r = await fetch(`${url}/rest/v1/produtos?select=slug&ativo=eq.true&limit=2000`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (r.ok) for (const { slug } of await r.json()) urls.push([`/produto?p=${encodeURIComponent(slug)}`, "weekly", "0.8"]);
  }
} catch (e) { console.warn("sitemap: sem produtos do Supabase", e.message); }
const today = new Date().toISOString().slice(0, 10);
const esc = (s) => s.replace(/&/g, "&amp;");
await writeFile(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, f, pr]) => `  <url><loc>${esc(SITE + u)}</loc><lastmod>${today}</lastmod><changefreq>${f}</changefreq><priority>${pr}</priority></url>`).join("\n")}\n</urlset>\n`);

// cache do app: versão nova a cada deploy
const sw = join(OUT, "sw.js");
const ver = "jss-" + (process.env.VERCEL_GIT_COMMIT_SHA || Date.now().toString(36)).slice(0, 8);
await writeFile(sw, (await readFile(sw, "utf8")).replace(/const VERSION = "[^"]*";/, `const VERSION = "${ver}";`));

console.log(`build ok: ${SITE} · ${urls.length} endereços no sitemap · cache ${ver}`);

// =============================================================
//  JS STORE — service worker (app instalável + modo offline)
//  Páginas, CSS e JS: busca na internet primeiro (sempre atualizado)
//  e usa a cópia guardada quando estiver sem conexão.
//  Fotos e fontes: usa a cópia guardada (abre mais rápido).
//  Supabase (dados, login): nunca é guardado.
// =============================================================
const VERSION = "jss-v1";
const SHELL = `${VERSION}-shell`;
const MEDIA = `${VERSION}-media`;
const MEDIA_MAX = 120;

const PRECACHE = [
  "/", "/loja", "/produto", "/offline.html", "/manifest.webmanifest",
  "/assets/css/style.css",
  "/assets/js/config.js", "/assets/js/data.js", "/assets/js/ui.js", "/assets/js/checkout.js",
  "/assets/js/home.js", "/assets/js/loja.js", "/assets/js/produto.js",
  "/assets/img/butterfly.webp", "/assets/img/butterfly-dark.webp",
  "/assets/img/icon-192.png", "/assets/img/favicon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

const isMedia = (url) =>
  /\.(png|jpe?g|webp|gif|svg|avif|woff2?)$/i.test(url.pathname) ||
  url.hostname === "images.unsplash.com" || url.hostname === "fonts.gstatic.com" ||
  url.pathname.includes("/storage/v1/object/public/");

async function trim(cacheName, max) {
  const c = await caches.open(cacheName); const keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // dados ao vivo (Supabase), WhatsApp e afins: direto da internet
  if (url.hostname.endsWith("supabase.co") && !url.pathname.includes("/storage/v1/object/public/")) return;
  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") return;

  // páginas: internet primeiro, depois cópia, depois página offline
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const pre = await e.preloadResponse; if (pre) return pre;
        const res = await fetch(req);
        const c = await caches.open(SHELL); c.put(url.pathname === "/" ? "/" : url.pathname, res.clone());
        return res;
      } catch {
        const c = await caches.open(SHELL);
        return (await c.match(url.pathname, { ignoreSearch: true })) || (await c.match("/offline.html"));
      }
    })());
    return;
  }

  // fotos e fontes: cópia guardada primeiro
  if (isMedia(url)) {
    e.respondWith((async () => {
      const c = await caches.open(MEDIA);
      const hit = await c.match(req); if (hit) return hit;
      try {
        // Unsplash e Supabase liberam CORS: assim a cópia guardada ocupa o tamanho real da foto
        const cors = url.origin !== location.origin && (url.hostname === "images.unsplash.com" || url.pathname.includes("/storage/v1/object/public/") || url.hostname === "fonts.gstatic.com");
        const res = await fetch(cors ? new Request(req.url, { mode: "cors", credentials: "omit" }) : req).catch(() => fetch(req));
        if (res.ok) { c.put(req, res.clone()); trim(MEDIA, MEDIA_MAX); }
        return res;
      } catch { return hit || Response.error(); }
    })());
    return;
  }

  // CSS, JS e o resto do próprio site: internet primeiro, cópia se estiver offline
  if (url.origin === location.origin || url.hostname === "cdn.jsdelivr.net" || url.hostname === "fonts.googleapis.com") {
    e.respondWith((async () => {
      const c = await caches.open(SHELL);
      try { const res = await fetch(req); if (res.ok) c.put(req, res.clone()); return res; }
      catch { return (await c.match(req, { ignoreSearch: url.origin === location.origin })) || Response.error(); }
    })());
  }
});

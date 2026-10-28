// =============================================================
//  Componentes compartilhados da loja
// =============================================================
import { getConfig, stockTotal, finalPrice, DEMO_MODE } from "./data.js";
import { checkout } from "./checkout.js";

// ---------- ícones (lucide, inline) ----------
const P = {
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  pix: '<path d="m12 2 4.5 4.5-4.5 4.5-4.5-4.5z"/><path d="m12 13 4.5 4.5L12 22l-4.5-4.5z"/><path d="m2 12 4.5-4.5L11 12l-4.5 4.5z"/><path d="m13 12 4.5-4.5L22 12l-4.5 4.5z"/>',
  sparkle: '<path d="M9.94 14.06 4 20M12 3l1.9 5.8L20 12l-6.1 3.2L12 21l-1.9-5.8L4 12l6.1-3.2Z"/>',
  ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
  insta: '<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  pin: '<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  pointer: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>',
  star: '<path d="M11.52 2.3a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.9l5.16-.76a2.12 2.12 0 0 0 1.6-1.16z"/>',
};
export const icon = (n, cls = "") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ""}</svg>`;
export const waIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37A9.86 9.86 0 0 1 2.16 12C2.16 6.55 6.6 2.12 12.06 2.12c2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 7c0 5.45-4.44 9.89-9.89 9.89m8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.48-8.41"/></svg>';

export const brl = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const waLink = (num, text) => `https://wa.me/${String(num || "").replace(/\D/g, "")}${text ? "?text=" + encodeURIComponent(text) : ""}`;
/** Links de contato da loja (WhatsApp, Instagram, Google Maps). */
export function contactLinks(cfg = {}) {
  const ig = String(cfg.instagram || "").replace(/^@/, "").trim();
  const maps = cfg.maps_url || (cfg.endereco ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("JS STORE " + cfg.endereco)}` : "");
  return {
    wa: (text = "Olá! Vim pelo site da JS STORE.") => (cfg.whatsapp ? waLink(cfg.whatsapp, text) : ""),
    ig: ig ? `https://instagram.com/${encodeURIComponent(ig)}` : "",
    igUser: ig,
    maps,
  };
}
const PLACEHOLDER = "/assets/img/butterfly.webp";
export const imgOf = (p, i = 0) => (p.imagens && p.imagens[i]) || PLACEHOLDER;

// ---------- armazenamento local ----------
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem("jss_" + k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem("jss_" + k, JSON.stringify(v)); } catch {} },
};

export const state = { config: null, products: [] };

// fotos aparecem suavemente quando carregam (vale para a loja e o painel)
document.addEventListener("load", (e) => { if (e.target.tagName === "IMG") e.target.classList.add("is-loaded"); }, true);
document.addEventListener("error", (e) => { if (e.target.tagName === "IMG") e.target.classList.add("is-loaded"); }, true);

// ---------- carrinho ----------
export const cart = {
  items: () => store.get("cart", []),
  save(items) { store.set("cart", items); renderCart(); updateBadges(true); },
  add(p, tamanho, qtd = 1) {
    const items = cart.items();
    const max = (p.tamanhos || []).find((t) => t.t === tamanho)?.q ?? 0;
    const ex = items.find((i) => i.id === p.id && i.tamanho === tamanho);
    const cur = ex ? ex.qtd : 0;
    if (cur + qtd > max) { toast(`Só temos ${max} unidade(s) no tamanho ${tamanho}.`, { err: true }); return false; }
    if (ex) ex.qtd += qtd;
    else items.push({ id: p.id, slug: p.slug, nome: p.nome, tamanho, qtd, preco: finalPrice(p), img: imgOf(p), max });
    cart.save(items);
    toast(`<b>${esc(p.nome)}</b> (${esc(tamanho)}) foi para a sacola`, { img: imgOf(p), action: ["Ver sacola", () => openDrawer("cart")] });
    return true;
  },
  setQty(idx, q) { const it = cart.items(); if (q <= 0) it.splice(idx, 1); else it[idx].qtd = Math.min(q, it[idx].max || 99); cart.save(it); },
  clear() { cart.save([]); },
  count: () => cart.items().reduce((a, i) => a + i.qtd, 0),
  total: () => cart.items().reduce((a, i) => a + i.preco * i.qtd, 0),
};

// ---------- favoritos / vistos recentemente ----------
export const favs = {
  all: () => store.get("favs", []),
  has: (id) => favs.all().some((f) => f.id === id),
  toggle(p) {
    let f = favs.all();
    const on = !favs.has(p.id);
    f = on ? [{ id: p.id, slug: p.slug, nome: p.nome, preco: finalPrice(p), img: imgOf(p) }, ...f] : f.filter((x) => x.id !== p.id);
    store.set("favs", f); updateBadges(true); renderFavs();
    toast(on ? "Adicionado aos favoritos" : "Removido dos favoritos", { ic: "heart" });
    return on;
  },
};
export const recent = {
  all: () => store.get("recent", []),
  push(id) { store.set("recent", [id, ...recent.all().filter((x) => x !== id)].slice(0, 12)); },
};

// ---------- toast ----------
export function toast(html, { err = false, img = null, action = null, ms = 3600, ic = null } = {}) {
  let box = $(".toasts");
  if (!box) { box = document.createElement("div"); box.className = "toasts"; box.setAttribute("role", "status"); document.body.append(box); }
  const t = document.createElement("div");
  t.className = "toast" + (err ? " err" : "");
  const iconName = ic || (err ? "alert" : img ? null : "checkCircle");
  t.innerHTML = `${img ? `<img src="${esc(img)}" alt="">` : iconName ? `<i class="toast-ic">${icon(iconName)}</i>` : ""}<span>${html}</span>${action ? `<a href="#">${action[0]}</a>` : ""}`;
  if (action) t.querySelector("a").onclick = (e) => { e.preventDefault(); action[1](); t.remove(); };
  box.append(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 350); }, ms);
}

// ---------- modal ----------
export function modal(html, { onOpen } = {}) {
  closeModal();
  const m = document.createElement("div");
  m.className = "modal"; m.id = "modal";
  m.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true"><button class="icon-btn modal-close" aria-label="Fechar">${icon("x")}</button>${html}</div>`;
  document.body.append(m);
  $("#overlay").classList.add("open");
  m.querySelector(".modal-close").onclick = closeModal;
  m.addEventListener("click", (e) => { if (e.target === m) closeModal(); });
  requestAnimationFrame(() => m.classList.add("open"));
  onOpen && onOpen(m);
  return m;
}
export function closeModal() {
  const m = $("#modal"); if (!m) return;
  m.classList.remove("open");
  if (!$(".drawer.open") && !$(".mnav.open")) $("#overlay")?.classList.remove("open");
  setTimeout(() => m.remove(), 300);
}

export function sizeGuide() {
  modal(`<h3>Guia de medidas</h3><p class="muted">Medidas do corpo em centímetros. Na dúvida entre dois tamanhos, chame a gente no WhatsApp que ajudamos você a escolher!</p>
  <table class="sizes-table"><tr><th>Tam.</th><th>Busto</th><th>Cintura</th><th>Quadril</th></tr>
  <tr><td>PP / 34</td><td>80–84</td><td>62–66</td><td>88–92</td></tr>
  <tr><td>P / 36</td><td>84–88</td><td>66–70</td><td>92–96</td></tr>
  <tr><td>M / 38–40</td><td>88–94</td><td>70–76</td><td>96–102</td></tr>
  <tr><td>G / 42</td><td>94–100</td><td>76–82</td><td>102–108</td></tr>
  <tr><td>GG / 44–46</td><td>100–108</td><td>82–90</td><td>108–116</td></tr></table>`);
}

// ---------- gavetas ----------
export function openDrawer(which) {
  closeMenu();
  $$(".drawer").forEach((d) => d.classList.toggle("open", d.id === "drawer-" + which));
  $("#overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
export function closeDrawers() {
  $$(".drawer").forEach((d) => d.classList.remove("open"));
  closeMenu();
  if (!$("#modal")) $("#overlay").classList.remove("open");
  document.body.style.overflow = "";
}
function closeMenu() { $(".mnav")?.classList.remove("open"); }

function updateBadges(bump) {
  const set = (id, n) => {
    const b = $(id); if (!b) return;
    b.textContent = n; b.classList.toggle("on", n > 0);
    if (bump && n > 0) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
  };
  set("#cart-count", cart.count());
  set("#fav-count", favs.all().length);
}

function renderCart() {
  const body = $("#drawer-cart .drawer-body"), foot = $("#drawer-cart .drawer-foot");
  if (!body) return;
  const items = cart.items();
  const cfg = state.config || {};
  if (!items.length) {
    body.innerHTML = `<div class="empty"><img src="/assets/img/butterfly.webp" alt=""><p>Sua sacola está vazia.</p><a class="btn btn-ghost btn-sm" href="/loja">Ver novidades</a></div>`;
    foot.classList.add("hidden"); return;
  }
  foot.classList.remove("hidden");
  body.innerHTML = items.map((i, idx) => `
    <div class="line-item">
      <a href="/produto?p=${encodeURIComponent(i.slug)}"><img src="${esc(i.img)}" alt=""></a>
      <div><h5>${esc(i.nome)}</h5><small>Tamanho ${esc(i.tamanho)}</small>
        <div class="qty"><button data-q="${idx}" data-d="-1" aria-label="Diminuir">−</button><span>${i.qtd}</span><button data-q="${idx}" data-d="1" aria-label="Aumentar">+</button></div><br>
        <button class="rm" data-rm="${idx}">Remover</button></div>
      <b>${brl(i.preco * i.qtd)}</b>
    </div>`).join("");
  const total = cart.total();
  const lim = Number(cfg.frete_gratis_acima) || 0;
  const pix = Number(cfg.pix_desconto) || 0;
  foot.innerHTML = `
    ${lim ? `<div class="ship-bar">${total >= lim ? `<span class="ship-ok">${icon("gift")} Você ganhou <b>frete grátis!</b></span>` : `Faltam <b>${brl(lim - total)}</b> para o frete grátis`}<div class="bar"><i style="width:${Math.min(100, (total / lim) * 100)}%"></i></div></div>` : ""}
    <div class="totals"><span>Subtotal</span><span>${brl(total)}</span></div>
    ${pix ? `<div class="totals" style="color:var(--ok)"><span>No Pix (${pix}% off)</span><span>${brl(total * (1 - pix / 100))}</span></div>` : ""}
    <div class="totals big"><span>Total</span><span>${brl(total)}</span></div>
    <button class="btn btn-wa btn-block" id="go-checkout">${waIcon} Finalizar pelo WhatsApp</button>
    <p class="muted" style="font-size:12.5px;text-align:center;margin:10px 0 0">Você confirma tamanho, entrega e pagamento direto com a loja.</p>`;
  $("#go-checkout").onclick = () => { closeDrawers(); checkout({ cfg, items: cart.items(), onDone: () => { cart.clear(); closeDrawers(); } }); };
}

function renderFavs() {
  const body = $("#drawer-favs .drawer-body"); if (!body) return;
  const f = favs.all();
  body.innerHTML = f.length ? f.map((i) => `
    <div class="line-item"><a href="/produto?p=${encodeURIComponent(i.slug)}"><img src="${esc(i.img)}" alt=""></a>
    <div><h5>${esc(i.nome)}</h5><small>${brl(i.preco)}</small><a class="btn btn-ghost btn-sm" style="margin-top:10px" href="/produto?p=${encodeURIComponent(i.slug)}">Escolher tamanho</a></div>
    <button class="icon-btn" data-unfav="${esc(i.id)}" aria-label="Remover">${icon("x")}</button></div>`).join("")
    : `<div class="empty"><img src="/assets/img/butterfly.webp" alt=""><p>Toque no ${icon("heart", "inline-ic")} das peças que você amar para salvar aqui.</p></div>`;
}

// ---------- cartão de produto ----------
export function productCard(p, cfg = state.config || {}) {
  const total = stockTotal(p);
  const fp = finalPrice(p);
  const sale = fp < Number(p.preco);
  const pix = Number(cfg.pix_desconto) || 0;
  const off = sale ? Math.round((1 - fp / p.preco) * 100) : 0;
  const tags = [];
  if (!total) tags.push('<span class="tag out">Esgotado</span>');
  else {
    if (sale) tags.push(`<span class="tag sale">-${off}%</span>`);
    if (p.novidade) tags.push('<span class="tag new">Novo</span>');
    if (total <= 2) tags.push('<span class="tag low">Últimas peças</span>');
  }
  const url = `/produto?p=${encodeURIComponent(p.slug)}`;
  return `<article class="card reveal" data-id="${esc(p.id)}">
    <div class="card-media">
      <a href="${url}" aria-label="${esc(p.nome)}"><img src="${esc(imgOf(p))}" alt="${esc(p.nome)}" loading="lazy">${p.imagens?.[1] ? `<img class="alt" src="${esc(p.imagens[1])}" alt="" loading="lazy">` : ""}</a>
      <div class="tags">${tags.join("")}</div>
      <button class="fav ${favs.has(p.id) ? "on" : ""}" data-fav="${esc(p.id)}" aria-label="Favoritar">${icon("heart")}</button>
      ${total ? `<div class="quick"><p>Adicionar rápido</p><div class="sizes">${(p.tamanhos || []).map((t) => `<button class="size" data-quick="${esc(p.id)}" data-size="${esc(t.t)}" ${t.q > 0 ? "" : "disabled"}>${esc(t.t)}</button>`).join("")}</div></div>` : ""}
    </div>
    <a class="card-body" href="${url}">
      <div class="card-cat">${esc(p.categoria)}</div>
      <h3 class="card-title">${esc(p.nome)}</h3>
      <div class="price"><b>${brl(fp)}</b>${sale ? `<s>${brl(p.preco)}</s>` : ""}${pix && total ? `<span class="pix">${brl(fp * (1 - pix / 100))} no Pix</span>` : ""}</div>
    </a>
  </article>`;
}

export function skeletonCards(n = 4) {
  return Array.from({ length: n }, () => `<div><div class="skel" style="aspect-ratio:4/5;border-radius:18px"></div><div class="skel" style="height:14px;width:40%;margin-top:14px"></div><div class="skel" style="height:20px;width:80%;margin-top:8px"></div></div>`).join("");
}

// animação ao rolar a página
let io;
export function observeReveal(root = document) {
  io ||= new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -40px 0px" });
  $$(".reveal:not(.in)", root).forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + "ms"; io.observe(el); });
  markLoaded(root);
}

// ---------- layout (cabeçalho, rodapé, gavetas) ----------
function layout(cfg, active) {
  const avisos = (cfg.aviso_topo || []).filter(Boolean);
  const mq = avisos.length ? avisos.map((a) => `<span>${esc(a)}</span>`).join("") : "";
  const links = [["/", "Início"], ["/loja", "Loja"], ["/loja?f=novidades", "Novidades"], ["/loja?f=promo", "Promoções"]];
  const nav = links.map(([h, t]) => `<a href="${h}" class="${active === h ? "active" : ""}">${t}</a>`).join("");
  const brand = `<a class="brand" href="/" aria-label="JS STORE - início"><img src="/assets/img/butterfly.webp" alt="" width="44" height="34"><span><b>JS STORE</b><small>MODA FEMININA</small></span></a>`;
  const header = `
  ${mq ? `<div class="topbar"><div class="marquee">${mq}${mq}${mq}${mq}</div></div>` : ""}
  <header class="header" id="header"><div class="wrap header-in">
    <div style="display:flex;align-items:center;gap:20px"><button class="icon-btn menu-btn" id="menu-btn" aria-label="Menu">${icon("menu")}</button><nav class="nav">${nav}</nav></div>
    ${brand}
    <div class="actions">
      <button class="icon-btn" id="search-btn" aria-label="Buscar">${icon("search")}</button>
      <button class="icon-btn" id="fav-btn" aria-label="Favoritos">${icon("heart")}<span class="badge" id="fav-count">0</span></button>
      <button class="icon-btn" id="cart-btn" aria-label="Sacola">${icon("bag")}<span class="badge" id="cart-count">0</span></button>
    </div></div>
    <div class="search-bar" id="search-bar"><form class="wrap" action="/loja"><input class="input" name="q" placeholder="O que você procura? Ex.: vestido, blazer..." autocomplete="off"><button class="btn btn-sm">Buscar</button></form></div>
  </header>
  <nav class="mnav" id="mnav">${brand}${links.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}<a href="/admin/" style="font-size:16px;font-family:var(--sans);border:0;margin-top:auto;color:var(--ink-3)">Área da loja</a></nav>`;

  const L = contactLinks(cfg);
  const footer = `
  <footer class="footer"><div class="wrap">
    <div class="footer-grid">
      <div>${brand}<p style="margin-top:16px">Moda feminina com curadoria cuidadosa, atendimento próximo e aquele toque de delicadeza em cada detalhe.</p></div>
      <div><h4>Loja</h4><a href="/loja">Todas as peças</a><a href="/loja?f=novidades">Novidades</a><a href="/loja?f=promo">Promoções</a><a href="/loja?f=destaque">Mais amadas</a></div>
      <div><h4>Ajuda</h4><a href="#" data-sizeguide>Guia de medidas</a><a href="${waLink(cfg.whatsapp, "Olá! Tenho uma dúvida sobre trocas.")}" target="_blank" rel="noopener">Trocas e devoluções</a><a href="${waLink(cfg.whatsapp, "Olá! Vim pelo site da JS STORE.")}" target="_blank" rel="noopener">Fale com a gente</a></div>
      <div><h4>Contato</h4>
        <div class="contact-list">
          ${L.wa() ? `<a href="${L.wa()}" target="_blank" rel="noopener"><span class="ci wa">${waIcon}</span>WhatsApp</a>` : ""}
          ${L.ig ? `<a href="${L.ig}" target="_blank" rel="noopener"><span class="ci ig">${icon("insta")}</span>@${esc(L.igUser)}</a>` : ""}
          ${L.maps ? `<a href="${L.maps}" target="_blank" rel="noopener"><span class="ci map">${icon("pin")}</span>${esc(cfg.endereco || "Como chegar")}</a>` : ""}
          ${cfg.grupo_vip ? `<a href="${esc(cfg.grupo_vip)}" target="_blank" rel="noopener"><span class="ci">${icon("bell")}</span>Grupo VIP</a>` : ""}
        </div></div>
    </div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} JS STORE · Moda Feminina</span><div class="pay"><span>Pix</span><span>Cartão</span><span>Dinheiro</span></div></div>
  </div></footer>
  <div class="social-float" aria-label="Fale com a JS STORE">
    ${L.maps ? `<a class="sf sf-map" href="${L.maps}" target="_blank" rel="noopener" aria-label="Ver no Google Maps"><span class="sf-tip">Como chegar</span>${icon("pin")}</a>` : ""}
    ${L.ig ? `<a class="sf sf-ig" href="${L.ig}" target="_blank" rel="noopener" aria-label="Instagram"><span class="sf-tip">Instagram</span>${icon("insta")}</a>` : ""}
    ${L.wa() ? `<a class="sf sf-wa" href="${L.wa()}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp"><span class="sf-tip">Fale conosco</span>${waIcon}</a>` : ""}
  </div>
  <div class="overlay" id="overlay"></div>
  <aside class="drawer" id="drawer-cart" aria-label="Sacola"><div class="drawer-head"><h3>Sua sacola</h3><button class="icon-btn" data-close aria-label="Fechar">${icon("x")}</button></div><div class="drawer-body"></div><div class="drawer-foot"></div></aside>
  <aside class="drawer" id="drawer-favs" aria-label="Favoritos"><div class="drawer-head"><h3>Favoritos</h3><button class="icon-btn" data-close aria-label="Fechar">${icon("x")}</button></div><div class="drawer-body"></div></aside>
  ${DEMO_MODE ? `<div style="position:fixed;left:14px;bottom:14px;z-index:45;background:#fff;border:1px solid var(--line);border-radius:999px;padding:6px 12px;font-size:11.5px;color:var(--ink-3);box-shadow:var(--shadow-sm)">Modo demonstração</div>` : ""}`;

  $("#site-header").innerHTML = header;
  $("#site-footer").innerHTML = footer;
}

function bindGlobal() {
  document.addEventListener("click", (e) => {
    const t = e.target.closest("button, a");
    if (!t) { if (e.target.id === "overlay") { closeDrawers(); closeModal(); } return; }
    if (t.id === "cart-btn") openDrawer("cart");
    else if (t.id === "fav-btn") openDrawer("favs");
    else if (t.id === "menu-btn") { $("#mnav").classList.add("open"); $("#overlay").classList.add("open"); }
    else if (t.id === "search-btn") { const s = $("#search-bar"); s.classList.toggle("open"); if (s.classList.contains("open")) setTimeout(() => s.querySelector("input").focus(), 200); }
    else if (t.hasAttribute("data-close")) closeDrawers();
    else if (t.hasAttribute("data-sizeguide")) { e.preventDefault(); sizeGuide(); }
    else if (t.dataset.q) { const idx = +t.dataset.q; cart.setQty(idx, cart.items()[idx].qtd + +t.dataset.d); }
    else if (t.dataset.rm) cart.setQty(+t.dataset.rm, 0);
    else if (t.dataset.unfav) { const f = favs.all().find((x) => x.id === t.dataset.unfav); f && favs.toggle(f); }
    else if (t.dataset.fav) {
      e.preventDefault();
      const p = state.products.find((x) => x.id === t.dataset.fav); if (!p) return;
      const on = favs.toggle(p); t.classList.toggle("on", on); t.classList.remove("pop"); void t.offsetWidth; t.classList.add("pop");
    } else if (t.dataset.quick) {
      e.preventDefault();
      const p = state.products.find((x) => x.id === t.dataset.quick); p && cart.add(p, t.dataset.size);
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDrawers(); closeModal(); } });
  // cabeçalho: some ao descer, volta ao subir
  const h = $("#header");
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      h?.classList.toggle("scrolled", y > 10);
      const menusOpen = $(".drawer.open") || $(".search-bar.open");
      h?.classList.toggle("hide", !menusOpen && y > 420 && y > lastY + 4);
      if (y < lastY - 4 || y < 420) h?.classList.remove("hide");
      lastY = y; ticking = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();


  // pré-carrega a página do produto ao passar o mouse/encostar o dedo
  const pre = new Set();
  const prefetch = (e) => {
    const a = e.target.closest?.('a[href^="/produto"], a[href^="/loja"]'); if (!a || pre.has(a.href)) return;
    pre.add(a.href); const l = document.createElement("link"); l.rel = "prefetch"; l.href = a.href; document.head.append(l);
  };
  document.addEventListener("pointerenter", prefetch, { capture: true, passive: true });
  document.addEventListener("touchstart", prefetch, { capture: true, passive: true });
}

/** Marca fotos que já estavam no cache como carregadas. */
export function markLoaded(root = document) {
  $$("img:not(.is-loaded)", root).forEach((i) => { if (i.complete) i.classList.add("is-loaded"); });
}

/** Inicia a página: carrega config, monta layout, gavetas. */
export async function initPage(active) {
  let cfg;
  try { cfg = await getConfig(); } catch (e) { console.error(e); cfg = (await import("./data.js")).DEFAULT_CONFIG; }
  state.config = cfg;
  layout(cfg, active);
  bindGlobal();
  renderCart(); renderFavs(); updateBadges(false);
  return cfg;
}

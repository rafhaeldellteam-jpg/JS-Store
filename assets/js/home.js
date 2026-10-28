import { listProducts, stockTotal, finalPrice } from "./data.js";
import { initPage, state, productCard, skeletonCards, observeReveal, recent, $, $$, esc, brl, waLink, icon, waIcon } from "./ui.js";

const cfg = await initPage("/");

// textos editáveis pelo painel
if (cfg.hero_titulo) {
  const words = cfg.hero_titulo.split(" ");
  const i = Math.min(2, words.length - 1);
  words[i] = `<em>${esc(words[i])}</em>`;
  $("#hero-title").innerHTML = words.map((w, k) => (k === i ? w : esc(w))).join(" ");
}
if (cfg.hero_subtitulo) $("#hero-sub").textContent = cfg.hero_subtitulo;
if (cfg.pix_desconto) $("#trust-pix").textContent = `${cfg.pix_desconto}% off no Pix`;
if (cfg.frete_gratis_acima) $("#trust-ship").textContent = `Frete grátis acima de ${brl(cfg.frete_gratis_acima)}`;

// comunidade
const ig = cfg.instagram ? String(cfg.instagram).replace(/^@/, "") : "";
$("#community-btns").innerHTML =
  (ig ? `<a class="btn" href="https://instagram.com/${encodeURIComponent(ig)}" target="_blank" rel="noopener">${icon("insta")} @${esc(ig)}</a>` : "") +
  (cfg.grupo_vip ? `<a class="btn btn-wa" href="${esc(cfg.grupo_vip)}" target="_blank" rel="noopener">${waIcon} Entrar no grupo VIP</a>`
                 : `<a class="btn btn-wa" href="${waLink(cfg.whatsapp, "Oi! Quero receber as novidades da JS STORE 🦋")}" target="_blank" rel="noopener">${waIcon} Quero receber novidades</a>`);

// produtos
$("#rail-new").innerHTML = skeletonCards(4);
$("#grid-hot").innerHTML = skeletonCards(4);
let products = [];
try { products = await listProducts(); } catch (e) { console.error(e); }
state.products = products;

const inStock = products.filter((p) => stockTotal(p) > 0);
$("#stat-pecas").textContent = inStock.length;
$("#stat-novas").textContent = products.filter((p) => p.novidade).length;

// categorias com produtos
const cats = [...new Set(products.map((p) => p.categoria).filter(Boolean))];
$("#cats").innerHTML = `<button class="cat active" data-cat="">Tudo</button>` + cats.map((c) => `<button class="cat" data-cat="${esc(c)}">${esc(c)}</button>`).join("");

function renderNew(cat = "") {
  let list = [...products];
  list.sort((a, b) => (b.novidade - a.novidade) || b.created_at.localeCompare(a.created_at));
  if (cat) list = list.filter((p) => p.categoria === cat);
  list = list.slice(0, 10);
  $("#rail-new").innerHTML = list.length ? list.map((p) => productCard(p)).join("") : `<p class="muted">Nenhuma peça nesta categoria ainda.</p>`;
  $("#rail-new").scrollTo({ left: 0 });
  observeReveal($("#rail-new"));
}
renderNew();
$("#cats").addEventListener("click", (e) => {
  const b = e.target.closest(".cat"); if (!b) return;
  $$(".cat", $("#cats")).forEach((x) => x.classList.toggle("active", x === b));
  renderNew(b.dataset.cat);
});
$$("[data-rail]").forEach((b) => b.addEventListener("click", () => {
  const r = $("#rail-new"); r.scrollBy({ left: (r.clientWidth * 0.8) * +b.dataset.rail, behavior: "smooth" });
}));

// mais amadas: destaque primeiro, depois mais vendidos
const hot = [...inStock].sort((a, b) => (b.destaque - a.destaque) || ((b.vendidos || 0) - (a.vendidos || 0))).slice(0, 8);
$("#grid-hot").innerHTML = hot.length ? hot.map((p) => productCard(p)).join("") : `<p class="muted">Em breve, novidades por aqui!</p>`;

// vistos recentemente
const rec = recent.all().map((id) => products.find((p) => p.id === id)).filter(Boolean);
if (rec.length) { $("#recent-wrap").classList.remove("hidden"); $("#rail-recent").innerHTML = rec.map((p) => productCard(p)).join(""); }

// promoção com contagem regressiva
const sale = products.filter((p) => finalPrice(p) < Number(p.preco));
const end = cfg.promo_fim ? new Date(cfg.promo_fim) : null;
if ((!end || end < new Date()) && !sale.length) $("#promo-wrap").classList.add("hidden");
else {
  if (cfg.promo_titulo) $("#promo-title").textContent = cfg.promo_titulo;
  if (cfg.promo_texto) $("#promo-text").textContent = cfg.promo_texto;
  if (!end || end < new Date()) $("#countdown").classList.add("hidden");
  else {
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const d = Math.floor(s / 86400); s %= 86400;
      const h = Math.floor(s / 3600); s %= 3600;
      const m = Math.floor(s / 60); s %= 60;
      $('[data-cd="d"]').textContent = pad(d); $('[data-cd="h"]').textContent = pad(h);
      $('[data-cd="m"]').textContent = pad(m); $('[data-cd="s"]').textContent = pad(s);
    };
    tick(); setInterval(tick, 1000);
  }
}

observeReveal();

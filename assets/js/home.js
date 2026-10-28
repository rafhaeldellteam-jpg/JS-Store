import { listProducts, stockTotal, finalPrice, DEMO_HERO, listFeedbacks, submitFeedback } from "./data.js";
import { initPage, state, productCard, skeletonCards, observeReveal, recent, contactLinks, modal, closeModal, toast, $, $$, esc, brl, icon, waIcon } from "./ui.js";

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

// foto do topo
const heroImg = $("#hero-img");
heroImg.src = cfg.hero_imagem || DEMO_HERO;

// contato: WhatsApp, Instagram e Maps
const L = contactLinks(cfg);
const cards = [
  L.wa() && `<a class="contact-card wa reveal" href="${L.wa("Olá! Vim pelo site da JS STORE.")}" target="_blank" rel="noopener"><span class="cc-ic">${waIcon}</span><b>WhatsApp</b><small>Atendimento e pedidos</small><span class="cc-go">${icon("arrow")}</span></a>`,
  L.ig && `<a class="contact-card ig reveal" href="${L.ig}" target="_blank" rel="noopener"><span class="cc-ic">${icon("insta")}</span><b>Instagram</b><small>@${esc(L.igUser)}</small><span class="cc-go">${icon("arrow")}</span></a>`,
  L.maps && `<a class="contact-card map reveal" href="${L.maps}" target="_blank" rel="noopener"><span class="cc-ic">${icon("pin")}</span><b>Como chegar</b><small>${esc(cfg.endereco || "Ver no Google Maps")}</small><span class="cc-go">${icon("arrow")}</span></a>`,
  cfg.grupo_vip && `<a class="contact-card vip reveal" href="${esc(cfg.grupo_vip)}" target="_blank" rel="noopener"><span class="cc-ic">${icon("bell")}</span><b>Grupo VIP</b><small>Novidades em primeira mão</small><span class="cc-go">${icon("arrow")}</span></a>`,
].filter(Boolean);
$("#community-btns").innerHTML = cards.join("");

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

// ---------- feedbacks (carrossel) ----------
const STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z"/></svg>';
const starsHtml = (n) => `<span class="stars">${[1, 2, 3, 4, 5].map((i) => STAR.replace("<svg", `<svg class="${i <= n ? "on" : ""}"`)).join("")}</span>`;
let fbs = [];
try { fbs = await listFeedbacks(); } catch (e) { console.error(e); }
const track = $("#fb-track");
if (!fbs.length) {
  track.innerHTML = `<div class="fb-empty">${icon("heart")}<p>Seja a primeira a contar como foi sua experiência com a JS STORE.</p></div>`;
  $("#fb-nav").classList.add("hidden");
} else {
  track.innerHTML = fbs.map((f, i) => `<figure class="fb-item" data-i="${i}">
    <svg class="fb-quote" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 6C4.4 7.3 3 9.6 3 12.8V18h6v-6H6c0-1.9.8-3.3 2.4-4.1zm10 0c-2.8 1.3-4.2 3.6-4.2 6.8V18h6v-6h-3c0-1.9.8-3.3 2.4-4.1z"/></svg>
    ${starsHtml(f.nota)}
    <blockquote>${esc(f.texto)}</blockquote>
    <figcaption><span class="fb-av">${esc((f.nome || "?").trim().charAt(0).toUpperCase())}</span><span><b>${esc(f.nome)}</b>${f.cidade ? `<small>${esc(f.cidade)}</small>` : ""}</span></figcaption>
  </figure>`).join("");
  // pontinhos + avanço automático suave (pausa quando a pessoa interage)
  const items = $$(".fb-item", track);
  const dots = $("#fb-dots");
  dots.innerHTML = items.map((_, i) => `<button aria-label="Feedback ${i + 1}" data-dot="${i}"></button>`).join("");
  const step = () => (items[1] ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth);
  const current = () => Math.round(track.scrollLeft / step());
  const perView = () => Math.max(1, Math.round(track.clientWidth / step()));
  const go = (i) => {
    const max = Math.max(0, items.length - perView());
    if (i > max) i = 0; if (i < 0) i = max;
    track.scrollTo({ left: i * step(), behavior: "smooth" });
  };
  const paint = () => { const c = current(); $$("button", dots).forEach((d, i) => d.classList.toggle("on", i >= c && i < c + perView())); };
  track.addEventListener("scroll", () => requestAnimationFrame(paint), { passive: true }); paint();
  $$("[data-fb]").forEach((b) => b.addEventListener("click", () => { go(current() + +b.dataset.fb); pause(); }));
  dots.addEventListener("click", (e) => { const d = e.target.closest("[data-dot]"); if (d) { go(+d.dataset.dot); pause(); } });
  let timer = null, resume = null;
  const start = () => { if (matchMedia("(prefers-reduced-motion: reduce)").matches || items.length <= perView()) return; clearInterval(timer); timer = setInterval(() => go(current() + 1), 5500); };
  const pause = () => { clearInterval(timer); clearTimeout(resume); resume = setTimeout(start, 9000); };
  ["pointerdown", "touchstart", "wheel"].forEach((ev) => track.addEventListener(ev, pause, { passive: true }));
  track.addEventListener("mouseenter", () => clearInterval(timer)); track.addEventListener("mouseleave", start);
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : clearInterval(timer))).observe(track);
}

// formulário de feedback (entra como pendente; a loja aprova no painel)
$("#fb-open").addEventListener("click", () => {
  modal(`<h3>Conte como foi</h3><p class="muted" style="margin:0 0 16px">Seu feedback ajuda outras clientes. Ele aparece no site depois que a loja revisar.</p>
    <form id="fbf">
      <div class="field"><label for="fn">Seu nome *</label><input class="input" id="fn" maxlength="80" required autocomplete="given-name"></div>
      <div class="field"><label for="fc">Cidade</label><input class="input" id="fc" maxlength="60" autocomplete="address-level2"></div>
      <div class="field"><label>Sua nota</label><div class="star-pick" id="fs">${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-n="${i}" class="on" aria-label="${i} estrela(s)">${STAR}</button>`).join("")}</div></div>
      <div class="field"><label for="ft">Comentário *</label><textarea class="textarea" id="ft" maxlength="600" required placeholder="O que você achou das peças e do atendimento?"></textarea></div>
      <input type="text" id="fhp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
      <button class="btn btn-gold btn-block" id="fsend">Enviar feedback</button>
    </form>`, {
    onOpen(m) {
      let nota = 5;
      m.querySelector("#fs").addEventListener("click", (e) => { const b = e.target.closest("[data-n]"); if (!b) return; nota = +b.dataset.n; m.querySelectorAll("#fs button").forEach((x) => x.classList.toggle("on", +x.dataset.n <= nota)); });
      m.querySelector("#fbf").onsubmit = async (e) => {
        e.preventDefault();
        if (m.querySelector("#fhp").value) { closeModal(); return; } // robô
        const btn = m.querySelector("#fsend"); btn.disabled = true; btn.textContent = "Enviando...";
        try {
          await submitFeedback({ nome: m.querySelector("#fn").value, cidade: m.querySelector("#fc").value, nota, texto: m.querySelector("#ft").value });
          closeModal(); toast("Obrigada! Seu feedback foi enviado e será revisado pela loja.", { ic: "heart", ms: 5000 });
        } catch (er) { toast(er.message || "Não foi possível enviar agora.", { err: true }); btn.disabled = false; btn.textContent = "Enviar feedback"; }
      };
    },
  });
});

observeReveal();

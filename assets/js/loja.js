import { listProducts, stockTotal, finalPrice } from "./data.js";
import { initPage, state, productCard, skeletonCards, observeReveal, $, $$, esc } from "./ui.js";

const params = new URLSearchParams(location.search);
await initPage(params.get("f") === "novidades" ? "/loja?f=novidades" : params.get("f") === "promo" ? "/loja?f=promo" : "/loja");

const f = { cat: params.get("c") || "", q: (params.get("q") || "").trim(), show: params.get("f") || "", sort: "new", stock: true, sizes: new Set() };
$("#f-show").value = f.show;
$("#grid").innerHTML = skeletonCards(8);

let products = [];
try { products = await listProducts(); } catch (e) { console.error(e); $("#grid").innerHTML = `<p class="muted">Não foi possível carregar as peças agora.</p>`; }
state.products = products;

const cats = [...new Set(products.map((p) => p.categoria).filter(Boolean))];
const sizes = [...new Set(products.flatMap((p) => (p.tamanhos || []).map((t) => t.t)))];
const order = ["PP", "P", "M", "G", "GG", "XG", "U"];
const rank = (s) => (order.includes(s) ? order.indexOf(s) : isNaN(+s) ? 1000 : 100 + +s);
sizes.sort((a, b) => rank(a) - rank(b));

$("#cats").innerHTML = `<button class="cat" data-cat="">Tudo</button>` + cats.map((c) => `<button class="cat" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
$("#f-sizes").innerHTML = sizes.length ? `<span class="muted" style="font-size:13px;align-self:center;margin-right:6px">Tamanho:</span>` + sizes.map((s) => `<button class="size" data-size="${esc(s)}">${esc(s)}</button>`).join("") : "";

const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function render() {
  $$(".cat", $("#cats")).forEach((b) => b.classList.toggle("active", b.dataset.cat === f.cat));
  let list = products.filter((p) => {
    if (f.cat && p.categoria !== f.cat) return false;
    if (f.q && !norm(p.nome + " " + p.categoria + " " + p.descricao + " " + (p.cores || []).join(" ")).includes(norm(f.q))) return false;
    if (f.show === "novidades" && !p.novidade) return false;
    if (f.show === "promo" && !(finalPrice(p) < Number(p.preco))) return false;
    if (f.show === "destaque" && !p.destaque) return false;
    if (f.stock && !stockTotal(p)) return false;
    if (f.sizes.size && !(p.tamanhos || []).some((t) => f.sizes.has(t.t) && t.q > 0)) return false;
    return true;
  });
  const s = { new: (a, b) => b.created_at.localeCompare(a.created_at), hot: (a, b) => (b.vendidos || 0) - (a.vendidos || 0), low: (a, b) => finalPrice(a) - finalPrice(b), high: (a, b) => finalPrice(b) - finalPrice(a) };
  list.sort(s[f.sort]);

  const titles = { novidades: ["Acabou de chegar", "Novidades"], promo: ["Preço especial", "Promoções"], destaque: ["Em alta", "As mais amadas"] };
  const [eb, tt] = f.q ? ["Busca", `“${f.q}”`] : titles[f.show] || ["Coleção", f.cat || "Toda a loja"];
  $("#shop-eyebrow").textContent = eb; $("#shop-title").textContent = tt;
  document.title = `${tt} · JS STORE`;

  $("#count").textContent = `${list.length} ${list.length === 1 ? "peça" : "peças"}`;
  $("#grid").innerHTML = list.length ? list.map((p) => productCard(p)).join("")
    : `<div class="empty" style="grid-column:1/-1"><img class="theme-img" data-light="/assets/img/butterfly.webp" data-dark="/assets/img/butterfly-dark.webp" alt=""><p>Nenhuma peça encontrada com esses filtros.</p><button class="btn btn-ghost btn-sm" id="clear">Limpar filtros</button></div>`;
  $("#clear")?.addEventListener("click", () => { f.cat = ""; f.q = ""; f.show = ""; f.sizes.clear(); $("#f-show").value = ""; $$(".size", $("#f-sizes")).forEach((b) => b.classList.remove("sel")); render(); });
  observeReveal($("#grid"));

  const u = new URLSearchParams();
  if (f.cat) u.set("c", f.cat); if (f.q) u.set("q", f.q); if (f.show) u.set("f", f.show);
  history.replaceState(null, "", "/loja" + (u.toString() ? "?" + u : ""));
}

$("#cats").addEventListener("click", (e) => { const b = e.target.closest(".cat"); if (b) { f.cat = b.dataset.cat; render(); } });
$("#f-sort").addEventListener("change", (e) => { f.sort = e.target.value; render(); });
$("#f-show").addEventListener("change", (e) => { f.show = e.target.value; render(); });
$("#f-stock").addEventListener("change", (e) => { f.stock = e.target.checked; render(); });
$("#f-sizes").addEventListener("click", (e) => {
  const b = e.target.closest(".size"); if (!b) return;
  const s = b.dataset.size; f.sizes.has(s) ? f.sizes.delete(s) : f.sizes.add(s);
  b.classList.toggle("sel"); render();
});
render();

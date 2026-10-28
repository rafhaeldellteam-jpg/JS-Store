// =============================================================
//  JS STORE — Painel administrativo
// =============================================================
import * as db from "./data.js";
import { SIZE_PRESETS, stockTotal, finalPrice, DEMO_MODE } from "./data.js";
import { icon, brl, esc, toast, modal, closeModal, productCard, state, $, $$, waLink, butterflySvg, toggleTheme, themeIcons } from "./ui.js";

const I = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"/>',
  gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  calc: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8M16 14v4M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  edit: '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/>',
  trash: '<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  eye: '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  money: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  star: '<path d="M11.52 2.3a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.9l5.16-.76a2.12 2.12 0 0 0 1.6-1.16z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  pin: '<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  store: '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M2 7h20v3a2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0Z"/>',
};
const ic = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ""}</svg>`;

const app = $("#app");
const S = { products: [], orders: [], config: null, dirty: false };
const STATUS = { pendente: "Pendente", confirmado: "Confirmado", enviado: "Enviado", entregue: "Entregue", cancelado: "Cancelado" };
const fmtDate = (d) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const errMsg = (e) => (e && (e.message || e.error_description)) || "Algo deu errado. Tente novamente.";
const imgOf = (p) => p.imagens?.[0] || "/assets/img/butterfly.webp";

// ---------------- inicialização ----------------
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-theme-toggle]"); if (!t) return;
  e.preventDefault(); toggleTheme(e);
});
boot();
async function boot() {
  let user = null;
  try { user = await db.currentUser(); } catch (e) { console.error(e); }
  db.onAuthChange((ev) => { if (ev === "PASSWORD_RECOVERY") setTimeout(changePasswordModal, 500); });
  if (!user) return loginView();
  if (!(await db.isAdmin())) return noAccessView(user);
  await loadAll();
  addEventListener("hashchange", route);
  addEventListener("beforeunload", (e) => { if (S.dirty) { e.preventDefault(); e.returnValue = ""; } });
  route();
}

async function loadAll() {
  const [c, p, o] = await Promise.allSettled([db.getConfig(), db.listProducts({ admin: true }), db.listOrders()]);
  S.config = c.value || db.DEFAULT_CONFIG; state.config = S.config;
  S.products = p.value || [];
  S.orders = o.value || [];
  if (p.status === "rejected") toast("Erro ao carregar produtos: " + errMsg(p.reason), { err: true, ms: 8000 });
}

// ---------------- login ----------------
function loginView(msg = "") {
  app.innerHTML = `<div class="login"><div class="login-box">
    <img src="/assets/img/logo-full.webp" alt="JS STORE">
    <h1>Área da loja</h1><p class="muted" style="margin:0">Entre para gerenciar seus produtos</p>
    ${DEMO_MODE ? `<div class="demo-banner" style="margin:16px 0 0;text-align:left">Modo demonstração: clique em <b>Entrar</b> (qualquer senha). Os dados ficam só neste navegador.</div>` : ""}
    <form id="login-f">
      <div class="field"><label for="em">E-mail</label><input class="input" id="em" type="email" autocomplete="username" ${DEMO_MODE ? "" : "required"}></div>
      <div class="field"><label for="pw">Senha</label><input class="input" id="pw" type="password" autocomplete="current-password" ${DEMO_MODE ? "" : "required"}></div>
      <div class="err" id="lerr">${esc(msg)}</div>
      <button class="btn btn-gold btn-block" id="lbtn">Entrar</button>
      ${DEMO_MODE ? "" : `<p style="text-align:center;margin:16px 0 0"><a href="#" class="link" id="forgot" style="font-size:14px">Esqueci minha senha</a></p>`}
    </form>
    <p style="margin:22px 0 0;display:flex;justify-content:space-between;align-items:center"><a href="/" class="muted" style="font-size:13.5px">Voltar para a loja</a><button class="icon-btn theme-btn" data-theme-toggle aria-label="Modo claro/escuro">${themeIcons()}</button></p>
  </div></div>`;
  $("#login-f").onsubmit = async (e) => {
    e.preventDefault();
    const b = $("#lbtn"); b.disabled = true; b.textContent = "Entrando...";
    try { await db.login($("#em").value.trim(), $("#pw").value); location.hash = "#inicio"; location.reload(); }
    catch (er) { $("#lerr").textContent = errMsg(er); b.disabled = false; b.textContent = "Entrar"; }
  };
  $("#forgot")?.addEventListener("click", async (e) => {
    e.preventDefault();
    const em = $("#em").value.trim();
    if (!em) { $("#lerr").textContent = "Digite seu e-mail acima primeiro."; return; }
    try { await db.resetPassword(em); $("#lerr").style.color = "var(--ok)"; $("#lerr").textContent = "Enviamos um link para seu e-mail."; }
    catch (er) { $("#lerr").textContent = errMsg(er); }
  });
}
function noAccessView(user) {
  app.innerHTML = `<div class="login"><div class="login-box"><img src="/assets/img/logo-full.webp" alt="JS STORE">
  <h1>Sem permissão</h1><p class="muted">O e-mail <b>${esc(user.email)}</b> entrou, mas ainda não foi liberado como administrador.</p>
  <button class="btn btn-ghost btn-block" id="lo">Sair</button></div></div>`;
  $("#lo").onclick = async () => { await db.logout(); location.reload(); };
}

// ---------------- estrutura ----------------
const NAV = [
  ["inicio", "Início", "home"], ["produtos", "Produtos", "shirt"], ["estoque", "Estoque", "box"],
  ["pedidos", "Pedidos", "receipt"], ["config", "Configurações", "gear"], ["calculadora", "Calculadora", "calc"],
];
function shell(active, title, sub, content, actions = "") {
  const pend = S.orders.filter((o) => o.status === "pendente").length;
  const pill = (k) => (k === "pedidos" && pend ? `<span class="pill">${pend}</span>` : "");
  app.innerHTML = `<div class="shell">
    <aside class="side">
      <a class="brand" href="/" target="_blank"><img src="/assets/img/butterfly.webp" alt="" width="40"><span><b>JS STORE</b><small>PAINEL</small></span></a>
      ${NAV.map(([k, t, i]) => `<a class="nav-i ${active === k ? "on" : ""}" href="#${k}">${ic(i)} ${t}${pill(k)}</a>`).join("")}
      <div class="bottom">
        <a class="nav-i theme-btn" href="#" data-theme-toggle>${themeIcons()} Modo claro/escuro</a>
        <a class="nav-i" href="/" target="_blank">${ic("store")} Ver loja</a>
        <a class="nav-i" href="#" data-logout>${ic("out")} Sair</a>
      </div>
    </aside>
    <main class="main">
      ${DEMO_MODE ? `<div class="demo-banner"><b>Modo demonstração</b> — tudo que você cadastrar fica salvo só neste navegador. Depois de conectar o Supabase, os dados ficam online. <a href="#" class="link" data-resetdemo>Restaurar exemplo</a></div>` : ""}
      <div class="topline"><div><h1>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ""}</div><div style="display:flex;gap:8px;flex-wrap:wrap">${actions}</div></div>
      <div id="view">${content}</div>
    </main>
    <nav class="tabbar">
      ${[["inicio", "Início", "home"], ["produtos", "Produtos", "shirt"], ["estoque", "Estoque", "box"], ["pedidos", "Pedidos", "receipt"], ["mais", "Mais", "more"]]
        .map(([k, t, i]) => `<a href="#${k}" class="${active === k || (k === "mais" && ["config", "calculadora"].includes(active)) ? "on" : ""}">${ic(i)}${t}${pill(k)}</a>`).join("")}
    </nav>
  </div>`;
  $("[data-logout]").onclick = async (e) => { e.preventDefault(); await db.logout(); location.hash = ""; location.reload(); };
  $("[data-resetdemo]")?.addEventListener("click", (e) => { e.preventDefault(); if (confirm("Apagar seus testes e voltar aos produtos de exemplo?")) { db.resetDemo(); location.reload(); } });
  scrollTo(0, 0);
}

function route() {
  if (S.dirty && !confirm("Você tem alterações não salvas. Sair mesmo assim?")) { history.back(); return; }
  S.dirty = false;
  const [r, arg] = location.hash.slice(1).split("/");
  ({ inicio: dashboard, produtos: productsView, produto: () => productForm(arg), estoque: stockView, pedidos: ordersView, config: configView, calculadora: calcView, mais: moreView }[r] || dashboard)();
}

// ---------------- início ----------------
function dashboard() {
  const P = S.products, O = S.orders;
  const ativos = P.filter((p) => p.ativo).length;
  const pecas = P.reduce((a, p) => a + stockTotal(p), 0);
  const pend = O.filter((o) => o.status === "pendente");
  const now = new Date();
  const vendasMes = O.filter((o) => ["confirmado", "enviado", "entregue"].includes(o.status) && new Date(o.created_at).getMonth() === now.getMonth() && new Date(o.created_at).getFullYear() === now.getFullYear());
  const fat = vendasMes.reduce((a, o) => a + Number(o.total), 0);
  const low = [];
  P.filter((p) => p.ativo).forEach((p) => (p.tamanhos || []).forEach((t) => { if (t.q <= 1) low.push({ p, t }); }));
  const top = [...P].sort((a, b) => (b.vendidos || 0) - (a.vendidos || 0)).filter((p) => p.vendidos > 0).slice(0, 5);
  const maxV = top[0]?.vendidos || 1;
  const hello = now.getHours() < 12 ? "Bom dia" : now.getHours() < 18 ? "Boa tarde" : "Boa noite";

  shell("inicio", `<span class="hello">${hello}! ${butterflySvg()}</span>`, now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }), `
    <div class="kpis">
      <div class="kpi"><div class="ic">${ic("money")}</div><span>Vendas no mês</span><b>${brl(fat)}</b><small>${vendasMes.length} pedido(s) confirmados</small></div>
      <div class="kpi ${pend.length ? "alert" : ""}"><div class="ic">${ic("receipt")}</div><span>Pedidos pendentes</span><b>${pend.length}</b><small><a class="link" href="#pedidos">ver pedidos</a></small></div>
      <div class="kpi"><div class="ic">${ic("shirt")}</div><span>Produtos na loja</span><b>${ativos}</b><small>${P.length - ativos} oculto(s)</small></div>
      <div class="kpi ${low.length ? "alert" : ""}"><div class="ic">${ic("box")}</div><span>Peças em estoque</span><b>${pecas}</b><small>${low.length} tamanho(s) acabando</small></div>
    </div>
    <div class="cols">
      <div>
        <div class="panel"><h3>Últimos pedidos <a class="link" href="#pedidos" style="font-weight:400;font-size:13px">ver todos</a></h3>
          ${O.slice(0, 6).map((o) => `<div class="list-row"><div class="grow"><b>${esc(o.codigo)} · ${esc(o.cliente_nome)}</b><small>${fmtDate(o.created_at)} · ${o.itens.length} item(ns)</small></div><span class="st ${o.status}">${STATUS[o.status]}</span><b style="min-width:90px;text-align:right">${brl(o.total)}</b></div>`).join("")
            || `<p class="muted">Quando uma cliente finalizar pelo WhatsApp, o pedido aparece aqui.</p>`}
        </div>
        <div class="panel" style="margin-top:18px"><h3>Mais vendidos</h3>
          ${top.length ? `<div class="bars">${top.map((p) => `<div class="bar-row"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.nome)}</span><div class="t"><i style="width:${(p.vendidos / maxV) * 100}%"></i></div><b>${p.vendidos}</b></div>`).join("")}</div>` : `<p class="muted">Ainda sem vendas confirmadas.</p>`}
        </div>
      </div>
      <div>
        <div class="panel"><h3>Ações rápidas</h3>
          <div style="display:grid;gap:10px">
            <a class="btn btn-gold btn-block" href="#produto/novo">${ic("plus")} Cadastrar produto</a>
            <button class="btn btn-ghost btn-block" id="copy-link">${ic("link")} Copiar link da loja</button>
            <a class="btn btn-ghost btn-block" href="#calculadora">${ic("calc")} Calcular preço</a>
          </div>
        </div>
        <div class="panel" style="margin-top:18px"><h3><span style="display:flex;gap:8px;align-items:center">${ic("alert").replace("<svg", '<svg style="width:18px;color:var(--warn)"')} Estoque acabando</span></h3>
          ${low.slice(0, 8).map(({ p, t }) => `<div class="list-row"><img src="${esc(imgOf(p))}" alt=""><div class="grow"><b>${esc(p.nome)}</b><small>Tamanho ${esc(t.t)}</small></div><span class="chip-sz ${t.q ? "low" : "zero"}">${t.q ? "resta 1" : "esgotado"}</span></div>`).join("")
            || `<p class="muted"><span class="ok-line">${ic("check")} Tudo certo com o estoque</span></p>`}
          ${low.length ? `<a class="btn btn-ghost btn-sm" style="margin-top:12px" href="#estoque">Repor estoque</a>` : ""}
        </div>
      </div>
    </div>`, `<a class="btn btn-gold btn-sm" href="#produto/novo">${ic("plus")} Novo produto</a>`);
  $("#copy-link").onclick = async () => { await navigator.clipboard?.writeText(location.origin); toast("Link copiado! Cole na bio do Instagram.", { ic: "link" }); };
}

// ---------------- produtos ----------------
function productsView() {
  const cats = [...new Set(S.products.map((p) => p.categoria).filter(Boolean))];
  shell("produtos", "Produtos", `${S.products.length} cadastrado(s)`, `
    <div class="filters">
      <input class="input" id="q" placeholder="Buscar por nome..." autocomplete="off">
      <select class="select" id="fc"><option value="">Todas as categorias</option>${cats.map((c) => `<option>${esc(c)}</option>`).join("")}</select>
      <select class="select" id="fs"><option value="">Todos</option><option value="ativo">Na loja</option><option value="inativo">Ocultos</option><option value="esgotado">Esgotados</option><option value="promo">Em promoção</option></select>
    </div>
    <table class="ptable"><thead><tr><th>Produto</th><th>Preço</th><th>Estoque</th><th>Na loja</th><th></th></tr></thead><tbody id="tb"></tbody></table>`,
    `<a class="btn btn-gold btn-sm" href="#produto/novo">${ic("plus")} Novo produto</a>`);

  const draw = () => {
    const q = $("#q").value.toLowerCase(), c = $("#fc").value, s = $("#fs").value;
    const list = S.products.filter((p) => (!q || p.nome.toLowerCase().includes(q)) && (!c || p.categoria === c) &&
      (!s || (s === "ativo" && p.ativo) || (s === "inativo" && !p.ativo) || (s === "esgotado" && !stockTotal(p)) || (s === "promo" && finalPrice(p) < p.preco)));
    $("#tb").innerHTML = list.map((p) => `<tr data-id="${esc(p.id)}">
      <td class="c-main"><div class="pcell"><img src="${esc(imgOf(p))}" alt=""><div><b>${esc(p.nome)}</b><small>${esc(p.categoria)}${p.destaque ? ` · <span class="star-ic">${ic("star")}</span> destaque` : ""}${p.novidade ? " · novo" : ""}</small></div></div></td>
      <td>${finalPrice(p) < p.preco ? `<b>${brl(finalPrice(p))}</b> <s class="muted" style="font-size:12.5px">${brl(p.preco)}</s>` : brl(p.preco)}</td>
      <td class="hide-m">${(p.tamanhos || []).map((t) => `<span class="chip-sz ${t.q <= 0 ? "zero" : t.q <= 1 ? "low" : ""}">${esc(t.t)}: ${t.q}</span>`).join("") || '<span class="muted">—</span>'}</td>
      <td><label class="switch" title="Mostrar na loja"><input type="checkbox" data-toggle ${p.ativo ? "checked" : ""}><i></i></label></td>
      <td><div class="row-actions">
        <a class="icon-btn" href="/produto?p=${encodeURIComponent(p.slug)}" target="_blank" title="Ver na loja">${ic("eye")}</a>
        <button class="icon-btn" data-dup title="Duplicar">${ic("copy")}</button>
        <a class="icon-btn" href="#produto/${esc(p.id)}" title="Editar">${ic("edit")}</a>
        <button class="icon-btn" data-del title="Excluir">${ic("trash")}</button></div></td></tr>`).join("")
      || `<tr><td colspan="5" style="text-align:center;padding:40px" class="muted">Nenhum produto encontrado. <a class="link" href="#produto/novo">Cadastrar o primeiro</a></td></tr>`;
  };
  ["q", "fc", "fs"].forEach((id) => $("#" + id).addEventListener("input", draw));
  draw();

  $("#tb").addEventListener("click", async (e) => {
    const tr = e.target.closest("tr[data-id]"); if (!tr) return;
    const p = S.products.find((x) => x.id === tr.dataset.id);
    if (e.target.closest("[data-del]")) {
      if (!confirm(`Excluir "${p.nome}" definitivamente?\n\nDica: para só esconder da loja, use a chavinha "Na loja".`)) return;
      try { await db.deleteProduct(p.id); S.products = S.products.filter((x) => x !== p); draw(); toast("Produto excluído"); } catch (er) { toast(errMsg(er), { err: true }); }
    } else if (e.target.closest("[data-dup]")) {
      const copy = { ...p, id: undefined, nome: p.nome + " (cópia)", slug: "", ativo: false, vendidos: 0, created_at: undefined };
      try { const n = await db.saveProduct(copy); S.products.unshift(n); location.hash = "#produto/" + n.id; toast("Cópia criada — edite e ative quando quiser"); } catch (er) { toast(errMsg(er), { err: true }); }
    }
  });
  $("#tb").addEventListener("change", async (e) => {
    if (!e.target.matches("[data-toggle]")) return;
    const p = S.products.find((x) => x.id === e.target.closest("tr").dataset.id);
    try { await db.saveProduct({ id: p.id, nome: p.nome, slug: p.slug, preco: p.preco, preco_promo: p.preco_promo, ativo: e.target.checked }); p.ativo = e.target.checked; toast(p.ativo ? "Produto visível na loja" : "Produto escondido da loja", { ic: p.ativo ? "check" : "alert" }); }
    catch (er) { e.target.checked = !e.target.checked; toast(errMsg(er), { err: true }); }
  });
}

// ---------------- formulário de produto ----------------
function productForm(id) {
  const orig = id && id !== "novo" ? S.products.find((p) => String(p.id) === id) : null;
  if (id !== "novo" && !orig) { location.hash = "#produtos"; return; }
  const p = orig ? structuredClone(orig) : { nome: "", categoria: S.config.categorias?.[0] || "", descricao: "", preco: "", preco_promo: "", imagens: [], tamanhos: [], cores: [], destaque: false, novidade: true, ativo: true };
  const cats = [...new Set([...(S.config.categorias || []), ...S.products.map((x) => x.categoria)].filter(Boolean))];

  shell("produtos", orig ? "Editar produto" : "Novo produto", `<a class="link" href="#produtos">← voltar para produtos</a>`, `
  <form id="pf" class="form-grid" novalidate>
    <div>
      <div class="panel"><h3>Informações</h3>
        <div class="field"><label for="nome">Nome da peça *</label><input class="input" id="nome" maxlength="120" required value="${esc(p.nome)}" placeholder="Ex.: Vestido Midi Rosé"></div>
        <div class="row2">
          <div class="field"><label for="cat">Categoria</label><input class="input" id="cat" list="cats" value="${esc(p.categoria)}" placeholder="Escolha ou digite uma nova"><datalist id="cats">${cats.map((c) => `<option value="${esc(c)}">`).join("")}</datalist></div>
          <div class="field"><label>Cores</label><div class="tagsin" id="cores"><input placeholder="Digite e Enter" id="cor-in"></div></div>
        </div>
        <div class="field"><label for="desc">Descrição</label><textarea class="textarea" id="desc" maxlength="2000" placeholder="Tecido, caimento, como usar, cuidados...">${esc(p.descricao)}</textarea></div>
      </div>
      <div class="panel"><h3>Fotos <span class="hint" style="font-weight:400">A primeira é a capa · arraste para reordenar</span></h3>
        <label class="dropzone" id="dz">${ic("upload")}<div><b>Toque para escolher fotos</b> ou arraste aqui</div><div class="hint">JPG, PNG ou da câmera do celular — reduzimos o tamanho automaticamente</div><input type="file" id="files" accept="image/*" multiple hidden></label>
        <div class="imgs" id="imgs"></div>
      </div>
      <div class="panel"><h3>Tamanhos e estoque</h3>
        <div class="presets">${Object.keys(SIZE_PRESETS).map((k) => `<button type="button" class="opt" data-preset="${esc(k)}">+ ${esc(k)}</button>`).join("")}<button type="button" class="opt" data-addsize>+ Outro</button></div>
        <div class="size-rows" id="sizes"></div>
        <p class="hint" style="margin:12px 0 0" id="stock-sum"></p>
      </div>
    </div>
    <div>
      <div class="panel"><h3>Preço</h3>
        <div class="field"><label for="preco">Preço *</label><div class="money"><input class="input" id="preco" inputmode="decimal" required value="${p.preco !== "" ? Number(p.preco).toFixed(2).replace(".", ",") : ""}" placeholder="0,00"></div></div>
        <div class="field"><label for="promo">Preço promocional <span class="hint">(opcional)</span></label><div class="money"><input class="input" id="promo" inputmode="decimal" value="${p.preco_promo ? Number(p.preco_promo).toFixed(2).replace(".", ",") : ""}" placeholder="0,00"></div></div>
        <p class="hint" id="price-hint" style="margin:0"></p>
      </div>
      <div class="panel"><h3>Visibilidade</h3>
        <div style="display:grid;gap:14px">
          <label class="switch"><input type="checkbox" id="ativo" ${p.ativo ? "checked" : ""}><i></i> Mostrar na loja</label>
          <label class="switch"><input type="checkbox" id="novidade" ${p.novidade ? "checked" : ""}><i></i> Selo "Novo"</label>
          <label class="switch"><input type="checkbox" id="destaque" ${p.destaque ? "checked" : ""}><i></i> Destaque em "Mais amadas"</label>
        </div>
      </div>
      <div class="panel"><h3>Prévia na loja</h3><div class="preview-card" id="preview"></div></div>
    </div>
    <div class="savebar" style="grid-column:1/-1">
      <a class="btn btn-ghost" href="#produtos">Cancelar</a>
      <button class="btn btn-gold" id="save">Salvar produto</button>
    </div>
  </form>`);

  const markDirty = () => { S.dirty = true; preview(); };
  const num = (v) => { const n = parseFloat(String(v).replace(/\./g, "").replace(",", ".")); return isNaN(n) ? "" : n; };

  // cores
  const drawCores = () => {
    $$("#cores span").forEach((s) => s.remove());
    $("#cor-in").insertAdjacentHTML("beforebegin", p.cores.map((c, i) => `<span>${esc(c)}<button type="button" data-rmcor="${i}">×</button></span>`).join(""));
  };
  $("#cor-in").addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === ",") && e.target.value.trim()) { e.preventDefault(); p.cores.push(e.target.value.trim()); e.target.value = ""; drawCores(); markDirty(); }
    else if (e.key === "Backspace" && !e.target.value && p.cores.length) { p.cores.pop(); drawCores(); markDirty(); }
  });
  $("#cor-in").addEventListener("blur", (e) => { if (e.target.value.trim()) { p.cores.push(e.target.value.trim()); e.target.value = ""; drawCores(); markDirty(); } });
  $("#cores").addEventListener("click", (e) => { const b = e.target.closest("[data-rmcor]"); if (b) { p.cores.splice(+b.dataset.rmcor, 1); drawCores(); markDirty(); } else $("#cor-in").focus(); });
  drawCores();

  // tamanhos
  const drawSizes = () => {
    $("#sizes").innerHTML = p.tamanhos.map((t, i) => `<div class="size-row">
      <input class="input" data-st="${i}" value="${esc(t.t)}" placeholder="Tamanho" aria-label="Tamanho">
      <div class="stepper"><button type="button" data-step="${i}" data-d="-1">−</button><input type="number" min="0" data-sq="${i}" value="${t.q}" aria-label="Estoque"><button type="button" data-step="${i}" data-d="1">+</button></div>
      <button type="button" class="icon-btn" data-rms="${i}" aria-label="Remover">${ic("x")}</button></div>`).join("")
      || `<p class="hint">Use os botões acima para adicionar os tamanhos que você tem (ex.: PP, P, M, G, GG).</p>`;
    const tot = p.tamanhos.reduce((a, t) => a + (+t.q || 0), 0);
    $("#stock-sum").textContent = p.tamanhos.length ? `Total em estoque: ${tot} peça(s)` : "";
  };
  $("#sizes").addEventListener("input", (e) => {
    if (e.target.dataset.st) p.tamanhos[+e.target.dataset.st].t = e.target.value.trim().toUpperCase();
    if (e.target.dataset.sq) { p.tamanhos[+e.target.dataset.sq].q = Math.max(0, parseInt(e.target.value) || 0); $("#stock-sum").textContent = `Total em estoque: ${p.tamanhos.reduce((a, t) => a + (+t.q || 0), 0)} peça(s)`; }
    markDirty();
  });
  $("#sizes").addEventListener("click", (e) => {
    const s = e.target.closest("[data-step]"), r = e.target.closest("[data-rms]");
    if (s) { const t = p.tamanhos[+s.dataset.step]; t.q = Math.max(0, (+t.q || 0) + +s.dataset.d); drawSizes(); markDirty(); }
    if (r) { p.tamanhos.splice(+r.dataset.rms, 1); drawSizes(); markDirty(); }
  });
  $$("[data-preset]").forEach((b) => b.onclick = () => {
    SIZE_PRESETS[b.dataset.preset].forEach((t) => { if (!p.tamanhos.some((x) => x.t === t)) p.tamanhos.push({ t, q: 0 }); });
    drawSizes(); markDirty();
  });
  $("[data-addsize]").onclick = () => { p.tamanhos.push({ t: "", q: 0 }); drawSizes(); $$("[data-st]").pop().focus(); };
  drawSizes();

  // fotos
  let dragFrom = null;
  const drawImgs = () => {
    $("#imgs").innerHTML = p.imagens.map((src, i) => `<div class="im" draggable="true" data-i="${i}"><img src="${esc(src)}" alt=""><button type="button" data-rmimg="${i}" aria-label="Remover foto">${ic("x")}</button>${i ? `<button type="button" data-cover="${i}" style="top:auto;bottom:5px;right:5px" aria-label="Tornar capa">${ic("star")}</button>` : ""}</div>`).join("");
  };
  $("#imgs").addEventListener("click", (e) => {
    const r = e.target.closest("[data-rmimg]"), c = e.target.closest("[data-cover]");
    if (r) { p.imagens.splice(+r.dataset.rmimg, 1); drawImgs(); markDirty(); }
    if (c) { const [x] = p.imagens.splice(+c.dataset.cover, 1); p.imagens.unshift(x); drawImgs(); markDirty(); toast("Foto definida como capa"); }
  });
  $("#imgs").addEventListener("dragstart", (e) => { const el = e.target.closest(".im"); if (el) { dragFrom = +el.dataset.i; el.classList.add("dragging"); } });
  $("#imgs").addEventListener("dragover", (e) => e.preventDefault());
  $("#imgs").addEventListener("drop", (e) => {
    e.preventDefault(); const el = e.target.closest(".im"); if (!el || dragFrom === null) return;
    const [x] = p.imagens.splice(dragFrom, 1); p.imagens.splice(+el.dataset.i, 0, x); dragFrom = null; drawImgs(); markDirty();
  });
  $("#imgs").addEventListener("dragend", () => { dragFrom = null; $$(".im.dragging").forEach((x) => x.classList.remove("dragging")); });
  const upload = async (files) => {
    const list = [...files].filter((f) => f.type.startsWith("image/")).slice(0, 10);
    for (const f of list) {
      const ph = document.createElement("div"); ph.className = "im loading"; ph.textContent = "Enviando..."; $("#imgs").append(ph);
      try { p.imagens.push(await db.uploadImage(f)); markDirty(); }
      catch (er) { toast("Erro ao enviar foto: " + errMsg(er), { err: true }); }
      ph.remove(); drawImgs();
    }
  };
  $("#files").onchange = (e) => { upload(e.target.files); e.target.value = ""; };
  const dz = $("#dz");
  dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("drag"); });
  dz.addEventListener("dragleave", () => dz.classList.remove("drag"));
  dz.addEventListener("drop", (e) => { e.preventDefault(); dz.classList.remove("drag"); if (e.dataTransfer.files.length) upload(e.dataTransfer.files); });
  drawImgs();

  // campos simples
  const sync = () => {
    p.nome = $("#nome").value.trim(); p.categoria = $("#cat").value.trim(); p.descricao = $("#desc").value;
    p.preco = num($("#preco").value); p.preco_promo = num($("#promo").value);
    p.ativo = $("#ativo").checked; p.novidade = $("#novidade").checked; p.destaque = $("#destaque").checked;
  };
  $("#pf").addEventListener("input", (e) => { if (!e.target.closest("#sizes") && e.target.id !== "cor-in") { sync(); markDirty(); } });
  $("#pf").addEventListener("change", () => { sync(); preview(); });

  function preview() {
    sync();
    const h = $("#price-hint");
    if (p.preco_promo !== "" && p.preco !== "" && p.preco_promo >= p.preco) h.innerHTML = `<span style="color:var(--warn)">O preço promocional precisa ser menor que o preço normal.</span>`;
    else if (p.preco_promo !== "" && p.preco) h.textContent = `Desconto de ${Math.round((1 - p.preco_promo / p.preco) * 100)}% — aparece com selo na loja.`;
    else h.textContent = S.config.pix_desconto && p.preco ? `No Pix sai por ${brl(p.preco * (1 - S.config.pix_desconto / 100))}.` : "";
    $("#preview").innerHTML = productCard({ ...p, id: "preview", slug: "", preco: p.preco || 0, preco_promo: p.preco_promo || null, nome: p.nome || "Nome da peça", tamanhos: p.tamanhos.length ? p.tamanhos : [{ t: "U", q: 1 }] }).replace("reveal", "");
  }
  preview();

  $("#pf").onsubmit = async (e) => {
    e.preventDefault(); sync();
    const problems = [];
    if (!p.nome) problems.push("o nome");
    if (!(p.preco > 0)) problems.push("o preço");
    p.tamanhos = p.tamanhos.filter((t) => t.t);
    if (!p.tamanhos.length) problems.push("pelo menos um tamanho");
    if (problems.length) { toast("Falta preencher " + problems.join(", ") + ".", { err: true }); return; }
    if (new Set(p.tamanhos.map((t) => t.t)).size !== p.tamanhos.length) { toast("Há tamanhos repetidos.", { err: true }); return; }
    if (p.preco_promo !== "" && p.preco_promo >= p.preco) p.preco_promo = "";
    if (!p.imagens.length && !confirm("Salvar sem foto? Produtos com foto vendem muito mais.")) return;
    const b = $("#save"); b.disabled = true; b.textContent = "Salvando...";
    try {
      const row = { ...p, preco_promo: p.preco_promo === "" ? null : p.preco_promo };
      delete row.vendidos;
      if (!orig) delete row.id;
      if (orig && orig.nome !== p.nome) row.slug = db.slugify(p.nome);
      const saved = await db.saveProduct(row);
      const full = { ...(orig || {}), ...row, ...(saved || {}) };
      if (orig) S.products[S.products.indexOf(orig)] = full; else S.products.unshift(full);
      S.dirty = false;
      toast(orig ? "Alterações salvas" : "Produto cadastrado! Já está na loja.");
      location.hash = "#produtos";
    } catch (er) { toast(errMsg(er), { err: true, ms: 7000 }); b.disabled = false; b.textContent = "Salvar produto"; }
  };
}

// ---------------- estoque rápido ----------------
function stockView() {
  const changed = new Map();
  const items = [...S.products].sort((a, b) => stockTotal(a) - stockTotal(b));
  shell("estoque", "Estoque", "Atualize as quantidades rapidinho — as que estão acabando aparecem primeiro", `
    <div class="filters"><input class="input" id="q" placeholder="Buscar produto..."></div>
    <table class="ptable stock-grid"><thead><tr><th>Produto</th><th>Quantidade por tamanho</th><th>Total</th></tr></thead><tbody id="tb"></tbody></table>
    <div class="savebar"><button class="btn btn-gold" id="save" disabled>Salvar estoque</button></div>`);
  const draw = () => {
    const q = $("#q").value.toLowerCase();
    $("#tb").innerHTML = items.filter((p) => !q || p.nome.toLowerCase().includes(q)).map((p) => {
      const cur = changed.get(p.id) || p.tamanhos;
      return `<tr data-id="${esc(p.id)}" class="${changed.has(p.id) ? "dirty" : ""}">
        <td class="c-main"><div class="pcell"><img src="${esc(imgOf(p))}" alt=""><div><b>${esc(p.nome)}</b><small>${p.ativo ? "" : "oculto · "}${esc(p.categoria)}</small></div></div></td>
        <td class="c-main"><div class="stock-cells">${cur.map((t, i) => `<label>${esc(t.t)}<div class="stepper"><button type="button" data-d="-1" data-i="${i}">−</button><input type="number" min="0" value="${t.q}" data-i="${i}"><button type="button" data-d="1" data-i="${i}">+</button></div></label>`).join("") || `<a class="link" href="#produto/${esc(p.id)}">adicionar tamanhos</a>`}</div></td>
        <td class="hide-m"><b>${cur.reduce((a, t) => a + (+t.q || 0), 0)}</b></td></tr>`;
    }).join("");
  };
  const edit = (tr, i, val) => {
    const p = S.products.find((x) => String(x.id) === tr.dataset.id);
    const t = structuredClone(changed.get(p.id) || p.tamanhos);
    t[i].q = Math.max(0, val(t[i].q));
    changed.set(p.id, t); tr.classList.add("dirty");
    tr.querySelectorAll("input")[i].value = t[i].q;
    const tot = tr.querySelector("td.hide-m b"); if (tot) tot.textContent = t.reduce((a, x) => a + (+x.q || 0), 0);
    $("#save").disabled = false; $("#save").textContent = `Salvar estoque (${changed.size})`; S.dirty = true;
  };
  $("#tb").addEventListener("click", (e) => { const b = e.target.closest("button[data-d]"); if (b) edit(b.closest("tr"), +b.dataset.i, (q) => (+q || 0) + +b.dataset.d); });
  $("#tb").addEventListener("change", (e) => { if (e.target.matches("input[data-i]")) edit(e.target.closest("tr"), +e.target.dataset.i, () => parseInt(e.target.value) || 0); });
  $("#q").addEventListener("input", draw);
  $("#save").onclick = async () => {
    const b = $("#save"); b.disabled = true; b.textContent = "Salvando...";
    let ok = 0;
    for (const [id, tamanhos] of changed) {
      const p = S.products.find((x) => x.id === id);
      try { await db.saveProduct({ id, nome: p.nome, slug: p.slug, preco: p.preco, preco_promo: p.preco_promo, tamanhos }); p.tamanhos = tamanhos; ok++; changed.delete(id); }
      catch (er) { toast(`${p.nome}: ${errMsg(er)}`, { err: true }); }
    }
    S.dirty = changed.size > 0;
    if (ok) toast(`Estoque atualizado em ${ok} produto(s)`);
    b.textContent = "Salvar estoque"; draw();
  };
  draw();
}

// ---------------- pedidos ----------------
function ordersView() {
  let filtro = S.orders.some((o) => o.status === "pendente") ? "pendente" : "";
  shell("pedidos", "Pedidos", "Pedidos enviados pelo WhatsApp a partir do site", `
    <p class="hint" style="margin:-10px 0 16px">Ao <b>confirmar</b> um pedido, as peças saem do estoque automaticamente. Se cancelar depois, elas voltam.</p>
    <div class="seg" id="seg" style="margin-bottom:16px"></div><div id="list"></div>`,
    `<button class="btn btn-ghost btn-sm" id="reload">Atualizar</button>`);
  const draw = () => {
    const count = (s) => S.orders.filter((o) => !s || o.status === s).length;
    $("#seg").innerHTML = [["", "Todos"], ...Object.entries(STATUS)].map(([k, t]) => `<button class="${filtro === k ? "on" : ""}" data-f="${k}">${t} (${count(k)})</button>`).join("");
    const list = S.orders.filter((o) => !filtro || o.status === filtro);
    $("#list").innerHTML = list.map((o) => {
      const tel = String(o.cliente_telefone || "").replace(/\D/g, "");
      const tel55 = tel && tel.length <= 11 ? "55" + tel : tel;
      const next = { pendente: [["confirmado", "Confirmar pagamento"]], confirmado: [["enviado", "Marcar como enviado"]], enviado: [["entregue", "Marcar como entregue"]] }[o.status] || [];
      return `<div class="order" data-id="${o.id}">
        <div class="order-head"><div><b>${esc(o.codigo)}</b> · ${esc(o.cliente_nome)}<br><small class="muted">${fmtDate(o.created_at)}</small></div><div style="text-align:right"><span class="st ${o.status}">${STATUS[o.status]}</span><br><b style="font-size:18px">${brl(o.total)}</b></div></div>
        <ul>${o.itens.map((i) => `<li><span>${i.qtd}× ${esc(i.nome)} <span class="muted">(${esc(i.tamanho)})</span></span><span>${brl(i.preco * i.qtd)}</span></li>`).join("")}</ul>
        ${o.observacao ? `<div class="obs">${esc(o.observacao)}</div>` : ""}
        <div class="order-actions">
          ${next.map(([s, t]) => `<button class="btn btn-sm" data-st="${s}">${t}</button>`).join("")}
          ${tel ? `<a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${waLink(tel55, `Oi, ${o.cliente_nome}! Aqui é da JS STORE. Sobre seu pedido ${o.codigo}:`)}">WhatsApp da cliente</a>` : ""}
          ${o.status !== "cancelado" ? `<button class="btn btn-ghost btn-sm" data-st="cancelado">Cancelar</button>` : `<button class="btn btn-ghost btn-sm" data-st="pendente">Reabrir</button><button class="icon-btn" data-delo title="Excluir">${ic("trash")}</button>`}
        </div></div>`;
    }).join("") || `<div class="panel" style="text-align:center"><p class="muted">Nenhum pedido ${filtro ? `com status "${STATUS[filtro]}"` : "ainda"}.</p></div>`;
  };
  $("#seg").addEventListener("click", (e) => { const b = e.target.closest("[data-f]"); if (b) { filtro = b.dataset.f; draw(); } });
  $("#list").addEventListener("click", async (e) => {
    const card = e.target.closest(".order"); if (!card) return;
    const o = S.orders.find((x) => String(x.id) === card.dataset.id);
    const st = e.target.closest("[data-st]");
    if (st) {
      const s = st.dataset.st;
      if (s === "cancelado" && !confirm(`Cancelar o pedido ${o.codigo}?${["confirmado", "enviado", "entregue"].includes(o.status) ? "\nAs peças voltam para o estoque." : ""}`)) return;
      st.disabled = true;
      try {
        await db.setOrderStatus(o.id, s);
        S.products = await db.listProducts({ admin: true });
        o.status = s; draw();
        toast(s === "confirmado" ? "Pedido confirmado e estoque atualizado" : `Pedido ${STATUS[s].toLowerCase()}`);
      } catch (er) { st.disabled = false; toast(errMsg(er), { err: true }); }
    }
    if (e.target.closest("[data-delo]") && confirm("Excluir este pedido do histórico?")) {
      try { await db.deleteOrder(o.id); S.orders = S.orders.filter((x) => x !== o); draw(); } catch (er) { toast(errMsg(er), { err: true }); }
    }
  });
  $("#reload").onclick = async () => { S.orders = await db.listOrders(); draw(); toast("Pedidos atualizados"); };
  draw();
}

// ---------------- configurações ----------------
function configView() {
  const c = S.config;
  const toLocal = (d) => (d ? new Date(new Date(d).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
  shell("config", "Configurações", "Textos, contatos e regras da loja", `
  <form id="cf" class="form-grid">
    <div>
      <div class="panel"><h3>Contato</h3>
        <div class="field"><label for="wa">WhatsApp que recebe os pedidos *</label><input class="input" id="wa" inputmode="tel" value="${esc(c.whatsapp)}" placeholder="5511999999999"><span class="hint">Com código do país e DDD, só números. Ex.: 55 11 99999-9999 → 5511999999999</span></div>
        <div class="row2">
          <div class="field"><label for="ig">Instagram</label><input class="input" id="ig" value="${esc(c.instagram)}" placeholder="js_store"></div>
          <div class="field"><label for="vip">Link do grupo VIP</label><input class="input" id="vip" value="${esc(c.grupo_vip)}" placeholder="https://chat.whatsapp.com/..."></div>
        </div>
        <div class="field"><label for="end">Endereço da loja / região</label><input class="input" id="end" value="${esc(c.endereco)}" placeholder="Ex.: Rua das Flores, 120 - Centro, São Paulo - SP"><span class="hint">Aparece no rodapé e é usado no botão "Como chegar" (Google Maps).</span></div>
        <div class="field"><label for="maps">Link do Google Maps <span class="hint">(opcional)</span></label><input class="input" id="maps" value="${esc(c.maps_url)}" placeholder="https://maps.app.goo.gl/..."><span class="hint">No Google Maps, abra a loja, toque em Compartilhar e cole o link aqui. Se ficar vazio, usamos o endereço acima.</span></div>
        <div class="contact-preview" id="cprev"></div>
      </div>
      <div class="panel"><h3>Página inicial</h3>
        <div class="field"><label>Foto de destaque do topo</label>
          <div class="hero-pick"><img id="hero-img" src="${esc(c.hero_imagem || db.DEMO_HERO)}" alt=""><div>
            <label class="btn btn-ghost btn-sm" style="cursor:pointer">${ic("image")} Trocar foto<input type="file" id="hero-file" accept="image/*" hidden></label>
            <p class="hint" style="margin:8px 0 0">Foto vertical fica melhor. Reduzimos o tamanho automaticamente.</p></div></div></div>
        <div class="field"><label for="ht">Título principal</label><input class="input" id="ht" maxlength="60" value="${esc(c.hero_titulo)}"></div>
        <div class="field"><label for="hs">Subtítulo</label><textarea class="textarea" id="hs" maxlength="200">${esc(c.hero_subtitulo)}</textarea></div>
        <div class="field"><label for="av">Faixa de avisos do topo <span class="hint">(um por linha)</span></label><textarea class="textarea" id="av">${esc((c.aviso_topo || []).join("\n"))}</textarea></div>
      </div>
      <div class="panel"><h3>Banner de promoção</h3>
        <div class="field"><label for="pt">Título</label><input class="input" id="pt" maxlength="60" value="${esc(c.promo_titulo)}"></div>
        <div class="field"><label for="px">Texto</label><input class="input" id="px" maxlength="160" value="${esc(c.promo_texto)}"></div>
        <div class="field"><label for="pf">Termina em <span class="hint">(mostra a contagem regressiva)</span></label><input class="input" type="datetime-local" id="pfim" value="${toLocal(c.promo_fim)}"></div>
        <p class="hint" style="margin:0">O banner aparece enquanto houver contagem ativa ou produtos com preço promocional.</p>
      </div>
    </div>
    <div>
      <div class="panel"><h3>Vendas</h3>
        <div class="field"><label for="pix">Desconto no Pix (%)</label><input class="input" id="pix" type="number" min="0" max="50" value="${Number(c.pix_desconto) || 0}"></div>
        <div class="field"><label for="fg">Frete grátis acima de (R$)</label><input class="input" id="fg" type="number" min="0" step="1" value="${Number(c.frete_gratis_acima) || 0}"><span class="hint">Use 0 para não mostrar.</span></div>
      </div>
      <div class="panel"><h3>Categorias sugeridas</h3>
        <div class="tagsin" id="cats"><input placeholder="Nova categoria + Enter" id="cat-in"></div>
      </div>
      ${DEMO_MODE ? "" : `<div class="panel"><h3>Sua conta</h3><button type="button" class="btn btn-ghost btn-block" id="chpw">Trocar minha senha</button></div>`}
    </div>
    <div class="savebar" style="grid-column:1/-1"><button class="btn btn-gold" id="save">Salvar configurações</button></div>
  </form>`);
  const cats = [...(c.categorias || [])];
  const drawCats = () => { $$("#cats span").forEach((s) => s.remove()); $("#cat-in").insertAdjacentHTML("beforebegin", cats.map((x, i) => `<span>${esc(x)}<button type="button" data-rm="${i}">×</button></span>`).join("")); };
  $("#cat-in").addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.value.trim()) { e.preventDefault(); cats.push(e.target.value.trim()); e.target.value = ""; drawCats(); S.dirty = true; } });
  $("#cats").addEventListener("click", (e) => { const b = e.target.closest("[data-rm]"); if (b) { cats.splice(+b.dataset.rm, 1); drawCats(); S.dirty = true; } });
  drawCats();
  let heroImg = c.hero_imagem || "";
  $("#hero-file").onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    $("#hero-img").style.opacity = .4;
    try { heroImg = await db.uploadImage(f); $("#hero-img").src = heroImg; S.dirty = true; toast("Foto carregada. Clique em Salvar para aplicar."); }
    catch (er) { toast("Erro ao enviar foto: " + errMsg(er), { err: true }); }
    $("#hero-img").style.opacity = 1; e.target.value = "";
  };
  const drawPrev = () => {
    const wa = $("#wa").value.replace(/\D/g, ""), ig = $("#ig").value.trim().replace(/^@/, ""), end = $("#end").value.trim(), maps = $("#maps").value.trim();
    const mapUrl = maps || (end ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("JS STORE " + end)}` : "");
    $("#cprev").innerHTML = `<span class="hint">Teste os botões:</span>
      ${wa ? `<a class="cp wa" href="${waLink(wa, "Teste do site JS STORE")}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
      ${ig ? `<a class="cp ig" href="https://instagram.com/${encodeURIComponent(ig)}" target="_blank" rel="noopener">Instagram</a>` : ""}
      ${mapUrl ? `<a class="cp map" href="${mapUrl}" target="_blank" rel="noopener">${ic("pin")} Maps</a>` : ""}`;
  };
  ["wa", "ig", "end", "maps"].forEach((id) => $("#" + id).addEventListener("input", drawPrev)); drawPrev();
  $("#cf").addEventListener("input", () => (S.dirty = true));
  $("#chpw")?.addEventListener("click", changePasswordModal);
  $("#cf").onsubmit = async (e) => {
    e.preventDefault();
    const wa = $("#wa").value.replace(/\D/g, "");
    if (wa.length < 12) { toast("Confira o WhatsApp: use 55 + DDD + número.", { err: true }); return; }
    const cfg = {
      whatsapp: wa, instagram: $("#ig").value.trim().replace(/^@/, ""), grupo_vip: $("#vip").value.trim(), endereco: $("#end").value.trim(),
      maps_url: $("#maps").value.trim(), hero_imagem: heroImg,
      hero_titulo: $("#ht").value.trim(), hero_subtitulo: $("#hs").value.trim(),
      aviso_topo: $("#av").value.split("\n").map((s) => s.trim()).filter(Boolean),
      promo_titulo: $("#pt").value.trim(), promo_texto: $("#px").value.trim(),
      promo_fim: $("#pfim").value ? new Date($("#pfim").value).toISOString() : null,
      pix_desconto: Math.max(0, Math.min(50, parseInt($("#pix").value) || 0)),
      frete_gratis_acima: Math.max(0, Number($("#fg").value) || 0), categorias: cats,
    };
    const b = $("#save"); b.disabled = true; b.textContent = "Salvando...";
    try { await db.saveConfig(cfg); Object.assign(S.config, cfg); S.dirty = false; toast("Configurações salvas"); }
    catch (er) { toast(errMsg(er), { err: true }); }
    b.disabled = false; b.textContent = "Salvar configurações";
  };
}

function changePasswordModal() {
  modal(`<h3>Nova senha</h3><p class="muted">Mínimo de 8 caracteres.</p>
    <form id="pwf"><div class="field"><input class="input" type="password" id="np" minlength="8" required autocomplete="new-password" placeholder="Nova senha"></div>
    <button class="btn btn-gold btn-block">Salvar senha</button></form>`, {
    onOpen(m) {
      m.querySelector("#pwf").onsubmit = async (e) => {
        e.preventDefault();
        try { await db.updatePassword(m.querySelector("#np").value); closeModal(); toast("Senha alterada"); } catch (er) { toast(errMsg(er), { err: true }); }
      };
    },
  });
}

// ---------------- calculadora de preço ----------------
function calcView() {
  const saved = JSON.parse(localStorage.getItem("jss_calc") || "null") || { custo: "", extra: 5, margem: 100, taxa: 4.99, pix: S.config.pix_desconto || 0 };
  shell("calculadora", "Calculadora de preço", "Descubra por quanto vender cada peça sem perder dinheiro", `
  <div class="form-grid">
    <div class="panel">
      <div class="field"><label for="c-custo">Quanto você pagou na peça</label><div class="money"><input class="input" id="c-custo" inputmode="decimal" value="${saved.custo}" placeholder="0,00"></div></div>
      <div class="field"><label for="c-extra">Embalagem, etiqueta, frete do fornecedor (por peça)</label><div class="money"><input class="input" id="c-extra" inputmode="decimal" value="${saved.extra}"></div></div>
      <div class="field"><label for="c-margem">Margem desejada sobre o custo (%)</label><input class="input" id="c-margem" type="number" value="${saved.margem}"><span class="hint">100% = vender pelo dobro do custo total</span></div>
      <div class="row2">
        <div class="field"><label for="c-taxa">Taxa da maquininha (%)</label><input class="input" id="c-taxa" type="number" step="0.01" value="${saved.taxa}"></div>
        <div class="field"><label for="c-pix">Desconto no Pix (%)</label><input class="input" id="c-pix" type="number" value="${saved.pix}"></div>
      </div>
    </div>
    <div>
      <div class="calc-out" id="out"></div>
      <a class="btn btn-gold btn-block" style="margin-top:14px" href="#produto/novo">${ic("plus")} Cadastrar produto com esse preço</a>
    </div>
  </div>`);
  const n = (id) => parseFloat(String($(id).value).replace(",", ".")) || 0;
  const calc = () => {
    const custo = n("#c-custo") + n("#c-extra"), margem = n("#c-margem") / 100, taxa = n("#c-taxa") / 100, pix = n("#c-pix") / 100;
    localStorage.setItem("jss_calc", JSON.stringify({ custo: $("#c-custo").value, extra: $("#c-extra").value, margem: $("#c-margem").value, taxa: $("#c-taxa").value, pix: $("#c-pix").value }));
    if (!custo) { $("#out").innerHTML = `<span style="color:var(--blush-300)">Preço sugerido</span><b>R$ —</b><p style="margin:0;color:var(--blush-300)">Digite o custo da peça para calcular.</p>`; return; }
    const base = (custo * (1 + margem)) / (1 - taxa);
    const preco = Math.max(Math.ceil(base) - 0.1, base);
    const lucroCartao = preco * (1 - taxa) - custo, precoPix = preco * (1 - pix), lucroPix = precoPix - custo;
    $("#out").innerHTML = `<span style="color:var(--blush-300)">Preço sugerido</span><b>${brl(preco)}</b>
      <div class="l"><span>Custo total</span><span>${brl(custo)}</span></div>
      <div class="l"><span>Lucro no cartão</span><span>${brl(lucroCartao)}</span></div>
      <div class="l"><span>Preço no Pix</span><span>${brl(precoPix)}</span></div>
      <div class="l" style="border:0"><span>Lucro no Pix</span><span style="color:${lucroPix > 0 ? "#9be0bd" : "#ffb3b3"}">${brl(lucroPix)}</span></div>`;
  };
  $$(".form-grid input").forEach((i) => i.addEventListener("input", calc));
  calc();
}

// ---------------- "Mais" (celular) ----------------
function moreView() {
  shell("mais", "Mais opções", "", `<div class="panel" style="display:grid;gap:10px">
    <a class="btn btn-ghost btn-block" href="#config">${ic("gear")} Configurações da loja</a>
    <a class="btn btn-ghost btn-block" href="#calculadora">${ic("calc")} Calculadora de preço</a>
    <button class="btn btn-ghost btn-block theme-btn" data-theme-toggle>${themeIcons()} Modo claro/escuro</button>
    <a class="btn btn-ghost btn-block" href="/" target="_blank">${ic("store")} Ver minha loja</a>
    <button class="btn btn-ghost btn-block" id="cp">${ic("link")} Copiar link da loja</button>
    <button class="btn btn-block" data-logout2>${ic("out")} Sair</button>
    <p class="hint" style="text-align:center;margin:8px 0 0">Dica: no celular, use "Adicionar à tela de início" para abrir o painel como um app.</p></div>`);
  $("#cp").onclick = async () => { await navigator.clipboard?.writeText(location.origin); toast("Link copiado!"); };
  $("[data-logout2]").onclick = async () => { await db.logout(); location.hash = ""; location.reload(); };
}

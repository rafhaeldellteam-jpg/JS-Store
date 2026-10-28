import { getProduct, listProducts, stockTotal, finalPrice } from "./data.js";
import { initPage, state, productCard, observeReveal, cart, favs, recent, sizeGuide, openDrawer, toast, setMeta, $, $$, esc, brl, icon, waLink, waIcon, imgOf } from "./ui.js";

const cfg = await initPage("/loja");
const slug = new URLSearchParams(location.search).get("p");
let p = null;
try { p = slug ? await getProduct(slug) : null; } catch (e) { console.error(e); }

if (!p || (!p.ativo && p.ativo !== undefined)) {
  $("#pdp").innerHTML = `<div class="empty" style="padding:100px 0"><img class="theme-img" data-light="/assets/img/butterfly.webp" data-dark="/assets/img/butterfly-dark.webp" alt=""><h2 style="font-family:var(--display);font-weight:500;font-size:36px;color:var(--text)">Peça não encontrada</h2><p>Ela pode ter esgotado ou saído da loja.</p><a class="btn" href="/loja">Ver outras peças</a></div>`;
} else render();

function render() {
  state.products = [p];
  recent.push(p.id);
  {
    const url = `${location.origin}/produto?p=${encodeURIComponent(p.slug)}`;
    const preco = finalPrice(p), estoque = stockTotal(p);
    const desc = `${p.nome} por ${preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}. ${String(p.descricao || "").slice(0, 140)}`;
    setMeta({
      title: `${p.nome} · JS STORE`, description: desc, image: imgOf(p), url,
      jsonld: {
        "@context": "https://schema.org", "@type": "Product", name: p.nome, description: p.descricao || p.nome,
        image: (p.imagens || []).map((u) => new URL(u, location.origin).href), sku: String(p.id), category: p.categoria,
        brand: { "@type": "Brand", name: "JS STORE" }, color: (p.cores || []).join(", ") || undefined,
        offers: { "@type": "Offer", url, priceCurrency: "BRL", price: preco.toFixed(2), itemCondition: "https://schema.org/NewCondition",
          availability: estoque ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
      },
    });
  }
  const fp = finalPrice(p), sale = fp < Number(p.preco), total = stockTotal(p);
  const pix = Number(cfg.pix_desconto) || 0;
  const imgs = p.imagens?.length ? p.imagens : [imgOf(p)];
  const parcelas = fp >= 100 ? Math.min(6, Math.floor(fp / 50)) : 0;
  let sel = null, qty = 1;

  $("#pdp").innerHTML = `
  <nav class="crumbs"><a href="/">Início</a>/<a href="/loja">Loja</a>${p.categoria ? `/<a href="/loja?c=${encodeURIComponent(p.categoria)}">${esc(p.categoria)}</a>` : ""}/<span>${esc(p.nome)}</span></nav>
  <div class="pdp">
    <div class="gallery">
      <div class="thumbs">${imgs.map((src, i) => `<button class="${i ? "" : "on"}" data-img="${i}" aria-label="Foto ${i + 1}"><img src="${esc(src)}" alt=""></button>`).join("")}</div>
      <div class="main-img" id="main-img"><img src="${esc(imgs[0])}" alt="${esc(p.nome)}"><div class="tags">${sale ? `<span class="tag sale">-${Math.round((1 - fp / p.preco) * 100)}%</span>` : ""}${p.novidade ? '<span class="tag new">Novo</span>' : ""}</div></div>
    </div>
    <div class="pdp-info">
      <span class="eyebrow">${esc(p.categoria || "JS STORE")}</span>
      <h1>${esc(p.nome)}</h1>
      <div class="price"><b>${brl(fp)}</b>${sale ? `<s>${brl(p.preco)}</s>` : ""}${pix ? `<span class="pix">${icon("pix")} ${brl(fp * (1 - pix / 100))} no Pix (${pix}% off)</span>` : ""}</div>
      ${parcelas > 1 ? `<div class="installments">ou até ${parcelas}x de ${brl(fp / parcelas)} no cartão</div>` : ""}

      <div class="pdp-block">
        <h6>Tamanho <button type="button" data-sizeguide-btn>${"Guia de medidas"}</button></h6>
        <div class="sizes" id="sizes">${(p.tamanhos || []).map((t) => `<button class="size" data-s="${esc(t.t)}" ${t.q > 0 ? "" : "disabled"} aria-label="Tamanho ${esc(t.t)}${t.q > 0 ? "" : " esgotado"}">${esc(t.t)}</button>`).join("")}</div>
        <div class="stock-note" id="stock-note">${total ? "Selecione um tamanho" : `${icon("alert")} Esta peça esgotou`}</div>
        ${p.cores?.length ? `<p style="margin:14px 0 0;font-size:14px"><span class="muted">Cor:</span> ${esc(p.cores.join(", "))}</p>` : ""}
        <div class="buy-row">
          <div class="qty"><button id="q-minus" aria-label="Diminuir">−</button><span id="q">1</span><button id="q-plus" aria-label="Aumentar">+</button></div>
          ${total ? `<button class="btn btn-gold" id="add">${icon("bag")} Adicionar à sacola</button>`
                  : cfg.whatsapp ? `<a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(cfg.whatsapp, `Oi! A peça "${p.nome}" vai voltar ao estoque? Quero ser avisada.`)}">${icon("bell")} Avise-me quando chegar</a>` : `<button class="btn" disabled>Esgotado</button>`}
          <button class="fav ${favs.has(p.id) ? "on" : ""}" id="fav" aria-label="Favoritar">${icon("heart")}</button>
        </div>
        ${total && cfg.whatsapp ? `<a class="btn btn-ghost btn-block" style="margin-top:10px" id="ask" target="_blank" rel="noopener" href="#">${waIcon} Tirar dúvida no WhatsApp</a>` : ""}
        <ul class="perks">
          <li>${icon("shield")} Compra segura com atendimento direto da loja</li>
          <li>${icon("truck")} ${cfg.frete_gratis_acima ? `Frete grátis acima de ${brl(cfg.frete_gratis_acima)}` : "Entrega ou retirada combinada"}</li>
          <li>${icon("refresh")} Troca fácil em até 7 dias</li>
        </ul>
      </div>
      <details class="acc" open><summary>Descrição</summary><p>${esc(p.descricao || "Peça da curadoria JS STORE.")}</p></details>
      <details class="acc"><summary>Trocas e devoluções</summary><p>Não serviu ou não amou? Você tem até 7 dias após o recebimento para solicitar a troca. A peça deve estar sem uso e com etiqueta. <a class="link" href="/trocas">Ver todas as regras de troca</a>.</p></details>
      <div class="share-row"><button class="btn btn-ghost btn-sm" id="share">${icon("share")} Compartilhar</button></div>
    </div>
  </div>`;

  const note = $("#stock-note");
  $("#sizes").addEventListener("click", (e) => {
    const b = e.target.closest(".size"); if (!b || b.disabled) return;
    $$(".size", $("#sizes")).forEach((x) => x.classList.toggle("sel", x === b));
    sel = b.dataset.s; qty = 1; $("#q").textContent = 1;
    const q = p.tamanhos.find((t) => t.t === sel).q;
    note.className = "stock-note" + (q <= 2 ? " low" : "");
    note.innerHTML = q <= 2 ? `${icon("alert")} Corre! Só ${q === 1 ? "1 unidade" : "2 unidades"} no ${sel}` : `${icon("check")} Disponível no ${sel}`;
  });
  const max = () => (sel ? p.tamanhos.find((t) => t.t === sel).q : 1);
  $("#q-minus").onclick = () => { qty = Math.max(1, qty - 1); $("#q").textContent = qty; };
  $("#q-plus").onclick = () => { if (qty < max()) qty++; else toast(sel ? `Máximo disponível no ${sel}: ${max()}` : "Escolha o tamanho primeiro"); $("#q").textContent = qty; };
  $("#add")?.addEventListener("click", () => {
    if (!sel) { note.className = "stock-note low"; note.innerHTML = `${icon("pointer")} Escolha um tamanho para continuar`; $("#sizes").animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 }); return; }
    if (cart.add(p, sel, qty)) setTimeout(() => openDrawer("cart"), 450);
  });
  $("#fav").onclick = (e) => { const on = favs.toggle(p); e.currentTarget.classList.toggle("on", on); };

  // celular: barra fixa de compra quando o botão principal sai da tela
  if (total && $("#add")) {
    const bar = document.createElement("div");
    bar.className = "buy-bar";
    bar.innerHTML = `<div><small>${esc(p.nome)}</small><b>${brl(fp)}</b></div><button class="btn btn-gold" id="add2">${icon("bag")} Comprar</button>`;
    document.body.append(bar);
    bar.querySelector("#add2").onclick = () => {
      if (!sel) { $("#sizes").scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => $("#add").click(), 450); return; }
      $("#add").click();
    };
    new IntersectionObserver(([e]) => {
      const show = !e.isIntersecting && e.boundingClientRect.top < 0;
      bar.classList.toggle("show", show); document.body.classList.toggle("has-buybar", show);
    }).observe($(".buy-row"));
  }
  $("#ask")?.addEventListener("click", (e) => { e.currentTarget.href = waLink(cfg.whatsapp, `Oi! Tenho uma dúvida sobre "${p.nome}"${sel ? ` no tamanho ${sel}` : ""}: ${location.href}`); });
  $("[data-sizeguide-btn]").onclick = sizeGuide;
  $("#share").onclick = async () => {
    const data = { title: p.nome, text: `Olha essa peça da JS STORE: ${p.nome}`, url: location.href };
    if (navigator.share) { try { await navigator.share(data); } catch {} }
    else { await navigator.clipboard?.writeText(location.href); toast("Link copiado!", { ic: "link" }); }
  };

  // galeria + zoom
  const main = $("#main-img"), mimg = main.querySelector("img");
  $(".thumbs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-img]"); if (!b) return;
    $$(".thumbs button").forEach((x) => x.classList.toggle("on", x === b));
    mimg.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 300 });
    mimg.src = imgs[+b.dataset.img];
  });
  const origin = (x, y) => { const r = main.getBoundingClientRect(); mimg.style.transformOrigin = `${Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100))}% ${Math.max(0, Math.min(100, ((y - r.top) / r.height) * 100))}%`; };
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    // computador: zoom acompanhando o mouse
    main.addEventListener("mousemove", (e) => origin(e.clientX, e.clientY));
    main.addEventListener("mouseenter", () => main.classList.add("zoom"));
    main.addEventListener("mouseleave", () => main.classList.remove("zoom"));
  } else {
    // celular: toque na foto para ampliar, arraste para ver detalhes, toque de novo para voltar
    main.insertAdjacentHTML("beforeend", `<span class="zoom-hint">${icon("search")} Toque para ampliar</span>`);
    let moved = false;
    main.addEventListener("click", (e) => {
      if (moved) { moved = false; return; }
      if (!main.classList.contains("zoom")) origin(e.clientX, e.clientY);
      main.classList.toggle("zoom");
    });
    main.addEventListener("touchmove", (e) => {
      if (!main.classList.contains("zoom")) return;
      e.preventDefault(); moved = true;
      const t = e.touches[0]; origin(t.clientX, t.clientY);
    }, { passive: false });
    main.addEventListener("touchend", () => setTimeout(() => (moved = false), 50));
  }

  // relacionados
  listProducts().then((all) => {
    state.products = all;
    const rel = all.filter((x) => x.id !== p.id && stockTotal(x) > 0).sort((a, b) => (b.categoria === p.categoria) - (a.categoria === p.categoria) || (b.vendidos || 0) - (a.vendidos || 0)).slice(0, 8);
    if (rel.length) { $("#related-wrap").classList.remove("hidden"); $("#related").innerHTML = rel.map((x) => productCard(x)).join(""); observeReveal($("#related")); }
  }).catch(() => {});
}

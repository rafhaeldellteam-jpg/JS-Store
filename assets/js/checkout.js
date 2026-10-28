// =============================================================
//  Finalização de compra
//  Hoje: pedido enviado pelo WhatsApp e registrado no painel.
//  Para adicionar pagamento online no futuro (ex.: Mercado Pago),
//  crie um novo provedor em PROVIDERS e troque CHECKOUT_PROVIDER
//  em config.js — o carrinho não precisa mudar.
// =============================================================
import { CHECKOUT_PROVIDER } from "./config.js";
import { createOrder } from "./data.js";

const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const escH = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const PROVIDERS = {
  whatsapp: whatsappCheckout,
  // mercadopago: mercadoPagoCheckout,   // ← futuro
};

export async function checkout(ctx) {
  const fn = PROVIDERS[CHECKOUT_PROVIDER] || whatsappCheckout;
  return fn(ctx);
}

async function whatsappCheckout({ cfg, items, onDone }) {
  const { modal, closeModal, toast, waIcon } = await import("./ui.js");
  const saved = (() => { try { return JSON.parse(localStorage.getItem("jss_cliente")) || {}; } catch { return {}; } })();
  const total = items.reduce((a, i) => a + i.preco * i.qtd, 0);
  const pix = Number(cfg.pix_desconto) || 0;

  modal(`
    <h3>Quase lá! 🦋</h3>
    <p class="muted" style="margin:0 0 18px">Preencha rapidinho e seu pedido vai prontinho para o WhatsApp da loja.</p>
    <form id="co-form">
      <div class="field"><label for="co-nome">Seu nome *</label><input class="input" id="co-nome" required maxlength="120" value="${escH(saved.nome || "")}" autocomplete="name"></div>
      <div class="field"><label for="co-tel">WhatsApp</label><input class="input" id="co-tel" inputmode="tel" maxlength="20" placeholder="(11) 99999-9999" value="${escH(saved.tel || "")}" autocomplete="tel"></div>
      <div class="field"><label>Como prefere receber?</label><div class="opts" data-group="entrega"><button type="button" class="opt sel">Entrega</button><button type="button" class="opt">Retirar na loja</button></div></div>
      <div class="field" id="co-end-wrap"><label for="co-end">Endereço / bairro</label><input class="input" id="co-end" maxlength="200" value="${escH(saved.end || "")}" autocomplete="street-address"></div>
      <div class="field"><label>Forma de pagamento</label><div class="opts" data-group="pag"><button type="button" class="opt sel">Pix${pix ? ` (-${pix}%)` : ""}</button><button type="button" class="opt">Cartão</button><button type="button" class="opt">Dinheiro</button></div></div>
      <div class="field"><label for="co-obs">Observação</label><textarea class="textarea" id="co-obs" maxlength="500" placeholder="Algum detalhe? (opcional)"></textarea></div>
      <div class="totals big"><span>Total</span><span>${fmt(total)}</span></div>
      <button class="btn btn-wa btn-block" id="co-send">${waIcon} Enviar pedido no WhatsApp</button>
    </form>`, {
    onOpen(m) {
      m.querySelectorAll(".opts").forEach((g) => g.addEventListener("click", (e) => {
        const b = e.target.closest(".opt"); if (!b) return;
        g.querySelectorAll(".opt").forEach((o) => o.classList.toggle("sel", o === b));
        if (g.dataset.group === "entrega") m.querySelector("#co-end-wrap").classList.toggle("hidden", b.textContent !== "Entrega");
      }));
      m.querySelector("#co-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = m.querySelector("#co-send");
        const nome = m.querySelector("#co-nome").value.trim();
        const tel = m.querySelector("#co-tel").value.trim();
        const entrega = m.querySelector('[data-group="entrega"] .sel').textContent;
        const end = m.querySelector("#co-end").value.trim();
        const pag = m.querySelector('[data-group="pag"] .sel').textContent;
        const obs = m.querySelector("#co-obs").value.trim();
        try { localStorage.setItem("jss_cliente", JSON.stringify({ nome, tel, end })); } catch {}
        const win = window.open("", "_blank"); // abre já (evita bloqueio de pop-up)
        btn.disabled = true; btn.textContent = "Registrando pedido...";
        const observacao = [`Entrega: ${entrega}${entrega === "Entrega" && end ? " — " + end : ""}`, `Pagamento: ${pag}`, obs].filter(Boolean).join("\n");
        let ped;
        try {
          ped = await createOrder({ nome, telefone: tel, itens: items.map((i) => ({ id: i.id, tamanho: i.tamanho, qtd: i.qtd })), observacao });
        } catch (err) {
          win && win.close();
          btn.disabled = false; btn.innerHTML = `${waIcon} Enviar pedido no WhatsApp`;
          toast(err.message || "Não foi possível registrar o pedido. Tente novamente.", { err: true, ms: 6000 });
          return;
        }
        const lines = (ped.itens || []).map((i) => `• ${i.qtd}x ${i.nome} — Tam. ${i.tamanho} — ${fmt(i.preco * i.qtd)}`);
        const tot = Number(ped.total);
        const msg = [
          `Olá, JS STORE! 🦋 Quero fazer um pedido.`,
          ``, `*Pedido ${ped.codigo}*`, ...lines, ``,
          `*Total: ${fmt(tot)}*${pix && pag.startsWith("Pix") ? ` (no Pix: ${fmt(tot * (1 - pix / 100))})` : ""}`,
          ``, `Nome: ${nome}`, tel ? `WhatsApp: ${tel}` : "", `Entrega: ${entrega}${entrega === "Entrega" && end ? " — " + end : ""}`, `Pagamento: ${pag}`, obs ? `Obs.: ${obs}` : "",
        ].filter((l) => l !== "").join("\n").replace(/\n\n\n+/g, "\n\n");
        const url = `https://wa.me/${String(cfg.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
        if (win) win.location.href = url; else location.href = url;
        closeModal();
        onDone && onDone();
        toast(`Pedido <b>${ped.codigo}</b> enviado! Finalize a conversa no WhatsApp 💕`, { ms: 7000 });
      });
    },
  });
}

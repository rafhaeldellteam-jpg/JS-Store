// Páginas de Trocas e Privacidade: preenche com os dados da empresa cadastrados no painel
import { initPage, contactLinks, mapPin, icon, waIcon, esc, $, $$ } from "./ui.js";

const cfg = await initPage(location.pathname);
$$("[data-cfg]").forEach((el) => { const v = cfg[el.dataset.cfg]; el.textContent = v || el.dataset.fallback || ""; });
$$("[data-cfg-wrap]").forEach((el) => { if (!cfg[el.dataset.cfgWrap]) el.remove(); });

const L = contactLinks(cfg);
const box = $("#legal-contact");
if (box) {
  const items = [
    L.wa("Olá! Tenho uma dúvida sobre trocas ou sobre meus dados.") && `<a class="btn btn-wa" href="${L.wa("Olá! Tenho uma dúvida sobre trocas ou sobre meus dados.")}" target="_blank" rel="noopener">${waIcon} WhatsApp</a>`,
    cfg.email && `<a class="btn btn-ghost" href="mailto:${esc(cfg.email)}">${icon("arrow")} ${esc(cfg.email)}</a>`,
    L.ig && `<a class="btn btn-ghost" href="${L.ig}" target="_blank" rel="noopener">${icon("insta")} @${esc(L.igUser)}</a>`,
  ].filter(Boolean);
  box.innerHTML = items.length ? `<h2>Fale com a gente</h2><div class="row-btns">${items.join("")}</div>` : "";
}
const d = $("#legal-date"); if (d) d.textContent = "28 de outubro de 2026";

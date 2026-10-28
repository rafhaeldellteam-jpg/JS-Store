// =============================================================
//  Camada de dados — Supabase (produção) ou navegador (demo)
// =============================================================
import { SUPABASE_URL, SUPABASE_ANON_KEY, STORAGE_BUCKET, DEMO_MODE } from "./config.js";

export { DEMO_MODE };

let _sb = null;
async function sb() {
  if (_sb) return _sb;
  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  _sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true } });
  return _sb;
}

export const SIZE_PRESETS = {
  Letras: ["PP", "P", "M", "G", "GG"],
  "Numeração": ["34", "36", "38", "40", "42", "44", "46"],
  "Tamanho único": ["U"],
};

export const DEFAULT_CONFIG = {
  id: 1,
  whatsapp: "5511999999999",
  instagram: "js_store",
  aviso_topo: [
    "Frete grátis acima de R$ 299",
    "5% de desconto no Pix",
    "Troca fácil em até 7 dias",
    "Novidades toda semana",
  ],
  hero_titulo: "Elegância que voa com você",
  hero_subtitulo: "Peças femininas selecionadas a dedo, com o toque de delicadeza que você merece.",
  promo_titulo: "Semana JS",
  promo_texto: "Peças selecionadas com preço especial. Corre que é por pouco tempo!",
  promo_fim: null,
  frete_gratis_acima: 299,
  pix_desconto: 5,
  grupo_vip: "",
  endereco: "",
  maps_url: "",
  hero_imagem: "",
  categorias: ["Vestidos", "Blusas", "Calças", "Saias", "Conjuntos", "Blazers"],
};

// ---------- helpers ----------
export function slugify(s) {
  return String(s || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
export const stockTotal = (p) => (p.tamanhos || []).reduce((a, t) => a + (Number(t.q) || 0), 0);
export const finalPrice = (p) => (p.preco_promo && Number(p.preco_promo) < Number(p.preco) ? Number(p.preco_promo) : Number(p.preco));

// =============================================================
//  MODO DEMO (localStorage)
// =============================================================
const LS = {
  get(k, d) { try { const v = localStorage.getItem("jss_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("jss_" + k, JSON.stringify(v)); } catch (e) { throw new Error("Sem espaço no navegador para salvar (modo demonstração)."); } },
};

// Fotos de teste: Unsplash (licença gratuita, uso comercial permitido)
export const unsplash = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${Math.round(w * 1.25)}&fit=crop&crop=faces,center&auto=format&q=75`;
export const DEMO_HERO = unsplash("1609741873312-7ce5ae7c56b4", 1000);

function demoSeed() {
  const now = Date.now();
  const mk = (i, nome, cat, preco, promo, fotos, tam, flags = {}) => ({
    id: "demo-" + i, nome, slug: slugify(nome), categoria: cat, preco, preco_promo: promo,
    descricao: flags.desc || "Peça da curadoria JS STORE. Tecido de toque macio, caimento impecável e acabamento delicado: perfeita do dia ao jantar.",
    imagens: fotos.map((f) => unsplash(f)), tamanhos: tam, cores: flags.cores || [],
    destaque: !!flags.destaque, novidade: !!flags.novidade, ativo: true, vendidos: flags.vendidos || 0,
    created_at: new Date(now - i * 86400000).toISOString(),
  });
  const L = (q) => ["PP", "P", "M", "G", "GG"].map((t, i) => ({ t, q: q[i] }));
  const N = (q) => ["36", "38", "40", "42", "44"].map((t, i) => ({ t, q: q[i] }));
  return [
    mk(1, "Vestido Midi Rosé Alças", "Vestidos", 249.9, 199.9, ["1609533896512-68e72be46a33"], L([1, 3, 4, 2, 0]), { destaque: true, novidade: true, vendidos: 18, cores: ["Rosé"], desc: "Vestido midi com alças finas e busto estruturado. Tecido acetinado com leve brilho, forro interno e zíper invisível nas costas." }),
    mk(2, "Top Ombro a Ombro Babados", "Blusas", 139.9, null, ["1763152608881-67c80e52d0fc"], L([0, 2, 3, 2, 1]), { novidade: true, vendidos: 9, cores: ["Rosa antigo"], desc: "Top tomara que caia com babados em camadas. Elástico de silicone no decote para não sair do lugar." }),
    mk(3, "Calça Pantalona Bordô", "Calças", 229.9, null, ["1790384071619-de00d80547ac", "1790384070481-d4eefe6d509b"], N([2, 4, 3, 1, 2]), { destaque: true, vendidos: 14, cores: ["Bordô"], desc: "Pantalona de cintura alta com caimento fluido. Alonga a silhueta e combina com tudo, do tênis ao salto." }),
    mk(4, "Saia Midi Off-white", "Saias", 159.9, 129.9, ["1762342676887-bf683bb21695", "1762343041573-aa2827852bc9"], L([2, 2, 1, 0, 0]), { novidade: true, vendidos: 6, cores: ["Off-white"], desc: "Saia midi evasê com cós de elástico embutido. Leve, com movimento, perfeita para os dias quentes." }),
    mk(5, "Conjunto Rosé Alfaiataria", "Conjuntos", 319.9, null, ["1763971922545-2e5ed772ae43", "1763971922545-c0ffa1c09cc0"], L([0, 1, 2, 2, 1]), { destaque: true, vendidos: 11, cores: ["Rosé"], desc: "Conjunto de camisa e calça em alfaiataria leve. Use junto para um look marcante ou separado no dia a dia." }),
    mk(6, "Terno Bege Essencial", "Blazers", 349.9, 299.9, ["1779406166699-662a041a12a9", "1779406167603-d0afe0a4cdd7"], L([1, 2, 2, 1, 1]), { novidade: true, destaque: true, vendidos: 7, cores: ["Bege"], desc: "Blazer de corte reto e calça combinando. Elegância atemporal para o trabalho e eventos." }),
    mk(7, "Vestido Longo Romance", "Vestidos", 289.9, null, ["1609741873312-7ce5ae7c56b4"], L([1, 1, 2, 1, 0]), { vendidos: 5, cores: ["Rosa claro"], desc: "Vestido longo de tule com saia ampla. Ideal para festas, casamentos e ensaios." }),
    mk(8, "Camisa Off-white Clássica", "Blusas", 149.9, null, ["1600973964462-0cf10488d440"], L([2, 3, 3, 2, 1]), { vendidos: 12, cores: ["Off-white"], desc: "Camisa de viscose com botões e mangas longas. Peça curinga que vai do jeans à alfaiataria." }),
    mk(9, "Conjunto Floral Verão", "Conjuntos", 259.9, 219.9, ["1763818104121-7d63caa456f1"], L([0, 1, 1, 0, 0]), { novidade: true, vendidos: 4, cores: ["Estampado"], desc: "Conjunto estampado de blusa e calça em tecido leve. Fresquinho e cheio de personalidade." }),
    mk(10, "Blazer Caramelo Oversized", "Blazers", 279.9, null, ["1590873802674-55bb8f947bc5"], L([1, 2, 1, 1, 0]), { vendidos: 8, cores: ["Caramelo"], desc: "Blazer de modelagem ampla com ombreiras suaves. Joga por cima de qualquer look e eleva na hora." }),
  ];
}
// "v2" = produtos de teste com fotos reais (substitui os antigos desenhos)
const PK = "produtos_v2";
function demoProducts() {
  let p = LS.get(PK, null);
  if (!p) { p = demoSeed(); LS.set(PK, p); }
  return p;
}
function demoConfig() {
  const c = LS.get("config", null);
  if (c) {
    if (c.promo_titulo === "Semana da Borboleta") { c.promo_titulo = "Semana JS"; LS.set("config", c); }
    return { ...DEFAULT_CONFIG, endereco: "São Paulo - SP", ...c };
  }
  const d = { ...DEFAULT_CONFIG, endereco: "São Paulo - SP", promo_fim: new Date(Date.now() + 3 * 86400000).toISOString() };
  LS.set("config", d);
  return d;
}

// =============================================================
//  API pública
// =============================================================
export async function getConfig() {
  if (DEMO_MODE) return demoConfig();
  const c = await sb();
  const { data, error } = await c.from("config").select("*").eq("id", 1).maybeSingle();
  if (error) console.warn(error);
  return { ...DEFAULT_CONFIG, ...(data || {}) };
}

export async function saveConfig(cfg) {
  if (DEMO_MODE) { LS.set("config", { ...demoConfig(), ...cfg }); return; }
  const c = await sb();
  const { error } = await c.from("config").upsert({ ...cfg, id: 1 });
  if (error) throw error;
}

/** Lista produtos. admin=true inclui inativos. */
export async function listProducts({ admin = false } = {}) {
  if (DEMO_MODE) {
    const all = demoProducts();
    return (admin ? all : all.filter((p) => p.ativo)).sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const c = await sb();
  let q = c.from("produtos").select("*").order("created_at", { ascending: false });
  if (!admin) q = q.eq("ativo", true);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getProduct(slug) {
  if (DEMO_MODE) return demoProducts().find((p) => p.slug === slug || p.id === slug) || null;
  const c = await sb();
  const { data, error } = await c.from("produtos").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveProduct(p) {
  const row = { ...p };
  row.slug = row.slug || slugify(row.nome);
  row.preco = Number(row.preco) || 0;
  row.preco_promo = row.preco_promo === "" || row.preco_promo == null ? null : Number(row.preco_promo);
  if (DEMO_MODE) {
    const all = demoProducts();
    if (!row.id) {
      row.id = "demo-" + Date.now();
      row.created_at = new Date().toISOString();
      row.vendidos = 0;
      if (all.some((x) => x.slug === row.slug)) row.slug += "-" + Date.now().toString(36).slice(-4);
      all.push(row);
    } else {
      const i = all.findIndex((x) => x.id === row.id);
      all[i] = { ...all[i], ...row };
    }
    LS.set(PK, all);
    return row;
  }
  const c = await sb();
  const id = row.id; delete row.id;
  delete row.created_at;
  row.updated_at = new Date().toISOString();
  let res;
  if (id) res = await c.from("produtos").update(row).eq("id", id).select().single();
  else {
    res = await c.from("produtos").insert(row).select().single();
    if (res.error && String(res.error.message).includes("duplicate")) {
      row.slug += "-" + Date.now().toString(36).slice(-4);
      res = await c.from("produtos").insert(row).select().single();
    }
  }
  if (res.error) throw res.error;
  return res.data;
}

export async function deleteProduct(id) {
  if (DEMO_MODE) { LS.set(PK, demoProducts().filter((p) => p.id !== id)); return; }
  const c = await sb();
  const { error } = await c.from("produtos").delete().eq("id", id);
  if (error) throw error;
}

/** Comprime a imagem no navegador (máx 1400px, WebP) antes de enviar. */
export async function compressImage(file, max = 1400, quality = 0.85) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  cv.getContext("2d").drawImage(bmp, 0, 0, w, h);
  return await new Promise((r) => cv.toBlob(r, "image/webp", quality));
}

export async function uploadImage(file) {
  if (DEMO_MODE) {
    const blob = await compressImage(file, 700, 0.75);
    return await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
  }
  const blob = await compressImage(file);
  const c = await sb();
  const path = `${new Date().getFullYear()}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const { error } = await c.storage.from(STORAGE_BUCKET).upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw error;
  return c.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

// ---------- Pedidos ----------
/** itens: [{id, tamanho, qtd}] — o preço é recalculado pelo servidor. */
export async function createOrder({ nome, telefone, itens, observacao }) {
  if (DEMO_MODE) {
    const prods = demoProducts();
    const lines = itens.map((i) => {
      const p = prods.find((x) => x.id === i.id);
      return { id: i.id, nome: p?.nome, tamanho: i.tamanho, qtd: i.qtd, preco: p ? finalPrice(p) : 0 };
    });
    const pedidos = LS.get("pedidos", []);
    const ped = {
      id: Date.now(), codigo: "JS" + String(Date.now()).slice(-5), cliente_nome: nome, cliente_telefone: telefone,
      itens: lines, total: lines.reduce((a, l) => a + l.preco * l.qtd, 0), status: "pendente", observacao, created_at: new Date().toISOString(),
    };
    pedidos.unshift(ped); LS.set("pedidos", pedidos);
    return ped;
  }
  const c = await sb();
  const { data, error } = await c.rpc("criar_pedido", { p_nome: nome, p_telefone: telefone || "", p_itens: itens, p_obs: observacao || "" });
  if (error) throw error;
  return data;
}

export async function listOrders() {
  if (DEMO_MODE) return LS.get("pedidos", []);
  const c = await sb();
  const { data, error } = await c.from("pedidos").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw error;
  return data || [];
}

/** Muda o status. Confirmar dá baixa no estoque; cancelar um confirmado devolve. */
export async function setOrderStatus(id, status) {
  if (DEMO_MODE) {
    const pedidos = LS.get("pedidos", []);
    const o = pedidos.find((x) => x.id === id);
    const prods = demoProducts();
    const baixou = (s) => ["confirmado", "enviado", "entregue"].includes(s);
    const sign = baixou(status) && !baixou(o.status) ? -1 : !baixou(status) && baixou(o.status) ? 1 : 0;
    if (sign) for (const it of o.itens) {
      const p = prods.find((x) => x.id === it.id); if (!p) continue;
      const t = p.tamanhos.find((x) => x.t === it.tamanho); if (t) t.q = Math.max(0, t.q + sign * it.qtd);
      p.vendidos = Math.max(0, (p.vendidos || 0) - sign * it.qtd);
    }
    o.status = status; LS.set("pedidos", pedidos); LS.set(PK, prods);
    return;
  }
  const c = await sb();
  const { error } = await c.rpc("atualizar_status_pedido", { p_id: id, p_status: status });
  if (error) throw error;
}

export async function deleteOrder(id) {
  if (DEMO_MODE) { LS.set("pedidos", LS.get("pedidos", []).filter((o) => o.id !== id)); return; }
  const c = await sb();
  const { error } = await c.from("pedidos").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Autenticação (painel) ----------
export async function currentUser() {
  if (DEMO_MODE) return LS.get("demo_login", false) ? { email: "demo@jsstore" } : null;
  const c = await sb();
  const { data } = await c.auth.getSession();
  return data.session?.user || null;
}
export async function isAdmin() {
  if (DEMO_MODE) return true;
  const c = await sb();
  const { data, error } = await c.rpc("is_admin");
  return !error && data === true;
}
// Usuário padrão do painel (provisório): admin / admin
// No Supabase, "admin" vira o e-mail admin@jsstore.local (crie esse usuário lá).
export const ADMIN_DOMAIN = "jsstore.local";
const toEmail = (u) => (String(u).includes("@") ? String(u).trim() : `${String(u).trim().toLowerCase()}@${ADMIN_DOMAIN}`);
const demoCred = () => LS.get("demo_cred", { u: "admin", p: "admin" });

export async function login(user, password) {
  if (!String(user).trim() || !password) throw new Error("Preencha usuário e senha.");
  if (DEMO_MODE) {
    const cred = demoCred();
    if (String(user).trim().toLowerCase() !== cred.u || password !== cred.p) throw new Error("Usuário ou senha incorretos.");
    LS.set("demo_login", true); return { email: cred.u };
  }
  const c = await sb();
  const { data, error } = await c.auth.signInWithPassword({ email: toEmail(user), password });
  if (error) throw new Error(error.message === "Invalid login credentials" ? "Usuário ou senha incorretos." : error.message);
  return data.user;
}
export async function logout() {
  if (DEMO_MODE) { LS.set("demo_login", false); return; }
  const c = await sb();
  await c.auth.signOut();
}
export async function resetPassword(email) {
  if (DEMO_MODE) return;
  const c = await sb();
  const { error } = await c.auth.resetPasswordForEmail(toEmail(email), { redirectTo: location.origin + "/admin/" });
  if (error) throw error;
}
export async function updatePassword(pw) {
  if (DEMO_MODE) { LS.set("demo_cred", { ...demoCred(), p: pw }); return; }
  const c = await sb();
  const { error } = await c.auth.updateUser({ password: pw });
  if (error) throw error;
}
export async function onAuthChange(cb) {
  if (DEMO_MODE) return;
  const c = await sb();
  c.auth.onAuthStateChange((ev, session) => cb(ev, session));
}
export function resetDemo() {
  ["produtos", PK, "config", "pedidos", "feedbacks"].forEach((k) => localStorage.removeItem("jss_" + k));
}

// =============================================================
//  Feedbacks
//  status: pendente | aprovado | reprovado
//  aparece no site quando status = aprovado E visivel = true
// =============================================================
// Exemplos SÓ do modo demonstração: são marcados como exemplo de propósito,
// para não parecerem depoimentos reais de clientes.
function demoFeedbacks() {
  let f = LS.get("feedbacks", null);
  if (!f) {
    const d = (n) => new Date(Date.now() - n * 86400000).toISOString();
    const ex = "Exemplo de depoimento. Quando suas clientes enviarem feedbacks pelo site e você aprovar no painel, eles aparecem aqui no lugar deste texto.";
    f = [
      { id: "fb-1", nome: "Cliente exemplo 1", cidade: "", nota: 5, texto: ex, status: "aprovado", visivel: true, created_at: d(1) },
      { id: "fb-2", nome: "Cliente exemplo 2", cidade: "", nota: 5, texto: ex, status: "aprovado", visivel: true, created_at: d(2) },
      { id: "fb-3", nome: "Cliente exemplo 3", cidade: "", nota: 4, texto: ex, status: "aprovado", visivel: true, created_at: d(3) },
      { id: "fb-4", nome: "Cliente exemplo 4", cidade: "", nota: 5, texto: "Exemplo de feedback esperando aprovação no painel.", status: "pendente", visivel: false, created_at: d(0) },
    ];
    LS.set("feedbacks", f);
  }
  return f;
}

/** Loja: só aprovados e visíveis. Painel (admin=true): todos. */
export async function listFeedbacks({ admin = false } = {}) {
  if (DEMO_MODE) {
    const all = demoFeedbacks().slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    return admin ? all : all.filter((x) => x.status === "aprovado" && x.visivel);
  }
  const c = await sb();
  let q = c.from("feedbacks").select("*").order("created_at", { ascending: false }).limit(admin ? 500 : 30);
  if (!admin) q = q.eq("status", "aprovado").eq("visivel", true);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

/** Limpa o @ do Instagram: só letras, números, ponto e _ (máx. 30). */
export const cleanInstagram = (v) => String(v || "").trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@+/, "").replace(/[/?#].*$/, "").replace(/[^A-Za-z0-9._]/g, "").slice(0, 30);
export const FEEDBACK_MAX_FOTOS = 3;

/** Foto enviada pela cliente junto com o feedback (opcional). */
export async function uploadFeedbackPhoto(file) {
  if (!file.type.startsWith("image/")) throw new Error("Envie apenas imagens.");
  if (DEMO_MODE) {
    const blob = await compressImage(file, 600, 0.72);
    return await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
  }
  const blob = await compressImage(file, 1200, 0.82);
  const c = await sb();
  const path = `${new Date().getFullYear()}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.webp`;
  const { error } = await c.storage.from("feedbacks").upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw new Error("Não foi possível enviar a foto. Tente uma imagem menor.");
  return c.storage.from("feedbacks").getPublicUrl(path).data.publicUrl;
}

/** Cliente envia pelo site: sempre entra como pendente e invisível.
 *  instagram e fotos (arquivos) são opcionais. */
export async function submitFeedback({ nome, cidade, nota, texto, instagram = "", fotos = [] }) {
  nome = String(nome || "").trim().slice(0, 80); texto = String(texto || "").trim().slice(0, 600);
  cidade = String(cidade || "").trim().slice(0, 60); nota = Math.max(1, Math.min(5, parseInt(nota) || 5));
  instagram = cleanInstagram(instagram);
  if (!nome || texto.length < 5) throw new Error("Preencha seu nome e escreva um comentário.");
  const urls = [];
  for (const f of [...fotos].slice(0, FEEDBACK_MAX_FOTOS)) urls.push(await uploadFeedbackPhoto(f));
  if (DEMO_MODE) {
    const f = demoFeedbacks();
    f.unshift({ id: "fb-" + Date.now(), nome, cidade, nota, texto, instagram, fotos: urls, status: "pendente", visivel: false, created_at: new Date().toISOString() });
    LS.set("feedbacks", f); return;
  }
  const c = await sb();
  const { error } = await c.rpc("enviar_feedback", { p_nome: nome, p_cidade: cidade, p_nota: nota, p_texto: texto, p_instagram: instagram, p_fotos: urls });
  if (error) throw error;
}

/** Painel: cria ou altera (status, visível, texto...). */
export async function saveFeedback(fb) {
  const row = { ...fb };
  if ("instagram" in row) row.instagram = cleanInstagram(row.instagram);
  if ("fotos" in row) row.fotos = (row.fotos || []).slice(0, FEEDBACK_MAX_FOTOS);
  if (DEMO_MODE) {
    const f = demoFeedbacks();
    if (!row.id) { row.id = "fb-" + Date.now(); row.created_at = new Date().toISOString(); f.unshift(row); }
    else { const i = f.findIndex((x) => x.id === row.id); f[i] = { ...f[i], ...row }; }
    LS.set("feedbacks", f); return f.find((x) => x.id === row.id);
  }
  const c = await sb();
  const id = row.id; delete row.id; delete row.created_at;
  const res = id ? await c.from("feedbacks").update(row).eq("id", id).select().single()
                 : await c.from("feedbacks").insert(row).select().single();
  if (res.error) throw res.error;
  return res.data;
}

export async function deleteFeedback(id) {
  if (DEMO_MODE) { LS.set("feedbacks", demoFeedbacks().filter((x) => x.id !== id)); return; }
  const c = await sb();
  const { error } = await c.from("feedbacks").delete().eq("id", id);
  if (error) throw error;
}

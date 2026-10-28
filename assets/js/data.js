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
  promo_titulo: "Semana da Borboleta",
  promo_texto: "Peças selecionadas com preço especial. Corre que é por pouco tempo!",
  promo_fim: null,
  frete_gratis_acima: 299,
  pix_desconto: 5,
  grupo_vip: "",
  endereco: "",
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

function demoSeed() {
  const now = Date.now();
  const mk = (i, nome, cat, preco, promo, img, tam, flags = {}) => ({
    id: "demo-" + i, nome, slug: slugify(nome), categoria: cat, preco, preco_promo: promo,
    descricao: "Peça da curadoria JS STORE. Tecido de toque macio, caimento impecável e acabamento delicado — perfeita do dia ao jantar.",
    imagens: ["/assets/img/demo/" + img], tamanhos: tam, cores: flags.cores || [],
    destaque: !!flags.destaque, novidade: !!flags.novidade, ativo: true, vendidos: flags.vendidos || 0,
    created_at: new Date(now - i * 86400000).toISOString(),
  });
  const L = (q) => ["PP", "P", "M", "G", "GG"].map((t, i) => ({ t, q: q[i] }));
  return [
    mk(1, "Vestido Midi Rosé", "Vestidos", 249.9, 199.9, "vestido.svg", L([1, 3, 4, 2, 0]), { destaque: true, novidade: true, vendidos: 18, cores: ["Rosé"] }),
    mk(2, "Blusa Pérola Botões", "Blusas", 129.9, null, "blusa.svg", L([0, 2, 5, 3, 1]), { novidade: true, vendidos: 9, cores: ["Off-white"] }),
    mk(3, "Calça Alfaiataria Cacau", "Calças", 219.9, null, "calca.svg", ["36", "38", "40", "42", "44"].map((t, i) => ({ t, q: [2, 4, 3, 1, 2][i] })), { destaque: true, vendidos: 14, cores: ["Cacau"] }),
    mk(4, "Saia Plissada Vinho", "Saias", 159.9, 129.9, "saia.svg", L([2, 2, 1, 0, 0]), { novidade: true, vendidos: 6, cores: ["Vinho"] }),
    mk(5, "Conjunto Lavanda Soft", "Conjuntos", 289.9, null, "conjunto.svg", L([0, 1, 2, 2, 1]), { destaque: true, vendidos: 11, cores: ["Lavanda"] }),
    mk(6, "Blazer Areia Essencial", "Blazers", 329.9, 279.9, "blazer.svg", L([1, 2, 2, 1, 1]), { novidade: true, destaque: true, vendidos: 7, cores: ["Areia"] }),
  ];
}
function demoProducts() {
  let p = LS.get("produtos", null);
  if (!p) { p = demoSeed(); LS.set("produtos", p); }
  return p;
}
function demoConfig() {
  const c = LS.get("config", null);
  if (c) return { ...DEFAULT_CONFIG, ...c };
  const d = { ...DEFAULT_CONFIG, promo_fim: new Date(Date.now() + 3 * 86400000).toISOString() };
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
    LS.set("produtos", all);
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
  if (DEMO_MODE) { LS.set("produtos", demoProducts().filter((p) => p.id !== id)); return; }
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
    o.status = status; LS.set("pedidos", pedidos); LS.set("produtos", prods);
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
export async function login(email, password) {
  if (DEMO_MODE) { LS.set("demo_login", true); return { email: "demo@jsstore" }; }
  const c = await sb();
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
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
  const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: location.origin + "/admin/" });
  if (error) throw error;
}
export async function updatePassword(pw) {
  if (DEMO_MODE) return;
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
  ["produtos", "config", "pedidos"].forEach((k) => localStorage.removeItem("jss_" + k));
}

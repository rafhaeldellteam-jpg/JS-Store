// =============================================================
//  JS STORE — configuração
//  Preencha com os dados do seu projeto Supabase
//  (Supabase > Project Settings > API).
//  A "anon key" é pública por natureza: a segurança fica nas
//  regras (RLS) definidas em supabase/schema.sql.
//  Enquanto estiver vazio, o site roda em MODO DEMONSTRAÇÃO
//  (dados salvos só no navegador).
// =============================================================
export const SUPABASE_URL = "";
export const SUPABASE_ANON_KEY = "";

// Bucket do Supabase Storage onde ficam as fotos dos produtos
export const STORAGE_BUCKET = "produtos";

// Forma de finalizar a compra. Hoje: "whatsapp".
// Preparado para receber outros provedores no futuro
// (ex.: "mercadopago") — ver assets/js/checkout.js.
export const CHECKOUT_PROVIDER = "whatsapp";

export const DEMO_MODE = !SUPABASE_URL || !SUPABASE_ANON_KEY;

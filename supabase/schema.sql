-- =============================================================
--  JS STORE — banco de dados (Supabase)
--  Cole tudo no Supabase > SQL Editor > New query > Run.
--  Pode rodar de novo sem problema (é idempotente).
-- =============================================================

-- ---------- Administradoras do painel ----------
create table if not exists public.admins (
  email text primary key
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------- Produtos ----------
create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  descricao text default '',
  categoria text default '',
  preco numeric(10,2) not null default 0 check (preco >= 0),
  preco_promo numeric(10,2) check (preco_promo is null or preco_promo >= 0),
  imagens text[] not null default '{}',
  -- tamanhos: [{"t":"P","q":3},{"t":"M","q":5}]  (t = tamanho, q = estoque)
  tamanhos jsonb not null default '[]',
  cores text[] not null default '{}',
  destaque boolean not null default false,
  novidade boolean not null default true,
  ativo boolean not null default true,
  vendidos integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists produtos_ativo_idx on public.produtos (ativo, created_at desc);

-- ---------- Configurações da loja (1 linha) ----------
create table if not exists public.config (
  id integer primary key default 1 check (id = 1),
  whatsapp text default '',
  instagram text default '',
  aviso_topo text[] default '{}',
  hero_titulo text default '',
  hero_subtitulo text default '',
  promo_titulo text default '',
  promo_texto text default '',
  promo_fim timestamptz,
  frete_gratis_acima numeric(10,2) default 0,
  pix_desconto integer default 0,
  grupo_vip text default '',
  endereco text default '',
  maps_url text default '',
  hero_imagem text default '',
  categorias text[] default '{Vestidos,Blusas,Calças,Saias,Conjuntos,Blazers}'
);
-- colunas novas (para quem já rodou uma versão anterior deste arquivo)
alter table public.config add column if not exists maps_url text default '';
alter table public.config add column if not exists hero_imagem text default '';

insert into public.config (id, aviso_topo, hero_titulo, hero_subtitulo, promo_titulo, promo_texto, frete_gratis_acima, pix_desconto)
values (1,
  '{"Frete grátis acima de R$ 299","5% de desconto no Pix","Troca fácil em até 7 dias","Novidades toda semana"}',
  'Elegância que voa com você',
  'Peças femininas selecionadas a dedo, com o toque de delicadeza que você merece.',
  'Semana JS', 'Peças selecionadas com preço especial. Corre que é por pouco tempo!', 299, 5)
on conflict (id) do nothing;

-- ---------- Pedidos (vindos do carrinho / WhatsApp) ----------
create table if not exists public.pedidos (
  id bigint generated always as identity primary key,
  codigo text not null unique,
  cliente_nome text not null,
  cliente_telefone text default '',
  itens jsonb not null,           -- [{id,nome,tamanho,qtd,preco}]
  total numeric(10,2) not null,
  status text not null default 'pendente'
    check (status in ('pendente','confirmado','enviado','entregue','cancelado')),
  observacao text default '',
  created_at timestamptz not null default now()
);

-- ---------- Segurança (RLS) ----------
alter table public.admins   enable row level security;
alter table public.produtos enable row level security;
alter table public.config   enable row level security;
alter table public.pedidos  enable row level security;

drop policy if exists "admins_le" on public.admins;
create policy "admins_le" on public.admins for select using (public.is_admin());

drop policy if exists "produtos_le" on public.produtos;
create policy "produtos_le" on public.produtos for select using (ativo or public.is_admin());
drop policy if exists "produtos_escreve" on public.produtos;
create policy "produtos_escreve" on public.produtos for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "config_le" on public.config;
create policy "config_le" on public.config for select using (true);
drop policy if exists "config_escreve" on public.config;
create policy "config_escreve" on public.config for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "pedidos_admin" on public.pedidos;
create policy "pedidos_admin" on public.pedidos for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Criar pedido (público; preços recalculados aqui) ----------
create or replace function public.criar_pedido(p_nome text, p_telefone text, p_itens jsonb, p_obs text default '')
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  it jsonb; p public.produtos; v_qtd int; v_preco numeric; v_estoque int;
  v_linhas jsonb := '[]'; v_total numeric := 0; v_codigo text; v_ped public.pedidos;
begin
  if coalesce(trim(p_nome), '') = '' then raise exception 'Informe seu nome'; end if;
  if jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) = 0 or jsonb_array_length(p_itens) > 50 then
    raise exception 'Carrinho inválido';
  end if;
  for it in select * from jsonb_array_elements(p_itens) loop
    select * into p from public.produtos where id = (it->>'id')::uuid and ativo;
    if not found then raise exception 'Produto indisponível'; end if;
    v_qtd := greatest(1, least(20, coalesce((it->>'qtd')::int, 1)));
    select coalesce((t->>'q')::int, 0) into v_estoque
      from jsonb_array_elements(p.tamanhos) t where t->>'t' = it->>'tamanho';
    if v_estoque is null or v_estoque < v_qtd then
      raise exception 'Sem estoque suficiente: % (%)', p.nome, it->>'tamanho';
    end if;
    v_preco := case when p.preco_promo is not null and p.preco_promo < p.preco then p.preco_promo else p.preco end;
    v_total := v_total + v_preco * v_qtd;
    v_linhas := v_linhas || jsonb_build_object('id', p.id, 'nome', p.nome, 'tamanho', it->>'tamanho', 'qtd', v_qtd, 'preco', v_preco);
  end loop;
  v_codigo := 'JS' || to_char(now(), 'DDMM') || upper(substr(md5(random()::text), 1, 4));
  insert into public.pedidos (codigo, cliente_nome, cliente_telefone, itens, total, observacao)
    values (v_codigo, left(trim(p_nome), 120), left(coalesce(p_telefone, ''), 30), v_linhas, v_total, left(coalesce(p_obs, ''), 1000))
    returning * into v_ped;
  return to_jsonb(v_ped);
end $$;
grant execute on function public.criar_pedido(text, text, jsonb, text) to anon, authenticated;

-- ---------- Mudar status (admin) — confirma = baixa no estoque ----------
create or replace function public.atualizar_status_pedido(p_id bigint, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_ped public.pedidos; it jsonb; v_sinal int := 0;
  v_baixado_antes boolean; v_baixado_depois boolean;
begin
  if not public.is_admin() then raise exception 'Acesso negado'; end if;
  select * into v_ped from public.pedidos where id = p_id for update;
  if not found then raise exception 'Pedido não encontrado'; end if;
  v_baixado_antes  := v_ped.status in ('confirmado','enviado','entregue');
  v_baixado_depois := p_status     in ('confirmado','enviado','entregue');
  if v_baixado_depois and not v_baixado_antes then v_sinal := -1;
  elsif v_baixado_antes and not v_baixado_depois then v_sinal := 1; end if;

  if v_sinal <> 0 then
    for it in select * from jsonb_array_elements(v_ped.itens) loop
      update public.produtos pr set
        tamanhos = (
          select coalesce(jsonb_agg(
            case when t->>'t' = it->>'tamanho'
              then jsonb_set(t, '{q}', to_jsonb(greatest(0, coalesce((t->>'q')::int,0) + v_sinal * (it->>'qtd')::int)))
              else t end), '[]'::jsonb)
          from jsonb_array_elements(pr.tamanhos) t),
        vendidos = greatest(0, pr.vendidos - v_sinal * (it->>'qtd')::int),
        updated_at = now()
      where pr.id = (it->>'id')::uuid;
    end loop;
  end if;
  update public.pedidos set status = p_status where id = p_id;
end $$;
grant execute on function public.atualizar_status_pedido(bigint, text) to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Feedbacks ----------
create table if not exists public.feedbacks (
  id bigint generated always as identity primary key,
  nome text not null,
  cidade text default '',
  nota smallint not null default 5 check (nota between 1 and 5),
  texto text not null,
  status text not null default 'pendente' check (status in ('pendente','aprovado','reprovado')),
  visivel boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists feedbacks_site_idx on public.feedbacks (status, visivel, created_at desc);
alter table public.feedbacks enable row level security;

drop policy if exists "feedbacks_le_site" on public.feedbacks;
create policy "feedbacks_le_site" on public.feedbacks for select using ((status = 'aprovado' and visivel) or public.is_admin());
drop policy if exists "feedbacks_admin" on public.feedbacks;
create policy "feedbacks_admin" on public.feedbacks for all using (public.is_admin()) with check (public.is_admin());

-- Cliente envia pelo site: sempre entra pendente e invisível
create or replace function public.enviar_feedback(p_nome text, p_cidade text, p_nota int, p_texto text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if coalesce(trim(p_nome), '') = '' or length(trim(coalesce(p_texto, ''))) < 5 then
    raise exception 'Preencha seu nome e escreva um comentário.';
  end if;
  insert into public.feedbacks (nome, cidade, nota, texto, status, visivel)
  values (left(trim(p_nome), 80), left(trim(coalesce(p_cidade, '')), 60), greatest(1, least(5, coalesce(p_nota, 5))), left(trim(p_texto), 600), 'pendente', false);
end $$;
grant execute on function public.enviar_feedback(text, text, int, text) to anon, authenticated;

-- ---------- Fotos (Storage) ----------
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do update set public = true;

drop policy if exists "fotos_le" on storage.objects;
create policy "fotos_le" on storage.objects for select using (bucket_id = 'produtos');
drop policy if exists "fotos_envia" on storage.objects;
create policy "fotos_envia" on storage.objects for insert with check (bucket_id = 'produtos' and public.is_admin());
drop policy if exists "fotos_altera" on storage.objects;
create policy "fotos_altera" on storage.objects for update using (bucket_id = 'produtos' and public.is_admin());
drop policy if exists "fotos_apaga" on storage.objects;
create policy "fotos_apaga" on storage.objects for delete using (bucket_id = 'produtos' and public.is_admin());

-- =============================================================
--  ÚLTIMO PASSO: libere quem entra no painel.
--  O login "admin" do painel corresponde ao e-mail admin@jsstore.local.
--  1) Supabase > Authentication > Users > Add user > e-mail admin@jsstore.local,
--     uma senha forte e "Auto Confirm User"
--  2) Rode esta linha:
-- insert into public.admins (email) values ('admin@jsstore.local');
-- =============================================================

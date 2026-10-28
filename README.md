# JS STORE · Moda Feminina

Loja virtual da JS STORE com vitrine, carrinho, pedidos pelo WhatsApp e **painel administrativo** para a dona da loja cadastrar roupas, fotos, tamanhos e estoque sozinha — pelo computador ou celular.

- **Loja:** `/` · `/loja` · `/produto?p=...`
- **Painel:** `/admin`

Site estático (HTML/CSS/JS, sem build) hospedado na **Vercel**, com banco de dados, fotos e login no **Supabase** (plano grátis).

---

## O que tem

**Loja**
- Faixa de avisos animada, hero com a borboleta da marca, novidades em carrossel com filtro por categoria
- Banner de promoção com contagem regressiva (data definida no painel)
- "Mais amadas", "Vistos recentemente", selos de *Novo*, *-%*, *Últimas peças* e *Esgotado* (calculados pelo estoque real)
- Catálogo com busca, filtros por categoria, tamanho, promoção e ordenação
- Página do produto com galeria + zoom, seleção de tamanho com aviso de estoque, guia de medidas, parcelamento e preço no Pix, compartilhar, "Avise-me quando chegar"
- Favoritos e sacola salvos no aparelho, barra de frete grátis
- Checkout pelo **WhatsApp**: a cliente informa nome, entrega e pagamento, o pedido é registrado no painel e a mensagem chega pronta no WhatsApp da loja

**Painel (`/admin`)**: login provisório **admin / admin** (troque em Configurações → Sua conta)
- Feedbacks: aprovar, reprovar, mostrar/ocultar no carrossel do site, editar, excluir e adicionar
- Início com vendas do mês, pedidos pendentes, estoque acabando e mais vendidos
- Produtos: cadastrar/editar com fotos (comprimidas automaticamente), tamanhos com estoque, cores, preço promocional, prévia ao vivo, duplicar, esconder/mostrar
- Estoque rápido: ajusta todas as quantidades numa tela só
- Pedidos: confirmar (dá baixa no estoque), enviado, entregue, cancelar (devolve ao estoque), chamar a cliente no WhatsApp
- Configurações: WhatsApp, Instagram, grupo VIP, textos da página inicial, avisos, promoção, % Pix, frete grátis, categorias, trocar senha
- Calculadora de preço (custo + margem + taxa da maquininha + desconto Pix)
- Funciona como app no celular ("Adicionar à tela de início")

---

## Colocar no ar com o Supabase (uma vez só)

Enquanto o Supabase não estiver configurado, o site roda em **modo demonstração** (dados só no navegador) — dá pra mostrar para a cliente.

1. Crie uma conta em <https://supabase.com> → **New project** (região *South America (São Paulo)*).
2. **SQL Editor → New query**: cole todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique **Run**.
3. **Authentication → Users → Add user → Create new user**: e-mail `admin@jsstore.local` (é o usuário **admin** do painel), uma senha forte e marque *Auto Confirm User*.
4. No SQL Editor, rode:
   ```sql
   insert into public.admins (email) values ('admin@jsstore.local');
   ```
5. **Authentication → Sign In / Providers**: desative *Allow new users to sign up* (ninguém mais cria conta).
6. **Authentication → URL Configuration**: em *Site URL* coloque o endereço do site na Vercel (para o "esqueci minha senha" funcionar).
7. **Project Settings → API**: copie *Project URL* e a chave *anon public* e cole em [`assets/js/config.js`](assets/js/config.js). Faça commit — a Vercel publica sozinha.

> A chave *anon* é pública por natureza. Quem protege os dados são as regras (RLS) do `schema.sql`: só e-mails da tabela `admins` alteram produtos, fotos, pedidos e configurações; os preços dos pedidos são recalculados no servidor.

Depois disso, entre em `/admin` com o usuário **admin** e a senha criada e vá em **Configurações** para colocar o WhatsApp da loja.

## Deploy na Vercel

Projeto importado do GitHub, sem build (*Framework Preset: Other*). Cada `git push` na `main` publica uma nova versão.

## Pagamento online no futuro

O checkout está isolado em [`assets/js/checkout.js`](assets/js/checkout.js). Para trocar o WhatsApp por Mercado Pago (Pix/cartão), cria-se um novo provedor ali e muda-se `CHECKOUT_PROVIDER` em `config.js` — o carrinho e o painel continuam iguais.

## Estrutura

```
index.html  loja.html  produto.html  404.html
admin/                 painel
assets/css/            style.css (loja) · admin.css
assets/js/             config · data (Supabase/demo) · ui · checkout · home · loja · produto · admin
assets/img/            logo, borboleta, ícones, imagens de exemplo
supabase/schema.sql    tabelas, segurança, funções de pedido e fotos
vercel.json            URLs limpas e cabeçalhos
```

## Fotos de teste

As peças de exemplo do modo demonstração usam fotos do [Unsplash](https://unsplash.com) (licença gratuita, uso comercial permitido), carregadas direto do Unsplash. Quando a loja estiver no Supabase, a cliente cadastra as fotos das próprias peças pelo painel e essas fotos de teste deixam de aparecer.

-- ═══════════════════════════════════════════════════════════════════════════
--  Ajustes editables de cada herramienta (precio / gratis-pago) desde el panel.
--  Pega TODO esto en Supabase → SQL Editor → New query → Run.
-- ═══════════════════════════════════════════════════════════════════════════

-- Guarda el precio por herramienta. price = 0 → gratis. price > 0 → de pago.
-- Solo guarda las herramientas que hayas editado; el resto usa el precio del código.
create table if not exists public.tool_settings (
  slug       text primary key,
  price      integer not null default 0,
  updated_at timestamptz not null default now()
);

-- El catálogo es público → cualquiera puede LEER los precios.
alter table public.tool_settings enable row level security;

drop policy if exists "cualquiera puede leer precios" on public.tool_settings;
create policy "cualquiera puede leer precios"
  on public.tool_settings
  for select
  using (true);

-- Nadie escribe desde el navegador: solo el panel (service_role) puede cambiar precios.

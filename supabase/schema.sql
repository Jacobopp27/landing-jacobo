-- ═══════════════════════════════════════════════════════════════════════════
--  ESQUEMA: accesos a herramientas (entitlements)
--  Pega TODO este archivo en Supabase → SQL Editor → New query → Run.
--  Es seguro correrlo varias veces (usa IF NOT EXISTS / drop-and-recreate).
-- ═══════════════════════════════════════════════════════════════════════════

-- Tabla de accesos: "este email tiene acceso a esta herramienta".
-- Se usa el EMAIL como llave (no el user_id) para poder regalar acceso a
-- alguien ANTES de que se registre. Cuando esa persona cree su cuenta con
-- ese mismo email, el acceso ya está esperándola.
create table if not exists public.entitlements (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  tool_slug  text not null,
  source     text not null default 'grant',   -- 'purchase' (comprado) | 'grant' (regalado)
  created_at timestamptz not null default now(),
  unique (email, tool_slug)
);

-- Búsquedas rápidas por email.
create index if not exists entitlements_email_idx on public.entitlements (email);

-- ─── Seguridad por fila (RLS) ──────────────────────────────────────────────
-- Cada usuario SOLO puede ver sus propios accesos (los de su email).
-- Nadie puede insertar/editar desde el navegador: eso lo hace el servidor
-- (webhook de pago o panel de regalos) con la llave service_role, que
-- salta el RLS de forma controlada.
alter table public.entitlements enable row level security;

drop policy if exists "los usuarios ven sus propios accesos" on public.entitlements;
create policy "los usuarios ven sus propios accesos"
  on public.entitlements
  for select
  to authenticated
  using (email = auth.jwt() ->> 'email');

-- ═══════════════════════════════════════════════════════════════════════════
--  (Opcional, útil luego) Perfil por usuario. No es necesario todavía.
-- ═══════════════════════════════════════════════════════════════════════════
-- create table if not exists public.profiles (
--   id         uuid primary key references auth.users (id) on delete cascade,
--   email      text,
--   full_name  text,
--   created_at timestamptz not null default now()
-- );

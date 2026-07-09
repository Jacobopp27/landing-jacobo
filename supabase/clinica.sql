-- ═══════════════════════════════════════════════════════════════════════════
--  Agenda de Pacientes — tablas con aislamiento por clínica (RLS)
--  Pega TODO esto en Supabase → SQL Editor → New query → Run.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.patients (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nombre     text not null,
  telefono   text default '',
  email      text default '',
  condicion  text default '',
  notas      text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  fecha      date not null,
  hora       text default '',
  motivo     text default '',
  estado     text not null default 'pendiente',
  created_at timestamptz not null default now()
);

create table if not exists public.citas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  fecha      date not null,
  hora       text default '',
  duracion   integer not null default 30,
  motivo     text default '',
  estado     text not null default 'programada',
  created_at timestamptz not null default now()
);

create index if not exists patients_user_idx   on public.patients(user_id);
create index if not exists reminders_user_idx  on public.reminders(user_id);
create index if not exists reminders_pat_idx   on public.reminders(patient_id);
create index if not exists citas_user_idx      on public.citas(user_id);
create index if not exists citas_pat_idx       on public.citas(patient_id);

-- ─── Seguridad por fila: cada clínica solo ve/edita SUS datos ───────────────
alter table public.patients  enable row level security;
alter table public.reminders enable row level security;
alter table public.citas     enable row level security;

drop policy if exists "dueño patients" on public.patients;
create policy "dueño patients" on public.patients
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "dueño reminders" on public.reminders;
create policy "dueño reminders" on public.reminders
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "dueño citas" on public.citas;
create policy "dueño citas" on public.citas
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

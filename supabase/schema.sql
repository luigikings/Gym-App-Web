-- =============================================================
-- Gym Tracker — esquema de base de datos para Supabase (Postgres)
-- =============================================================
-- Cómo usarlo:
--   1. Crea un proyecto gratuito en https://supabase.com
--   2. Ve a "SQL Editor" -> "New query"
--   3. Pega TODO este archivo y dale a "Run"
--   4. Ve a "Project Settings" -> "API" y copia la "Project URL" y la
--      "anon public key" a tu archivo .env (mira .env.example)
--
-- Nota de seguridad: esta app es de uso personal/confianza (no pide
-- login real, solo una "palabra clave" en texto plano). Por eso las
-- políticas RLS de abajo son permisivas a propósito (permiten todo con
-- la clave anon). No la uses para guardar datos sensibles ni la
-- publiques como una app multiusuario abierta al público.
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  clave text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- EXERCISES
-- ---------------------------------------------------------------
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_exercises_user on exercises(user_id);

-- ---------------------------------------------------------------
-- ROUTINES
-- ---------------------------------------------------------------
create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_routines_user on routines(user_id);

-- ---------------------------------------------------------------
-- ROUTINE_EXERCISES (tabla puente, con orden)
-- ---------------------------------------------------------------
create table if not exists routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references routines(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  "order" integer not null default 0,
  unique (routine_id, exercise_id)
);

create index if not exists idx_routine_exercises_routine on routine_exercises(routine_id);

-- ---------------------------------------------------------------
-- ACTIVE_SESSION (entrenamiento en curso, para poder recuperarlo
-- desde cualquier dispositivo)
-- ---------------------------------------------------------------
create table if not exists active_session (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  routine_id uuid references routines(id) on delete cascade,
  routine_name text not null,
  started_at timestamptz not null default now(),
  elapsed_seconds integer not null default 0,
  sets_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- WORKOUT_SESSIONS (historial, máximo 30 por usuario, FIFO manejado
-- desde la app)
-- ---------------------------------------------------------------
create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  routine_id uuid references routines(id) on delete set null,
  routine_name text not null,
  date timestamptz not null default now(),
  duration_seconds integer not null default 0
);

create index if not exists idx_workout_sessions_user on workout_sessions(user_id, date desc);

-- ---------------------------------------------------------------
-- WORKOUT_SETS
-- ---------------------------------------------------------------
create table if not exists workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete cascade,
  exercise_name text not null,
  set_number integer not null,
  kg numeric not null default 0,
  reps integer not null default 0
);

create index if not exists idx_workout_sets_session on workout_sets(session_id);

-- ---------------------------------------------------------------
-- RECORDS (un récord vigente por ejercicio; prev_* guarda el récord
-- anterior para poder mostrar el "antes vs después" en el panel)
-- ---------------------------------------------------------------
create table if not exists records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  kg numeric not null,
  reps integer not null,
  date timestamptz not null default now(),
  prev_kg numeric,
  prev_reps integer,
  prev_date timestamptz,
  unique (user_id, exercise_id)
);

create index if not exists idx_records_user on records(user_id);

-- =============================================================
-- ROW LEVEL SECURITY — permisivo a propósito (ver nota arriba)
-- =============================================================
alter table users enable row level security;
alter table exercises enable row level security;
alter table routines enable row level security;
alter table routine_exercises enable row level security;
alter table active_session enable row level security;
alter table workout_sessions enable row level security;
alter table workout_sets enable row level security;
alter table records enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'users','exercises','routines','routine_exercises',
    'active_session','workout_sessions','workout_sets','records'
  ])
  loop
    execute format('drop policy if exists "allow_all_%1$s" on %1$s', t);
    execute format(
      'create policy "allow_all_%1$s" on %1$s for all using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- =============================================================
-- STORAGE — bucket público para fotos de ejercicios/rutinas
-- =============================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "photos_public_read" on storage.objects;
create policy "photos_public_read" on storage.objects
  for select using (bucket_id = 'photos');

drop policy if exists "photos_public_write" on storage.objects;
create policy "photos_public_write" on storage.objects
  for insert with check (bucket_id = 'photos');

drop policy if exists "photos_public_update" on storage.objects;
create policy "photos_public_update" on storage.objects
  for update using (bucket_id = 'photos');

drop policy if exists "photos_public_delete" on storage.objects;
create policy "photos_public_delete" on storage.objects
  for delete using (bucket_id = 'photos');

-- =============================================================
-- SEED — usuario admin por defecto
-- =============================================================
insert into users (name, clave, is_admin)
select 'LK', 'yuka', true
where not exists (select 1 from users where name = 'LK');

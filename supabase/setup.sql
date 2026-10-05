-- The Halal Way: room leaderboard for the quiz.
-- Run once in the Supabase SQL editor (Dashboard, SQL Editor, New query, paste, Run).
-- Safe to run again. It does not delete existing scores.
--
-- What it creates:
--   public.leaderboard          names and scores. Anyone with the anon key can read it.
--   leaderboard_private.devices which device owns which entry. Not reachable through the API.
--   leaderboard_private.settings the reset code, stored only as a bcrypt hash.
--   public.post_score(...)      the only way to add or update a score. Checks every input.
--   public.reset_leaderboard()  clears all scores when given the right code.
--
-- Nobody can insert, update, or delete rows directly with the anon key.

create extension if not exists pgcrypto with schema extensions;

-- ---------- public table ----------

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 20),
  score integer not null check (score between 0 and 18),
  level text check (level in ('Beginner', 'Learner', 'Advocate')),
  updated_at timestamptz not null default now()
);

create index if not exists leaderboard_rank on public.leaderboard (score desc, updated_at asc);

alter table public.leaderboard enable row level security;

drop policy if exists "Anyone can read the leaderboard" on public.leaderboard;
create policy "Anyone can read the leaderboard"
  on public.leaderboard for select
  to anon, authenticated
  using (true);

-- Supabase grants table rights to anon by default. Take back everything except reading.
revoke all on public.leaderboard from anon, authenticated;
grant select on public.leaderboard to anon, authenticated;

-- ---------- private schema ----------

create schema if not exists leaderboard_private;
revoke all on schema leaderboard_private from public, anon, authenticated;

create table if not exists leaderboard_private.devices (
  device_id uuid primary key,
  entry_id uuid not null unique references public.leaderboard (id) on delete cascade
);

create table if not exists leaderboard_private.settings (
  id boolean primary key default true check (id),
  reset_code_hash text not null
);

-- The reset code itself is not in this file. Only the hash of the first code is, and that code has been replaced.
insert into leaderboard_private.settings (id, reset_code_hash)
values (true, '$2a$10$9bA7oL8yFMo8gQn9d6QgZuo9QhOM/fSRpvSThAgq/5HFhPyVkGLVa')
on conflict (id) do nothing; -- keeps a code that was changed later. Change it with an update, not by rerunning this file.

-- ---------- functions ----------

create or replace function public.post_score(p_device uuid, p_name text, p_score integer, p_level text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  v_entry uuid;
begin
  if p_device is null then
    raise exception 'device id is required';
  end if;
  if char_length(v_name) < 1 or char_length(v_name) > 20
     or v_name !~ '^[[:alpha:]][[:alpha:] .''-]*$' then
    raise exception 'name must be 1 to 20 letters, spaces, hyphens, apostrophes, or periods';
  end if;
  if p_score is null or p_score < 0 or p_score > 18 then
    raise exception 'score must be between 0 and 18';
  end if;
  if p_level is not null and p_level not in ('Beginner', 'Learner', 'Advocate') then
    raise exception 'unknown level';
  end if;

  select entry_id into v_entry from leaderboard_private.devices where device_id = p_device;

  if v_entry is null then
    if (select count(*) from public.leaderboard) >= 500 then
      raise exception 'the leaderboard is full';
    end if;
    insert into public.leaderboard (name, score, level) values (v_name, p_score, p_level)
    returning id into v_entry;
    insert into leaderboard_private.devices (device_id, entry_id) values (p_device, v_entry);
  else
    -- Same device: keep the best total. The time only moves when the score goes up, so ties
    -- stay ordered by who reached the score first.
    update public.leaderboard
       set name = v_name,
           level = case when p_score >= score then coalesce(p_level, level) else level end,
           updated_at = case when p_score > score then now() else updated_at end,
           score = greatest(score, p_score)
     where id = v_entry;
  end if;
end;
$$;

create or replace function public.reset_leaderboard(p_code text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text;
  v_count integer;
begin
  select reset_code_hash into v_hash from leaderboard_private.settings where id;
  if v_hash is null or extensions.crypt(coalesce(p_code, ''), v_hash) <> v_hash then
    perform pg_sleep(1); -- slows down guessing
    raise exception 'wrong code';
  end if;
  delete from public.leaderboard where true;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.post_score(uuid, text, integer, text) from public;
revoke all on function public.reset_leaderboard(text) from public;
grant execute on function public.post_score(uuid, text, integer, text) to anon, authenticated;
grant execute on function public.reset_leaderboard(text) to anon, authenticated;

-- ---------- live updates ----------

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'leaderboard'
     ) then
    alter publication supabase_realtime add table public.leaderboard;
  end if;
end;
$$;

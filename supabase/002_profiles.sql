-- The Halal Way: player profiles on the room leaderboard (name and avatar).
-- Run once in the Supabase SQL editor after setup.sql. Safe to run again. Existing scores are kept.
--
-- Adds:
--   public.leaderboard.avatar          a preset avatar id such as "star-emerald". Never an image.
--   public.post_score(..., p_avatar)   same as before, plus the avatar, and a wider name rule:
--                                      2 to 20 letters, numbers, spaces, hyphens, apostrophes, periods, or underscores.
-- The first post_score (four arguments) stays, so older copies of the app keep working.

alter table public.leaderboard add column if not exists avatar text;

alter table public.leaderboard drop constraint if exists leaderboard_avatar_check;
alter table public.leaderboard add constraint leaderboard_avatar_check
  check (avatar is null or (char_length(avatar) <= 32 and avatar ~ '^[a-z]+-[a-z]+$'));

-- Reading rights are granted per table, so the new column is readable like the others.
grant select on public.leaderboard to anon, authenticated;

create or replace function public.post_score(p_device uuid, p_name text, p_score integer, p_level text, p_avatar text)
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
  if char_length(v_name) < 2 or char_length(v_name) > 20
     or v_name !~ '^[[:alnum:]][[:alnum:] .''_-]*$' then
    raise exception 'name must be 2 to 20 letters, numbers, spaces, hyphens, apostrophes, periods, or underscores';
  end if;
  if p_score is null or p_score < 0 or p_score > 18 then
    raise exception 'score must be between 0 and 18';
  end if;
  if p_level is not null and p_level not in ('Beginner', 'Learner', 'Advocate') then
    raise exception 'unknown level';
  end if;
  if p_avatar is not null and (char_length(p_avatar) > 32 or p_avatar !~ '^[a-z]+-[a-z]+$') then
    raise exception 'unknown avatar';
  end if;

  select entry_id into v_entry from leaderboard_private.devices where device_id = p_device;

  if v_entry is null then
    if (select count(*) from public.leaderboard) >= 500 then
      raise exception 'the leaderboard is full';
    end if;
    insert into public.leaderboard (name, score, level, avatar) values (v_name, p_score, p_level, p_avatar)
    returning id into v_entry;
    insert into leaderboard_private.devices (device_id, entry_id) values (p_device, v_entry);
  else
    update public.leaderboard
       set name = v_name,
           avatar = coalesce(p_avatar, avatar),
           level = case when p_score >= score then coalesce(p_level, level) else level end,
           updated_at = case when p_score > score then now() else updated_at end,
           score = greatest(score, p_score)
     where id = v_entry;
  end if;
end;
$$;

revoke all on function public.post_score(uuid, text, integer, text, text) from public;
grant execute on function public.post_score(uuid, text, integer, text, text) to anon, authenticated;

-- Ask the API to reload its list of functions, so the new one is usable at once.
notify pgrst, 'reload schema';

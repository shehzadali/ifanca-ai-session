#!/usr/bin/env bash
# Tests supabase/setup.sql on a local Postgres with stand-in Supabase roles.
# Usage: RESET_CODE=<code> PGHOST=localhost PGPORT=5432 PGUSER=postgres supabase/test-setup.sh
# Creates and drops a scratch database named thw_leaderboard_test.
set -u
DB=thw_leaderboard_test
DIR="$(cd "$(dirname "$0")" && pwd)"
pass=0; fail=0
q() { psql -X -q -t -A -v ON_ERROR_STOP=1 -d "$DB" -c "$1" 2>&1; }
ok()  { if [ "$2" = "$3" ]; then echo "pass  $1"; pass=$((pass+1)); else echo "FAIL  $1 (got: $2, want: $3)"; fail=$((fail+1)); fi; }
refused() { if q "$2" >/dev/null 2>&1; then echo "FAIL  $1 (was allowed)"; fail=$((fail+1)); else echo "pass  $1"; pass=$((pass+1)); fi; }

dropdb --if-exists "$DB" && createdb "$DB" || exit 1

# Stand-ins for what every Supabase project already has.
q "create role anon nologin; create role authenticated nologin;" >/dev/null 2>&1
q "create schema extensions;
   grant usage on schema public, extensions to anon, authenticated;
   alter default privileges in schema public grant all on tables to anon, authenticated;
   alter default privileges in schema public grant all on functions to anon, authenticated;
   create publication supabase_realtime;" >/dev/null

for f in setup.sql 002_profiles.sql; do
  for run in 1 2; do
    out=$(psql -X -q -v ON_ERROR_STOP=1 -d "$DB" -f "$DIR/$f" 2>&1) || { echo "FAIL  $f run $run: $out"; exit 1; }
  done
  echo "pass  $f runs twice without errors"; pass=$((pass+1))
done

D1=11111111-1111-1111-1111-111111111111
D2=22222222-2222-2222-2222-222222222222
A="set role anon;"

ok "anon can read the leaderboard" "$(q "$A select count(*) from public.leaderboard")" "0"
q "$A select public.post_score('$D1', 'Amina', 6, 'Beginner')" >/dev/null
ok "post_score adds an entry" "$(q "$A select name || ':' || score from public.leaderboard")" "Amina:6"
q "$A select public.post_score('$D1', 'Amina', 11, 'Learner')" >/dev/null
ok "same device updates, not adds" "$(q "$A select count(*) || ':' || max(score) || ':' || max(level) from public.leaderboard")" "1:11:Learner"
q "$A select public.post_score('$D1', 'Amina', 4, 'Beginner')" >/dev/null
ok "a lower total keeps the best" "$(q "$A select score || ':' || level from public.leaderboard")" "11:Learner"
q "$A select public.post_score('$D2', '  Jean-Luc  O''Neil ', 9, null)" >/dev/null
ok "names are trimmed, hyphen and apostrophe allowed" "$(q "$A select name from public.leaderboard where score = 9")" "Jean-Luc O'Neil"

refused "empty name refused" "$A select public.post_score('$D2', '   ', 5, null)"
refused "21-character name refused" "$A select public.post_score('$D2', 'Abcdefghijklmnopqrstu', 5, null)"
refused "name with symbols refused" "$A select public.post_score('$D2', 'Bob<1>', 5, null)"
refused "score above 18 refused" "$A select public.post_score('$D2', 'Bob', 19, null)"
refused "unknown level refused" "$A select public.post_score('$D2', 'Bob', 5, 'Expert')"

refused "anon cannot insert directly" "$A insert into public.leaderboard (name, score) values ('X', 18)"
refused "anon cannot update directly" "$A update public.leaderboard set score = 18"
refused "anon cannot delete directly" "$A delete from public.leaderboard"
ok "rows unchanged after refused writes" "$(q "$A select count(*) || ':' || max(score) from public.leaderboard")" "2:11"
refused "anon cannot read device keys" "$A select * from leaderboard_private.devices"
refused "anon cannot read the reset hash" "$A select * from leaderboard_private.settings"

# 002: avatars and the wider name rule
D3=33333333-3333-3333-3333-333333333333
q "$A select public.post_score('$D3', 'ali_99', 7, 'Beginner', 'star-emerald')" >/dev/null
ok "post with avatar and a name with numbers" "$(q "$A select name || ':' || avatar from public.leaderboard where score = 7")" "ali_99:star-emerald"
q "$A select public.post_score('$D3', 'ali_99', 8, 'Beginner', null)" >/dev/null
ok "a later post without avatar keeps it" "$(q "$A select avatar || ':' || score from public.leaderboard where name = 'ali_99'")" "star-emerald:8"
refused "unknown avatar refused" "$A select public.post_score('$D3', 'ali_99', 9, null, 'Star<script>')"
refused "one-character name refused" "$A select public.post_score('$D3', 'A', 9, null, 'star-emerald')"
refused "anon cannot write the avatar directly" "$A update public.leaderboard set avatar = 'sun-amber'"
ok "anon can read avatars" "$(q "$A select count(avatar) from public.leaderboard")" "1"
q "$A select public.post_score('$D3', 'ali_99', 6, null)" >/dev/null 2>&1
ok "the first post_score still works for old app copies" "$(q "$A select count(*) from public.leaderboard where name = 'ali_99'")" "1"

refused "wrong reset code refused" "$A select public.reset_leaderboard('wrong-code')"
ok "wrong code removes nothing" "$(q "$A select count(*) from public.leaderboard")" "3"
if [ -n "${RESET_CODE:-}" ]; then
  ok "right reset code clears all entries" "$(q "$A select public.reset_leaderboard('$RESET_CODE')")" "3"
  ok "leaderboard is empty after reset" "$(q "$A select count(*) from public.leaderboard")" "0"
  ok "device keys are cleared too" "$(q "select count(*) from leaderboard_private.devices")" "0"
else
  echo "skip  right reset code (set RESET_CODE to test it)"
fi
ok "table is in the realtime publication" "$(q "select count(*) from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'leaderboard'")" "1"

dropdb "$DB"
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]

-- The Halal Way: one player per name on the room leaderboard.
-- Run once in the Supabase SQL editor after 002_profiles.sql. Safe to run again.
-- Names are compared without case, so "Amina" and "amina" count as the same name.
-- If the board already holds a duplicate name, this fails. Clear the board with the Reset control first.

create unique index if not exists leaderboard_name_unique on public.leaderboard (lower(name));

-- post_score then refuses a name that another device already uses, with error code 23505.
-- The app shows: "Another player already has this name."

-- Migration 008: RPC get_collection_stats
--
-- Powers the /estadisticas page with a single Postgres call.
-- Replaces what would otherwise be 4–5 serial round-trips:
--   1. Basic summary (percentage, owned, missing, available)
--   2. Special stickers count (owned vs total)
--   3. Top repeated stickers
--   4. Section-level progress
--   5. Timeline (days collecting + current streak)
--
-- Special sticker definition (mirrors isSpecialSticker in AlbumView.tsx):
--   section = 'FWC'  OR  (section != 'CC' AND number = 1)
--
-- Streak logic: counts consecutive days with at least one sticker added,
-- ending today or yesterday. Uses created_at from collection_stickers.
-- If no activity today or yesterday, streak = 0.
--
-- Uses SECURITY INVOKER so RLS policies on collection_stickers and
-- stickers still apply (no privilege escalation).

create or replace function get_collection_stats(
  p_collection_id uuid,
  p_album_id      uuid
)
returns table (
  percentage       integer,
  owned            integer,
  missing          integer,
  available        integer,
  owned_specials   integer,
  total_specials   integer,
  days_collecting  integer,
  current_streak   integer,
  top_repeated     jsonb,
  section_progress jsonb
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_total          integer;
  v_owned          integer;
  v_missing        integer;
  v_available      integer;
  v_percentage     integer;
  v_owned_specials integer;
  v_total_specials integer;
  v_days           integer;
  v_streak         integer;
  v_top_repeated   jsonb;
  v_section_prog   jsonb;
begin
  -- 1. Get total stickers for the album
  select total_stickers into v_total
  from albums
  where id = p_album_id;

  -- 2. Core aggregates from the user's collection
  select
    coalesce(count(*)::integer,                             0),
    coalesce(sum(greatest(0, cs.quantity - 1))::integer,   0)
  into v_owned, v_available
  from collection_stickers cs
  where cs.collection_id = p_collection_id;

  v_missing := v_total - v_owned;
  v_percentage := case
    when v_total > 0 then round((v_owned::numeric / v_total) * 100)::integer
    else 0
  end;

  -- 3. Special stickers — total in album
  select count(*)::integer into v_total_specials
  from stickers s
  where s.album_id = p_album_id
    and (s.section = 'FWC' or (s.section <> 'CC' and s.number = 1));

  -- 4. Special stickers — owned by the user
  select count(*)::integer into v_owned_specials
  from collection_stickers cs
  join stickers s on s.id = cs.sticker_id
  where cs.collection_id = p_collection_id
    and (s.section = 'FWC' or (s.section <> 'CC' and s.number = 1));

  -- 5. Days collecting — days since the first sticker was added
  --    Returns 0 if collection is empty (MIN over empty set = NULL)
  select coalesce(
    extract(day from now() - min(cs.created_at))::integer,
    0
  )
  into v_days
  from collection_stickers cs
  where cs.collection_id = p_collection_id;

  -- 6. Current streak — consecutive days with activity ending today or yesterday.
  --    Uses created_at dates only. Streak = 0 if last activity was 2+ days ago.
  with activity as (
    select distinct cs.created_at::date as d
    from collection_stickers cs
    where cs.collection_id = p_collection_id
  ),
  grouped as (
    -- Consecutive dates share the same (date - row_number) group key
    select
      d,
      d - (row_number() over (order by d))::integer as grp
    from activity
  ),
  streaks as (
    select
      max(d)       as last_day,
      count(*)::integer as len
    from grouped
    group by grp
  )
  select coalesce(
    (
      select len
      from streaks
      where last_day >= current_date - 1
      order by last_day desc
      limit 1
    ),
    0
  ) into v_streak;

  -- 7. Top repeated stickers — up to 5, ordered by quantity desc
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'code',     s.code,
        'name',     s.name,
        'section',  s.section,
        'quantity', cs.quantity
      )
      order by cs.quantity desc
    ),
    '[]'::jsonb
  )
  into v_top_repeated
  from (
    select cs2.sticker_id, cs2.quantity
    from collection_stickers cs2
    where cs2.collection_id = p_collection_id
      and cs2.quantity >= 2
    order by cs2.quantity desc
    limit 5
  ) cs
  join stickers s on s.id = cs.sticker_id;

  -- 8. Section progress — owned and total per section, ordered by completion % desc
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'section', sp.section,
        'owned',   sp.owned,
        'total',   sp.total
      )
      order by (sp.owned::numeric / nullif(sp.total, 0)) desc nulls last
    ),
    '[]'::jsonb
  )
  into v_section_prog
  from (
    select
      s.section,
      count(cs.id)::integer                       as owned,
      count(s.id)::integer                        as total
    from stickers s
    left join collection_stickers cs
      on cs.sticker_id = s.id
      and cs.collection_id = p_collection_id
    where s.album_id = p_album_id
    group by s.section
  ) sp;

  -- 9. Return the single result row
  return query
  select
    v_percentage,
    v_owned,
    v_missing,
    v_available,
    v_owned_specials,
    v_total_specials,
    v_days,
    v_streak,
    v_top_repeated,
    v_section_prog;
end;
$$;

-- Allow authenticated users to call this function
grant execute on function get_collection_stats(uuid, uuid) to authenticated;

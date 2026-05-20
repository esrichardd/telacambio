-- Migration 009: Add owned_specials to get_or_create_dashboard_summary
--
-- Extends the dashboard RPC to also return how many "especial" stickers
-- the user owns, so the Home stats card can display it without a second
-- round-trip.
--
-- DROP is required before recreating because PostgreSQL does not allow
-- changing the return type of an existing function via CREATE OR REPLACE.

drop function if exists get_or_create_dashboard_summary(uuid, uuid);
--
-- A sticker is "especial" if:
--   section = 'FWC'  (all FIFA World Cup special stickers)
--   OR (section <> 'CC' AND number = 1)  (#1 of every team section)
--
-- This mirrors the TypeScript logic in lib/utils/stickers.ts
-- and the SQL logic already used in 008_stats_rpc.sql.

create or replace function get_or_create_dashboard_summary(
  p_profile_id uuid,
  p_album_id   uuid
)
returns table (
  collection_id  uuid,
  total          integer,
  owned          integer,
  missing        integer,
  repeated       integer,
  available      integer,
  percentage     integer,
  owned_specials integer
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_collection_id uuid;
  v_total         integer;
begin
  -- 1. Get existing collection
  select id into v_collection_id
  from collections
  where profile_id = p_profile_id
    and album_id   = p_album_id;

  -- 2. Create if it doesn't exist (first visit)
  if v_collection_id is null then
    insert into collections (profile_id, album_id)
    values (p_profile_id, p_album_id)
    returning id into v_collection_id;
  end if;

  -- 3. Get total stickers for the album
  select total_stickers into v_total
  from albums
  where id = p_album_id;

  -- 4. Aggregate and return everything in one shot
  return query
  select
    v_collection_id,
    v_total,
    coalesce(count(*)::integer,                                          0) as owned,
    v_total - coalesce(count(*)::integer,                                0) as missing,
    coalesce(sum(case when quantity >= 2 then 1 else 0 end)::integer,    0) as repeated,
    coalesce(sum(greatest(0, quantity - 1))::integer,                    0) as available,
    case
      when v_total > 0
        then round((coalesce(count(*), 0)::numeric / v_total) * 100)::integer
      else 0
    end as percentage,
    -- Especiales: FWC section OR sticker #1 of any team section (excluding CC)
    coalesce((
      select count(*)::integer
      from collection_stickers cs
      join stickers s on s.id = cs.sticker_id
      where cs.collection_id = v_collection_id
        and (s.section = 'FWC' or (s.section <> 'CC' and s.number = 1))
    ), 0) as owned_specials
  from collection_stickers
  where collection_stickers.collection_id = v_collection_id;
end;
$$;

-- Allow authenticated users to call this function
grant execute on function get_or_create_dashboard_summary(uuid, uuid) to authenticated;

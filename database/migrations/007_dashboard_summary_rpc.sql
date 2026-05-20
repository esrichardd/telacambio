-- Migration 007: RPC get_or_create_dashboard_summary
--
-- Replaces the two serial DB round-trips on /dashboard:
--   1. getOrCreateCollection  (SELECT + optional INSERT on collections)
--   2. getCollectionSummary   (SELECT + aggregate on collection_stickers)
--
-- With a single Postgres call that returns collection_id + full summary.
-- Uses SECURITY INVOKER so RLS policies on collections and
-- collection_stickers still apply (no privilege escalation).

create or replace function get_or_create_dashboard_summary(
  p_profile_id uuid,
  p_album_id   uuid
)
returns table (
  collection_id uuid,
  total         integer,
  owned         integer,
  missing       integer,
  repeated      integer,
  available     integer,
  percentage    integer
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
    end as percentage
  from collection_stickers
  where collection_stickers.collection_id = v_collection_id;
end;
$$;

-- Allow authenticated users to call this function
grant execute on function get_or_create_dashboard_summary(uuid, uuid) to authenticated;

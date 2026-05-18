-- =============================================================================
-- MIGRACIÓN 004: Agrega la barajita FWC00 (portada/escudo especial)
--
-- La barajita FWC00 es la primera del álbum y no estaba incluida en el seed
-- original. Se inserta con number = 0 dentro de la sección FWC.
--
-- Actualiza también el contador total_stickers del álbum: 993 → 994.
-- =============================================================================

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from albums where slug = 'mundial-2026';

  if v_album_id is null then
    raise exception 'Album mundial-2026 no encontrado.';
  end if;

  -- Insertar FWC00 solo si no existe ya
  insert into stickers (album_id, code, section, number, name)
  values (v_album_id, 'FWC00', 'FWC', 0, '00')
  on conflict (album_id, code) do nothing;

  -- Actualizar contador total del álbum
  update albums
  set total_stickers = 994
  where id = v_album_id;

end $$;

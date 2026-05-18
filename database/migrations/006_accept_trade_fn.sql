-- =============================================================================
-- MIGRACIÓN 006: Función de aceptación atómica de intercambios
-- Descripción: Transfiere barajitas entre colecciones en una sola transacción.
--
-- Por qué SECURITY DEFINER:
--   La función necesita escribir en collection_stickers de AMBOS participantes.
--   RLS solo permite que un usuario edite sus propias colecciones, así que
--   sin SECURITY DEFINER la actualización del proponente fallaría cuando la
--   ejecuta el receptor (y viceversa).
--   auth.uid() sigue funcionando dentro de la función gracias al JWT de Supabase,
--   lo que nos permite validar que solo el receptor puede llamarla.
--
-- Flujo:
--   1. Bloquear la fila del trade (FOR UPDATE) para evitar race conditions
--   2. Validar que quien llama es el receptor y que el trade está pending
--   3. Verificar que cada barajita sigue disponible (quantity >= 2)
--   4. Ejecutar las transferencias (decrementar dador, incrementar receptor)
--   5. Marcar el trade como accepted
--
-- Retorna: jsonb { success: true, trade_id: uuid }
-- Errores: RAISE EXCEPTION con errcode P000x para distinguirlos en el cliente
-- =============================================================================

create or replace function accept_trade(p_trade_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trade              trades%rowtype;
  v_proposer_coll_id   uuid;
  v_receiver_coll_id   uuid;
  v_sticker            record;
  v_qty                int;
  v_unavailable        text[] := '{}';
begin

  -- ── 1. Bloquear y validar la propuesta ──────────────────────────────────────
  select * into v_trade
  from trades
  where id        = p_trade_id
    and status    = 'pending'
    and receiver_id = auth.uid()
  for update;

  if not found then
    raise exception 'Propuesta no encontrada, ya procesada, o no tienes permiso para aceptarla'
      using errcode = 'P0001';
  end if;


  -- ── 2. Obtener colecciones de ambos participantes ────────────────────────────
  select id into v_proposer_coll_id
  from collections
  where profile_id = v_trade.proposer_id
    and album_id   = v_trade.album_id;

  if not found then
    raise exception 'El proponente no tiene colección registrada para este álbum'
      using errcode = 'P0002';
  end if;

  select id into v_receiver_coll_id
  from collections
  where profile_id = v_trade.receiver_id
    and album_id   = v_trade.album_id;

  if not found then
    raise exception 'No tienes colección registrada para este álbum'
      using errcode = 'P0003';
  end if;


  -- ── 3. Validar disponibilidad de cada barajita ───────────────────────────────
  -- Una barajita es válida solo si quien la da tiene quantity >= 2
  -- (necesita al menos una repetida para ceder una unidad)
  for v_sticker in
    select ts.sticker_id, ts.direction, s.code
    from trade_stickers ts
    join stickers s on s.id = ts.sticker_id
    where ts.trade_id = p_trade_id
  loop
    if v_sticker.direction = 'proposer_gives' then
      select quantity into v_qty
      from collection_stickers
      where collection_id = v_proposer_coll_id
        and sticker_id    = v_sticker.sticker_id;

      if v_qty is null or v_qty < 2 then
        v_unavailable := v_unavailable || v_sticker.code;
      end if;

    else -- receiver_gives
      select quantity into v_qty
      from collection_stickers
      where collection_id = v_receiver_coll_id
        and sticker_id    = v_sticker.sticker_id;

      if v_qty is null or v_qty < 2 then
        v_unavailable := v_unavailable || v_sticker.code;
      end if;
    end if;
  end loop;

  -- Si alguna barajita ya no está disponible, informar cuáles y abortar
  if array_length(v_unavailable, 1) > 0 then
    raise exception 'Algunas barajitas ya no están disponibles: %',
      array_to_string(v_unavailable, ', ')
      using errcode = 'P0004';
  end if;


  -- ── 4. Ejecutar transferencias ───────────────────────────────────────────────
  for v_sticker in
    select sticker_id, direction
    from trade_stickers
    where trade_id = p_trade_id
  loop

    if v_sticker.direction = 'proposer_gives' then
      -- Proponente pierde una unidad
      update collection_stickers
      set    quantity = quantity - 1
      where  collection_id = v_proposer_coll_id
        and  sticker_id    = v_sticker.sticker_id;

      -- Eliminar la fila si llega a 0 (safety net; la validación lo previene)
      delete from collection_stickers
      where  collection_id = v_proposer_coll_id
        and  sticker_id    = v_sticker.sticker_id
        and  quantity      <= 0;

      -- Receptor gana una unidad (crea la fila si no la tenía)
      insert into collection_stickers (collection_id, sticker_id, quantity)
      values (v_receiver_coll_id, v_sticker.sticker_id, 1)
      on conflict (collection_id, sticker_id)
      do update set quantity = collection_stickers.quantity + 1;

    else -- receiver_gives
      -- Receptor pierde una unidad
      update collection_stickers
      set    quantity = quantity - 1
      where  collection_id = v_receiver_coll_id
        and  sticker_id    = v_sticker.sticker_id;

      delete from collection_stickers
      where  collection_id = v_receiver_coll_id
        and  sticker_id    = v_sticker.sticker_id
        and  quantity      <= 0;

      -- Proponente gana una unidad
      insert into collection_stickers (collection_id, sticker_id, quantity)
      values (v_proposer_coll_id, v_sticker.sticker_id, 1)
      on conflict (collection_id, sticker_id)
      do update set quantity = collection_stickers.quantity + 1;
    end if;

  end loop;


  -- ── 5. Marcar la propuesta como aceptada ─────────────────────────────────────
  update trades
  set    status     = 'accepted',
         updated_at = now()
  where  id = p_trade_id;


  return jsonb_build_object('success', true, 'trade_id', p_trade_id);

end;
$$;

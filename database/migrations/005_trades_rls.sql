-- =============================================================================
-- MIGRACIÓN 005: Row Level Security para intercambios
-- Descripción: Define quién puede leer y modificar propuestas de intercambio.
--
-- REGLA PRINCIPAL: Solo los participantes de un intercambio (proponente y
-- receptor) pueden ver sus datos. Nadie más.
--
-- ESCRITURA:
--   - Crear propuesta → solo el proponente (proposer_id = auth.uid())
--   - Cancelar        → solo el proponente mientras está pending
--   - Rechazar        → solo el receptor mientras está pending
--   - Aceptar         → vía la función accept_trade() (SECURITY DEFINER),
--                       que bypasea RLS para actualizar ambas colecciones
-- =============================================================================


-- Habilitar RLS
alter table trades         enable row level security;
alter table trade_stickers enable row level security;


-- =============================================================================
-- TRADES
-- =============================================================================

-- Los participantes pueden ver sus propias propuestas (en cualquier estado)
create policy "trades: lectura de participantes"
  on trades for select
  using (auth.uid() = proposer_id or auth.uid() = receiver_id);

-- Solo usuarios autenticados pueden crear propuestas, y deben ser el proponente
create policy "trades: inserción como proponente"
  on trades for insert
  with check (auth.uid() = proposer_id and auth.uid() is not null);

-- El proponente puede cancelar su propuesta mientras esté pendiente
create policy "trades: cancelación por proponente"
  on trades for update
  using  (auth.uid() = proposer_id and status = 'pending')
  with check (status = 'cancelled');

-- El receptor puede rechazar una propuesta pendiente
create policy "trades: rechazo por receptor"
  on trades for update
  using  (auth.uid() = receiver_id and status = 'pending')
  with check (status = 'rejected');


-- =============================================================================
-- TRADE_STICKERS
-- La visibilidad hereda de la propuesta padre.
-- Solo el proponente inserta. Nadie edita ni borra directamente:
--   - Si el trade se elimina, cascade borra los stickers.
--   - accept_trade() maneja la transferencia vía SECURITY DEFINER.
-- =============================================================================

-- Los participantes de la propuesta pueden ver sus barajitas
create policy "trade_stickers: lectura de participantes"
  on trade_stickers for select
  using (
    exists (
      select 1 from trades
      where trades.id = trade_stickers.trade_id
        and (trades.proposer_id = auth.uid() or trades.receiver_id = auth.uid())
    )
  );

-- Solo el proponente puede agregar barajitas a una propuesta pendiente suya
create policy "trade_stickers: inserción por proponente"
  on trade_stickers for insert
  with check (
    exists (
      select 1 from trades
      where trades.id = trade_stickers.trade_id
        and trades.proposer_id = auth.uid()
        and trades.status = 'pending'
    )
  );

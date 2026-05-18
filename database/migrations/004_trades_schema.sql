-- =============================================================================
-- MIGRACIÓN 004: Schema de intercambios (trades)
-- Descripción: Tablas y enums para propuestas de intercambio entre usuarios
-- =============================================================================


-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------

create type trade_status_type as enum ('pending', 'accepted', 'rejected', 'cancelled');

-- Direction es siempre desde la perspectiva del proponente
create type trade_direction_type as enum ('proposer_gives', 'receiver_gives');


-- -----------------------------------------------------------------------------
-- TRADES
-- Una propuesta de intercambio entre dos coleccionistas.
-- El proponente (proposer) la crea; el receptor (receiver) la acepta o rechaza.
-- El WhatsApp actúa como canal de notificación externo — la confirmación
-- y la actualización de colecciones ocurren dentro de la app.
-- -----------------------------------------------------------------------------

create table trades (
  id           uuid primary key default gen_random_uuid(),
  proposer_id  uuid not null references profiles(id) on delete cascade,
  receiver_id  uuid not null references profiles(id) on delete cascade,
  album_id     uuid not null references albums(id) on delete cascade,
  status       trade_status_type not null default 'pending',
  message      text,            -- mensaje opcional que acompaña la propuesta
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),

  -- Un usuario no puede proponerse un intercambio a sí mismo
  constraint trades_different_users check (proposer_id != receiver_id)
);


-- -----------------------------------------------------------------------------
-- TRADE_STICKERS
-- Las barajitas individuales que forman parte de una propuesta.
-- direction indica quién entrega la barajita (perspectiva del proponente):
--   proposer_gives → el proponente la da al receptor
--   receiver_gives → el receptor la da al proponente
-- Una barajita no puede aparecer dos veces en la misma dirección en un trade.
-- -----------------------------------------------------------------------------

create table trade_stickers (
  id          uuid primary key default gen_random_uuid(),
  trade_id    uuid not null references trades(id) on delete cascade,
  sticker_id  uuid not null references stickers(id) on delete cascade,
  direction   trade_direction_type not null,
  created_at  timestamptz default now(),

  unique(trade_id, sticker_id, direction)
);


-- -----------------------------------------------------------------------------
-- ÍNDICES
-- -----------------------------------------------------------------------------

-- Consultas frecuentes: propuestas recibidas o enviadas por estado
create index idx_trades_receiver   on trades(receiver_id, status);
create index idx_trades_proposer   on trades(proposer_id, status);

-- Barajitas de una propuesta
create index idx_trade_stickers_trade   on trade_stickers(trade_id);
create index idx_trade_stickers_sticker on trade_stickers(sticker_id);


-- -----------------------------------------------------------------------------
-- TRIGGER: updated_at
-- Reutiliza update_updated_at() definida en 002_triggers.sql
-- -----------------------------------------------------------------------------

create trigger set_updated_at
  before update on trades
  for each row execute function update_updated_at();

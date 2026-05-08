-- =============================================================================
-- MIGRACIÓN 001: Schema inicial de TeLaCambio
-- Descripción: Crea todos los tipos, tablas e índices del sistema
-- =============================================================================


-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------

create type trading_status_type as enum ('active', 'paused', 'not_trading');
create type preferred_contact_type as enum ('whatsapp', 'in_app', 'any');


-- -----------------------------------------------------------------------------
-- ALBUMS
-- Catálogo de álbumes disponibles en la plataforma.
-- Manejado por el admin — los usuarios no crean álbumes.
-- -----------------------------------------------------------------------------

create table albums (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,           -- "Panini Mundial 2026"
  slug             text not null unique,    -- "mundial-2026" (usado en URLs)
  description      text,
  total_stickers   int not null,
  cover_image_url  text,
  is_active        boolean default true,
  created_at       timestamptz default now()
);


-- -----------------------------------------------------------------------------
-- STICKERS
-- Catálogo completo de barajitas por álbum.
-- Cargado por el admin. Los usuarios no crean barajitas, solo las registran.
-- -----------------------------------------------------------------------------

create table stickers (
  id          uuid primary key default gen_random_uuid(),
  album_id    uuid not null references albums(id) on delete cascade,
  code        text not null,    -- "ARG-2", "BRA-8" — lo que tipea el usuario
  name        text,             -- "Lionel Messi", "Escudo Argentina"
  section     text not null,    -- "ARG", "BRA", "TROPHY", "STADIUMS"
  number      int,              -- posición dentro de la sección
  image_url   text,
  created_at  timestamptz default now(),

  unique(album_id, code)
);


-- -----------------------------------------------------------------------------
-- PROFILES
-- Extiende auth.users con datos del coleccionista.
-- Se crea automáticamente al registrarse (ver triggers).
-- -----------------------------------------------------------------------------

create table profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  username              text not null unique,           -- URL: telacambio.com/@username
  display_name          text,                           -- nombre visible en la UI
  avatar_url            text,
  bio                   text,                           -- descripción corta
  whatsapp_number       text,                           -- "+573001234567"
  show_whatsapp         boolean default false,          -- si lo muestra a otros usuarios
  city                  text,
  country_code          char(2),                        -- ISO 3166: "CO", "VE", "MX"
  lat                   numeric(9,6),                   -- derivado de ciudad al guardar
  lng                   numeric(9,6),
  trading_status        trading_status_type default 'active',
  preferred_contact     preferred_contact_type default 'whatsapp',
  is_public             boolean default true,           -- si su colección es visible
  onboarding_completed  boolean default false,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);


-- -----------------------------------------------------------------------------
-- COLLECTIONS
-- La colección activa de un usuario para un álbum específico.
-- Un usuario puede tener una colección por álbum.
-- La URL pública es: telacambio.com/@username/mundial-2026
-- -----------------------------------------------------------------------------

create table collections (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  album_id    uuid not null references albums(id) on delete cascade,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),

  unique(profile_id, album_id)
);


-- -----------------------------------------------------------------------------
-- COLLECTION_STICKERS
-- Las barajitas que tiene un usuario en su colección.
-- El estado se DERIVA de quantity (no se almacena):
--   ausente en tabla  → "Me falta"
--   quantity = 1      → "La tengo"
--   quantity >= 2     → "Repetida"
-- -----------------------------------------------------------------------------

create table collection_stickers (
  id             uuid primary key default gen_random_uuid(),
  collection_id  uuid not null references collections(id) on delete cascade,
  sticker_id     uuid not null references stickers(id) on delete cascade,
  quantity       int not null default 1 check (quantity > 0),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),

  unique(collection_id, sticker_id)
);


-- -----------------------------------------------------------------------------
-- TRADING SPOTS
-- Lugares físicos conocidos para intercambiar barajitas.
-- Pueden ser sugeridos por usuarios y verificados por el admin.
-- -----------------------------------------------------------------------------

create table trading_spots (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,       -- "Parque Sabaneta"
  description   text,                -- "Frente a la iglesia, lado norte"
  address       text,
  city          text not null,
  country_code  char(2) not null,
  lat           numeric(9,6) not null,
  lng           numeric(9,6) not null,
  suggested_by  uuid references profiles(id) on delete set null,
  is_verified   boolean default false,   -- el admin lo aprueba
  created_at    timestamptz default now()
);


-- -----------------------------------------------------------------------------
-- PROFILE TRADING SPOTS
-- Los lugares donde un usuario acostumbra intercambiar.
-- -----------------------------------------------------------------------------

create table profile_trading_spots (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references profiles(id) on delete cascade,
  trading_spot_id  uuid not null references trading_spots(id) on delete cascade,
  notes            text,            -- "Los domingos de 10am a 1pm"
  is_active        boolean default true,
  created_at       timestamptz default now(),

  unique(profile_id, trading_spot_id)
);


-- -----------------------------------------------------------------------------
-- GROUPS
-- Grupos privados de coleccionistas (familia, trabajo, amigos).
-- Permiten ver quién tiene qué y coordinar intercambios entre el grupo.
-- -----------------------------------------------------------------------------

create table groups (
  id           uuid primary key default gen_random_uuid(),
  album_id     uuid not null references albums(id) on delete cascade,
  name         text not null,
  description  text,
  invite_code  text not null unique default substring(gen_random_uuid()::text, 1, 8),
  owner_id     uuid not null references profiles(id) on delete cascade,
  is_active    boolean default true,
  created_at   timestamptz default now()
);


-- -----------------------------------------------------------------------------
-- GROUP MEMBERS
-- Relación entre colecciones y grupos.
-- Usa collection_id (no user_id) para permitir múltiples álbumes por grupo.
-- -----------------------------------------------------------------------------

create table group_members (
  id             uuid primary key default gen_random_uuid(),
  group_id       uuid not null references groups(id) on delete cascade,
  collection_id  uuid not null references collections(id) on delete cascade,
  joined_at      timestamptz default now(),

  unique(group_id, collection_id)
);


-- -----------------------------------------------------------------------------
-- ÍNDICES
-- -----------------------------------------------------------------------------

-- Búsqueda de barajitas por álbum y código
create index idx_stickers_album_code    on stickers(album_id, code);
create index idx_stickers_section       on stickers(album_id, section);

-- Performance en colecciones grandes
create index idx_col_stickers_collection  on collection_stickers(collection_id);
create index idx_col_stickers_sticker     on collection_stickers(sticker_id);

-- Búsqueda geográfica de usuarios
create index idx_profiles_country_city  on profiles(country_code, city);
create index idx_profiles_username      on profiles(username);

-- Búsqueda geográfica de spots
create index idx_trading_spots_country  on trading_spots(country_code);
create index idx_trading_spots_geo      on trading_spots(lat, lng);
create index idx_trading_spots_verified on trading_spots(is_verified);

-- Grupos por álbum
create index idx_groups_album  on groups(album_id);
create index idx_groups_owner  on groups(owner_id);

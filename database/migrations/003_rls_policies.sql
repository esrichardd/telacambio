-- =============================================================================
-- MIGRACIÓN 003: Row Level Security (RLS) de TeLaCambio
-- Descripción: Define quién puede leer y escribir qué en cada tabla.
--
-- REGLA DE ORO: La visibilidad se hereda de profiles.is_public
--   Si el perfil es público → su colección, barajitas y spots son públicos.
--   Un cambio en is_public lo afecta todo en cascada.
--
-- ESCRITURA ADMIN: albums, stickers y verificación de trading_spots
--   se manejan con el service role key desde el backend.
--   Ese key bypasea RLS y nunca se expone al cliente.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Habilitar RLS en todas las tablas
-- -----------------------------------------------------------------------------

alter table albums                 enable row level security;
alter table stickers               enable row level security;
alter table profiles               enable row level security;
alter table collections            enable row level security;
alter table collection_stickers    enable row level security;
alter table trading_spots          enable row level security;
alter table profile_trading_spots  enable row level security;
alter table groups                 enable row level security;
alter table group_members          enable row level security;


-- =============================================================================
-- ALBUMS
-- Lectura pública. Escritura solo via service role (admin).
-- =============================================================================

create policy "albums: lectura pública"
  on albums for select
  using (is_active = true);


-- =============================================================================
-- STICKERS
-- Lectura pública. Escritura solo via service role (admin).
-- =============================================================================

create policy "stickers: lectura pública"
  on stickers for select
  using (true);


-- =============================================================================
-- PROFILES
-- =============================================================================

-- Cualquiera puede ver perfiles públicos
create policy "profiles: lectura pública"
  on profiles for select
  using (is_public = true);

-- El usuario siempre puede ver su propio perfil (aunque sea privado)
create policy "profiles: lectura propia"
  on profiles for select
  using (auth.uid() = id);

-- El trigger handle_new_user crea el perfil, pero esta policy lo permite
create policy "profiles: inserción propia"
  on profiles for insert
  with check (auth.uid() = id);

-- Solo puede editar su propio perfil
create policy "profiles: edición propia"
  on profiles for update
  using (auth.uid() = id);


-- =============================================================================
-- COLLECTIONS
-- =============================================================================

-- Lectura pública si el perfil es público
create policy "collections: lectura pública"
  on collections for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = collections.profile_id
        and profiles.is_public = true
    )
  );

-- El dueño siempre puede ver su propia colección
create policy "collections: lectura propia"
  on collections for select
  using (auth.uid() = profile_id);

-- Solo puede crear colecciones para sí mismo
create policy "collections: inserción propia"
  on collections for insert
  with check (auth.uid() = profile_id);

-- Solo puede editar sus propias colecciones
create policy "collections: edición propia"
  on collections for update
  using (auth.uid() = profile_id);

-- Solo puede borrar sus propias colecciones
create policy "collections: borrado propio"
  on collections for delete
  using (auth.uid() = profile_id);


-- =============================================================================
-- COLLECTION_STICKERS
-- La visibilidad hereda de collections → profiles
-- =============================================================================

-- Lectura pública si el perfil es público, o es el dueño
create policy "collection_stickers: lectura"
  on collection_stickers for select
  using (
    exists (
      select 1 from collections c
      join profiles p on p.id = c.profile_id
      where c.id = collection_stickers.collection_id
        and (p.is_public = true or p.id = auth.uid())
    )
  );

-- Solo puede agregar barajitas a sus propias colecciones
create policy "collection_stickers: inserción propia"
  on collection_stickers for insert
  with check (
    exists (
      select 1 from collections
      where id = collection_stickers.collection_id
        and profile_id = auth.uid()
    )
  );

-- Solo puede editar sus propias barajitas
create policy "collection_stickers: edición propia"
  on collection_stickers for update
  using (
    exists (
      select 1 from collections
      where id = collection_stickers.collection_id
        and profile_id = auth.uid()
    )
  );

-- Solo puede borrar sus propias barajitas
create policy "collection_stickers: borrado propio"
  on collection_stickers for delete
  using (
    exists (
      select 1 from collections
      where id = collection_stickers.collection_id
        and profile_id = auth.uid()
    )
  );


-- =============================================================================
-- TRADING SPOTS
-- =============================================================================

-- Cualquiera puede ver spots verificados
create policy "trading_spots: lectura pública verificados"
  on trading_spots for select
  using (is_verified = true);

-- El que lo sugirió puede ver su propio spot aunque no esté verificado
create policy "trading_spots: lectura propia no verificada"
  on trading_spots for select
  using (auth.uid() = suggested_by);

-- Usuarios autenticados pueden sugerir nuevos spots
create policy "trading_spots: sugerencia autenticada"
  on trading_spots for insert
  with check (auth.uid() = suggested_by and auth.uid() is not null);

-- El creador puede editar su spot mientras no esté verificado
-- Una vez verificado, solo el service role puede modificarlo
create policy "trading_spots: edición propia no verificada"
  on trading_spots for update
  using (auth.uid() = suggested_by and is_verified = false);


-- =============================================================================
-- PROFILE TRADING SPOTS
-- =============================================================================

-- Lectura pública si el perfil es público
create policy "profile_trading_spots: lectura pública"
  on profile_trading_spots for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = profile_trading_spots.profile_id
        and profiles.is_public = true
    )
  );

-- El usuario siempre puede ver sus propios spots
create policy "profile_trading_spots: lectura propia"
  on profile_trading_spots for select
  using (auth.uid() = profile_id);

-- Solo puede agregar spots a su propio perfil
create policy "profile_trading_spots: inserción propia"
  on profile_trading_spots for insert
  with check (auth.uid() = profile_id);

-- Solo puede editar sus propios spots
create policy "profile_trading_spots: edición propia"
  on profile_trading_spots for update
  using (auth.uid() = profile_id);

-- Solo puede borrar sus propios spots
create policy "profile_trading_spots: borrado propio"
  on profile_trading_spots for delete
  using (auth.uid() = profile_id);


-- =============================================================================
-- GROUPS
-- =============================================================================

-- Los miembros del grupo pueden verlo, y el dueño también
create policy "groups: lectura de miembros"
  on groups for select
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from group_members gm
      join collections c on c.id = gm.collection_id
      where gm.group_id = groups.id
        and c.profile_id = auth.uid()
    )
  );

-- Cualquier usuario autenticado puede crear un grupo
create policy "groups: creación autenticada"
  on groups for insert
  with check (auth.uid() = owner_id);

-- Solo el dueño puede editar el grupo
create policy "groups: edición del dueño"
  on groups for update
  using (auth.uid() = owner_id);

-- Solo el dueño puede borrar el grupo
create policy "groups: borrado del dueño"
  on groups for delete
  using (auth.uid() = owner_id);


-- =============================================================================
-- GROUP MEMBERS
-- =============================================================================

-- Los miembros del grupo pueden ver a otros miembros
create policy "group_members: lectura de miembros"
  on group_members for select
  using (
    exists (
      select 1 from group_members my_seat
      join collections c on c.id = my_seat.collection_id
      where my_seat.group_id = group_members.group_id
        and c.profile_id = auth.uid()
    )
  );

-- Un usuario puede unirse con su propia colección (via invite_code validado en la app)
create policy "group_members: unirse propio"
  on group_members for insert
  with check (
    exists (
      select 1 from collections
      where id = group_members.collection_id
        and profile_id = auth.uid()
    )
  );

-- El usuario puede salir del grupo
create policy "group_members: salida propia"
  on group_members for delete
  using (
    exists (
      select 1 from collections
      where id = group_members.collection_id
        and profile_id = auth.uid()
    )
  );

-- El dueño del grupo puede expulsar a cualquier miembro
create policy "group_members: expulsión por dueño"
  on group_members for delete
  using (
    exists (
      select 1 from groups
      where groups.id = group_members.group_id
        and groups.owner_id = auth.uid()
    )
  );

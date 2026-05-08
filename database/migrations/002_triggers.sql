-- =============================================================================
-- MIGRACIÓN 002: Triggers de TeLaCambio
-- Descripción: Automatizaciones a nivel de base de datos
-- =============================================================================


-- -----------------------------------------------------------------------------
-- TRIGGER: updated_at automático
-- Actualiza el campo updated_at cada vez que se modifica una fila.
-- -----------------------------------------------------------------------------

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger set_updated_at
  before update on collections
  for each row execute function update_updated_at();

create trigger set_updated_at
  before update on collection_stickers
  for each row execute function update_updated_at();


-- -----------------------------------------------------------------------------
-- TRIGGER: Crear perfil automáticamente al registrarse
-- Se ejecuta cuando Supabase Auth crea un nuevo usuario.
-- Funciona igual para usuarios anónimos y registrados.
-- El username temporal usa los primeros 8 caracteres del UUID.
-- El usuario lo puede cambiar durante el onboarding.
-- -----------------------------------------------------------------------------

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    'user_' || substring(new.id::text, 1, 8)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- -----------------------------------------------------------------------------
-- TRIGGER: Validar username
-- El username solo puede contener letras, números, guiones y guiones bajos.
-- Mínimo 3 caracteres, máximo 30.
-- -----------------------------------------------------------------------------

create or replace function validate_username()
returns trigger as $$
begin
  if new.username !~ '^[a-zA-Z0-9_-]{3,30}$' then
    raise exception 'Username inválido. Solo letras, números, _ y -. Entre 3 y 30 caracteres.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger check_username
  before insert or update of username on profiles
  for each row execute function validate_username();


-- -----------------------------------------------------------------------------
-- TRIGGER: Actualizar updated_at en collections cuando cambian sus barajitas
-- Útil para saber cuándo fue la última vez que el usuario actualizó su álbum.
-- -----------------------------------------------------------------------------

create or replace function update_collection_on_sticker_change()
returns trigger as $$
begin
  update collections
  set updated_at = now()
  where id = coalesce(new.collection_id, old.collection_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger sync_collection_updated_at
  after insert or update or delete on collection_stickers
  for each row execute function update_collection_on_sticker_change();

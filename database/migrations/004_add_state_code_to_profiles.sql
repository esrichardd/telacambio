-- Migración 004: agrega state_code a profiles
-- Persiste el estado/departamento seleccionado por el usuario,
-- necesario para precargar correctamente el formulario de ubicación.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS state_code text;

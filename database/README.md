# TeLaCambio — Base de Datos

Documentación del modelo de datos de TeLaCambio, construido sobre **Supabase (PostgreSQL)**.

---

## Estructura de archivos

```
database/
├── migrations/
│   ├── 001_schema.sql        → Tablas, tipos e índices
│   ├── 002_triggers.sql      → Automatizaciones (updated_at, validaciones, perfil automático)
│   └── 003_rls_policies.sql  → Row Level Security (quién puede leer/escribir qué)
├── seeds/
│   └── 001_mundial_2026.sql  → Datos iniciales: álbum y trading spots verificados
└── README.md                 → Este archivo
```

---

## Cómo aplicar las migraciones

### Opción A — Supabase CLI (recomendado)

```bash
# Instalar CLI
npm install -g supabase

# Inicializar en el proyecto (si no está hecho)
supabase init

# Linkear con tu proyecto
supabase link --project-ref TU_PROJECT_REF

# Aplicar migraciones en orden
supabase db push
```

### Opción B — Dashboard de Supabase

1. Ir a **SQL Editor** en el dashboard
2. Ejecutar los archivos en orden: `001` → `002` → `003`
3. Luego ejecutar el seed `001_mundial_2026.sql` con el service role

> ⚠️ Los seeds deben ejecutarse con el **service role key** porque bypassean RLS.

---

## Modelo de datos

### Diagrama de relaciones

```
auth.users (Supabase Auth)
    └── profiles (1:1)
            ├── collections (1:N — una por álbum)
            │     └── collection_stickers (N:N con stickers)
            │                                └── stickers (pertenecen a un album)
            ├── profile_trading_spots (N:N)
            │     └── trading_spots
            └── groups (como owner)

group_members
    ├── group_id    → groups
    └── collection_id → collections
```

---

## Tablas

### `albums`

Catálogo de álbumes disponibles. Manejado por el admin — los usuarios no crean álbumes.

| Campo          | Tipo | Descripción                          |
| -------------- | ---- | ------------------------------------ |
| id             | uuid | PK                                   |
| name           | text | "Panini Mundial 2026"                |
| slug           | text | URL-friendly, único: "mundial-2026"  |
| total_stickers | int  | Total oficial del álbum              |
| is_active      | bool | Ocultar álbumes viejos sin borrarlos |

---

### `stickers`

El catálogo completo de barajitas de un álbum. También manejado por el admin.

| Campo   | Tipo | Descripción                                 |
| ------- | ---- | ------------------------------------------- |
| code    | text | "ARG-2", "BRA-8" — lo que tipea el usuario  |
| section | text | Grupo temático: "ARG", "TROPHY", "STADIUMS" |
| number  | int  | Posición dentro de la sección               |

**Clave de diseño:** el campo `code` es lo que el usuario escribe para registrar una barajita. Debe ser consistente, corto y fácil de recordar.

---

### `profiles`

Extiende `auth.users` con los datos del coleccionista.

| Campo                | Tipo    | Descripción                                               |
| -------------------- | ------- | --------------------------------------------------------- |
| username             | text    | Único. Genera la URL pública: `telacambio.com/@username`  |
| whatsapp_number      | text    | Guardado siempre, expuesto solo si `show_whatsapp = true` |
| lat / lng            | numeric | Derivados de ciudad+país via geocoder al guardar          |
| trading_status       | enum    | `active` / `paused` / `not_trading`                       |
| is_public            | bool    | **Controla la visibilidad de toda la colección**          |
| onboarding_completed | bool    | Para mostrar el flow de bienvenida la primera vez         |

**Nota sobre usuarios anónimos:** Supabase genera un `auth.uid()` real para usuarios anónimos, así que las RLS policies aplican igual. El perfil se crea automáticamente con un username temporal (`user_xxxxxxxx`) y el usuario lo personaliza en el onboarding.

---

### `collections`

La colección activa de un usuario para un álbum específico.

- Un usuario puede tener **máximo una colección por álbum** (`unique(profile_id, album_id)`)
- La URL pública es `telacambio.com/@username/mundial-2026`
- `updated_at` se actualiza automáticamente cuando se agregan/editan barajitas

---

### `collection_stickers`

Las barajitas que tiene el usuario. El estado se **deriva de `quantity`**, no se almacena:

| quantity           | Estado visible                                    |
| ------------------ | ------------------------------------------------- |
| No existe en tabla | Me falta                                          |
| 1                  | La tengo                                          |
| 2 o más            | Repetida (quantity - 1 = disponibles para cambio) |

Esta decisión de diseño evita estados inconsistentes y simplifica las queries. Para el texto de WhatsApp, por ejemplo:

```sql
-- Barajitas que me faltan
select s.code, s.name from stickers s
where s.album_id = $album_id
  and s.id not in (
    select sticker_id from collection_stickers
    where collection_id = $collection_id
  );

-- Mis repetidas disponibles para cambio
select s.code, s.name, (cs.quantity - 1) as disponibles
from collection_stickers cs
join stickers s on s.id = cs.sticker_id
where cs.collection_id = $collection_id
  and cs.quantity > 1;
```

---

### `trading_spots`

Lugares físicos para intercambiar. Flujo de vida de un spot:

1. Usuario sugiere un spot → `is_verified = false`
2. El admin lo revisa y aprueba → `is_verified = true`
3. Aparece en búsquedas públicas y en el mapa

Una vez verificado, **solo el service role puede modificarlo**. El creador puede editar mientras no esté verificado.

---

### `profile_trading_spots`

Los lugares donde un usuario acostumbra ir. El campo `notes` permite contexto como "Los domingos de 10am a 1pm", que es clave para que dos personas puedan coordinar sin necesidad de chatear.

---

### `groups`

Grupos privados (familia, trabajo, amigos del barrio). Se unen via `invite_code` — un código de 8 caracteres generado automáticamente. El dueño puede expulsar miembros y el miembro puede salir cuando quiera.

---

### `group_members`

Relaciona **colecciones** (no usuarios) con grupos. Esto es intencional: permite que en el futuro un usuario tenga colecciones distintas en grupos distintos, o que la lógica de "quién tiene qué en el grupo" sea directa sin joins extra.

---

## Row Level Security

La RLS sigue una sola regla de oro: **la visibilidad se hereda de `profiles.is_public`**.

```
profiles.is_public = true
    → collections visibles
        → collection_stickers visibles
        → profile_trading_spots visibles
```

Un cambio en `is_public` lo apaga o enciende todo en cascada automáticamente.

### Operaciones admin (service role)

Las siguientes operaciones bypasean RLS usando el **service role key** desde el backend:

- Crear/editar álbumes y barajitas
- Verificar trading spots (`is_verified = true`)
- Operaciones de moderación en grupos

> ⚠️ El service role key **nunca** debe estar en el frontend ni en variables de entorno del cliente.

---

## Triggers incluidos

| Trigger                      | Tabla                                      | Qué hace                                                           |
| ---------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| `set_updated_at`             | profiles, collections, collection_stickers | Actualiza `updated_at` automáticamente                             |
| `on_auth_user_created`       | auth.users                                 | Crea el perfil al registrarse                                      |
| `check_username`             | profiles                                   | Valida formato del username (3-30 chars, solo letras/números/\_/-) |
| `sync_collection_updated_at` | collection_stickers                        | Actualiza `updated_at` de la colección padre al cambiar barajitas  |

---

## Escalabilidad

El modelo está diseñado para crecer sin cambios estructurales:

**Más álbumes:** agregar filas en `albums` y `stickers`. Todo lo demás escala solo.

**Trading marketplace:** el modelo ya tiene todo lo necesario (`trading_status`, `whatsapp_number`, `lat/lng`, `trading_spots`). Solo falta una tabla `trade_requests` con `from_collection_id`, `to_collection_id`, y los sticker IDs a intercambiar.

**Chat interno:** `preferred_contact` ya prevé esta opción. Una tabla `messages` con `from_profile_id`, `to_profile_id`, `content` y opcionalmente ligada a un `trade_request_id` es suficiente para el MVP del chat.

**Leaderboard en grupos:** query directa sobre `group_members` → `collection_stickers` agrupada por collection. No requiere cambios en el schema.

**Notificaciones geográficas:** con `lat/lng` en `profiles` y `trading_spots`, una query con `ST_DWithin` (PostGIS, disponible en Supabase) permite "usuarios a X km con barajitas que te faltan".

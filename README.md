# TeLaCambio 🎴

Plataforma para coleccionistas de barajitas Panini del Mundial 2026. Registra tu colección, descubre qué te falta, y coordina intercambios con coleccionistas cercanos en Colombia.

---

## Qué hace

- **Colección personal** — marca qué barajitas tienes, cuáles te faltan y cuáles tienes repetidas
- **Intercambios** — conecta con coleccionistas cercanos que tengan lo que necesitas
- **Grupos** — arma grupos privados con amigos, familia o el trabajo para cambiar entre sí
- **Spots de intercambio** — puntos físicos conocidos donde la gente se reúne a cambiar

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Estilos | Tailwind CSS v4 |
| Auth + DB | Supabase |
| Lenguaje | TypeScript strict |
| Package manager | pnpm |

---

## Requisitos

- Node.js 20+
- pnpm
- Una cuenta en [Supabase](https://supabase.com)

---

## Setup inicial

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Variables de entorno

Crea un archivo `.env.local` en la raíz:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Consíguelas en Supabase → Settings → API.

### 3. Configurar la base de datos

En el SQL Editor de Supabase, ejecuta los archivos en este orden:

```
database/migrations/001_schema.sql       # tablas, enums, índices
database/migrations/002_triggers.sql     # updated_at, handle_new_user, validate_username
database/migrations/003_rls_policies.sql # seguridad por fila (RLS)

database/seeds/001_mundial_2026.sql                # álbum Panini Mundial 2026
database/seeds/002_stickers_mundial_2026.sql       # 993 stickers
```

### 4. Configurar Auth en Supabase

En Authentication → Settings:
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: agrega `http://localhost:3000/auth/callback`

En Authentication → Email Templates, pega el contenido de:
- `email-templates/confirm-signup.html`
- `email-templates/reset-password.html`

### 5. Correr en desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Estructura del proyecto

```
app/                    # Rutas (Next.js App Router)
components/
  auth/                 # Inputs, botones, tarjetas de autenticación
  onboarding/           # Wizard de 3 pasos al registrarse
lib/
  supabase/             # Clientes server/client de Supabase
  db/                   # Queries por tabla (profiles, collections, etc.)
  constants/            # Departamentos y ciudades de Colombia
types/
  app.ts                # Tipos de dominio
  database.ts           # Tipos generados por Supabase CLI (no editar)
database/
  migrations/           # SQL para crear las tablas
  seeds/                # Datos iniciales del álbum y stickers
email-templates/        # HTML para los correos de Supabase
```

---

## Flujo de usuario

```
Registro → verificar email → onboarding (3 pasos) → dashboard

Login → dashboard (si ya completó onboarding)
      → onboarding (si no)
```

**Onboarding:**
1. Elige tu `@username` y nombre para mostrar
2. Selecciona tu departamento y ciudad en Colombia
3. Define tu estado de intercambio y WhatsApp opcional

---

## Estado del proyecto

| Módulo | Estado |
|--------|--------|
| Autenticación (registro, login, reset) | ✅ Listo |
| Onboarding | ✅ Listo |
| Dashboard | 🚧 Pendiente |
| Perfil público `/@username` | 🚧 Pendiente |
| Vista del álbum | 🚧 Pendiente |
| Sistema de intercambios | 🚧 Pendiente |
| Grupos | 🚧 Pendiente |
| Búsqueda de coleccionistas | 🚧 Pendiente |

---

## Comandos útiles

```bash
pnpm dev        # desarrollo local con Turbopack
pnpm build      # build de producción
pnpm lint       # linter
```

Para regenerar los tipos de Supabase después de cambios en la DB:

```bash
pnpm supabase gen types typescript --linked > types/database.ts
```

@AGENTS.md

# TeLaCambio — Contexto del proyecto

App para coleccionistas de barajitas Panini del Mundial 2026. Los usuarios registran su colección, marcan cuáles tienen y cuáles les faltan, y coordinan intercambios con otros coleccionistas cercanos.

**Estado actual:** En desarrollo activo. Auth completo, onboarding listo, dashboard pendiente.

---

## Stack

| Capa                | Tecnología           | Versión               |
| ------------------- | -------------------- | --------------------- |
| Framework           | Next.js (App Router) | 16.2.6                |
| UI                  | React                | 19.2.4                |
| Estilos             | Tailwind CSS v4      | ^4                    |
| Backend / Auth / DB | Supabase             | @supabase/ssr ^0.10.3 |
| Lenguaje            | TypeScript strict    | ^5                    |
| Package manager     | pnpm                 | —                     |

**Comandos:**

```bash
pnpm dev    # desarrollo con Turbopack
pnpm build
pnpm lint
```

---

## Arquitectura

### Estructura de carpetas clave

```
app/                        # App Router de Next.js
  layout.tsx                # Root layout con suppressHydrationWarning en body
  page.tsx                  # Landing page (home)
  register/page.tsx         # Registro con email
  login/page.tsx            # Login con email
  forgot-password/page.tsx  # Solicitar reset
  verify-email/page.tsx     # Pantalla de "revisa tu correo"
  reset-password/page.tsx   # Nueva contraseña (post-callback)
  auth/callback/route.ts    # Route Handler PKCE — maneja code y token_hash
  onboarding/page.tsx       # Server Component — redirige si ya completó onboarding
  dashboard/                # TODO: pendiente

components/
  auth/                     # Componentes reutilizables de autenticación
    AuthCard.tsx            # Wrapper full-page con glow y brand
    AuthInput.tsx           # Input con label, error, hint (forwardRef)
    AuthSelect.tsx          # Select con mismo estilo que AuthInput
    AuthButton.tsx          # primary (verde) y ghost (outline), con loading spinner
    AuthAlert.tsx           # error | success | info
  onboarding/
    OnboardingShell.tsx     # Client Component — orquesta los 3 pasos
    OnboardingProgress.tsx  # Barra de progreso por pasos
    StepUsername.tsx        # Paso 1: username + display_name
    StepLocation.tsx        # Paso 2: departamento + ciudad (Colombia)
    StepTrading.tsx         # Paso 3: trading_status + whatsapp

lib/
  supabase/
    client.ts               # createClient() para Client Components
    server.ts               # createClient() async para Server Components
    proxy.ts                # Middleware para refresh de sesión
  db/
    profiles.ts             # getProfileById, checkUsernameAvailable, completeOnboarding, etc.
    albums.ts
    stickers.ts
    collections.ts
    collection-stickers.ts
    trading-spots.ts
    groups.ts
  constants/
    colombia.ts             # COLOMBIA_DEPARTAMENTOS[], getCiudadesByDepartamento()

types/
  app.ts                    # Tipos de dominio: Profile, Album, OnboardingData, TradingStatus, etc.
  database.ts               # Tipos auto-generados por Supabase CLI (NO editar a mano)

database/
  migrations/
    001_schema.sql          # Tablas, enums, índices
    002_triggers.sql        # updated_at, handle_new_user, validate_username
    003_rls_policies.sql    # Row Level Security
  seeds/
    001_mundial_2026.sql    # El álbum Panini Mundial 2026
    002_stickers_mundial_2026.sql  # 993 stickers en formato MEX1-MEX20

email-templates/
  confirm-signup.html       # Template HTML para Supabase (verificación de email)
  reset-password.html       # Template HTML para Supabase (reset de contraseña)
```

---

## Supabase

### Auth flow (PKCE)

`@supabase/ssr` v0.10.3 usa PKCE por defecto → envía `?code=xxx` en el callback, no `token_hash`.

El Route Handler en `app/auth/callback/route.ts` maneja ambos casos:

- `?code=` → `exchangeCodeForSession(code)`
- `?token_hash=&type=` → `verifyOtp({ token_hash, type })` (fallback)

Después de verificar:

- `type === "recovery"` → redirige a `/reset-password`
- Cualquier otro → redirige a `/onboarding`
- Error → redirige a `/login?error=link-expirado`

### Base de datos — tablas principales

- `albums` — catálogo de álbumes (solo admin escribe)
- `stickers` — 993 stickers del Mundial 2026 en formato `MEX1`, `ARG22`, `FWC1`, etc.
- `profiles` — extiende `auth.users`. Se crea automáticamente con el trigger `handle_new_user` con username temporal `user_XXXXXXXX`
- `collections` — una por usuario por álbum
- `collection_stickers` — barajitas de una colección con `quantity` (ausente=falta, 1=la tengo, ≥2=repetida)
- `trading_spots` — puntos físicos de intercambio
- `groups` — grupos privados entre amigos

### RLS

La visibilidad de colecciones y perfiles hereda de `profiles.is_public`. El service role key (nunca expuesto al cliente) bypasea RLS para operaciones de admin.

---

## Diseño y estilos

Tailwind CSS v4 con variables CSS personalizadas. Paleta:

```css
--color-brand: #1d9e75 /* verde principal */ --color-brand-dark: #178a65
  /* hover del verde */ --background: #111111 /* fondo oscuro */
  --color-surface: #1a1a1a /* tarjetas */ --color-surface-subtle: #161616
  --color-border: #2a2a2a --color-foreground: #f5f5f5 --color-muted: #888888;
```

Clases de utilidad frecuentes: `bg-surface`, `bg-surface-subtle`, `text-foreground`, `text-muted`, `text-brand`, `border-border`, `bg-brand`, `bg-brand/8`.

Estilo general: dark mode, bordes `rounded-xl` / `rounded-2xl`, botones con `rounded-full`, sombras sutiles.

---

## Convenciones de código

- **Server Components** por defecto. Solo agregar `"use client"` cuando hay estado, efectos, o eventos del browser.
- **`createClient()`** de `lib/supabase/server.ts` (async) en Server Components y Route Handlers. De `lib/supabase/client.ts` en Client Components.
- **Formularios**: estado local con `useState`, validación en el cliente antes de llamar a Supabase, errores en español.
- **No usar `setState` síncronamente en el cuerpo de un `useEffect`** — React 19 lo marca como error. Derivar estados síncronos directamente en render.
- **Tipos**: siempre de `@/types/app` (nunca importar de `database.ts` directamente en componentes).
- **Paths**: alias `@/` apunta a la raíz del proyecto.
- **Idioma**: toda la UI en español latinoamericano.

---

## Flujo de usuario

```
/register → email enviado → /verify-email?type=signup
         → click en correo → /auth/callback → /onboarding
         → completa 3 pasos → /dashboard

/login → /dashboard (si ya completó onboarding)
       → /onboarding (si no)

/forgot-password → email enviado → /verify-email?type=reset
                → click en correo → /auth/callback → /reset-password
                → nueva contraseña → /login
```

### Onboarding (3 pasos)

1. **Tu perfil** — username único (validación en tiempo real con debounce 500ms) + display_name opcional
2. **Ubicación** — país fijo Colombia 🇨🇴, cascada departamento → ciudad. Paso omitible.
3. **Cómo intercambias** — trading_status (active/paused/not_trading) + WhatsApp opcional con toggle de visibilidad

Al completar: `completeOnboarding()` guarda en `profiles` y setea `onboarding_completed = true`. Redirige a `/dashboard`.

---

## Lo que falta construir

- `/dashboard` — página principal del usuario autenticado
- `/@[username]` — perfil público
- `/@[username]/[album-slug]` — colección pública
- Vista del álbum (grid de barajitas, marcar tengo/falta/repetida)
- Sistema de intercambios
- Grupos
- Búsqueda de usuarios cercanos

---

## Variables de entorno necesarias

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

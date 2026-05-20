@AGENTS.md

# TeLaCambio — Lineamientos del proyecto

## Lenguaje

- **Código** (variables, funciones, constantes, tipos, nombres de archivos, columnas de DB): siempre en **inglés**.
- **UI** (strings visibles al usuario, mensajes de error, labels): siempre en **español neutro**, sin regionalismos.
- **Comentarios en código**: inglés.

---

## Naming conventions

| Elemento                  | Convención           | Ejemplo                             |
| ------------------------- | -------------------- | ----------------------------------- |
| Componentes React         | PascalCase           | `AlbumView.tsx`                     |
| Archivos en `lib/`, `db/` | kebab-case           | `collection-stickers.ts`            |
| Funciones y hooks         | camelCase            | `getProfileById`, `useAlbumFilters` |
| Constantes                | SCREAMING_SNAKE_CASE | `COLOMBIA_DEPARTAMENTOS`            |
| Columnas en DB            | snake_case           | `onboarding_completed`              |
| Rutas de URL              | kebab-case           | `/reset-password`                   |
| Tipos TypeScript          | PascalCase           | `TradingStatus`, `OnboardingData`   |

---

## Estructura de carpetas

Regla general: cada capa tiene una responsabilidad única. No mezclar lógica de datos con componentes UI.

- **Nueva ruta** → `app/[ruta]/page.tsx`. Server Component por defecto.
- **Componentes de una feature** → `components/[feature]/NombreComponente.tsx`. Un archivo por componente.
- **Queries a la base de datos** → `lib/db/[tabla].ts`. Una función exportada por operación.
- **Tipos de dominio** → `types/app.ts`. Nunca agregar tipos en archivos de componentes.
- **Constantes reutilizables** → `lib/constants/[nombre].ts`.
- **Utilidades genéricas** → `lib/utils/[nombre].ts`.

---

## Base de datos y migraciones

- **Cada cambio en el schema requiere un archivo de migración nuevo**, numerado secuencialmente (`004_...`, `005_...`). Nunca editar migraciones existentes.
- Cambios de schema (tablas, columnas, índices, enums) van en su propio archivo.
- Cambios de triggers van en su propio archivo.
- Cambios de RLS policies van en su propio archivo.
- Después de cualquier cambio en la DB, regenerar los tipos: `pnpm supabase gen types typescript --linked > types/database.ts`.

---

## React y Next.js

- **Server Components por defecto.** Solo agregar `"use client"` cuando el componente usa `useState`, `useEffect`, event handlers del browser, o refs.
- No pasar funciones no serializables de Server a Client Components.
- No usar `setState` síncronamente en el cuerpo de un `useEffect` — React 19 lo trata como error. Derivar estados síncronos directamente en el render.
- Formularios: validación en el cliente antes de cualquier llamada a Supabase. Errores mostrados en español.
- **Formularios con Server Actions**: usar `useActionState` (React 19) — no `useFormState`. El estado inicial es `null`, la action recibe `(prevState, formData)`.
- **Mutaciones**: usar Server Actions en `app/actions/[dominio].ts`. Llamar `revalidatePath()` dentro de la action. No usar `router.refresh()` en Client Components para invalidar después de mutaciones.

---

## Estructura de carpetas (ampliada)

- **Rutas privadas** (requieren auth) → `app/(app)/[ruta]/page.tsx`. El layout compartido `app/(app)/layout.tsx` provee AppHeader y BottomNav.
- **Server Actions** → `app/actions/[dominio].ts`. Una función exportada por operación de escritura.
- **Invalidación de caché** → `lib/cache/invalidate.ts`. Todas las llamadas a `revalidateTag` van aquí, nunca dispersas.

---

## Autenticación y sesión

El proxy (`proxy.ts`) corre antes de cada request en rutas privadas. Ya valida el JWT via `supabase.auth.getUser()`. Las páginas **no deben volver a llamar a Supabase Auth** — leerían el user ID desde los headers inyectados.

- **Obtener el usuario autenticado**: `getAuthUser()` de `lib/auth/get-auth-user.ts`. Lee el header `x-user-id` inyectado por el proxy (~0ms). No llama a Supabase.
- **Obtener usuario + perfil**: `getCurrentProfile()` de `lib/auth/get-current-profile.ts`. Combina `getAuthUser()` + `getProfileByIdCached()`. Usar en todas las páginas privadas.
- **Nunca llamar** `supabase.auth.getUser()` directamente en páginas o layouts privados — ya ocurrió en el proxy.

El matcher del proxy es una **lista positiva** (solo rutas que necesitan auth). No agregar rutas públicas al matcher.

---

## Caché y performance

### Dos niveles de caché

1. **`cache()` de React** — memoiza dentro de un solo request. Útil cuando layout y page llaman la misma función (comparten la promise sin hit extra a la DB). Usar para funciones que se llaman múltiples veces en el mismo render tree.

2. **`unstable_cache` de Next.js** — persiste entre requests (cross-request). Requiere `revalidate` en segundos y `tags` para invalidación. **Restricción importante**: no puede usar `createClient()` (cookies) en su interior — usar `createPublicClient()` de `lib/supabase/public.ts` (cliente sin cookies).

### Datos cacheados actualmente

| Función                                    | Archivo              | TTL   | Tag de invalidación   |
| ------------------------------------------ | -------------------- | ----- | --------------------- |
| `getActiveAlbumsCached()`                  | `lib/db/albums.ts`   | 5 min | `active-albums`       |
| `getStickersByAlbumGroupedCached(albumId)` | `lib/db/stickers.ts` | 5 min | `stickers:${albumId}` |
| `getProfileByIdCached(userId)`             | `lib/db/profiles.ts` | 5 min | `profile:${userId}`   |

### Reglas

- Al agregar un nuevo dato cacheable con `unstable_cache`, registrar su tag en `lib/cache/invalidate.ts`.
- Invalidar siempre en la Server Action que muta el dato, no en el cliente.
- Datos que cambian con cada request (colecciones del usuario, intercambios) **no** deben cachearse con `unstable_cache`.

### Fetching paralelo

Queries independientes siempre en `Promise.all`. No encadenar `await` seriales si los datos no dependen entre sí.

```ts
// ✅ Correcto
const [albums, profile] = await Promise.all([
  getActiveAlbumsCached(),
  getCurrentProfile(),
]);

// ❌ Evitar
const albums = await getActiveAlbumsCached();
const profile = await getCurrentProfile();
```

---

## Base de datos — patrones de query

- **Join en una sola query**: usar select anidado de PostgREST en vez de dos queries seriales. Ejemplo: `select("*, collection_stickers(sticker_id, quantity)")`.
- **Operaciones compuestas**: si una feature requiere select + insert condicional + aggregate, considerar un RPC de Postgres (`security invoker` para respetar RLS). Ver `007_dashboard_summary_rpc.sql` como referencia.
- **Ambigüedad en PL/pgSQL**: al referenciar columnas dentro de un RPC que también tiene variables locales con el mismo nombre, calificar siempre con el nombre de la tabla (`collection_stickers.collection_id`, no solo `collection_id`).

---

## Supabase

- En **Server Components y Route Handlers**: usar `createClient()` de `lib/supabase/server.ts` (es async, hay que awaitearlo).
- En **Client Components**: usar `createClient()` de `lib/supabase/client.ts`.
- Dentro de **`unstable_cache`**: usar `createPublicClient()` de `lib/supabase/public.ts` — el cliente con cookies no funciona en ese contexto.
- Nunca exponer la `service role key` al cliente.

---

## TypeScript e imports

- Importar tipos de dominio siempre desde `@/types/app`. **Nunca** importar desde `types/database.ts` directamente en componentes o en `lib/db/`.
- `types/database.ts` es generado por Supabase CLI — no editar a mano.
- Path alias `@/` apunta a la raíz del proyecto.
- TypeScript en modo strict. No usar `any`.

---

## Diseño y estilos

Tailwind CSS v4. Variables CSS disponibles:

```
--color-brand: #1d9e75        /* verde principal */
--color-brand-dark: #178a65   /* hover */
--background: #111111
--color-surface: #1a1a1a
--color-surface-subtle: #161616
--color-border: #2a2a2a
--color-foreground: #f5f5f5
--color-muted: #888888
```

Clases utilitarias frecuentes: `bg-surface`, `bg-surface-subtle`, `text-foreground`, `text-muted`, `text-brand`, `border-border`, `bg-brand`, `bg-brand/8`.

Estilo general: dark mode, `rounded-xl` / `rounded-2xl` en tarjetas, `rounded-full` en botones, sombras sutiles.

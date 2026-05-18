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

---

## Supabase

- En **Server Components y Route Handlers**: usar `createClient()` de `lib/supabase/server.ts` (es async, hay que awaitearlo).
- En **Client Components**: usar `createClient()` de `lib/supabase/client.ts`.
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

# AGENTS.md — Guía para agentes de IA en este repo

Este archivo es para cualquier agente (Claude, Cursor, Copilot, Codex...) que
vaya a tocar código aquí. Léelo antes de hacer cambios.

## Qué es esto

Gym Tracker: app personal de seguimiento de entrenamientos de gimnasio.
Frontend en React, datos en Supabase (así el progreso es el mismo entres
desde donde entres). No tiene autenticación real — es un selector de
usuarios con una "palabra clave" en texto plano, pensado para uso
personal/familiar de confianza. Esto es una decisión de producto explícita
del dueño del proyecto, no un descuido: no la "arregles" metiendo hashing,
JWT ni RLS estricto sin que te lo pidan.

Lee `README.md` para la visión general y el setup. Lee `memory.md` para el
historial de decisiones y problemas ya resueltos — evita repetir trabajo o
reintroducir bugs ya arreglados.

## Stack

- React 19 + Vite (JavaScript plano, sin TypeScript)
- Tailwind CSS v4 — **sin `tailwind.config.js`**: el tema vive en
  `src/index.css` con el bloque `@theme`. No crees un config file de
  Tailwind v3, no aplica a esta versión.
- Supabase (`@supabase/supabase-js`) como único backend — Postgres +
  Storage. No hay servidor propio ni API routes.
- `react-router-dom` para rutas, `framer-motion` para animaciones,
  `canvas-confetti` para la celebración de récords, `lucide-react` para
  iconos.
- `oxlint` como linter (`npm run lint`), no eslint.

## Comandos

```bash
npm install          # instalar dependencias
npm run dev           # servidor de desarrollo (localhost:5173)
npm run build          # build de producción — correlo siempre antes de dar
                         # un cambio por terminado
npm run lint            # oxlint
npm run preview          # sirve el build de dist/
```

No hay suite de tests automatizados. Para verificar un cambio: `npm run
build` + `npm run lint` como mínimo, y si el cambio toca UI, levanta
`npm run dev` y revísalo en el navegador (o con Playwright si no tienes
acceso visual directo — ver `memory.md` para cómo se hizo una demo con
datos mock).

## Estructura

```
src/
  lib/
    supabaseClient.js   # cliente de Supabase + isSupabaseConfigured +
                          publicPhotoUrl()
    api.js               # TODA la lógica de datos vive aquí. Las páginas
                           no llaman a `supabase` directamente, llaman a
                           funciones de este archivo.
  context/
    AuthContext.jsx       # quién está logueado en ESTE dispositivo
                            (solo un puntero en localStorage, nunca datos
                            reales — ver sección "localStorage" abajo)
  components/              # piezas reutilizables (modales, cards, inputs)
  pages/                    # una página por ruta, importan de lib/api.js
                              y components/
supabase/
  schema.sql                # fuente de verdad del esquema de DB. Si cambias
                              algo en el modelo de datos, actualiza este
                              archivo también (tablas, RLS, seed del admin).
```

## Convenciones de código

- Sin TypeScript, sin comentarios explicando el "qué" (los nombres ya lo
  dicen); comentarios solo para el "por qué" cuando no es obvio.
- Componentes funcionales, hooks, nada de clases.
- Tailwind utility classes inline. Los colores de marca son tokens de
  `src/index.css` (`--color-lime`, `--color-ink`, `--color-panel`, etc.),
  úsalos en vez de valores hex sueltos.
- Mobile-first: todo layout nuevo se diseña primero para ~390px de ancho y
  después se verifica que escale a desktop (contenedor `max-w-2xl
  mx-auto` es el patrón usado en casi todas las páginas).
- Animaciones con `framer-motion`, no CSS `@keyframes` manuales salvo casos
  muy puntuales (ya hay precedente en `index.css` para scrollbars).
- Toda función que toca la base de datos va en `src/lib/api.js`, nunca
  inline en un componente. Esto mantiene las páginas simples y hace que
  mockear para pruebas (ver `memory.md`) sea cuestión de reemplazar un solo
  archivo.

## Modelo de datos y Supabase

- El esquema completo (tablas, índices, RLS, bucket de Storage, seed del
  admin) está en `supabase/schema.sql`. Es idempotente (`create table if
  not exists`, `on conflict do nothing`) — se puede re-correr sin romper
  nada.
- Las políticas RLS son **intencionalmente permisivas** (`using (true)`)
  porque no hay autenticación real. No las endurezcas sin que el usuario lo
  pida explícitamente — romperías la app (no hay sesión de Supabase Auth
  que las políticas puedan usar para filtrar).
- `active_session` es la tabla clave para "recuperar entrenamiento entre
  dispositivos". El cronómetro usa `started_at` como fuente de verdad (se
  calcula `now - started_at` en el cliente), no un contador que se vaya
  sumando — así no se desincroniza si cierras la pestaña. No cambies esto
  por un contador acumulativo sin pensarlo bien.
- `records` guarda `prev_kg/prev_reps/prev_date` además del récord vigente
  — esto NO estaba en el esquema sugerido original, se agregó para poder
  mostrar el "antes vs después" en el panel de récords sin tener que
  mantener una tabla de historial de récords aparte. Si tocas la lógica de
  récords en `finishWorkout()` (en `api.js`), mantén este patrón.

## `localStorage`

Regla del proyecto: **nada de datos reales en localStorage**, todo vive en
Supabase para que sincronice entre dispositivos. La única excepción es
`AuthContext.jsx`, que guarda el `id` del usuario logueado en este
dispositivo (una conveniencia de sesión, no una fuente de verdad — si se
borra, simplemente se vuelve a pedir la palabra clave). No agregues otros
usos de localStorage/sessionStorage para datos de la app sin que te lo
pidan explícitamente.

## Cosas con las que hay que tener cuidado

- **`canvas-confetti`** mete su propio `<canvas>` en `<body>` fuera del
  ciclo de vida de React. `RecordCelebration.jsx` ya tiene el cleanup
  correcto (`confetti.reset()` en el `return` del `useEffect`) — si copias
  este patrón de celebración a otro lado, no te olvides del cleanup.
- **Push a GitHub**: si `git push` falla con `403` / "Claude doesn't have
  GitHub access", no es un problema del código — es un permiso de la
  GitHub App de Claude que el dueño del repo tiene que conceder desde
  `https://github.com/apps/claude/installations/select_target`. No lo
  intentes resolver reescribiendo remotes ni con workarounds raros, avisa
  al usuario. Detalle completo en `memory.md`.
- El bundle de producción pesa >500kb (warning de Vite en el build). Es
  conocido y aceptado por ahora — no es un bug, no lo "arregles" metiendo
  code-splitting a menos que te lo pidan.
- El archivo `.env` nunca se commitea (está en `.gitignore`). Si necesitas
  probar algo que requiera Supabase configurado y no tienes credenciales
  reales a mano, mira en `memory.md` cómo se armó una demo con datos mock
  sin tocar el `api.js` real a largo plazo.

## Rama de trabajo

El desarrollo de esta app se hizo en `claude/great-darwin-qsz6ee`. Revisa
con `git branch`/`git log` el estado actual antes de asumir que sigue
siendo la rama activa.

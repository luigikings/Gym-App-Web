# Gym Tracker 🏋️‍♂️

App personal de seguimiento de entrenamientos de gimnasio. Frontend en React
(Vite) + Tailwind, datos en Supabase para que tu progreso sea el mismo entres
por donde entres (móvil u ordenador).

## Stack

- **Frontend:** React + Vite + Tailwind CSS v4
- **Backend/DB:** Supabase (Postgres + Storage)
- **Animaciones:** Framer Motion + canvas-confetti
- **Iconos:** lucide-react

No hay un sistema de login real: es un selector de usuarios tipo Netflix con
una "palabra clave" simple en texto plano, pensado para uso personal/familiar
de confianza, no para seguridad estricta.

## 1. Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto gratuito
   (no pide tarjeta).
2. Dentro del proyecto, abre **SQL Editor → New query**.
3. Copia y pega todo el contenido de [`supabase/schema.sql`](./supabase/schema.sql)
   y dale a **Run**. Esto crea todas las tablas, activa RLS con políticas
   abiertas (ver nota de seguridad dentro del archivo), crea el bucket
   público `photos` para las fotos, y siembra el usuario admin `LK` con
   palabra clave `yuka`.
4. Ve a **Project Settings → API** y copia:
   - **Project URL**
   - **anon public key**

## 2. Configurar el frontend

```bash
npm install
cp .env.example .env
```

Edita `.env` y pon tus valores de Supabase:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

```bash
npm run dev
```

Abre `http://localhost:5173`.

## 3. Desplegar (Netlify o Vercel, gratis)

Cualquiera de las dos funciona igual de bien porque todo el backend vive en
Supabase (el hosting solo sirve el frontend estático).

**Netlify:**
1. Conecta el repo.
2. Build command: `npm run build` — Publish directory: `dist`.
3. En **Site settings → Environment variables** agrega `VITE_SUPABASE_URL`
   y `VITE_SUPABASE_ANON_KEY`.

**Vercel:**
1. Importa el repo (framework preset: Vite).
2. En **Settings → Environment Variables** agrega las mismas dos variables.

## Cómo funciona por dentro

- **Selector de usuarios:** pantalla `/` — lista los usuarios de la tabla
  `users`. El admin (`LK`, clave `yuka`) puede crear usuarios nuevos desde el
  botón "Añadir" (pide la clave de admin + nombre y clave del nuevo usuario).
- **Ejercicios y Rutinas:** paneles independientes por usuario. Una rutina no
  puede tener el mismo ejercicio dos veces (se valida en la app y también a
  nivel de base de datos con un `unique` constraint).
- **Entrenamiento:** al darle ▶ a una rutina se crea (o retoma) una fila en
  `active_session`. Cada cambio en una serie se guarda ahí mismo, así que si
  cierras la pestaña o cambias de dispositivo a mitad de entrenamiento, al
  volver a entrar retomas exactamente donde ibas — el cronómetro se calcula
  siempre a partir de `started_at`, no de un contador que se pueda desincronizar.
- **Terminar rutina:** guarda todo en `workout_sessions` + `workout_sets`,
  compara cada serie contra el récord vigente de `records` (se actualiza si
  el kg es mayor, o si es igual pero con más repeticiones), y si se rompió
  algún récord muestra una animación con confeti. El historial se limita a
  30 entrenamientos por usuario (FIFO): al guardar el 31, se borra el más
  antiguo automáticamente.
- **Fotos:** se suben al bucket público `photos` de Supabase Storage.

## Nota de seguridad

Las políticas RLS del `schema.sql` son intencionalmente permisivas (permiten
todo con la clave `anon`) porque la app no implementa autenticación real —
es justo lo que pide el enunciado: una palabra clave simple para uso
personal/de confianza. No la conviertas en una app pública sin repensar la
seguridad primero.

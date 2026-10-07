# memory.md — Bitácora del proyecto

Historial de decisiones, problemas encontrados y su solución, y pendientes.
Esto NO es documentación de producto (eso es `README.md`) ni una guía de
convenciones (eso es `AGENTS.md`) — es memoria de "qué pasó y por qué",
para que quien retome esto (humano o agente) no repita trabajo ni
redescubra los mismos problemas.

Formato: entradas nuevas arriba, con fecha. Si resuelves algo listado en
"Pendientes", muévelo a una entrada con fecha y borralo de ahí.

---

## 2026-09-14 — Construcción inicial de la app

Se construyó la app completa desde un repo vacío: selector de usuarios,
panel de ejercicios, panel de rutinas, pantalla de entrenamiento con
cronómetro y recuperación de sesión entre dispositivos, historial (FIFO de
30), panel de récords con celebración de confeti, y el esquema SQL completo
para Supabase. Commit `9cea3d8` en la rama `claude/great-darwin-qsz6ee`.

**Decisiones de diseño que no estaban explícitas en el pedido original:**

- El esquema sugerido para `records` no alcanzaba para mostrar "récord
  anterior vs récord nuevo" en el panel de récords sin otra tabla. Se le
  agregaron las columnas `prev_kg`, `prev_reps`, `prev_date` a `records`
  (guarda el récord anterior al más reciente) en vez de crear una tabla de
  historial de récords aparte. Más simple, y es lo único que pedía el
  panel.
- El cronómetro de un entrenamiento activo no se guarda como un contador
  que se va sumando — se calcula siempre como `ahora - started_at`. Esto es
  a propósito: si se guardara como contador acumulado, retomar el
  entrenamiento desde otro dispositivo podría desincronizarse (depende de
  cuándo se guardó el último tick). Con `started_at` como fuente de verdad,
  el cronómetro siempre es correcto sin importar desde dónde se reanude.
- RLS de Supabase quedó intencionalmente permisiva (`using (true)` en
  todas las tablas). El pedido original es explícito en que no quiere
  autenticación real ("palabra clave" simple, uso de confianza), así que
  una RLS estricta basada en `auth.uid()` no tendría de dónde sacar la
  identidad del usuario (no se usa Supabase Auth). Documentado también
  dentro de `supabase/schema.sql`.
- Tailwind v4 no usa `tailwind.config.js` — el tema (paleta negro/verde
  lima) se define con `@theme` dentro de `src/index.css`. Si algo busca un
  config file de Tailwind clásico y no lo encuentra, es esperado.

## 2026-09-15 — Problema de push a GitHub (resuelto)

Al intentar subir el primer commit, `git push` fallaba con:

```
remote: Claude doesn't have GitHub access to luigikings/Gym-App-Web for your organization.
fatal: ... 403
```

Se probaron varias vías (reintentar el push, `add_repo` + clonar de nuevo,
pushear vía las tools de GitHub MCP) y todas daban el mismo error de fondo:
`403 Resource not accessible by integration`. O sea, no era un problema de
código ni de configuración del repo — la GitHub App de Claude no tenía
permiso de escritura concedido sobre ese repo específico.

**Solución:** el dueño del repo instaló/autorizó la GitHub App de Claude en
`https://github.com/apps/claude/installations/select_target` dándole
acceso a `Gym-App-Web`. Después de eso, el mismo comando `git push` que
antes fallaba funcionó sin cambiar nada más.

**Para la próxima vez que esto pase** (en este repo o en otro): no hay
nada que arreglar en el código. Explicar el error tal cual al usuario y
pedirle que revise los permisos de la GitHub App en ese link. No vale la
pena perder tiempo con workarounds (tokens de env, remotes alternativos,
etc.) — se probaron y todos pegan contra el mismo permiso de fondo.

## 2026-09-15 — Demo visual con datos mock + bug de confeti encontrado y arreglado

El usuario pidió ver un preview visual de la app sin tener Supabase
configurado. Como todo el acceso a datos pasa por `src/lib/api.js`, se
pudo mockear sin tocar el resto de la app:

1. Se guardó el `api.js` real (ya estaba commiteado, así que alcanzaba con
   poder revertir después con `git checkout -- src/lib/api.js`).
2. Se reemplazó temporalmente por una versión con una base de datos en
   memoria (mismos nombres de función exportados, mismas firmas) con datos
   de ejemplo (usuario LK, un par de rutinas, ejercicios, récords e
   historial de muestra).
3. Se creó un `.env` temporal con valores dummy no vacíos (para que
   `isSupabaseConfigured` sea `true` y no se muestre la pantalla de aviso
   de setup) — nunca se commiteó, se borró al terminar.
4. Se levantó `npm run dev` y se usó Playwright (Chromium ya viene
   preinstalado en el entorno remoto en `/opt/pw-browsers/`, hay que
   apuntar `executablePath` ahí a mano porque el binario `chromium/chrome`
   no existe directo, es `chromium-<build>/chrome-linux/chrome`) para
   navegar la app real y sacar capturas de cada pantalla clave.
5. Al final: `git checkout -- src/lib/api.js` para revertir el mock, y
   `rm .env`.

**Bug real encontrado durante la demo** (no relacionado al mock): al
romper un récord y navegar a otra pantalla, el confeti de
`canvas-confetti` se quedaba animando encima de la pantalla siguiente.
Causa: esa librería agrega su propio `<canvas>` a `document.body` por
fuera del control de React, así que desmontar el componente
`RecordCelebration` no lo limpiaba. Arreglado agregando un cleanup en el
`useEffect` (`confetti.reset()` + una bandera `cancelled` para cortar el
loop de `requestAnimationFrame`). Commit `1aff316`.

**Nota para la próxima vez que se necesite una demo visual sin
Supabase real:** repetir el mismo patrón (mock de `api.js` + `.env` dummy +
Playwright con el Chromium preinstalado) en vez de intentar levantar un
Supabase real de prueba — es más rápido y no deja nada que limpiar en la
cuenta de Supabase del usuario.

---

## Pendientes / cosas que quedaron fuera de alcance

- No hay suite de tests automatizados (ni unitarios ni e2e). La
  verificación hasta ahora fue manual (build + lint + revisión visual).
- El bundle de producción pesa >500kb según el warning de Vite — no se hizo
  code-splitting. No es urgente, pero si la app crece vale la pena revisar
  `React.lazy()` para las páginas.
- No hay CI configurado (no hay `.github/workflows`).
- `package-lock.json` está commiteado (correcto), pero no se probó el flujo
  completo de deploy en Netlify/Vercel con el repo real, solo se documentó
  en el README.
- Las políticas RLS permisivas son aceptables para el alcance actual
  (uso personal/familiar de confianza) pero si el proyecto alguna vez
  quiere soportar usuarios que no se conocen entre sí, hay que repensar
  todo el modelo de autenticación — no es un cambio chico.

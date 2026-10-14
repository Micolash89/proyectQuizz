# Simulador de Parciales — UNLaM

App web para practicar parciales de distintas materias de la facultad. Hoy trae **Calidad de Software**; sumar otra materia son 3 cambios en `src/data/`.

## Quick path

1. `pnpm install`
2. `pnpm dev` y abrí http://localhost:3000
3. Elegí la materia → configurá parcial (`1°` / `2°`), cantidad de preguntas y modo de feedback → **Comenzar Quiz**

Al terminar, `/results` muestra el puntaje, el detalle pregunta por pregunta y recomendaciones por categoría.

## Flujo de rutas

| Ruta | Qué hace |
| ---- | -------- |
| `/` | Selector de materia (obligatorio). Al elegir una, redirige a su setup. |
| `/materia/[slug]` | Setup: parcial, cantidad y feedback. Muestra los temas y los contadores reales del banco. |
| `/quiz` | El quiz. Recibe todo por query params. |
| `/results` | Pantalla final. Lee `sessionStorage.quizResults`; si no hay datos, redirige a `/`. |

Query params de `/quiz` y `/results`:

| Param | Valores | Default |
| ----- | ------- | ------- |
| `subject` | id de materia (`calidad-software`) | `calidad-software` |
| `partial` | `primer` \| `segundo` | `primer` |
| `count` | `15` \| `25` \| `50` \| `todas` | `25` |
| `feedback` | `immediate` \| `end_only` | `end_only` |

> `subject` tiene default para no romper links viejos. El resto se valida y cae al default si viene cualquier otra cosa.

## Estructura

| Path | Rol |
| ---- | --- |
| `app/` | Rutas (App Router). `layout.tsx` monta fonts, metadata y viewport. |
| `app/globals.css` | Design tokens (`@theme`), foco visible y `prefers-reduced-motion`. |
| `src/data/subjects/list.ts` | Catálogo de materias: id, nombre, institución, ícono y temas por parcial. |
| `src/data/subjects/index.ts` | Registry: banco por materia + helpers (`getSubject`, `getQuestionsBySubject`, `isValidSubjectId`). |
| `src/data/questions.ts` | Bancos de preguntas de Calidad de Software. |
| `src/hooks/useQuiz.ts` | Estado del quiz, scoring y `timeSpent` por pregunta. |
| `src/hooks/useIsClient.ts` | `useSyncExternalStore` para código solo-cliente sin romper la hidratación. |
| `src/components/` | UI: `QuestionCard`, `Navigation`, `ProgressBar`, `ResultsTable`, `SubjectCard`, `SubjectIcon`, `Footer`. |
| `src/types/quiz.ts` | Tipos del dominio: `SubjectId`, `Subject`, `Question`, `Partial`, `FeedbackMode`. |
| `tests/e2e/routes.spec.ts` | Suite E2E de rutas y flujo completo. |

## Cómo agregar una materia

1. Sumá el id en `SubjectId` (`src/types/quiz.ts`).
2. Agregá la entrada en `src/data/subjects/list.ts` con sus `topics.primer` y `topics.segundo`. El `icon` tiene que ser uno de los 4 de `SubjectIcon`; para uno nuevo, agregalo en ese tipo **y** en el mapa `ICONS` de `src/components/SubjectIcon.tsx`.
3. Mapeá su banco en `questionsBySubject` (`src/data/subjects/index.ts`).

Si te falta el paso 3, TypeScript te frena: `questionsBySubject` es un `Record<SubjectId, Question[]>`. Con eso la materia ya aparece sola en `/` y su setup queda en `/materia/<id>`.

Las preguntas pueden ser `multiple_choice`, `true_false`, `calculation` o `analysis`, y opcionalmente multi-respuesta (`isMultiAnswer`). Hoy los bancos solo usan las dos primeras, pero la UI renderiza todas.

## Design tokens

El tema completo vive en `@theme` dentro de `app/globals.css` y se consume como utilidades: `bg-surface`, `text-gray-3`, `border-line`, `text-success`, etc. Si necesitás un color nuevo, agregalo ahí en vez de hardcodear un hex en el componente.

| Token | Valor | Uso |
| ----- | ----- | --- |
| `primary` / `secondary` | `#000000` / `#FFFFFF` | Botones y estado seleccionado |
| `gray-1` / `gray-2` / `gray-3` | `#F5F5F5` / `#A3A3A3` / `#8F8F8F` | Texto sobre negro / bordes / texto secundario |
| `surface` / `surface-2` / `surface-3` | `#0F0F0F` / `#1A1A1A` / `#262626` | Superficies |
| `line` | `#333333` | Bordes estándar |
| `success` / `warning` / `danger` | `#22C55E` / `#FBBF24` / `#EF4444` | Correcto / advertencia / incorrecto |

Dos reglas que no conviene romper:

- `gray-3` es `#8F8F8F` a propósito. Con `#737373` el texto secundario daba ~4.06:1 sobre `surface` y no llegaba a AA (4.5:1).
- El estado seleccionado (parcial, cantidad, feedback) es fondo `primary` + texto `secondary` + borde `secondary` + ícono de check. No lo dejes solo en color: se tiene que notar sin depender del matiz.

## Metadata, íconos y manifest

| Archivo | Qué emite |
| ------- | --------- |
| `app/favicon.ico` | `<link rel="icon">` (lo detecta solo) |
| `app/icon.png` (32×32) | `<link rel="icon" sizes="32x32">` |
| `app/apple-icon.png` (180×180) | `<link rel="apple-touch-icon">` |
| `app/manifest.ts` | `/manifest.webmanifest` + `<link rel="manifest">` |
| `public/icons/android-chrome-{192,512}.png` | Solo los usa el manifest (instalación PWA) |

Los PNG de 192 y 512 viven en `public/`, no en `app/`, a propósito: en `app/` Next los emitiría como `<link rel="icon">` y el navegador podría bajarse el de 512 (227 KB) solo para pintar el favicon de la pestaña.

`themeColor` va en `export const viewport` (`app/layout.tsx`), no en `metadata`: ahí está deprecado desde Next 16.

## Scripts

| Comando | Qué hace |
| ------- | -------- |
| `pnpm dev` | Dev server en `http://localhost:3000` |
| `pnpm build` · `pnpm start` | Build de producción · servirlo |
| `pnpm lint` | ESLint |
| `pnpm test:e2e` | Playwright (11 tests). Levanta `pnpm dev` por su cuenta. |
| `pnpm test:e2e:ui` · `pnpm test:e2e:debug` | Modo UI · modo debug |

`playwright-report/` y `test-results/` están trackeados en el repo, así que después de correr la suite conviene revertirlos para no ensuciar el diff:

```bash
git checkout -- playwright-report test-results
```

## Stack

Next.js 16.2.6 (App Router, Turbopack) · React 19.2.4 · TypeScript · Tailwind CSS v4 (`@theme`) · `react-icons/lu` · Playwright.

## Checklist antes de pushear

- [ ] `pnpm lint` sin errores
- [ ] `pnpm build` OK
- [ ] `pnpm test:e2e` en verde
- [ ] `playwright-report/` y `test-results/` revertidos

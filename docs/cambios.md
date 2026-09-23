# Cambios programados

Inbox de features, mejoras y refactors planificados. Borrar al implementar. La historia vive en `git log` / commit messages, no acá.

> **Nota**: después de cada fase, sacar la entrada de acá. El resumen histórico vive abajo en "Línea del tiempo".

---

## En curso

_(vacío — sesión cerrada al final del redesign visual, ver "Línea del tiempo")_

---

## Pendientes (post-refactor) — lo que falta

### 1. **Auth real** — bloqueante para producción

Sacar el `AuthService` cliente-hardcodeado (`admin/admin123` + flag `localStorage`) y migrar a Firebase Auth + Cloud Functions para validar tokens server-side. AGENTS.md marca `core/services/auth.service.ts` como **área crítica** — pedir OK explícito antes de empezar.

### 2. **Imágenes reales** de los 5 iPhones (pendiente de data)

Hoy todos muestran `https://picsum.photos/seed/{slug}/800/800` (placeholders). Para producción real se necesitan fotos de cada modelo + colores. Subir vía admin → Firebase Storage; o pasarle URLs de Apple al seed.

---

## Línea del tiempo

Resumen de lo cerrado en esta sesión (2026-09-21 a 2026-09-23). El detalle línea-por-línea con archivos modificados y rationale vive en **`docs/design.md`** y en el `git log` de la sesión.

### ✅ Refactor visual "Tech Premium" (todo cerrado)

| Fase | Descripción | Archivos clave |
|---|---|---|
| **Fase 0 — Discovery** | `docs/design.md` con principios Apple HIG, paleta monocroma + Apple Blue `#0071e3`, escala tipográfica, espaciado 8pt, componentes clave, accesibilidad | `docs/design.md` (nuevo) |
| **Fase 1 — Sistema base de tokens** | Reemplazó paleta `brand-*` por tokens semánticos (`--color-ink`, `--canvas`, `--mist`, `--action`, etc.). Spacing 8pt, radius, easing. Dark mode con inversión semántica. `prefers-reduced-motion` | `src/styles.css` (rewrite) |
| **Fase 2 — Componentes shared** | `product-card` (1:1, lift hover sin scale, badge único top-left, CTA siempre visible). `header` (backdrop-blur + pill buttons). `footer` (copy tech, fondo ink). `confirm-dialog`, `modal`, `login-modal`, `product-detail-modal` | 8 archivos TS/HTML |
| **Fase 3 — Páginas públicas** | `home` (hero edge-to-edge con producto + 2 CTAs, sin `rotate-3`/`animate-bounce`, trust band inline). `catalog` (chips + grid 2-col mobile). `product-detail` (sticky CTA mobile + desktop, "12 cuotas sin interés", retirar en tienda cerca del CTA, variant pickers condicionales). Estáticas (`about`, `terms`, `privacy`, `returns`) | 7 htmls + modelo `Product` con `colores`/`capacidades` opcionales |
| **Fase 4 — Accesibilidad + microinteracciones** | `*:focus-visible` global con outline 2px action, `.skip-link` helper, `<main id="main-content" tabindex="-1">` en layouts, `product-card` ahora es `<a>` semántico, variant pickers funcionales con `aria-pressed`/`role="radiogroup"`, selección en el mensaje de WhatsApp, `::selection` custom | `styles.css`, `header.html`, `layouts/*`, `product-card.html`, `product-detail.{html,ts}` |

### ✅ Bonus implementados en esta sesión

| Item | Descripción |
|---|---|
| **Comparador de iPhones** | Layout híbrido: cards verticales en mobile / tabla con scroll horizontal + sticky first-column en desktop. Specs **hardcoded** (migración a Firestore queda como pendiente #1). `src/app/modules/components/iphone-comparator/` |
| **Admin-form con Variant Pickers** | El `product-form` del admin ahora soporta cargar colores (con `<input type="color">` y hex validado por regex) y capacidades (FormArray de strings). `src/app/modules/admin/product-form/` |
| **Seed de 5 iPhones** | `scripts/seed-products.mjs` reemplazó muebles/decoración por: iPhone 13, 14, 15, 16, 16 Pro. Cada uno con `colores`, `capacidades` reales de Apple Store AR. Imágenes via `picsum.photos` (pendiente #3). |
| **Filtros de catálogo** | Rango de precio (min/max con placeholder auto-descubierto) + toggles Destacados / Con oferta / Con stock. Contador de resultados. Fix del bug "Cargando productos" cuando había 0 resultados filtrados. `src/app/core/services/products.ts`, `src/app/modules/public/catalog/{.ts,.html}` |

### Notas operativas (relevantes para próxima sesión)

- **Dev servers long-running**: los procesos bash background (`ng serve`, `firebase emulators:start`) tienen **timeout de 30 min** del runtime. Para sesiones de UI largas, abrirlos en tu PowerShell local — viven hasta que los cierres vos.
- **Verificación visual sin Playwright**: el navegador integrado de Mavis no tiene browser embebido. La skill `probar-app` (capturas automatizadas + reporte) es de Claude, no de Mavis. Pedile en una sesión aparte.

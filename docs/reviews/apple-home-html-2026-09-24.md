# Revisión de diseño Apple — home.html

**Fecha:** 2026-09-24
**Alcance:** `src/app/modules/public/home/home.html` (1 archivo revisado, 1 sibling `home.ts` omitido por ser lógica)
**Sistema de diseño detectado:**
- `AGENTS.md` (Tailwind 4, standalone, signals, sin NgModel, imágenes en Storage)
- `docs/design.md` (sistema monocromo + acento Apple Blue)
- `styles.css` con `@theme` de Tailwind 4: `--color-action`, `--color-canvas`, `--color-mist`, `--color-ink`, `--color-hairline`, `--radius-{sm,md,lg,pill}`
- Font: GothamSSm (custom del proyecto)
- Tailwind v4.2.1

## Resumen

- **Blocking:** 0
- **Warning:** 3 (legibilidad de texto sobre imagen, uppercase fuera de tamaño de label, emoji en chrome)
- **Info:** 11
- **Aplicados:** 0 · **Rechazados:** 0 · **Salteados:** 0

---

## Divergencias del sistema de diseño (decisiones del proyecto)

### S1. [INFO] Magic number en overlay del hero
- **Definido en:** `home.html:6` — `bg-ink/15 lg:bg-ink/25`
- **Por qué:** Apple references trabaja con tokens. `bg-ink/15` y `bg-ink/25` son valores arbitrarios sin documentar como decisión del proyecto.
- **Propuesta:** definir tokens en `styles.css`:
  ```css
  --overlay-hero-light: rgba(29, 29, 31, 0.15);
  --overlay-hero-strong: rgba(29, 29, 31, 0.25);
  ```
  Y reemplazar `bg-ink/15` por `bg-[var(--overlay-hero-light)]`.
- **Estado:** pendiente.

---

## Hallazgos por archivo

### src/app/modules/public/home/home.html

#### H1. [INFO] L4 — `<img src="/hero-store-isometric.jpg" alt="" aria-hidden="true">`
- **Categoría:** A11y-markup (fuera de scope Apple HIG, mencionado para visibilidad)
- **Por qué:** imagen decorativa de fondo correctamente marcada como `aria-hidden="true"` con `alt=""`. Cumple con práctica estándar.
- **Estado:** verificado sin problemas.

#### H2. [INFO] L6 — overlay `bg-ink/15` mobile, `bg-ink/25` desktop
- **Categoría:** Materials — Apple usa overlays con tokens, no magic numbers.
- **Por qué:** cubierto por **S1**.
- **Estado:** pendiente.

#### H3. [WARNING] L6 — overlay `bg-ink/15` puede ser insuficiente para legibilidad
- **Categoría:** Text on imagery — `references/principles.md` (Depth) y práctica de scrim
- **Por qué:** Apple HIG dice que texto sobre fotos necesita un scrim o material para mantener legibilidad. La imagen `hero-store-isometric.jpg` (generada con floors `#f5f5f7` y walls blancos) tiene grandes áreas claras. Un overlay al 15% deja esas áreas visibles detrás del texto blanco (`text-canvas`), comprometiendo el contraste.
- **Actual:**
  ```html
  <div class="absolute inset-0 bg-ink/15 lg:bg-ink/25"></div>
  ```
- **Propuesta:**
  ```html
  <div class="absolute inset-0 bg-ink/30 lg:bg-ink/20"></div>
  ```
  Invertir la lógica: más overlay en mobile (pantalla chica, texto más cerca), menos en desktop (imagen más visible).
- **Estado:** pendiente.

#### H4. [INFO] L10 — eyebrow `text-xs uppercase tracking-wide text-canvas font-medium`
- **Categoría:** Typography — Apple-scale Caption 1 (12px) ✓
- **Por qué:** `font-medium` (500) es aceptable per Apple references para labels ≤13px. `tracking-wide` (0.025em) está dentro del rango Apple.
- **Estado:** verificado sin problemas.

#### H5. [INFO] L13 — headline `text-4xl md:text-5xl lg:text-6xl`
- **Categoría:** Typography — Apple.com display marketing 40–80px ✓ (36/48/60 está dentro)
- **Por qué:** excede Apple scale estándar (Title 1 = 32px), pero apple.com hero usa display 40–80. Aceptable como excepción documentada.
- **Sugerencia:** agregar comment documentando que es hero display marketing.
- **Estado:** pendiente.

#### H6. [INFO] L13 — headline sin drop-shadow
- **Categoría:** Text on imagery — Apple dice "scrim o material para mantener legibilidad"
- **Por qué:** cubierto por **H3**. El overlay es la solución preferida por Apple; drop-shadow no se usa en apple.com.
- **Estado:** depende de H3.

#### H7. [INFO] L21 — CTA primario `bg-action text-white rounded-full text-base font-medium`
- **Categoría:** Button — Apple-style ✓
- pill, `min-h-[44px]` tap target, `transition-opacity hover:opacity-90` (Apple calm motion).
- **Estado:** verificado sin problemas.

#### H8. [INFO] L24 — CTA secundario `bg-canvas/90 backdrop-blur-sm text-ink`
- **Categoría:** Materials — translucent + blur ✓ Apple HIG sticky/chrome pattern
- **Por qué:** uso correcto de material translúcido sobre imagen. Apple usa esto en nav bars y sticky chrome.
- **Estado:** verificado sin problemas.

#### H9. [INFO] L31 — badge `shadow-xl` (Tailwind v4 = 0.10 alpha)
- **Categoría:** Corners & shadows — alpha ≤ 0.10 ✓
- **Por qué:** Tailwind v4 `shadow-xl` = `0 20px 25px -5px rgb(0 0 0 / 0.1)`. Está dentro del límite Apple (≤0.10 por capa, 3 niveles max).
- **Estado:** verificado sin problemas.

#### H10. [INFO] L32 — badge number `text-3xl font-semibold` "+5.000"
- **Categoría:** Typography — 30px entre Apple Title 2 (28) y Large Title (40). on-scale ✓
- **Estado:** verificado sin problemas.

#### H11. [INFO] L33 — badge label `text-xs uppercase tracking-wide opacity-80`
- **Categoría:** Typography — Apple Caption 1 (12px) ✓ con `opacity-80` para emphasis
- **Estado:** verificado sin problemas.

#### H12. [WARNING] L42 — H2 "Explorá por rubro" `text-lg font-medium text-ink uppercase tracking-wide`
- **Categoría:** Typography — Apple: "uppercase solo para labels ≤13px"
- **Por qué:** `text-lg` (18px) con uppercase excede el tamaño límite Apple para labels. Vibra "revista 90s", no "Apple product".
- **Actual:**
  ```html
  <h2 class="text-lg font-medium text-ink uppercase tracking-wide">Explorá por rubro</h2>
  ```
- **Propuesta:**
  ```html
  <h2 class="text-sm uppercase tracking-wide text-ink-48 mb-2">Categorías</h2>
  ```
  Convertir el H2 en eyebrow (text-sm 14px ≤ 13px borderline, mejor text-xs 12px). O eliminar uppercase y usar Title 3 normal:
  ```html
  <h2 class="text-2xl md:text-3xl font-semibold text-ink">Explorá por rubro</h2>
  ```
- **Estado:** pendiente.

#### H13. [INFO] L62 — eyebrow "Top ventas" `text-xs font-medium uppercase tracking-wide text-ink-48`
- **Categoría:** Typography — Apple Caption 1 (12px) ≤ 13px ✓
- **Estado:** verificado sin problemas.

#### H14. [INFO] L63 — H2 "Los más pedidos" `text-2xl md:text-3xl tracking-tight text-ink` con span `font-medium`
- **Categoría:** Typography — 24/30px ✓ on-scale borderline. `font-medium` (500) podría ser 600.
- **Por qué:** Title 2 (24px) Apple scale usa 600, no 500.
- **Estado:** pendiente (refinamiento).

#### H15. [INFO] L67 — link "Ver catálogo completo" `text-sm font-medium hover:opacity-80`
- **Categoría:** Typography — 14px Apple Callout ✓
- **Estado:** verificado sin problemas.

#### H16. [WARNING] L83 — emoji ⌛ en empty state
- **Categoría:** Anti-patterns — Iconos
- **Por qué:** Apple no usa emojis como iconos de UI; usa SVGs de línea monocromos. El emoji ⌛ está catalogado como "Apple never does this".
- **Actual:**
  ```html
  <div class="text-5xl mb-4 opacity-50">⌛</div>
  ```
- **Propuesta:** reemplazar por SVG inline (estilo monocromo similar al check de home.html original) o quitar y dejar solo el texto:
  ```html
  <div class="mb-4 text-ink-48">
    <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  </div>
  ```
- **Estado:** pendiente.

#### H17. [INFO] L98 — eyebrow "¿Por qué elegirnos?" `text-xs font-medium uppercase tracking-wide text-ink-48`
- **Categoría:** Typography — ✓ Apple-scale
- **Estado:** verificado sin problemas.

#### H18. [INFO] L99 — H2 "Compra segura, atención personal" `text-2xl md:text-3xl tracking-tight text-ink` con span `font-medium`
- **Categoría:** Typography — covered por H14
- **Estado:** pendiente (refinamiento).

#### H19. [INFO] L139 — gradient `bg-gradient-to-br from-canvas to-cool-wash` en SVG container
- **Categoría:** Color, restraint — Apple no usa gradientes decorativos
- **Por qué:** gradiente sutil (canvas → cool-wash, vecinos en la escala). Anti-pattern catalogado como info, no warning.
- **Estado:** info (aceptable, podría mejorar a bg-cool-wash sólido si querés Apple más puro).

---

## Verificado sin problemas

- **Motion**: ninguna `animate-bounce`, `animate-pulse`, `hover:scale-*` o animación custom. Solo `transition-opacity` y `transition-colors` con duración Tailwind default (150ms). Apple-style calm motion ✓.
- **Reduced motion**: el archivo es un template Angular; la regla global en `styles.css:254-261` ya implementa `@media (prefers-reduced-motion: reduce)`. ✓
- **State feedback**: CTAs tienen `hover:opacity-90` y `hover:bg-canvas` (Apple subtle state). El link "Ver catálogo completo" tiene `hover:opacity-80`. ✓
- **Sticky / scrolling**: no hay sticky surfaces en este template. El sticky se delega al `<app-header>`. ✓
- **Backdrop-blur**: CTA secundario usa `bg-canvas/90 backdrop-blur-sm` (Apple HIG material). ✓
- **One accent**: solo `bg-action` (#0071e3). Cero colores compitiendo. ✓
- **Tap targets**: todos los CTAs usan `min-h-[44px]`. ✓
- **Container y padding**: `max-w-[1500px]` + `px-5 md:px-8 lg:px-10` consistente con el resto del sitio. ✓
- **Sin emojis en chrome** (excepto H16, flaggeado). ✓
- **Sin rotación, sin scale, sin bounce**. ✓
- **Sin raw hex en chrome** (los hex están solo en el SVG inline decorativo, que es contenido, no chrome). ✓

---

## Observaciones (sin regla — fuera de scope)

- **`(click)="navigateToCategory(cat.id)"` en chips de categoría**: chips no son links sino buttons. Funcional, no es regla Apple. AGENTS.md del proyecto dice nada al respecto.
- **Span vacío en SVG del WhatsApp illustration** (L139-181): SVG decorativo de ~40 paths hardcoded en home.html. Apple no opina sobre esto; es contenido, no chrome. Decisión: dejarlo o reemplazarlo por un PNG estático en `public/`.
- **Sección "Comparador de iPhones"** (L91): delega a `<app-iphone-comparator>`, fuera de scope de este single-file review.

---

## Resumen ejecutivo

El nuevo hero con imagen de fondo **cumple Apple HIG en estructura** — un solo acento, jerarquía clara, materiales correctos, motion calmado, sin anti-patterns severos. 

**Lo único bloqueante potencial** es la legibilidad del texto blanco sobre imagen clara con overlay al 15% (H3). Si el texto se pierde cuando recargues, es ese.

El resto (H12 uppercase 18px, H16 emoji) son detalles de polish que Apple marca como warning pero no rompen la experiencia.

📄 **Reporte:** `docs/reviews/apple-home-html-2026-09-24.md`

¿Aplico los 3 warnings? Respondé con IDs (`H3 H12 H16`), `todo lo warning`, `ninguno` o `saltear H12`.

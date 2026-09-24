# Apple HIG Review — parte pública

**Date:** 2026-09-24
**Scope:** `src/app/modules/public/` + `src/app/modules/components/` (12 archivos UI + 1 stylesheet global = 13 archivos)
**Reviewer:** apple-reviewer v1

> **Scope note:** la "parte pública" estricta son 7 páginas. Le agregué `src/app/modules/components/` (header, footer, product-card, iphone-comparator) porque esas plantillas las usan las páginas públicas. Si querés revisión solo de `public/`, sacá los 4 archivos de components/.

---

## Summary

- **Files reviewed:** 13 (12 templates + 1 stylesheet global)
- **Files skipped (non-UI):** 11 `.ts` companions (lógica, no markup)
- **Blocking:** 8 (6 global, 2 per-file)
- **Warning:** 14 (7 global, 7 per-file)
- **Info:** 13 (3 global, 10 per-file)
- **Applied this session:** 0 / Declined: 0 / Skipped: 0

**Headline:** el proyecto YA adoptó el sistema monocromo + Apple Blue de `docs/design.md` (todos usan `bg-action`, `text-ink`, `bg-canvas`). El sistema de tokens está bien armado. **Los issues son de consistencia de aplicación**, no del sistema en sí: off-scale typography, radios fuera del 4-tokens-scale, `font-bold` donde Apple usa 500, `tracking-widest` donde HIG pide `0.02em`.

---

## Global Consistency Findings

### G1. [BLOCKING] Off-scale font sizes — `text-3xl` (30px) y `text-4xl` (36px) usados como heading estándar
- **Category:** Typography (`references/typography.md`)
- **Files affected (text-3xl):**
  - `src/app/modules/public/catalog/catalog.html:L6` — H1 `text-3xl lg:text-4xl`
  - `src/app/modules/public/product-detail/product-detail.html:L70, L76, L87` — H1 + precio
  - `src/app/modules/public/about/about.html:L10` — H1
  - `src/app/modules/public/privacy/privacy.html:L10` — H1
  - `src/app/modules/public/terms/terms.html:L10` — H1
  - `src/app/modules/public/returns/returns.html:L10` — H1
  - `src/app/modules/components/iphone-comparator/iphone-comparator.html:L37` — precio mobile
- **Why:** Apple scale es 12/13/15/16/20/24/32/40. `text-3xl` (30px) y `text-4xl` (36px) están entre 24 y 32 / entre 32 y 40. Rompen el ritmo tipográfico. La escala HIG dice Title 1 = 32px y Large Title = 40px.
- **Proposed canonical value:** usar `text-2xl` (24px) para H1 en mobile, `md:text-3xl` no existe — ir directo a `md:text-[2rem]` (32px) o `md:text-4xl` solo si la página es hero.
- **Status:** [ ] applied [ ] declined [ ] skipped

### G2. [BLOCKING] `font-bold` (700) usado 7 veces donde Apple usa max 500
- **Category:** Typography + Consistency
- **Files affected:**
  - `src/app/modules/public/home/home.html:L70` — badge descuento del hero
  - `src/app/modules/components/product-card/product-card.html:L21, L25, L29, L44, L51` — 5 badges + precio
  - `src/app/modules/components/iphone-comparator/iphone-comparator.html:L27, L94` — 2 badges
- **Why:** Apple usa 3 pesos en producción: 400 / 500 / 600. `font-bold` (700) está catalogado como anti-pattern en `references/typography.md`. Pero hay un **bug raíz en `styles.css`** que hace que el problema se note menos: el `@font-face` de `GothamSSm-Bold` declara `font-weight: 500` en lugar de 700 (styles.css:L24). Eso significa que `font-bold` se renderiza con el Medium (500), no con Bold real. **El bug de font-face enmascara el anti-pattern visualmente, pero sigue siendo un problema de sistema.**
- **Proposed canonical value:**
  1. Fix `styles.css:L24` → `font-weight: 700` para `GothamSSm-Bold`.
  2. Reemplazar `font-bold` por `font-medium` (500) en badges, y `font-semibold` (600) en precios.
- **Status:** [ ] applied [ ] declined [ ] skipped

### G3. [BLOCKING] Radii fuera del scale de 4 (`rounded-2xl` = 16px y `rounded-lg` = 8px en 6 archivos)
- **Category:** Corners & Shadows (`references/corners-shadows.md`)
- **Files affected:**
  - `src/app/modules/public/home/home.html:L68, L134, L234` — `rounded-2xl` (3 veces)
  - `src/app/modules/public/catalog/catalog.html:L77, L89, L134` — `rounded-lg` (price inputs) + `rounded-2xl`
  - `src/app/modules/public/product-detail/product-detail.html:L55, L182` — `rounded-lg` (thumbnails) + `rounded-[16px]` (retiro card)
  - `src/app/modules/components/header/header.html:L54` — `rounded-2xl` (mobile menu)
- **Why:** `styles.css` define `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 20px`, `--radius-pill: 9999px`. Pero los archivos usan `rounded-lg` de Tailwind = 8px (que coincide con `--radius-sm`, no `--radius-md`!), `rounded-2xl` = 16px (que no está en el scale). Inconsistencia entre lo declarado en tokens y lo que aplica Tailwind por default.
- **Proposed canonical value:**
  - Cards / superficies grandes: `rounded-[20px]` (que es `--radius-lg`).
  - Inputs / thumbnails: `rounded-xl` (12px, equivale a `--radius-md`).
  - Botones / pills: `rounded-full` (`--radius-pill`).
  - Badges internos: `rounded-md` (8px, equivale a `--radius-sm`).
  - **No usar `rounded-2xl`** (16px — fuera del scale).
- **Status:** [ ] applied [ ] declined [ ] skipped

### G4. [BLOCKING] `text-[10px]` ilegible en 2 archivos
- **Category:** Typography + Clarity
- **Files affected:**
  - `src/app/modules/public/home/home.html:L77` — descripción del producto en badge flotante ("iPhone 17 Pro" en 10px)
  - `src/app/modules/public/home/home.html:L236` — "Clientes felices" en badge
  - `src/app/modules/components/iphone-comparator/iphone-comparator.html:L27, L94` — badge descuento
- **Why:** Apple HIG explicit floor para texto UI es 11pt (≈14.6px). 10px es ilegible en mobile, especialmente con `font-bold` y tracking `0.05em`.
- **Proposed fix:** usar `text-xs` (12px = Caption style) o `text-[11px]` como mínimo. Para los badges de descuento del comparador, ya hay `text-[11px]` en `product-card.html` — unificar.
- **Status:** [ ] applied [ ] declined [ ] skipped

### G5. [WARNING] `tracking-widest` (0.1em) usado 13+ veces como eyebrow
- **Category:** Typography
- **Files affected:**
  - `src/app/modules/public/home/home.html:L7, L94, L114, L150`
  - `src/app/modules/public/catalog/catalog.html:L5, L38, L43, L66, L96`
  - `src/app/modules/public/product-detail/product-detail.html:L69, L99, L135, L162`
  - `src/app/modules/components/iphone-comparator/iphone-comparator.html:L4, L32`
  - `src/app/modules/public/about/about.html:L9`, `privacy.html:L9`, `terms.html:L9`, `returns.html:L9`
- **Why:** Apple tracking rule: 0.02em es el límite para labels ≤13px. 0.1em es "tracked-out marketing copy" de los 90s. Los eyebrows de la app vibran "revista", no "Apple".
- **Proposed canonical value:** `tracking-wide` (0.025em) o directamente `tracking-normal`. Apple no usa tracking ancho.
- **Status:** [ ] applied [ ] declined [ ] skipped

### G6. [WARNING] Headlines con `font-medium` (500) en lugar de `font-semibold` (600)
- **Category:** Typography
- **Files affected:**
  - `src/app/modules/public/catalog/catalog.html:L6, L8` — H1
  - `src/app/modules/public/product-detail/product-detail.html:L70, L76, L87` — H1 + precio
  - `src/app/modules/public/home/home.html:L115, L151, L162, L173, L184, L235` — H2, H3, precio
  - `src/app/modules/components/iphone-comparator/iphone-comparator.html:L5, L25, L37, L92` — H2, H3, precio
  - `src/app/modules/public/about/about.html:L10`, `privacy.html:L10`, `terms.html:L10`, `returns.html:L10`
- **Why:** Title 2 (24px) y Title 3 (20px) en el scale HIG son 600. 500 "se ve bajo" para anchors de sección. El sistema de Gotham tiene Medium en 500 y Bold en 500 (por el bug), entonces cambiar a 600 requiere fix de font-face primero.
- **Status:** [ ] applied [ ] declined [ ] skipped

### G7. [WARNING] CTA button markup duplicado 7+ veces en vez de `<app-button>` shared
- **Category:** Component reuse (`references/global-consistency.md` G10)
- **Files affected:**
  - `src/app/modules/public/home/home.html:L23` — Comprar ahora
  - `src/app/modules/public/catalog/catalog.html:L178, L191` — Limpiar búsqueda / filtros
  - `src/app/modules/public/product-detail/product-detail.html:L14, L206, L233` — Volver / WhatsApp x2
  - `src/app/modules/components/iphone-comparator/iphone-comparator.html:L68` — Ver detalle
- **Why:** Cada botón repite el mismo class stack con pequeñas variaciones (`px-5`/`px-6`/`px-7`, `py-3`/`py-4`, `min-h-[44px]`/`min-h-[48px]`). 7 instancias de duplicación → umbral de extracción.
- **Proposed fix:** extraer `<app-button variant="primary" size="md" routerLink="...">` con variants `primary | secondary | success` (para el WhatsApp verde) y `sizes: sm | md | lg`.
- **Status:** [ ] applied [ ] declined [ ] skipped

### G8. [WARNING] 4 páginas legales/about casi idénticas — extraer `<app-legal-page>`
- **Category:** Component reuse
- **Files affected:**
  - `src/app/modules/public/about/about.html` (32 líneas)
  - `src/app/modules/public/privacy/privacy.html` (31 líneas)
  - `src/app/modules/public/terms/terms.html` (31 líneas)
  - `src/app/modules/public/returns/returns.html` (31 líneas)
- **Why:** Las 4 comparten exactamente: header con eyebrow + H1 + opcional "Última actualización" + article con `whitespace-pre-wrap` + empty state. Diferencias: el eyebrow ("Nuestra historia" vs "Información legal") y si muestra fecha. Un componente parametrizado cubre las 4.
- **Status:** [ ] applied [ ] declined [ ] skipped

### G9. [WARNING] Sticky first-column en `iphone-comparator` sin sombra/gradient cue
- **Category:** Depth (`references/principles.md`)
- **Files affected:** `src/app/modules/components/iphone-comparator/iphone-comparator.html:L86, L107, L117, L127, L137, L147, L157, L167, L177, L187, L197`
- **Why:** Cuando la tabla scrollea horizontalmente, el contenido de las celdas siguientes pasa visualmente por debajo del sticky column. Sin `box-shadow` ni gradient a la derecha del sticky, el usuario no tiene señal de que hay contenido oculto. Apple HIG pide "visual affordances should communicate state".
- **Proposed fix:** agregar `after:absolute after:right-0 after:top-0 after:bottom-0 after:w-4 after:bg-gradient-to-r after:from-mist after:to-transparent after:pointer-events-none` en cada sticky `<th>`.
- **Status:** [ ] applied [ ] declined [ ] skipped

### G10. [INFO] Emoji en empty states (⌛ 🔍 📦 ⚠)
- **Category:** Anti-patterns (`references/anti-patterns.md`)
- **Files affected:**
  - `src/app/modules/public/home/home.html:L135` — ⌛
  - `src/app/modules/public/catalog/catalog.html:L171, L184` — 🔍, 📦
  - `src/app/modules/public/product-detail/product-detail.html:L11` — ⚠
- **Why:** Anti-pattern "Emoji as primary UI icon" — vibra "marketing email", no "Apple product". Apple usa SVGs monocromos o vacío.
- **Proposed fix:** reemplazar por SVGs de línea (estilo el check de home.html:L37) o quitar.
- **Status:** [ ] applied [ ] declined [ ] skipped

### G11. [INFO] `prefers-reduced-motion` solo en `styles.css` — falta verificar Angular animations
- **Category:** Motion
- **Why:** El media query global (styles.css:L254-261) desactiva CSS animations y transitions. Pero las Angular animations (ej: `[@fadeIn]`, `[@hoverAnimation]` en `product-card.html:L2`) usan su propio sistema. Hay que verificar si el `BrowserAnimationsModule` las respeta.
- **Files affected:** `src/app/modules/components/product-card/product-card.html:L2`
- **Status:** [ ] applied [ ] declined [ ] skipped

### G12. [INFO] Strings hardcoded — sin i18n en vistas públicas
- **Category:** i18n consistency
- **Files affected:** todos los archivos public/
- **Why:** Si el proyecto va a ser multi-idioma, todos los strings visibles (`"Comprar ahora"`, `"Sobre nosotros"`, etc.) deberían ser keys de `@angular/localize`. Hoy son literales.
- **Status:** [ ] applied [ ] declined [ ] skipped

### G13. [INFO] `text-canvas/30` y `text-canvas/40` en footer — opacidad muy baja
- **Category:** Contrast
- **Files affected:** `src/app/modules/components/footer/footer.html:L94, L97`
- **Why:** 30-40% opacity sobre `bg-ink` (#1d1d1f) puede caer bajo WCAG AA 4.5:1 para texto small. Calcular ratio real y subir a 60%+ si falla.
- **Status:** [ ] applied [ ] declined [ ] skipped

---

## Per-File Findings

### src/app/modules/public/home/home.html

#### H1. [BLOCKING] L77, L236 — `text-[10px]` en descripciones de badges del hero
- **Category:** Clarity (covered by global G4)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### H2. [WARNING] L10 — H1 con scale custom `text-4xl md:text-5xl lg:text-6xl`
- **Category:** Typography
- **Why:** El hero de home es la única página que justifica un display size mayor. Apple hero usa hasta 56-64px en apple.com. Pero el sistema local solo define tokens hasta 40px. **Si querés mantener el hero grande**, declaralo explícitamente como excepción (`text-6xl` solo en home) y dejá documentado que es un override.
- **Current:** `<h1 class="text-4xl md:text-5xl lg:text-6xl tracking-tight text-ink leading-[1.05]">`
- **Proposed fix:** OK mantener como excepción documentada.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### H3. [INFO] L59 — `rounded-[32px]` en contenedor del hero image
- **Category:** Corners & Shadows
- **Why:** Excede `--radius-lg` (20px). El producto físico (iPhone) tiene esquinas grandes; usar 32px imita esa proporción. Defendible como excepción de hero.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### H4. [INFO] L191 — gradiente decorativo `bg-gradient-to-br from-canvas to-cool-wash`
- **Category:** Deference
- **Why:** El gradiente está en una card decorativa (no product image) y va de canvas a cool-wash, que son tokens vecinos. Sutil, no satura el contenido. Aceptable.
- **Status:** [ ] applied [ ] declined [ ] skipped

---

### src/app/modules/public/catalog/catalog.html

#### C1. [WARNING] L6 — H1 `text-3xl lg:text-4xl` con resultados de búsqueda
- **Category:** Typography (covered by global G1)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### C2. [WARNING] L8 — H1 `text-2xl lg:text-4xl` — el escalonado mobile→desktop es muy brusco
- **Category:** Typography
- **Why:** `text-2xl` (24px) → `lg:text-4xl` (36px) salta 2 steps de la escala. Mejor: `text-2xl md:text-3xl` (24→30) o `text-3xl lg:text-4xl` (30→36).
- **Status:** [ ] applied [ ] declined [ ] skipped

#### C3. [INFO] L77, L89 — `rounded-lg` (8px) en inputs de precio
- **Category:** Corners & Shadows (covered by global G3)
- **Proposed fix:** `rounded-xl` (12px = `--radius-md`).
- **Status:** [ ] applied [ ] declined [ ] skipped

#### C4. [INFO] L134 — `rounded-2xl` (16px) en empty state container
- **Category:** Corners & Shadows (covered by global G3)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### C5. [INFO] L20 — `placeholder:text-ink-48` (placeholder opacity 48%) — posible contraste bajo
- **Category:** Contrast
- **Why:** Calcular contra `bg-canvas` (#ffffff). `rgba(29,29,31,0.48)` sobre blanco da ~5.4:1 → pasa AA para body, pero como placeholder puede no ser exigido. Flag info.
- **Status:** [ ] applied [ ] declined [ ] skipped

---

### src/app/modules/public/product-detail/product-detail.html

#### P1. [INFO] L27 — `text-ink-24` (24% opacity) en separator de breadcrumb `/`
- **Category:** Contrast
- **Why:** 24% sobre `bg-canvas` da ~2.8:1, falla AA para texto. Es un separator decorativo, no informativo, pero sigue siendo visible. Considerar `text-ink-48` (48%) para mantener legibilidad AA-large.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### P2. [INFO] L45 — `transition-opacity duration-500` en galería principal
- **Category:** Motion
- **Why:** 500ms para opacity es muy lento (Apple standard es 200-300ms para fades). 500ms se siente "laggy".
- **Proposed fix:** `transition-opacity duration-300`.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### P3. [INFO] L55 — `rounded-lg` (8px) en thumbnails de galería
- **Category:** Corners & Shadows (covered by global G3)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### P4. [INFO] L182 — `rounded-[16px]` en card "Retiro en tienda / Envío a domicilio"
- **Category:** Corners & Shadows
- **Proposed fix:** `rounded-[20px]` (`--radius-lg`).
- **Status:** [ ] applied [ ] declined [ ] skipped

#### P5. [INFO] L182 — `bg-mist` con texto `text-ink` y `text-ink-80` — posible bajo contraste para `text-ink-80` sobre mist
- **Category:** Contrast
- **Why:** `rgba(29,29,31,0.8)` sobre `bg-mist` (#f5f5f7) da ~9:1 — pasa AA. OK.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### P6. [INFO] L44 — placeholder `https://picsum.photos/800/800` hardcoded
- **Category:** Best practice (no HIG)
- **Why:** Si el producto no tiene imagen, usa picsum. Es un fallback legítimo, pero es dependencia externa. Documentar.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### P7. [INFO] L106 — `role="radiogroup"` con `<button>` children — semánticamente debería ser `<input type="radio">` o `role="radio"` en cada button
- **Category:** Accessibility (fuera de scope estricto de HIG pero se cruza)
- **Status:** [ ] applied [ ] declined [ ] skipped

---

### src/app/modules/components/iphone-comparator/iphone-comparator.html

#### IC1. [BLOCKING] L27, L94 — `text-[10px]` en badges de descuento (covered by global G4)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### IC2. [WARNING] L107–L197 — `tracking-wider` (0.05em) en 10 row labels (covered by global G5)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### IC3. [WARNING] L27, L94 — `font-bold` en badges (covered by global G2)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### IC4. [WARNING] Sticky first-column sin sombra/gradient (covered by global G9)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### IC5. [INFO] L5, L25, L37, L92 — `font-medium` en headlines/precio (covered by global G6)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### IC6. [INFO] L5, L25 — off-scale sizes `md:text-3xl` (30px) y `text-lg` (18px)
- **Category:** Typography (covered by global G1)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### IC7. [INFO] L81 — truco de margen negativo `-mx-8 lg:-mx-10`
- **Category:** Spacing
- **Why:** Anti-pattern "Negative margin to fix layout" (catalogado en `references/anti-patterns.md`). Funciona pero oscurece el sistema. Aceptable en este caso (necesario para que la tabla sticky funcione al borde), documentar con comment.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### IC8. [INFO] L68 vs L202 — CTA `min-h` inconsistente (44px mobile vs 36px desktop)
- **Category:** Consistency
- **Why:** Mobile es 44px (HIG touch target), desktop 36px. Ambos son válidos en su contexto, pero el mismo "Ver detalle" en dos vistas distintas confunde al usuario sobre el componente. Considerar `<app-button size="md|sm">`.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### IC9. [INFO] L82 — tabla HTML sin `<caption>` ni `<th scope="...">` consistente
- **Category:** Accessibility
- **Why:** La tabla tiene `<th scope="col">` y `<th scope="row">` ✓, pero falta `<caption class="sr-only">Comparativa de modelos de iPhone</caption>` para screen readers.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### IC10. [INFO] L87 — `sr-only` implementado con utility stack custom en lugar de `class="sr-only"`
- **Category:** Accessibility (consistency)
- **Why:** El stack `absolute w-px h-px p-0 m-[-1px] overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)]` es la receta clásica de sr-only, pero Tailwind tiene `sr-only` built-in. Unificar.
- **Status:** [ ] applied [ ] declined [ ] skipped

---

### src/app/modules/components/header/header.html

#### HE1. [WARNING] L54 — `rounded-2xl` (16px) en mobile menu container (covered by global G3)
- **Proposed fix:** `rounded-[20px]`.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### HE2. [INFO] L40 — mobile menu toggle sin `aria-label` ni `aria-expanded`
- **Category:** Accessibility
- **Why:** El button tiene solo SVG icons (L42/L45) que se togglean con `[class.hidden]`. Falta `aria-label="Abrir menú"` / `"Cerrar menú"` y `aria-expanded="false"` / `"true"` ligado al signal `isMenuOpen`.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### HE3. [INFO] L1 — sticky header con `border-b border-hairline` ✓ (separación válida)

#### HE4. [INFO] L7 — logo con `alt=""` (decorativo, OK porque el link tiene el contexto del routerLink)

---

### src/app/modules/components/footer/footer.html

#### F1. [INFO] L30, L40 — `tracking-wider` en headings "Enlaces" / "Contacto" (covered by global G5)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### F2. [INFO] L94 — `text-canvas/30` en separator `|` (covered by global G13)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### F3. [INFO] L17 — admin button `bg-canvas text-ink` con `hover:bg-cool-wash` — OK, transición correcta

#### F4. [INFO] L62-64 — `@else { "Cargando..." }` sin contexto. **Issue:** no respeta `prefers-reduced-motion` para SVGs animados ni el patrón skeleton de Apple.

---

### src/app/modules/components/product-card/product-card.html

#### PC1. [BLOCKING] L21, L25, L29 — `font-bold` (700) en badges (covered by global G2)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### PC2. [WARNING] L44, L51 — `font-bold` (700) en precio (covered by global G2)
- **Why:** Precio es Title 3 → 600, no 700.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### PC3. [WARNING] L2 — `[@hoverAnimation]` y `[@fadeIn]` — Angular animations; verificar que respeten `prefers-reduced-motion`
- **Category:** Motion
- **Why:** El media query global desactiva CSS transitions/animations, pero Angular animations tienen su propio sistema (`provideAnimations` vs `provideNoopAnimations`). Hay que confirmar leyendo el `app.config.ts`.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### PC4. [INFO] L38 — `text-[15px]` en product name — off-scale (Apple scale: 12/13/15/16/20/24). 15px está en scale como "Callout" pero el nombre de producto generalmente es Title 3 (20px) o Body (16px).
- **Category:** Typography
- **Proposed fix:** `text-base` (16px) si se considera body, o `text-xl` (20px) si es title del card. Hoy está en un punto medio confuso.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### PC5. [INFO] L59 — `group-hover:gap-2` en arrow del CTA — micro-interacción sutil ✓ (Apple-like)

---

### src/app/modules/public/{about, privacy, terms, returns}.html

Todas comparten la misma estructura. Findings per-file (no globales porque son 4 archivos separados):

#### L1. [WARNING] Cada archivo — `tracking-widest` en eyebrow (covered by global G5)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### L2. [WARNING] Cada archivo — `font-medium` en H1 (covered by global G6)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### L3. [WARNING] Cada archivo — `text-3xl md:text-4xl` H1 (covered by global G1)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### L4. [WARNING] Extracción a `<app-legal-page>` (covered by global G8)
- **Status:** [ ] applied [ ] declined [ ] skipped

#### L5. [INFO] privacy.html, terms.html, returns.html — comparten "Información legal" como eyebrow literal en 3 archivos. Si se extrae el componente, el eyebrow puede ser un `@Input()`.

---

### src/styles.css (global)

#### S1. [BLOCKING] L8, L17, L24 — `@font-face` de GothamSSm declara `font-weight: 500` en todos los weights
- **Category:** Typography (root cause of G2 — `font-bold` se renderiza con Medium)
- **Why:** El font se llama "Light" pero el `@font-face` declara `font-weight: 500`. El Medium declara 500 (OK). El Bold declara 500 (BUG — debería ser 700). Resultado: `font-light`, `font-medium`, y `font-bold` se ven idénticos porque los 3 cargan el mismo archivo. **Este es un bug de root system** que afecta toda la app.
- **Current:**
  ```css
  @font-face { font-family: "GothamSSm-Light"; font-weight: 500; }
  @font-face { font-family: "GothamSSm-Medium"; font-weight: 500; }
  @font-face { font-family: "GothamSSm-Bold"; font-weight: 500; }
  ```
- **Proposed fix:** declarar `font-weight: 300` para Light, `500` para Medium, `700` para Bold.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### S2. [INFO] L165-167 — `.header-cart-badge { animation: pulse-custom 2s infinite }` — pulse infinito en badge del carrito
- **Category:** Motion anti-pattern
- **Why:** El anti-pattern catalogado dice "Apple never does `animate-pulse` on UI chrome". Pulsar cada 2s es ruido. Si querés llamar atención al carrito, hacelo cuando hay items nuevos (no siempre).
- **Proposed fix:** eliminar el pulse permanente; usar animation solo en state-change (ej: cuando se agrega un item).
- **Status:** [ ] applied [ ] declined [ ] skipped

#### S3. [INFO] L186-190 — `.cdk-drag-preview` shadow alpha 0.14 (excede 0.10 límite)
- **Category:** Corners & Shadows
- **Why:** Ligeramente por encima del límite 0.10. Es para drag preview (no producción UI), aceptable.
- **Status:** [ ] applied [ ] declined [ ] skipped

#### S4. [INFO] L186-191 — `.cdk-drag-*` usa `250ms` transitions (no Apple-standard 200ms)
- **Category:** Motion
- **Why:** 250ms está dentro del rango aceptable (200-300ms para layout). Aceptable.
- **Status:** [ ] applied [ ] declined [ ] skipped

---

## Non-issues (verified clean)

These are the categories where I found **no significant issues** worth flagging:

- **Container max-width `max-w-[1500px]`** ✓ usado uniformemente en los 11 archivos con section root.
- **Container padding `px-5 md:px-8 lg:px-10`** ✓ consistente en todos los archivos.
- **Section vertical padding `py-12 lg:py-20`** ✓ consistente.
- **Color tokens** — todos usan `bg-action`, `text-ink`, `bg-canvas`, `bg-mist`, `text-ink-48`, `text-ink-80` consistentemente. No hay hex raw hardcoded en componentes (excepto los SVGs decorativos de home, que son contenido no chrome).
- **`transition-colors` sin duración explícita** — Tailwind default 150ms. Funciona bien para hovers.
- **Backdrop-blur en header sticky** — `bg-canvas/80 backdrop-blur-md` da separación visual válida.
- **Skip link en header** — patrón a11y correcto.
- **Focus rings globales** — `*:focus-visible { outline: 2px solid var(--color-action) }` está bien.
- **`prefers-reduced-motion` global** — implementado correctamente en styles.css:L254.
- **Emoji como primary UI icon** — están en empty states (info), no en chrome de producción.
- **Hover lift** — no hay `hover:scale-105` ni `hover:rotate-` en ningún archivo. ✓ Apple-clean.
- **Animation `bounce`** — no hay `animate-bounce` en ningún archivo. ✓ Apple-clean.
- **Decorative gradients** — solo 1 gradiente sutil en home (decorativo, no product image). Aceptable.
- **Spinners de carga** — todos usan `animate-spin`, no `animate-pulse`. ✓ Patrón correcto.

---

## Suggested patch order

1. **S1** (font-face bug) — fix root cause primero; desbloquea G2/G6.
2. **G4** (text-[10px]) + **G1** (off-scale 30/36px) — typography blockers.
3. **G3** (radii) — definir convención en AGENTS.md o doc, después aplicar.
4. **G5** (tracking-widest) — search & replace masivo a `tracking-wide`.
5. **G7** (CTA button) + **G8** (legal page) — extraer componentes shared (esfuerzo de refactor mayor; mejor PR aparte).
6. **G9** (sticky column) — fix puntual de CSS.
7. Resto de warnings + info — batch.

---

## Out-of-scope reminders (no revisado)

- **`.spec.ts` files** — auto-skip per skill config.
- **`.ts` companions de componentes** — contienen lógica, no markup. Revisar lógica de Angular animations (`product-card.ts`) y motion-reduce handling requeriría leer `app.config.ts`.
- **`admin/` module** — fuera del scope "parte pública".
- **`shared/` layouts** — fuera del scope.
- **Cross-module consistency con admin/** — fuera del scope; hacer una segunda corrida en `src/app/modules/admin/` para comparar.

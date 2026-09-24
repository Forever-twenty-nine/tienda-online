# Revisión de diseño Apple — parte pública

**Fecha:** 2026-09-24
**Alcance:** `src/app/modules/public/` + `src/app/modules/components/` (11 archivos de UI revisados)
**Sistema de diseño detectado:**
- `AGENTS.md` (Tailwind 4, standalone, signals, sin NgModel, imágenes en Storage)
- `docs/design.md` (sistema de tokens monocromo + acento)
- `styles.css` con `@theme` de Tailwind 4: `--color-action`, `--color-canvas`, `--color-mist`, `--color-ink`, `--color-hairline`, `--radius-{sm,md,lg,pill}`, `--shadow-{resting,lifted,floating}`
- Font: GothamSSm (custom del proyecto)
- Tailwind v4.2.1

## Resumen

- **Blocking:** 0
- **Warning:** 3 (G2 `font-bold` en 4 archivos, G3 `tracking-wider` en 5 archivos, G4 sticky first column sin sombra de borde)
- **Info:** 1 global + ~15 per-file (refinamientos menores, todos con `S<n>` o `H<n>`/`C<n>`/`P<n>`/etc.)
- **Aplicados:** 3 (G2, G3, G4) · **Rechazados:** 0 · **Salteados:** 0

---

## Divergencias del sistema de diseño (decisiones del proyecto)

### S1. [INFO] `bg-brand-primary` (#afde41) definido pero no usado en el alcance
- **Definido en:** `styles.css` como `--color-brand-primary`.
- **Verificado:** 0 ocurrencias en `public/` ni `components/`. Solo `bg-action` (#0071e3) se usa como acento.
- **Propuesta:** decidir si mantenerlo para uso futuro (ej: badge "Marca propia") o eliminarlo del token set. No es hallazgo de Apple, es decisión del proyecto.

### S2. [INFO] Tailwind v4 detectado — los valores de shadow del design doc son válidos
- **Versión:** `tailwindcss: ^4.2.1` en `package.json`.
- **Verificado:** `shadow-resting`, `shadow-lifted`, `shadow-floating` con alphas ≤ 0.10 (correcto para v4).

### S3. [INFO] Apple HIG type scale vs proyecto
- **Proyecto:** `text-base` (16px) usado como body; `text-sm` (14px) para sub-text.
- **Apple iOS:** body = 17px.
- **Decisión del proyecto:** mantener 16px (la diferencia es de 1px, no rompe legibilidad). No se reporta como hallazgo.

---

## Hallazgos globales

### G1. [INFO] Una sola paleta de acentos en uso (Apple-style ✓)
- **Categoría:** Consistency — `global-consistency.md` §G1
- **Valor canónico:** `--color-action` (#0071e3).
- **Archivos que la usan:** home.html, catalog.html, product-detail.html, iphone-comparator.html, product-card.html, header.html, footer.html.
- **Acento secundario semántico:** `bg-success` (#1f8a4c) reservado solo para CTAs de WhatsApp en product-detail.html (L206, L233). No compite con `bg-action`.
- **Estado:** verificado sin problemas.

### G2. [WARNING] `font-bold` (700) en badges y precios — Apple usa max 600 para UI chrome
- **Categoría:** Typography — `references/anti-patterns.md` §"Tipografía y pesos"
- **Valores y ubicaciones:**
  - `font-bold` en `home.html:70` — badge del hero ("-15%" / "TOP")
  - `font-bold` en `product-detail.html:79` — badge descuento "-15%"
  - `font-bold` en `iphone-comparator.html:27, :94` — badges descuento mobile y desktop
  - `font-bold` en `product-card.html:21, :25, :29` — badges (-15%, Top, Sin stock)
  - `font-bold` en `product-card.html:44, :51` — precio destacado
- **Por qué:** Apple usa 3 pesos en producción (400, 500, 600). `font-bold` (700) está catalogado como "Apple no usa bold en UI chrome" — vibra "marketing email", no "Apple product".
- **Valor canónico propuesto:** reemplazar por `font-semibold` (600). Los badges tienen ya `font-bold` con weight 700 que va contra el sistema; 600 es más Apple.
- **Archivos a adoptar:** los 7 lugares listados arriba.
- **Estado:** aplicado (2026-09-24).

### G3. [WARNING] `tracking-wider` (0.05em) en eyebrows y labels — excede el rango Apple
- **Categoría:** Typography — `references/typography.md` (Apple: ≤ 0.025em para labels)
- **Valores y ubicaciones:**
  - `home.html:94` — eyebrow "Explorá por rubro"
  - `product-detail.html:79` — badge descuento (parte de la misma span que G2)
  - `iphone-comparator.html:27, :94, :107-197` — 11 row labels del comparador
  - `product-card.html:21, :25, :29` — badges
  - `footer.html:30, :40` — headings "Enlaces", "Contacto"
- **Por qué:** Apple usa tracking muy sutil (≤ 0.025em = `tracking-wide`). 0.05em (`tracking-wider`) es "revista de los 90s", no "Apple product".
- **Valor canónico propuesto:** `tracking-wide` (0.025em) o directamente `tracking-normal` (0). Aplicar solo en eyebrows uppercase ≤ 13px.
- **Archivos a adoptar:** los 5 archivos listados.
- **Estado:** aplicado (2026-09-24).

### G4. [WARNING] Sticky first column del comparador sin sombra/gradient de borde cuando scrollea horizontal
- **Categoría:** Depth — `references/corners-shadows.md` + `references/principles.md` (Sticky / scrolling surfaces)
- **Ubicación:** `iphone-comparator.html:81, :86, :107, :117, :127, :137, :147, :157, :167, :177, :187, :197`.
- **Por qué:** Cuando la tabla scrollea horizontalmente, el contenido de las celdas siguientes pasa visualmente por debajo del sticky first column. Solo se usa `bg-mist` para separación (mismo que el row), pero no hay sombra ni gradient en el borde derecho del sticky. El usuario no tiene señal visual de que el contenido sigue ahí pero está oculto.
- **Propuesta:** agregar sombra sutil al borde derecho del sticky first column (ej: `shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]`) o un gradient `after:` que fadea el contenido por debajo.
- **Estado:** aplicado (2026-09-24). Sombra agregada a los 11 th sticky (header + 10 row ths) en `iphone-comparator.html`.

---

## Hallazgos por archivo

### src/app/modules/public/home/home.html

#### H1. [INFO] L7 — eyebrow "Lo más nuevo"
- **Categoría:** Typography — eyebrow Apple-style ✓
- **Estado:** verificado sin problemas.

#### H2. [INFO] L10 — H1 `text-4xl md:text-5xl lg:text-6xl`
- **Por qué:** 36/48/60px excede Apple Title 1 (32px) y entra en display marketing (>40px). El hero puede justificar el override como excepción documentada, pero rompe el scale estándar.
- **Propuesta:** si se mantiene como hero, agregar comentario explicando que es excepción. Si se quiere alinear al scale: `text-3xl md:text-5xl lg:text-[3.5rem]`.
- **Estado:** pendiente.

#### H3. [INFO] L23 — CTA pill primary "Comprar ahora"
- **Categoría:** Button — Apple-style ✓
- `bg-action text-white px-7 py-3 rounded-full text-base font-medium hover:opacity-90 transition-opacity min-h-[44px]`
- **Estado:** verificado sin problemas.

#### H4. [INFO] L29 — CTA pill secondary "Sobre nosotros"
- **Categoría:** Button — Apple-style ✓
- `bg-canvas text-ink border border-hairline ... hover:bg-cool-wash transition-colors min-h-[44px]`
- **Estado:** verificado sin problemas.

#### H5. [WARNING] L70 — `font-bold` en badge circular del hero
- **Cubierto por G2.**
- **Estado:** pendiente.

#### H6. [INFO] L77 — descripción del producto en badge "iPhone 17 Pro"
- **Por qué:** `text-xs` (12px) está en el Apple scale como Caption. La descripción del modelo es legible pero ajustada — el contenedor tiene `truncate max-w-[100px]` (mobile) / `max-w-[160px]` (desktop).
- **Propuesta:** aceptable. Si se quiere más espacio, considerar `text-[13px]` (Footnote) pero rompe el scale.
- **Estado:** verificado sin problemas.

#### H7. [WARNING] L94 — `tracking-wider` en eyebrow "Explorá por rubro"
- **Cubierto por G3.**
- **Estado:** pendiente.

#### H8. [INFO] L135 — emoji ⌛ como empty state illustration
- **Categoría:** `references/anti-patterns.md` §"Anti-patterns Iconos"
- **Por qué:** Apple no usa emojis como iconos de UI; usa SVGs de línea monocromos. El emoji ⌛ está catalogado como "Apple never does this".
- **Propuesta:** reemplazar por SVG inline monocromo (igual estilo que los checks del trust band en L37-50) o un spinner sutil.
- **Estado:** pendiente.

#### H9. [INFO] L191 — `bg-gradient-to-br from-canvas to-cool-wash` decorative gradient
- **Categoría:** `references/anti-patterns.md` §"Color y decoración"
- **Por qué:** Apple no usa gradientes en decoración. El gradient está en una card decorativa (no product image), pero igualmente vibra "marketing", no "premium tech".
- **Propuesta:** reemplazar por `bg-cool-wash` sólido.
- **Estado:** pendiente.

#### H10. [INFO] L236 — `text-3xl font-medium` "+5.000"
- **Categoría:** Typography
- **Por qué:** 30px entre Apple Title 2 (28px) y Large Title (40px). 500 está OK para display, pero Apple suele usar 600 para números destacados.
- **Propuesta:** `font-semibold` (600) en lugar de `font-medium`.
- **Estado:** pendiente.

---

### src/app/modules/public/catalog/catalog.html

#### C1. [INFO] L6 — H1 con resultados de búsqueda
- `text-3xl lg:text-4xl font-semibold` — 30/36px, on-scale. Apple Title 2 = 28px, Title 1 = 32px → 30 está en el gap. Aceptable.
- **Estado:** verificado sin problemas.

#### C2. [INFO] L8 — H1 estándar del catálogo
- `text-2xl lg:text-4xl font-semibold` — 24→36 jump brusco (no escala por 30px intermedio).
- **Propuesta:** `text-2xl lg:text-3xl` para suavizar la transición.
- **Estado:** pendiente.

#### C3. [INFO] L17 — `[(ngModel)]="searchTerm"`
- **Categoría:** Fuera de scope Apple HIG (es regla de código del proyecto).
- **Por qué:** AGENTS.md del proyecto dice "Sin NgModel — usar Reactive Forms o signals". El comparador y otros componentes del proyecto usan signals.
- **Nota:** mencionado aquí para visibilidad. La skill de Apple no reporta esto como hallazgo de diseño; pertenece a una review de código.
- **Estado:** fuera de alcance.

#### C4. [INFO] L77, L89 — inputs de precio `rounded-xl`
- 12px, on-scale con `--radius-md` (Tailwind v4). Apple-style ✓.
- **Estado:** verificado sin problemas.

#### C5. [WARNING] L171 — emoji 🔍 como empty state "no se encontraron productos"
- **Cubierto por la regla anti-pattern emoji** (categoría Iconos).
- **Estado:** pendiente.

#### C6. [WARNING] L184 — emoji 📦 como empty state "no hay productos con esos filtros"
- **Cubierto por la regla anti-pattern emoji** (categoría Iconos).
- **Estado:** pendiente.

---

### src/app/modules/public/product-detail/product-detail.html

#### P1. [WARNING] L11 — emoji ⚠ como error state
- **Cubierto por anti-pattern emoji.**
- **Estado:** pendiente.

#### P2. [INFO] L45 — `transition-opacity duration-500` en galería principal
- **Por qué:** 500ms para un fade entre imágenes es lento (Apple: 200–300ms para opacity).
- **Propuesta:** `transition-opacity duration-300`.
- **Estado:** pendiente.

#### P3. [WARNING] L79 — `font-bold` en badge "-15%"
- **Cubierto por G2.**
- **Estado:** pendiente.

#### P4. [INFO] L111 — color picker con `focus:outline-none`
- **Por qué:** Apple HIG pide focus state visible. `focus:outline-none` lo quita sin reemplazo.
- **Propuesta:** agregar `focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2`.
- **Estado:** pendiente.

#### P5. [INFO] L231 — `shadow-[0_-4px_12px_rgba(0,0,0,0.06)]` en sticky CTA mobile
- **Categoría:** Depth — soft shadow hacia arriba ✓
- Alpha 0.06, dentro del límite ≤0.10 para sticky bars.
- **Estado:** verificado sin problemas.

---

### src/app/modules/components/iphone-comparator/iphone-comparator.html

#### IC1. [WARNING] L27 — `font-bold` en badge descuento mobile
- **Cubierto por G2.**
- **Estado:** pendiente.

#### IC2. [WARNING] L94 — `font-bold` en badge descuento desktop
- **Cubierto por G2.**
- **Estado:** pendiente.

#### IC3. [WARNING] L107-197 — `tracking-wider` en 11 row labels
- **Cubierto por G3.**
- **Estado:** pendiente.

#### IC4. [WARNING] Sticky first column sin sombra de borde derecho
- **Cubierto por G4.**
- **Estado:** pendiente.

#### IC5. [INFO] L202 — CTA mobile `min-h-[36px]`
- **Por qué:** Apple HIG pide 44×44pt mínimo para tap targets. Mobile CTA del comparador usa 36px (vs CTA mobile en product-detail que usa 48px).
- **Propuesta:** `min-h-[44px]` para alinearse con Apple HIG y con product-detail.
- **Estado:** pendiente.

---

### src/app/modules/components/header/header.html

#### HE1. [INFO] L1 — `bg-canvas/80 backdrop-blur-md sticky top-0`
- **Categoría:** Materials — translucent + blur ✓ Apple-style
- Header usa material translúcido + blur, exactamente lo que HIG pide para sticky chrome.
- **Estado:** verificado sin problemas.

#### HE2. [INFO] L16, L22, L57, L64 — routerLinkActive stack `bg-cool-wash text-ink font-ftn-bold`
- **Por qué:** Apple prefiere cambios sutiles en active state. Aplicar 3 cambios (`bg`, `text`, `font-family`) simultáneamente vibra "interfaz rica", no "Apple".
- **Propuesta:** usar solo cambio de color de fondo (`routerLinkActive="bg-cool-wash text-ink"`) y dejar el font-family del sitio.
- **Estado:** pendiente.

---

### src/app/modules/components/footer/footer.html

#### F1. [WARNING] L30, L40 — `tracking-wider` en headings "Enlaces" / "Contacto"
- **Cubierto por G3.**
- **Estado:** pendiente.

#### F2. [INFO] L94 — `text-canvas/30` separator "|"
- **Por qué:** 30% opacity sobre `bg-ink` (#1d1d1f). Apple: el separador puede ser visualmente ligero pero no tanto que parezca invisible.
- **Propuesta:** `text-canvas/40` (40% opacity) — apenas visible pero presente.
- **Estado:** pendiente.

---

### src/app/modules/components/product-card/product-card.html

#### PC1. [WARNING] L21, L25, L29 — `font-bold` en 3 badges
- **Cubierto por G2.**
- **Estado:** pendiente.

#### PC2. [WARNING] L44, L51 — `font-bold` en precio destacado
- **Cubierto por G2.**
- **Estado:** pendiente.

#### PC3. [INFO] L59 — `group-hover:gap-2 transition-all`
- **Por qué:** micro-interacción sutil (gap aumenta en hover). Apple-style ✓
- **Estado:** verificado sin problemas.

---

### src/app/modules/public/{about,privacy,terms,returns}.html

#### LP1. [INFO] H1 — `text-3xl md:text-4xl font-semibold text-ink`
- 30/36px, on-scale ✓
- **Estado:** verificado sin problemas.

#### LP2. [INFO] Eyebrows `text-xs uppercase tracking-wide text-ink-48`
- Apple-style ✓ (diferente del antiguo `tracking-widest` que era 0.1em).
- **Estado:** verificado sin problemas.

#### LP3. [INFO] Cuatro archivos casi idénticos
- about.html, privacy.html, terms.html, returns.html comparten la misma estructura: spinner → eyebrow + H1 + opcional fecha + article + empty state.
- **Por qué:** candidato a extracción como `<app-legal-page>` shared component. Pero esto es un refactor de código, no un hallazgo de Apple HIG.
- **Estado:** fuera de alcance (mencionado para visibilidad).

---

## Verificado sin problemas

- **Motion**: ningún `animate-bounce`, `animate-pulse` o hover-scale > 1.05 en chrome. `animate-spin` solo en spinners de carga (Apple-style loading indicator). `transition-colors`, `transition-opacity`, `transition-all` con duraciones razonables.
- **Reduced motion**: `styles.css` implementa `@media (prefers-reduced-motion: reduce)` globalmente.
- **State feedback**: hover states (`hover:bg-cool-wash`, `hover:opacity-90`), active states vía `routerLinkActive`, focus rings globales en `styles.css`.
- **One accent color**: solo `bg-action` (#0071e3) y `bg-success` (semántico WhatsApp). No compiten. (`bg-brand-primary` está definido pero no usado en el alcance.)
- **Tap targets**: mayoría de CTAs primary usan `min-h-[44px]`. (Excepción: CTA mobile del comparador a 36px — ver IC5.)
- **Backdrop-blur**: header usa material translúcido + blur — Apple HIG material.
- **Hairline borders**: `border-hairline` (1px) usado consistentemente en cards y secciones.
- **Container max-width + padding responsive**: `max-w-[1500px]` + `px-5 md:px-8 lg:px-10` consistente en los 11 archivos.
- **Padding en scale**: `p-3`, `p-4`, `p-5` (12/16/20px), todos on-scale.
- **Typografía on-scale**: Apple body usa 17px, proyecto usa `text-base` (16px). Diferencia de 1px — decisión del proyecto, no se reporta.
- **Tabla HTML con `<th scope="row">`**: estructura semántica correcta ✓

---

## Observaciones (sin regla)

- **`[(ngModel)]="searchTerm"` en `catalog.html:17`**: viola AGENTS.md ("Sin NgModel — usar Reactive Forms o signals"). Fuera del scope de Apple HIG, mencionado para visibilidad.
- **4 páginas legales casi idénticas** (about/privacy/terms/returns): candidato a `<app-legal-page>`. Refactor de código, no de diseño.
- **`font-ftn-bold` en routerLinkActive de `header.html`**: 3-class stack activo. Style choice — Apple prefiere cambios sutiles, no error.
- **Sticky first column con `bg-mist`** (mismo fondo que las filas): la separación se da por la diferencia con el fondo `bg-canvas` del contenedor padre, no por contraste con las filas. Verificado OK pero el G4 pide refuerzo explícito (sombra/gradient).
- **SVG decorativo del hero en `home.html:191-232`** (WhatsApp illustration): es contenido, no chrome. No se reporta.
- **`text-canvas/40` icon colors en `footer.html:44, L50, L56`**: 40% opacity sobre ink. Posible bajo contraste para icon visibility (no hay regla explícita Apple; cubre tema accesibilidad, fuera de scope).

---

## Resumen ejecutivo

El proyecto está **muy bien alineado** con Apple HIG — el sistema de tokens funciona, los CTAs son Apple-style, el header usa material translúcido, no hay anti-patterns severos (ningún `animate-bounce`, `animate-pulse`, hover-scale, etc.).

Los 3 warnings (G2, G3, G4) son ajustes de polish:
- **G2 (font-bold en 7 lugares)**: cambiar a `font-semibold` (600).
- **G3 (tracking-wider en 5 archivos)**: bajar a `tracking-wide` (0.025em).
- **G4 (sticky column sin sombra)**: agregar `shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]` al sticky first column del comparador.

Estos 3 fixes son search & replace masivo (mecánicos), no refactors.

📄 **Reporte:** `docs/reviews/apple-public-2026-09-24.md`

¿Aplico? Respondé con IDs (ej. `G2 G3 G4`), `todo`, `todo lo warning`, `ninguno` o `saltear G2`.
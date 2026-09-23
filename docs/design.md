# Design System — Tienda Online

> Documento de descubrimiento y propuesta de rediseño para adaptar la tienda a **tecnología premium (foco en iPhones)**. Inspirado en Apple Human Interface Guidelines y patrones mobile-first 2026.
>
> **Estado:** propuesta pendiente de aprobación. **No implementar hasta tener OK del dueño.** Este archivo es discovery; la historia de cambios vive en `git log`.

---

## 1. Contexto y objetivo

### Dónde estamos hoy
- La tienda vende actualmente "regalos y accesorios únicos" (copy del footer).
- Paleta: verde lima `#afde41`, violeta `#6f2eeb`, naranja `#dd592d`, rosa `#fb95ab` — vibra muy **joyería/detalle**.
- Hero con tagline poético ("Tu próxima joya favorita está aquí") y foto rotada 3°.
- Tipografía: GothamSSm (Light/Medium/Bold) — sans-serif geométrica, alineada con moda/belleza más que con tech.
- CTA principal: WhatsApp (consultar). No hay "Comprar" directo.
- Tipografías en mayúsculas + tracking ancho, botones redondeados suaves, gradientes en hero.

### A dónde vamos
- **Nicho**: tecnología, principalmente iPhones.
- **Público**: usuarios de iPhone en Argentina, mayoritariamente mobile (60–70% del tráfico de e-commerce AR es mobile según reportes 2026).
- **Sensación objetivo**: confiable, premium, simple, rápida. Cercana a la experiencia de apple.com/ar — sin ser una copia.

### Por qué importa
La identidad visual actual comunica "regalo/detalle", que no es coherente con "tecnología premium". Renombrar productos sin cambiar el lenguaje visual genera fricción: el usuario llega buscando una experiencia tipo Apple Store y encuentra algo tipo tienda de bijou. El rediseño debe cerrar esa brecha antes de sumar catálogo.

---

## 2. Principios de diseño (basados en Apple HIG)

Apple HIG se sostiene sobre cuatro principios: **Clarity**, **Deference**, **Depth** + **Consistency** como tejido conector. Los adaptamos así:

| Principio | Cómo se aplica a la tienda |
|---|---|
| **Clarity** | Tipografía legible, mucho whitespace, jerarquía clara. Nada compite con el producto. |
| **Deference** | El producto es el protagonista. La UI no decora, acompaña. |
| **Depth** | Capas por elevación (sombras sutiles, no decorativas), transiciones que muestran jerarquía. |
| **Consistency** | Mismos patrones en home, catálogo y detalle. Mismas esquinas, mismos radios, mismos espacios. |

Sumamos dos principios mobile-first 2026:

- **Thumb-friendly**: CTAs y acciones primarias en la mitad inferior en mobile.
- **Sticky & calm**: el CTA de compra queda siempre a mano sin saltos visuales.

---

## 3. Sistema de color

### Tokens actuales (en `src/styles.css`)
```css
--color-brand-primary: #afde41;      /* verde lima */
--color-brand-primary-dark: #92c434;
--color-brand-secondary: #6f2eeb;    /* violeta */
--color-brand-tertiary: #dd592d;     /* naranja */
--color-brand-pink: #fb95ab;
--color-brand-pink-dark: #e84266;
--color-brand-light: #e8e9ea;
--color-brand-dark: #1c1d20;
```

### Propuesta — Paleta "Tech Premium"

La idea es **achicar la paleta a casi monocroma + un único acento**. Apple usa esta misma disciplina: el color aparece en el producto (fotos de los iPhones), no en la UI.

#### Colores primarios
| Token | Hex | Uso |
|---|---|---|
| `--color-ink` | `#1d1d1f` | Texto principal, headings, botones oscuros, footer. Sustituye a `--color-brand-dark` para texto. |
| `--color-canvas` | `#ffffff` | Fondo principal de cards y body. |
| `--color-mist` | `#f5f5f7` | Bandas alternadas (reemplaza el `bg-white` vs `bg-gray-50` actual). Da ritmo sin ruido. |

#### Color de acento (el único cromático)
| Token | Hex | Uso |
|---|---|---|
| `--color-action` | `#0071e3` | Único color de acción en toda la UI. CTAs primarios, links, focus rings, badges de "Top". Apple Blue. |

> **Por qué uno solo**: en el patrón Apple, el acento cromático es *señal de interacción*. Si hay más de un color compitiendo, el ojo no sabe dónde mirar.

#### Neutros (escala de grises)
| Token | Hex | Uso |
|---|---|---|
| `--color-ink-80` | `rgba(29,29,31,0.8)` | Texto secundario, captions. |
| `--color-ink-48` | `rgba(29,29,31,0.48)` | Texto terciario, placeholders, disabled. |
| `--color-hairline` | `#d2d2d7` | Bordes 1px entre cards, separadores suaves. |
| `--color-cool-wash` | `#e8e8ed` | Background de botones hover secundarios, surfaces elevadas suaves. |
| `--color-graphite` | `#424245` | Texto inverse-medium, contraste medio sobre blanco. |

#### Semánticos (estados)
| Token | Hex | Uso |
|---|---|---|
| `--color-success` | `#16a34a` | "Con Stock". Mismo verde que el proyecto ya usa, pero reservado a éxito. |
| `--color-danger` | `#dc2626` | "Sin Stock", errores. |
| `--color-warning` | `#f59e0b` | Pocas unidades, alertas no-bloqueantes. |

#### Lo que **se va**
- `--color-brand-primary` verde lima (muy "jewelry", no comunica tecnología).
- `--color-brand-tertiary` naranja vibrante.
- `--color-brand-pink` y `--color-brand-pink-dark`.
- `--color-brand-secondary` violeta — solo se mantiene si el dueño lo pide para un caso puntual.

> **Decisión pendiente**: si querés conservar el verde lima como acento alternativo (caso "tecnología con onda"), lo agregamos como `--color-fresh` opcional. Recomendación: **no**. Mejor un solo acento.

#### Dark mode
Apple activa dark mode con semantic colors. Como ya hay un `.dark` en `styles.css`, mantenemos el switch.
- `--color-ink` se invierte a blanco `#f5f5f7`.
- `--color-canvas` se vuelve `#000000` (negro puro, no gris).
- `--color-mist` se vuelve `#1d1d1f`.
- `--color-action` se aclara a `#2997ff` (Apple Bright Blue) para mantener contraste sobre fondo oscuro.

---

## 4. Tipografía

### Fuente actual vs propuesta

| Actual | Propuesta |
|---|---|
| GothamSSm Light/Medium/Bold (3 archivos) | **Quedarse con Gotham** por costo (ya están las `@font-face` instaladas). Sumar Regular (400) si no está. |

> **Decisión pendiente**: si en el futuro querés alinear más con Apple, el reemplazo natural sería **Inter** (mless/geométrica, open source, peso de 300 a 900, soporte completo de dark/light, mejor que Gotham para pantallas chicas). Hoy, Gotham ya cumple. No romper lo que funciona.

### Escala tipográfica (alineada a HIG)

Mapeo de los estilos iOS a rem (asumiendo 16px base, 1rem = 16px):

| Estilo Apple | Tamaño | Peso | Line-height | Tracking | Uso en la tienda |
|---|---|---|---|---|---|
| Large Title | `2.5rem` (40px) | 600 | 1.10 | `-0.01em` | Headlines de sección ("Nuestros productos") |
| Title 1 | `2rem` (32px) | 600 | 1.13 | `-0.01em` | H1 de páginas estáticas |
| Title 2 | `1.5rem` (24px) | 600 | 1.21 | `normal` | H2, nombres de producto en cards |
| Title 3 | `1.25rem` (20px) | 600 | 1.25 | `normal` | H3, precio destacado |
| Body | `1rem` (16px) | 400 | 1.5 | `normal` | Texto corrido, descripciones |
| Callout | `0.9375rem` (15px) | 400 | 1.45 | `normal` | Subtexto de cards |
| Footnote | `0.8125rem` (13px) | 400 | 1.4 | `normal` | Meta, breadcrumbs |
| Caption | `0.75rem` (12px) | 500 | 1.35 | `0.02em` | Labels uppercase, badges |

> **Nota:** en mobile (≤640px) el Large Title baja a `2rem` y Title 1 a `1.5rem`. El resto se queda.

### Reglas de uso
- **Una sola familia** (Gotham). No mezclar sans-serif con serif.
- **2–3 pesos por vista**, máximo. Hoy hay Light/Medium/Bold disponibles.
- **Nunca weights bajo 400** en texto <17px (regla HIG).
- **Tracking negativo** en headlines grandes (`-0.01em` a `-0.02em`). Neutro en body.
- **Uppercase + tracking** SOLO para labels y eyebrows (≤13px), no para headings.

---

## 5. Espaciado y grid

### Sistema 8pt (con subdivisión 4pt)
Apple no lo llama "8pt grid" oficialmente pero su output lo respeta. Lo adoptamos como convención:

```
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
--space-8: 64px;
--space-9: 96px;
```

- **Cards padding interno**: `space-5` (24px) en desktop, `space-4` (16px) en mobile.
- **Gap entre cards en grid**: `space-5` (24px) desktop, `space-4` (16px) mobile.
- **Sección vertical padding**: `space-8` (64px) desktop, `space-7` (48px) mobile.
- **Container max-width**: mantener `1500px` actual pero con side padding `space-5` en lugar del actual `px-8` que se ve exagerado en mobile.

### Radios (esquinas)
| Token | Valor | Uso |
|---|---|---|
| `--radius-pill` | `9999px` | Botones, chips de filtro, badges. |
| `--radius-lg` | `20px` | Cards de producto, modales. |
| `--radius-md` | `12px` | Inputs, thumbnails. |
| `--radius-sm` | `8px` | Badges, tags internos. |

> **Decisión**: hoy la tienda usa `rounded-2xl` (16px) y `rounded-xl` (12px) mezclados con `rounded-3xl` (24px) en algunos lugares. Unificamos a 20px para cards (más cercano al iOS) y pill para botones.

---

## 6. Componentes clave

### Botones
- **Primario** (Apple style): fondo `--color-action`, texto blanco, radius `--radius-pill`, padding `12px 24px`, font-size 16px/600, tracking `-0.01em`.
- **Secundario**: fondo `--color-cool-wash`, texto `--color-ink`, mismo radius y padding.
- **Terciario (link)**: sin background, texto `--color-action`, underline en hover.
- **Tap target**: mínimo `44×44px` (regla HIG).
- **Estado hover**: sutil oscurecimiento (5%) + lift `translateY(-1px)`. Nada de escala 1.05 que se ve "juguetón".
- **Estado focus**: outline 2px `--color-action`, offset 2px.

### Cards de producto
- Aspect ratio de imagen: **1:1** (consistente en todo el grid, mismo que la propuesta mobile-first).
- Fondo: `--color-canvas`, borde 1px `--color-hairline`, radius `--radius-lg`.
- Padding interno: `space-5`.
- Hover desktop: lift 2px + sombra suave `0 8px 24px rgba(0,0,0,0.06)`. Sin rotación (la tienda actual rota cards, eso es vibra "regalo", no "tech").
- Toda la card es clickeable (no solo el botón).
- Estructura visual:
  ```
  ┌──────────────────────┐
  │                      │
  │   Imagen 1:1         │
  │   [badge top-left]   │
  │                      │
  ├──────────────────────┤
  │ Nombre producto      │  ← 14-16px, máx 2 líneas
  │ Capacidad / Color    │  ← 13px, --color-ink-80
  │ $ 1.299.999          │  ← 18px, 600
  │ ~~$ 1.499.999~~      │  ← 13px, tachado
  │ [Consultar →]        │  ← siempre visible, no solo hover
  └──────────────────────┘
  ```

### Badges
- **Top-left** de la imagen (regla mobile-first).
- **Máximo 1 badge** por card.
- Tipos:
  - `NUEVO` — fondo `--color-ink`, texto blanco.
  - `-15% OFF` — fondo `--color-danger`, texto blanco.
  - `TOP` — fondo `--color-action`, texto blanco.
  - `ÚLTIMAS UNIDADES` — fondo `--color-warning`, texto `--color-ink`.
- Tamaño: 11px uppercase, tracking `0.05em`, padding `4px 10px`, radius pill.

### Inputs / Search
- Border 1px `--color-hairline`, radius `--radius-md` (12px).
- Padding `12px 16px`, font-size 16px (mínimo mobile-safe).
- Focus: border `--color-action`, no box-shadow gigante (el actual es muy Google-Material).

### Variant pickers (color/capacidad) — NUEVO
Patrón Apple clásico para iPhones. No existe en la tienda hoy, hay que sumarlo a la ficha de producto:
- **Color**: círculos de 28px con el nombre del color abajo, borde activo = 2px `--color-action`.
- **Capacidad**: pills con el storage, fondo `--color-cool-wash` inactivo, fondo `--color-ink` activo.
- Ambos con etiqueta arriba en uppercase.

---

## 7. Página por página

### 7.1 Home
**Patrón Apple**: hero con producto edge-to-edge, mensaje corto, CTA claro.

```
┌────────────────────────────────────────────────────────┐
│  [Nav sticky transparente → sólido al scroll]          │
├────────────────────────────────────────────────────────┤
│                                                        │
│             [Imagen iPhone edge-to-edge                │
│              sobre fondo ink o canvas]                 │
│                                                        │
│           iPhone 17 Pro                                │
│           Titanio. Tan resistente                       │
│           como ligero.                                 │
│                                                        │
│           [Comprar →] [Ver detalles]                   │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Categorías (chips horizontales, no grid de cards)    │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Destacados                          Ver todo →        │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                          │
│  │card│ │card│ │card│ │card│                          │
│  └────┘ └────┘ └────┘ └────┘                          │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Comparador de modelos (tabla estilo Apple)            │
│  iPhone 17 | 17 Air | 17 Pro | 17 Pro Max             │
│                                                        │
├────────────────────────────────────────────────────────┤
│  Trust band (sin gradiente, solo íconos + texto)       │
└────────────────────────────────────────────────────────┘
```

**Cambios concretos:**
- Eliminar el tagline poético actual. Reemplazar por: nombre del producto + tagline de una línea + 2 CTAs (Comprar primario, Ver detalles secundario).
- Quitar la rotación `lg:rotate-3` de la imagen del hero. iPhones se ven derecho.
- Reemplazar el "50k+ Clientes / 100% Seguro / 24h Entrega" por una fila más sobria: "Envío gratis +50k ARS · Garantía oficial · 12 cuotas sin interés".
- Eliminar el badge animado `animate-bounce` "Oferta/Top". Los badges van en las cards.

### 7.2 Catálogo
**Patrón mobile-first 2026**:
- **Mobile (≤768px)**: grid de **2 columnas**. Cada card ~170px en iPhone SE. Hero image de card a 1:1.
- **Tablet (768–1024px)**: grid de 3 columnas.
- **Desktop (≥1024px)**: grid de 4 columnas.
- **Filtros**: chips horizontales (no sidebar en desktop). Chips arriba, scrollables horizontalmente en mobile.
- **Búsqueda**: input grande en la parte superior (hoy ya está, mantener).
- **Sort**: dropdown a la derecha del header de catálogo (no hay hoy).

### 7.3 Detalle de producto (ficha)
**Patrón Apple**: lead with the object, defer the spec.

```
┌────────────────────────────────────────────────────────┐
│  Breadcrumb: Tienda / iPhone / iPhone 17 Pro          │
├──────────────────────┬─────────────────────────────────┤
│                      │  iPhone 17 Pro                  │
│                      │  Titanio.                       │
│  [Galería            │                                  │
│   1 imagen grande    │  $ 1.299.999                    │
│   + thumbnails]      │  12 cuotas de $ 108.333 sin int. │
│                      │                                  │
│                      │  Color: [○][○][○][○]            │
│                      │  Capacidad: [128][256][512][1T] │
│                      │                                  │
│                      │  ────────────                    │
│                      │  Descripción (3 líneas, "Ver más") │
│                      │                                  │
│                      │  • Garantía oficial Apple        │
│                      │  • Retiro en sucursal            │
│                      │  • Envío gratis +$50.000        │
│                      │                                  │
│                      │  [Consultar por WhatsApp] (sticky mobile) │
└──────────────────────┴─────────────────────────────────┘

  ─── También te puede gustar ─── (4 cards)
```

**Cambios concretos respecto al actual:**
- Layout mobile: imagen **arriba** (60% del alto), info debajo. Hoy está mezclado y la info se ve chica en mobile.
- Agregar variant pickers (color/capacidad) como spec de iPhone. Sin esto, una tienda de iPhones no comunica "vendemos iPhones".
- "Consultar por WhatsApp" pasa a sticky bottom-bar en mobile (hoy está al final del bloque, hay que scrollear).
- Cuotas: agregar "12 cuotas sin interés" debajo del precio (regla de oro en AR e-commerce).
- "Retirar en Tienda" card: mover más cerca del CTA principal, no enterrado.

### 7.4 Header
- Sticky, fondo `--color-canvas` con backdrop-blur al hacer scroll (similar al efecto de apple.com).
- Logo + 3 links (Inicio, Catálogo, Sobre nosotros) + search icon + cart icon.
- En mobile: hamburger (ya existe) pero con menos items y mejor jerarquía.

### 7.5 Footer
- Fondo `--color-ink`, texto blanco/gris.
- Sin gradientes ni emojis 🎁✨ (vibran "regalos").
- Layout: 4 columnas desktop, stack mobile.
- Copy: cambiar "tienda online especializada en regalos y accesorios únicos" → "tienda online de tecnología en Mendoza".

---

## 8. Microinteracciones y motion

### Reglas generales
- **Duración**: 200ms para hovers, 300–400ms para transitions de layout, 600–800ms para reveals de scroll.
- **Easing**: `cubic-bezier(0.4, 0.0, 0.2, 1)` (estándar de Material, también Apple-like).
- **Hover en cards**: solo lift 2px + sombra. **No scale, no rotación.**
- **Sin `animate-bounce`**: ya hay uno en el hero actual (`animate-bounce duration-[3000ms]`). Eso es vibra "promo de Black Friday", no tech premium.
- **Scroll reveal**: fade-in + translateY(8px) al entrar viewport. Una vez.

### Lo que se quita
- `rotate-3` en hero
- `animate-bounce` en badge
- `hover:scale-105` en botones primarios
- `hover:scale-110` en iconos sociales

---

## 9. Accesibilidad

- **Contraste**: WCAG 2.1 AA mínimo (4.5:1 texto, 3:1 UI). El `--color-action` sobre blanco da 4.69:1 ✓.
- **Tap targets**: 44×44px mínimo en cualquier elemento interactivo.
- **Focus rings**: siempre visibles (`outline: 2px var(--color-action); outline-offset: 2px`).
- **Alt text**: obligatorio en toda imagen de producto (ya está en product-card).
- **Semántica**: `<button>` para acciones, `<a>` para navegación, `<article>` para cards.
- **Reduced motion**: respetar `@media (prefers-reduced-motion: reduce)` para desactivar transiciones.

---

## 10. Lo que se mantiene vs lo que cambia

### Se mantiene (no tocar)
- Estructura Angular standalone.
- Routing público + admin.
- Firebase / Firestore / Storage.
- Localización `es-AR`.
- i18n (locale registrado en `app.config.ts`).
- Auth (recordando que es cliente-hardcodeado y se va a migrar a Firebase Auth).
- Tipografía GothamSSm.
- `app.config.ts`, `app.routes.ts`.

### Cambia (con propuesta)
- Paleta de colores (`styles.css`).
- Copy de hero, footer, about.
- Estructura visual del hero (de "tagline poético" a "producto edge-to-edge").
- Cards de producto (1:1, sin rotación, badges unificados).
- Página de detalle (variant pickers + sticky CTA + cuotas).
- Header (logo search/cart, fondo blur).

### Decisiones pendientes con el dueño
1. **¿Se mantiene Gotham o migramos a Inter?** Recomendación: Gotham ahora, Inter si más adelante hay incomodidad.
2. **¿Se elimina el verde lima completamente o queda como acento opcional?** Recomendación: eliminar.
3. **¿Logo actual se queda o se rediseña?** No toco logos sin pedido explícito.
4. **¿Las páginas legales (terms, privacy, returns) heredan el nuevo look?** Recomendación: sí, todas.

---

## 11. Áreas críticas — NO romper

Recordatorio de AGENTS.md (no se toca en este rediseño):
- `firestore.rules` — restrictivas siempre, ver `docs/deuda-tecnica.md` para pendientes.
- `core/services/auth.service.ts` — modelo cliente-hardcodeado actual, no extender.
- `environments/environment.ts` — nunca commitear.
- `core/firebase/firebase.config.ts` — única instancia de Firebase.
- `docs/cambios.md` sigue siendo "Sin cambios programados." hasta que aprobemos un plan concreto de implementación. **Este doc es discovery, no propuesta commiteable todavía.**

---

## 12. Roadmap sugerido (cuando se apruebe)

### Fase 1 — Sistema base (1 sesión)
- Actualizar `src/styles.css` con la nueva paleta y tokens.
- Crear las variables `--color-*`, `--space-*`, `--radius-*` completas.
- No tocar componentes todavía, solo el sistema.

### Fase 2 — Componentes shared (1–2 sesiones)
- Refactorizar `product-card` al nuevo aspect ratio y layout.
- Refactorizar `header` con backdrop-blur.
- Refactorizar `footer` con nueva paleta y copy.
- Refactorizar `confirm-dialog`, `modal`, `login-modal` para que hereden el nuevo sistema.

### Fase 3 — Páginas (1–2 sesiones)
- `home`: hero nuevo, sección de categorías como chips, destacados.
- `catalog`: filtros como chips, sort dropdown, grid 2-col mobile.
- `product-detail`: variant pickers, sticky CTA, layout mobile-first.
- Páginas estáticas (`about`, `terms`, `privacy`, `returns`): tipografía y paleta unificadas.

### Fase 4 — Detalles finales
- Microinteracciones (hover, focus, scroll reveal).
- Accesibilidad (focus rings, prefers-reduced-motion).
- Verificación con `probar-app` (Claude) o specs vitest.

---

## 13. Referencias

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines) — fuente canónica de principios.
- [Designing for iOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-ios) — ergonomics y display.
- [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) — Dynamic Type, pesos, tracking.
- [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) — safe areas, 60pt/80pt.
- [Apple DESIGN.md (referencia)](https://designmd.fun/apple/design-md) — tokens extraídos de apple.com.
- [Baymard Apple UX Case Study](https://baymard.com/ux-benchmark/case-studies/apple) — patrones de e-commerce.
- [Mobile UX Best Practices 2026 (Ecosire)](https://ecosire.com/blog/mobile-ux-best-practices-ecommerce) — sticky CTA, thumb zones.
- [Apple UX Teardown — Typenorm](https://typenorm.com/articles/apple-ux-teardown) — "lead with the object, defer the spec".

---

> **Próximo paso**: revisar este doc. Si hay OK (o ajustes), bajar a `docs/cambios.md` la propuesta concreta como inbox de implementación y empezar por la Fase 1 (sistema base en `styles.css`).
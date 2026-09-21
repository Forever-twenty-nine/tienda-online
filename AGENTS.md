# AGENTS.md — tienda-online

> Convenciones para IAs y humanos trabajando en este repositorio. **Leer antes de implementar cualquier cambio.**

## Stack

- **Angular 22.1.7** — zoneless, standalone components, sin NgModules.
- **Firebase 12.9** — Firestore + Storage. Sin Cloud Functions deployadas todavía.
- **Tailwind 4** + PostCSS.
- **Vitest 5** para tests (NO Karma/Jasmine).
- **TypeScript ~6.0.3**.
- **Locale `es-AR`** registrado en `app.config.ts`. Moneda: ARS.

## Estructura

```
src/app/
├── core/                  # firebase config, guards, models, services
├── modules/
│   ├── admin/             # dashboard, productos, categorías, contacto, legal, product-form
│   ├── public/            # home, catálogo, detalle, about, terms, privacy, returns
│   ├── components/        # header, footer, product-card
│   └── shared/            # layouts (admin/public), confirm-dialog, modal, login-modal
└── environments/          # environment.ts NO debe estar commiteado (ver .gitignore)
```

- **Rutas públicas** (`/`, `/catalogo`, `/product/:slug`, `/about`, `/terms`, `/privacy`, `/returns`) bajo `PublicLayoutComponent`.
- **Admin** (`/admin/*`) bajo `AdminLayoutComponent` con `AdminGuard`.

## Convenciones de código

- **Standalone components** siempre. Nunca `NgModule`.
- **Signals** sobre RxJS para estado local. `inject()` o `inject(Provider)` en constructores.
- **No agregar Zone.js**: `provideZonelessChangeDetection()` ya está activo.
- **No usar `NgModel`** — usar Reactive Forms o signals.
- **Signal APIs** para `@Input/@Output`: usar `input()`/`input.required()`/`output()`/`model()` (Angular 17.1+). NO usar decoradores `@Input/@Output` ni `new EventEmitter()`.
- **Nuevo control flow** en templates: `@if/@for/@switch/@let`. NO usar directivas estructurales legacy `*ngIf/*ngFor/*ngSwitch`.
- **Una sola instancia de Firebase** en `core/firebase/firebase.config.ts`. No instanciar `initializeApp` en otros lados.
- **Imágenes en Storage**, nunca inline en base64.
- **Lógica de negocio en services**, no en componentes.

## Seguridad (NO ROMPER)

- **`src/environments/environment.ts` NUNCA commiteado**. Verificar `.gitignore` antes de cada commit. Si se commitea por error, rotar la apiKey en Firebase Console inmediatamente.
- **`firestore.rules` siempre restrictivas**. Ver `docs/deuda-tecnica.md` para los pendientes críticos.
- **`AuthService` actual es solo cliente** (`admin/admin123` + flag en `localStorage`). NO extender este modelo: el plan es migrar a Firebase Auth + Cloud Functions. Cualquier PR que sume features admin debe asumir esa migración, no profundizar el cliente.
- **No loggear tokens, passwords, apiKeys ni datos de Firestore** en consola ni en producción.
- **No subir `dist/`, `node_modules/`, `.angular/`** al repo.

## Tests

- Vitest. Specs en `*.spec.ts` al lado del archivo que prueban. Comando: `npm test`.
- NO usar `ng test` legacy (Karma). El builder es `@angular/build:unit-test`.
- **Cuándo agregar spec**: lógica no trivial en services, guards, directivas con comportamiento, componentes con estado interno o interacción compleja.
- **Cuándo NO agregar spec**: componentes puramente presentacionales (templates dumb sin signals/inputs).

## Documentación del proyecto

Toda la doc de proyecto vive en `docs/`:

| Archivo | Qué contiene | Reglas |
|---|---|---|
| `docs/cambios.md` | Inbox de cambios planificados | Vacío = "Sin cambios programados." Borrar al implementar. NO guardar histórico. |
| `docs/deuda-tecnica.md` | Pendientes técnicos / bugs / gaps | Sin items resueltos. Resuelto → borrar; la historia vive en `git log`. |
| `docs/funcionalidades.md` | Comportamiento vigente en lenguaje de producto | Sin nombres de funciones, modelos ni archivos. Si cambia la regla, describir la regla nueva. |
| `docs/testing.md` | Convenciones de tests, mocks, gaps en specs | — |

NO crear `docs/checklist.md` salvo que haya items concretos para verificar.

## Antes de implementar un cambio

1. `git status --short` — si hay cambios sin commitear del dueño sobre el mismo feature, **parar y avisar**. NO implementar encima.
2. Si el cambio toca `firestore.rules`, `core/services/auth.service.ts`, `environments/`, `core/firebase/` o el flujo admin/login, **avisar antes de avanzar** — son áreas críticas.
3. Si el cambio toca features grandes (carrito, pagos, auth real), actualizar `docs/cambios.md` con la propuesta antes de codear, esperar OK, y borrar de `cambios.md` al implementar.
4. Cambios chiquitos (UI copy, comentarios, css): implementar y avisar al final.

## Git

- Branch default: `master`.
- Commits en español, prefijo `tipo: descripción corta` (`feat`, `fix`, `chore`, `refactor`, `docs`, `test`).
- NO pushear a `master` directo — abrir PR o rama.

## Trabajo en paralelo con varias IAs

Este repo puede ser tocado por más de una IA (ej: Mavis y Claude Code) en sesiones distintas o alternadas. **No hay roles rígidos** — cualquiera puede planificar o codear según el caso. La división de abajo es solo la tendencia natural cuando las dos están disponibles; si una está sola, hace lo que pueda y avisa lo que no.

### Capacidades por agente (default, no exclusivo)

| Capacidad | Tendencia natural |
|---|---|
| Editar `docs/` y `AGENTS.md` | Mavis (parte del flujo de implementación) |
| Análisis lógico del código | Claude |
| `probar-app` (Playwright headless con browser embebido) | Claude — es skill de Claude, Mavis no la tiene |
| `vitest` / `npm test` | Mavis (cuando la skill activa lo requiere) |

Si una IA está corriendo una skill que necesita una capacidad específica, **esa IA la ejerce**. No se fragmenta el flujo pidiendo al otro que intervenga a mitad de la skill.

### Protocolo anti-colisión

1. **Antes de tocar archivos**: `git status --short`. Si hay cambios sin commitear sobre el mismo feature, **parar y avisar**. NO implementar encima.
2. **Inbox compartido**: `docs/cambios.md` es el inbox de features planificadas. Cualquier IA puede proponer un cambio ahí (o confirmar con el user en sesión). La otra lo recoge al arrancar.
3. **Estado compartido**: `docs/deuda-tecnica.md` y `git log` son la fuente de verdad sobre pendientes. Cualquiera puede leer y actualizar (resuelto → borrar; nunca "🟢 RESUELTO").
4. **Cierre de ciclo**: cuando una IA termina una unidad de trabajo, deja **commit + docs actualizados** (sacar de `cambios.md`, borrar de `deuda-tecnica.md` si aplica, ajustar `funcionalidades.md` si cambió comportamiento). El siguiente agente arranca con `git status --short` y lee el estado desde ahí.

### Reglas comunes (todas las IAs)

- No extender el `AuthService` hardcodeado ni abrir más `firestore.rules` — son áreas críticas (ver sección Seguridad).
- No persistir screenshots ni artefactos en el repo sin que el user lo pida.
- No asumir que la otra IA está activa. Si un flujo típicamente lo cierra otra (ej: `probar-app` de Claude) y solo Mavis está en sesión, **avisar al user** que esa parte queda pendiente, no simularla.
- Si el user pide algo que normalmente hace la otra IA (ej: pedirle a Mavis que corra `probar-app`), **avisar que esa capacidad no la tiene Mavis** antes de intentarlo.
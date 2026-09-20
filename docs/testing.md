# Testing

Convenciones y gaps de tests del proyecto.

## Stack

- **Vitest 4** como test runner.
- Builder Angular: `@angular/build:unit-test` (NO Karma/Jasmine).
- Specs en `*.spec.ts` al lado del archivo que prueban.
- DOM emulado con `jsdom`.

## Comandos

```bash
npm test
```

## Estado actual

- Specs en repo: solo `app.spec.ts` (smoke test del root component).
- Cobertura efectiva: 0%.

## Cuándo agregar spec

- Lógica no trivial en services (cálculos, transformaciones, validaciones).
- Guards y directivas con comportamiento.
- Componentes con estado interno o interacción compleja.
- Modelos / utilidades puras con funciones.

## Cuándo NO agregar spec

- Componentes puramente presentacionales (templates dumb sin signals, sin inputs reactivos, sin lógica de interacción).
- Wrappers triviales de UI library.

## Gaps conocidos

- **`AuthService`**: la lógica de login (`admin/admin123`) debería cubrirse con un spec que verifique credenciales válidas/inválidas antes de migrar a Firebase Auth.
- **`AdminGuard`**: sin spec.
- **Services de Firestore** (productos, categorías, contacto, legal): sin cobertura.
- **Componentes con formularios** (`product-form`): sin spec de validaciones ni transformaciones.
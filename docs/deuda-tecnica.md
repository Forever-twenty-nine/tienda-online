# Deuda técnica

Pendientes que requieren trabajo fuera del flujo normal o todavía no se implementaron. **Resuelto → borrar; la historia vive en `git log`.**

## 🔴 Crítico — bloquear antes de producción

### `environment.ts` commiteado en repo
- **Problema**: `src/environments/environment.ts` contiene credenciales reales de Firebase (apiKey, projectId `tienda-online-50dda`, etc.) y está trackeado por git.
- **Acción**:
  1. Sacar del repo (`git rm --cached src/environments/environment.ts`).
  2. Agregar `src/environments/environment.ts` al `.gitignore`.
  3. Rotar la apiKey en Firebase Console.
  4. Auditar `.firebase/` y `.firebaserc` por si quedó algo más.

### `firestore.rules` totalmente abiertas
- **Problema**: `match /products/{productId} { allow read, write: if true; }` y catch-all `match /{document=**} { allow read, write: if true; }`.
- **Riesgo**: cualquier usuario lee y escribe toda la DB.
- **Acción**: restringir `products` a lectura pública + escritura con custom claim `admin`; catch-all a `allow read, write: if false;`.

### Auth cliente hardcodeada
- **Problema**: `AuthService` valida `admin/admin123` contra strings en código fuente y persiste un flag en `localStorage`. El `AdminGuard` lee ese flag.
- **Riesgo**: trivial de bypassear; no hay backend que valide.
- **Acción**: migrar a Firebase Auth (email/password o custom claims) + Cloud Function que verifique el claim `admin` antes de operaciones de admin.

## 🟠 Feature gaps

Carrito, pagos, gestión de usuarios reales (separado de admin) y notificaciones están en el roadmap del README pero no iniciados. No son deuda crítica hoy; entran a `docs/cambios.md` cuando se prioricen.

## 🟢 No aplica (referencia)

- **Headers de seguridad** (CSP, clickjacking, MIME): no aplican a una SPA servida por Firebase Hosting sin SSR. Se puede agregar vía `firebase.json` (`headers`) si se decide endurecer.
- **Rate limiting** en login: depende de migrar a Firebase Auth (ver sección arriba). No se puede aplicar al esquema actual.
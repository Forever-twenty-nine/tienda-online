// functions/src/index.ts
//
// Cloud Functions mínimas para Auth real del admin de tienda-online.
//
// Alcance (sesión 2026-09-23):
//   - 1 solo admin (sebastianechazu@gmail.com)
//   - Sin clientes autenticados
//   - Sin recovery / magic link / multi-admin
//
// Endpoints:
//   - grantAdminClaim: callable. El caller debe estar autenticado y su email
//     debe matchear ADMIN_EMAIL. Le setea custom claim { admin: true }.
//     Es idempotente (volver a llamar no rompe nada). El cliente lo llama
//     una vez después del primer signInWithEmailAndPassword para "elevarse"
//     a admin.
//
// Flujo esperado:
//   1. `scripts/create-admin-user.mjs` crea el user en firebase auth (1 sola
//      vez, con email + admin123). Se conecta al emulador de auth.
//   2. El cliente hace signInWithEmailAndPassword. Firebase auth devuelve
//      user + idToken.
//   3. El cliente llama grantAdminClaim. Firebase functions verifica email
//      y setea el claim.
//   4. El cliente relee el token (getIdTokenResult true) y ahora claims.admin
//      === true. firestore.rules acepta los writes.
//
// NOTA: en prod real (no dev), bootstrap de admin debe hacerse manualmente
// desde Firebase Console o con un service account, no desde un script con
// admin SDK contra el emulador.

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

admin.initializeApp();

/** Email preautorizado a tener el claim admin. Singleton. */
const ADMIN_EMAIL = 'sebastianechazu@gmail.com';

/** Custom claim para admin (singleton booleano). */
const ADMIN_CLAIM = { admin: true } as const;

export const grantAdminClaim = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Login required (use signInWithEmailAndPassword first).'
    );
  }

  // El chequeo es por EMAIL preautorizado (no por claim). Eso es lo que
  // rompe el chicken-and-egg del primer bootstrap: el user puede pedir el
  // claim antes de tenerlo. La seguridad recae en (a) que solo este email
  // está preautorizado y (b) que la password del email es robusta.
  const callerEmail = context.auth.token.email as string | undefined;
  if (callerEmail !== ADMIN_EMAIL) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Not authorized to be admin.'
    );
  }

  await admin.auth().setCustomUserClaims(context.auth.uid, ADMIN_CLAIM);
  return { uid: context.auth.uid, claims: ADMIN_CLAIM };
});
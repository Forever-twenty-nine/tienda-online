"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.grantAdminClaim = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
/** Email preautorizado a tener el claim admin. Singleton. */
const ADMIN_EMAIL = 'sebastianechazu@gmail.com';
/** Custom claim para admin (singleton booleano). */
const ADMIN_CLAIM = { admin: true };
exports.grantAdminClaim = functions.https.onCall(async (_data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Login required (use signInWithEmailAndPassword first).');
    }
    // El chequeo es por EMAIL preautorizado (no por claim). Eso es lo que
    // rompe el chicken-and-egg del primer bootstrap: el user puede pedir el
    // claim antes de tenerlo. La seguridad recae en (a) que solo este email
    // está preautorizado y (b) que la password del email es robusta.
    const callerEmail = context.auth.token.email;
    if (callerEmail !== ADMIN_EMAIL) {
        throw new functions.https.HttpsError('permission-denied', 'Not authorized to be admin.');
    }
    await admin.auth().setCustomUserClaims(context.auth.uid, ADMIN_CLAIM);
    return { uid: context.auth.uid, claims: ADMIN_CLAIM };
});
//# sourceMappingURL=index.js.map
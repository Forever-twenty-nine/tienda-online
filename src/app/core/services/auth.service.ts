import { Injectable, signal, computed, inject } from '@angular/core';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
  type User,
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebase/firebase.config';

/**
 * AuthService para el admin de tienda-online (sesión 2026-09-23).
 *
 * Migrado de un modelo hardcoded (`admin/admin123` + localStorage flag) a
 * Firebase Auth + custom claims. **1 solo admin** (no hay clientes autenticados).
 *
 * Flujo esperado:
 *   1. `scripts/create-admin-user.mjs` crea el user en firebase auth (1 vez).
 *   2. El usuario hace login con email + password.
 *   3. AuthService dispara `grantAdminClaim` (Cloud Function) que setea
 *      `{ admin: true }` en el user si su email matchea el preautorizado.
 *      Es idempotente.
 *   4. firestore.rules y storage.rules usan `request.auth.token.admin`
 *      para permitir writes.
 *
 ** Compat con la UI existente: admin.guard y footer usan
 * `isAuthenticated()` (boolean) y `isAdmin()` (boolean), basados en
 * signals reactivos.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<User | null>(null);
  private isAdminSignal = signal(false);

  /** True si hay un user autenticado (signal reactivo). */
  isAuthenticated = computed(() => this.userSignal() !== null);

  /** True si el user tiene el custom claim admin=true (signal reactivo). */
  isAdmin = computed(() => this.isAdminSignal());

  constructor() {
    // onAuthStateChanged dispara cada vez que el user se loguea/desloguea/
    // refresca token. Actualizamos las 2 signals desde acá para que toda
    // la UI sea reactiva.
    onAuthStateChanged(auth, async (user) => {
      this.userSignal.set(user);
      if (user) {
        try {
          const tokenResult = await getIdTokenResult(user);
          this.isAdminSignal.set(tokenResult.claims['admin'] === true);
        } catch {
          this.isAdminSignal.set(false);
        }
      } else {
        this.isAdminSignal.set(false);
      }
    });
  }

  /**
   * Login con email + password. Si el user está autenticado pero aún no
   * tiene el claim admin, dispara `grantAdminClaim` (la Cloud Function
   * verifica email preautorizado antes de aceptarlo).
   *
   * Devuelve true si el login fue exitoso (independiente de si tiene
   * claim admin). Devuelve false si falló el signIn.
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Re-leer claims por si ya estaban seteados
      const tokenResult = await getIdTokenResult(credential.user);
      if (tokenResult.claims['admin'] !== true) {
        // Disparar grantAdminClaim. Si el email no es preautorizado,
        // la function tira `permission-denied`. Eso es OK — fallaría
        // también el claim grant.
        try {
          await httpsCallable(functions, 'grantAdminClaim')({});
          // Forzar refresh de token para obtener el claim nuevo
          await getIdTokenResult(credential.user, true);
          const refreshed = await getIdTokenResult(credential.user);
          this.isAdminSignal.set(refreshed.claims['admin'] === true);
        } catch {
          // No es admin (no tiene el email preautorizado). El login igual
          // fue exitoso pero no es admin.
          this.isAdminSignal.set(false);
        }
      } else {
        this.isAdminSignal.set(true);
      }
      return true;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
    // onAuthStateChanged actualiza las signals a null/false
  }

  /**
   * Compat: admin.guard y footer usan esto para chequear si el user puede
   * acceder a /admin/*. Devuelve true si hay user autenticado Y es admin.
   */
  hasAdminAccess(): boolean {
    return this.isAuthenticated() && this.isAdmin();
  }
}
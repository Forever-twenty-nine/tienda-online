// scripts/create-admin-user.mjs
//
// Crea el primer (y único) usuario admin en Firebase Auth. Idempotente:
// si el user ya existe, no falla — solo loggea y sale.
//
// Email/password vienen de constantes acá. NO son secretos server-side:
// cualquiera con acceso al repo los ve. En dev (emulador) eso está OK.
// En prod real el bootstrap del admin debe hacerse desde Firebase Console
// o invocando la Cloud Function `grantAdminClaim` una vez que el user
// ya exista.
//
// Después de correr este script, el siguiente paso es loguearse en la app
// UNA vez para que la Cloud Function `grantAdminClaim` setee el claim
// `admin: true`. Sin ese claim, firestore.rules (después de endurecerlas)
// rechazará los writes.
//
// Prerrequisito: `firebase emulators:start` corriendo.
// Uso: node scripts/create-admin-user.mjs

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// ---------- 1. Config desde environment.ts ----------
const envPath = fileURLToPath(new URL('../src/environments/environment.ts', import.meta.url));
const envSource = readFileSync(envPath, 'utf-8');
const pick = (key) => {
  const m = envSource.match(new RegExp(`${key}:\\s*"([^"]+)"`));
  if (!m) throw new Error(`No se encontró "${key}" en environment.ts`);
  return m[1];
};

const app = initializeApp({
  apiKey: pick('apiKey'),
  authDomain: pick('authDomain'),
  projectId: pick('projectId'),
  storageBucket: pick('storageBucket'),
  messagingSenderId: pick('messagingSenderId'),
  appId: pick('appId'),
});

const auth = getAuth(app);
try {
  connectAuthEmulator(auth, '127.0.0.1', 9099);
} catch {}

// ---------- 2. Constantes (ver también functions/src/index.ts) ----------
const ADMIN_EMAIL = 'sebastianechazu@gmail.com';
const ADMIN_PASSWORD = 'admin123';

// ---------- 3. Crear / verificar ----------
async function ensureUser() {
  try {
    const credential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log(`✓ Usuario creado: ${credential.user.uid} (${credential.user.email})`);
    return credential.user;
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log(`✓ Usuario ya existe. Verificando login...`);
      const credential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      console.log(`  UID: ${credential.user.uid}`);
      return credential.user;
    }
    throw err;
  }
}

ensureUser()
  .then((user) => {
    console.log(`\nListo. Próximo paso: hacer login en la app con ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}.`);
    console.log(`Eso dispara grantAdminClaim (Cloud Function) que setea el custom claim.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
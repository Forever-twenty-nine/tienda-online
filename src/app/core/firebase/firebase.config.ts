import { InjectionToken } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';
import { environment } from '../../../environments/environment';

const app = initializeApp(environment.firebase);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

// En dev (ng serve), conectar a los emuladores locales en vez del proyecto real.
// Para activarlo: `firebase emulators:start` en otra terminal antes de `ng serve`.
// En producción (`environment.production === true`) estos conectores no se llaman
// y todo va contra Firebase real.
if (!environment.production) {
  try {
    connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  } catch {
    // Si los emuladores no están corriendo, la app intenta el remoto y falla ruidosamente.
    // En consola se verá el error correspondiente; conviene arrancar el emulador antes de `ng serve`.
  }
}

export const FIREBASE_STORAGE = new InjectionToken<FirebaseStorage>('FirebaseStorage');
export const FIREBASE_AUTH = new InjectionToken<Auth>('FirebaseAuth');
export const FIREBASE_FUNCTIONS = new InjectionToken<Functions>('FirebaseFunctions');
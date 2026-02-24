import { InjectionToken } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { environment } from '../../../environments/environment';

const app = initializeApp(environment.firebase);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export const FIREBASE_STORAGE = new InjectionToken<FirebaseStorage>('FirebaseStorage');

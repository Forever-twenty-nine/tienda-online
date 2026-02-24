import { ApplicationConfig,provideZonelessChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-AR';
import { provideAnimations } from '@angular/platform-browser/animations';

import { firestore, storage, FIREBASE_STORAGE } from './core/firebase/firebase.config';
import { Firestore } from 'firebase/firestore';

import { environment } from '../environments/environment';

// Registrar localización argentina
registerLocaleData(localeEs, 'es-AR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideZonelessChangeDetection(),
    provideAnimations(),
    { provide: LOCALE_ID, useValue: 'es-AR' },

    { provide: Firestore, useValue: firestore },
    { provide: FIREBASE_STORAGE, useValue: storage },
  ]
};


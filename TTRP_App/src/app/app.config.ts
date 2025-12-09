import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

const firebaseConfig = {
  apiKey: "AIzaSyBMUBQSkW4H_1iYqm-YZG9T_QDzcQAcyyk",
  authDomain: "cs336-final-project-37a32.firebaseapp.com",
  projectId: "cs336-final-project-37a32",
  storageBucket: "cs336-final-project-37a32.firebasestorage.app",
  messagingSenderId: "640614192588",
  appId: "1:640614192588:web:a9bd68b725c039549df969",
  measurementId: "G-YBN9R0KDJX"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore())
  ]
};

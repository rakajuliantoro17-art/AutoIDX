/**
==========================================================
AURA Trade OS
Firebase Client Configuration
Version : 0.0.2 Alpha
==========================================================
*/

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function validateFirebaseConfig() {
  const required = ["apiKey", "projectId", "appId"] as const;

  for (const key of required) {
    if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
      throw new Error(`Firebase config missing: ${key}`);
    }
  }
}

validateFirebaseConfig();

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };

import admin from 'firebase-admin';
import serviceAccount from '../firebasekey.json';

const serviceAccountTyped = serviceAccount as admin.ServiceAccount;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountTyped),
  });
}

export const db = admin.firestore();

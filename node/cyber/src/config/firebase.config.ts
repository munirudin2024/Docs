import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config menggunakan environment variables dari .env file
// Pastikan file .env sudah dibuat di root project dengan isi:
//
// VITE_FIREBASE_API_KEY=your_api_key
// VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
// VITE_FIREBASE_PROJECT_ID=your_project_id
// VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
// VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
// VITE_FIREBASE_APP_ID=your_app_id
// VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

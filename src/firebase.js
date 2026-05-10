import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhzFdKi8ezUO9BzS19IAIafRix_PXAGtA",
  authDomain: "vox-pi-43fdd.firebaseapp.com",
  projectId: "vox-pi-43fdd",
  storageBucket: "vox-pi-43fdd.firebasestorage.app",
  messagingSenderId: "505070443335",
  appId: "1:505070443335:web:785d69b1705363dbe54a62",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

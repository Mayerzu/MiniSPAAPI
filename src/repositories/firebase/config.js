import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGN63th2n64PVo4YR4rYLokk6cMuTTMq8",
  authDomain: "mini-spa-api-73c60.firebaseapp.com",
  projectId: "mini-spa-api-73c60",
  storageBucket: "mini-spa-api-73c60.firebasestorage.app",
  messagingSenderId: "876555344925",
  appId: "1:876555344925:web:268a3a63a746f84bb03af4",
  measurementId: "G-6K5R2F165Y"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

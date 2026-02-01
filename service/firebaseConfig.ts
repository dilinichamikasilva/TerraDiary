// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";

//@ts-ignore
import { initializeAuth , getReactNativePersistence } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseConfig = {
  apiKey: "AIzaSyCk_qST3oUrYvETaIOVHsSelkq2BJVBxgY",
  authDomain: "terra-diary-2026.firebaseapp.com",
  projectId: "terra-diary-2026",
  storageBucket: "terra-diary-2026.firebasestorage.app",
  messagingSenderId: "818258924002",
  appId: "1:818258924002:web:a4f413ec8f1d77882669bb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app , {
    persistence : getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app)

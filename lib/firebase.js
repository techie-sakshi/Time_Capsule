// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCDSAG29DowUBIgyAb2aRML57QdHpUArd4",
  authDomain: "timecapsule-ebfe6.firebaseapp.com",
  projectId: "timecapsule-ebfe6",
  storageBucket: "timecapsule-ebfe6.firebasestorage.app",
  messagingSenderId: "153322948193",
  appId: "1:153322948193:web:c8413901da03d27a2ccc20"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

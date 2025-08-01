import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDqfVhNPkxiow6KhA2ZOlz14HJW5JWSgX0",
  authDomain: "diversify-item.firebaseapp.com",
  projectId: "diversify-item",
  storageBucket: "diversify-item.firebasestorage.app",
  messagingSenderId: "302751951395",
  appId: "1:302751951395:web:6dc94ee8a044086c1c9f96",
  measurementId: "G-RWBCXDHDQV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

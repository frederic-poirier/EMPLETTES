import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth/web-extension";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUut1TyQ6A6EuPmCsG2DKDmOClLakoizs",
  authDomain: "les-emplettes.firebaseapp.com",
  projectId: "les-emplettes",
  storageBucket: "les-emplettes.firebasestorage.app",
  messagingSenderId: "15777989877",
  appId: "1:15777989877:web:ca337c4dc76fe082d6b1bc",
  measurementId: "G-WH8Z8Z4953"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app)

// firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, browserLocalPersistence, } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native'

const firebaseConfig = {
  apiKey: "AIzaSyC0j22QXZAxyeMDG2RAzIPx6MZUr-M9Ygs",
  authDomain: "glyde-f716b.firebaseapp.com",
  projectId: "glyde-f716b",
  storageBucket: "glyde-f716b.appspot.com",
  messagingSenderId: "375704357328",
  appId: "1:375704357328:web:bb4474f5a54f9cee5b91d5",
  measurementId: "G-T9Q7GY1127",
};

//const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

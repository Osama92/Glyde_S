
// firebaseConfig.ts
import { initializeApp} from "firebase/app";
import { getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  // apiKey: "AIzaSyC0j22QXZAxyeMDG2RAzIPx6MZUr-M9Ygs",
  // authDomain: "glyde-f716b.firebaseapp.com",
  // projectId: "glyde-f716b",
  // storageBucket: "glyde-f716b.appspot.com",
  // messagingSenderId: "375704357328",
  // appId: "1:375704357328:web:bb4474f5a54f9cee5b91d5",
  // measurementId: "G-T9Q7GY1127",
  apiKey: "AIzaSyA99lZ41SQSospNf2tUk6y8tk0gIM62_ss",
  authDomain: "glyde-s-eb857.firebaseapp.com",
  projectId: "glyde-s-eb857",
  storageBucket: "glyde-s-eb857.firebasestorage.app",
  messagingSenderId: "475838273562",
  appId: "1:475838273562:web:eccecca946b7a2899419a3",
  measurementId: "G-LKP8W36XD0"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, ReactNativeAsyncStorage};

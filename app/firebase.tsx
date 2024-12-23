// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth } from "firebase/auth";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyC0j22QXZAxyeMDG2RAzIPx6MZUr-M9Ygs",
//   authDomain: "glyde-f716b.firebaseapp.com",
//   projectId: "glyde-f716b",
//   storageBucket: "glyde-f716b.firebasestorage.app",
//   messagingSenderId: "375704357328",
//   appId: "1:375704357328:web:bb4474f5a54f9cee5b91d5",
//   measurementId: "G-T9Q7GY1127"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// // const analytics = getAnalytics(app);

// export {auth};

// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC0j22QXZAxyeMDG2RAzIPx6MZUr-M9Ygs",
  authDomain: "glyde-f716b.firebaseapp.com",
  projectId: "glyde-f716b",
  storageBucket: "glyde-f716b.firebasestorage.app",
  messagingSenderId: "375704357328",
  appId: "1:375704357328:web:bb4474f5a54f9cee5b91d5",
  measurementId: "G-T9Q7GY1127",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };

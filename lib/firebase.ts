import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCS70EpWTzdUNxz8FigsSS6k8Nwuqbfsvk",
  authDomain: "surveysparrow-542a6.firebaseapp.com",
  projectId: "surveysparrow-542a6",
  storageBucket: "surveysparrow-542a6.firebasestorage.app",
  messagingSenderId: "682338398728",
  appId: "1:682338398728:web:d11a961c76856399ac57bd",
  measurementId: "G-HQ6RHLD9H5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app)



export { auth, db };



// lib/firebase.ts
// import { initializeApp, getApp, getApps } from 'firebase/app'
// import { getAuth } from 'firebase/auth'
// import { getFirestore } from 'firebase/firestore'

// const firebaseConfig = {
//   apiKey: "AIzaSyCS70EpWTzdUNxz8FigsSS6k8Nwuqbfsvk",
//   authDomain: "surveysparrow-542a6.firebaseapp.com",
//   projectId: "surveysparrow-542a6",
//   storageBucket: "surveysparrow-542a6.appspot.com",
//   messagingSenderId: "682338398728",
//   appId: "1:682338398728:web:d11a961c76856399ac57bd",
//   measurementId: "G-HQ6RHLD9H5"
// };
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// export const auth = getAuth(app)


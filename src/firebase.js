import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBcI3284VLKKOl0D3eohBOBpuSRj60JSsE",
  authDomain: "nutmeg-auth.firebaseapp.com" ,
  projectId: "nutmeg-auth",
  storageBucket: "nutmeg-auth.firebasestorage.app",
  messagingSenderId: "158608923807",
  appId:"1:158608923807:web:f462da8fba0ba3455216aa"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
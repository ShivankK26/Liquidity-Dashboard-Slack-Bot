
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBX0Pf_ccCXcm3-nzr52u1CmtEBYn-lGyI",
  authDomain: "telegramapp-38ebb.firebaseapp.com",
  projectId: "telegramapp-38ebb",
  storageBucket: "telegramapp-38ebb.appspot.com",
  messagingSenderId: "51501557017",
  appId: "1:51501557017:web:c2ff4f7613f38ef2d65188",
  measurementId: "G-XB2VNYCE68"
};


const app = initializeApp(firebaseConfig);
export const db =getFirestore(app)
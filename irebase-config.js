import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD5JJzznHpSzMyvocaBFu9QuyeA7OSRHT4",
  authDomain: "bkpsdm-malteng.firebaseapp.com",
  projectId: "bkpsdm-malteng",
  storageBucket: "bkpsdm-malteng.firebasestorage.app",
  messagingSenderId: "82335203567",
  appId: "1:82335203567:web:80da48f1db741e9045db1a",
  measurementId: "G-FLCGL08CTT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, connectAuthEmulator, GoogleAuthProvider, FacebookAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDpsPiI_Wh6rgs0oFe8I5PLkyDeJf0nl9w",
  authDomain: "gizli-kutu.firebaseapp.com",
  projectId: "gizli-kutu",
  storageBucket: "gizli-kutu.firebasestorage.app",
  messagingSenderId: "908944115698",
  appId: "1:908944115698:web:7570c67adfd8c71f268d6b"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Local Emulator Connection
if (location.hostname === "localhost") {
  connectFirestoreEmulator(db, "localhost", 8080);
  // connectAuthEmulator(auth, "http://localhost:9099");
}

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// 🔥 GLOBAL erişim (console ve diğer scriptler için)
window.firebaseApp = app;
window.db = db;
window.firestoreDB = db; // alias for checkout-page.js
window.doc = doc;
window.getDoc = getDoc;
window.setDoc = setDoc;
window.updateDoc = updateDoc;
window.onSnapshot = onSnapshot;

console.log("🔥 Firebase initialized & functions exposed");
window.dispatchEvent(new CustomEvent('GK_FirebaseReady'));

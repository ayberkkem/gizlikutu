import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// 🔥 GLOBAL erişim (console ve diğer scriptler için)
window.firebaseApp = app;
window.firestoreDB = db;

console.log("🔥 Firebase initialized & global ready");

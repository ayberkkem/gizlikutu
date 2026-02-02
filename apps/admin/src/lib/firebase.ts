import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDpsPiI_Wh6rgs0oFe8I5PLkyDeJf0nl9w",
    authDomain: "gizli-kutu.firebaseapp.com",
    projectId: "gizli-kutu",
    storageBucket: "gizli-kutu.firebasestorage.app",
    messagingSenderId: "908944115698",
    appId: "1:908944115698:web:7570c67adfd8c71f268d6b"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to Emulators
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
}

export { app, auth, db, storage };

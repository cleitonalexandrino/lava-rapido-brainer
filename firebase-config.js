// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCteOZMD6J9zgspnFH8yr9OMRgz8Aqi2oo",
  authDomain: "lava-rapido-brainer.firebaseapp.com",
  projectId: "lava-rapido-brainer",
  storageBucket: "lava-rapido-brainer.firebasestorage.app",
  messagingSenderId: "636532209082",
  appId: "1:636532209082:web:d757c70633a2036c7cd983",
  measurementId: "G-MW4BJ0MY97"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBcq2eKJhCR9pnJRfbyoQlQeBDw3dLaMnM",
    authDomain: "capstone-66c71.firebaseapp.com",
    projectId: "capstone-66c71",
    storageBucket: "capstone-66c71.appspot.com",
    messagingSenderId: "870563062414",
    appId: "1:870563062414:web:25762f8ea13c8cfdf79fdf",
    measurementId: "G-7M6ZQ0GJH0"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };

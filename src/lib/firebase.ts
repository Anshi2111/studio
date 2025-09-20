'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'studio-6078214681-8f8e3',
  appId: '1:100160594583:web:920445dfeffac1e8353fd2',
  apiKey: 'AIzaSyDYmLTuwxec6QTSpcapnRzY-MaNTIRkHrg',
  authDomain: 'studio-6078214681-8f8e3.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '100160594583',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

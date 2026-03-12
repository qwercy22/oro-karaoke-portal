import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyB9gOn6-vhSJbZ59pfy02RZhNQx_7H9r-8",
    authDomain: "karaoke-portal-915ce.firebaseapp.com",
    databaseURL: "https://karaoke-portal-915ce-default-rtdb.firebaseio.com",
    projectId: "karaoke-portal-915ce",
    storageBucket: "karaoke-portal-915ce.firebasestorage.app",
    messagingSenderId: "17208561564",
    appId: "1:17208561564:web:6fb648bdab604738cf0259",
    measurementId: "G-P0M9Y4F9HD"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
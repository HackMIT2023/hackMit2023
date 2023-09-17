import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

        const firebaseConfig = {
        apiKey: "AIzaSyD3J0T5aSdNkycQ98CTbrRuA6QvnBB7kL8",
        authDomain: "hackmit-plantplot.firebaseapp.com",
        databaseURL: "https://hackmit-plantplot-default-rtdb.firebaseio.com",
        projectId: "hackmit-plantplot",
        storageBucket: "hackmit-plantplot.appspot.com",
        messagingSenderId: "729085375100",
        appId: "1:729085375100:web:97c4bad48d68891580cff9",
        };

// Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);



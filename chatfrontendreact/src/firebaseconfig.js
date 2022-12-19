import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyBBtVufDD_jC692-LXf59i7VjacB5H2sp8",
    authDomain: "notificationservice-56341.firebaseapp.com",
    projectId: "notificationservice-56341",
    storageBucket: "notificationservice-56341.appspot.com",
    messagingSenderId: "474620682542",
    appId: "1:474620682542:web:9eb1c0549b21c9c7b01abf",
    measurementId: "G-1WGCB3CKQ9"
  };

const app = initializeApp(firebaseConfig);

export default getAuth(app);

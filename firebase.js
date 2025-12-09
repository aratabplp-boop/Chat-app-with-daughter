


// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {

  authDomain: "asako-app.firebaseapp.com",
  projectId: "asako-app",
  storageBucket: "asako-app.firebasestorage.app",
  messagingSenderId: "255389737658",
  appId: "1:255389737658:web:f10918cef5eb9dac545883"
};

// 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 他のモジュールから使えるようにexport
export { db };



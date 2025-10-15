
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDcgdYaerMLGRRXtx4u6GjpJR0T1FbkyjA",
    authDomain: "test-firebase-a3703.firebaseapp.com",
    projectId: "test-firebase-a3703",
    storageBucket: "test-firebase-a3703.appspot.com",
    messagingSenderId: "467112888069",
    appId: "1:467112888069:web:1dcf147bfb91c8dba7596c",
    measurementId: "G-0Y29S95MRY"
 };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  let analytics;
  try {
    // Evita errores de analytics en algunos entornos sin HTTPS o con bloqueadores
    analytics = getAnalytics(app);
  } catch (_) {
    analytics = undefined;
  }
  const db = getFirestore(app);

  export { db, analytics, app };
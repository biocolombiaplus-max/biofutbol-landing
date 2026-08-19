// ── CONFIGURACIÓN DE FIREBASE ──
// Reemplaza estos valores con los de TU proyecto de Firebase.
// Los obtienes en: Firebase Console > Configuración del proyecto > Tus apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGr1nNlrTRm6NTJvu88zNveSY_z5zG9zQ",
  authDomain: "biofutbol-9f7c1.firebaseapp.com",
  projectId: "biofutbol-9f7c1",
  storageBucket: "biofutbol-9f7c1.firebasestorage.app",
  messagingSenderId: "32468508546",
  appId: "1:32468508546:web:c71f4960b6402fa04e799b"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ── CONFIGURACIÓN DE EMAILJS (opcional, para enviar el contrato por correo) ──
// Crea una cuenta gratis en https://www.emailjs.com y reemplaza estos 3 valores.
// Si los dejas así, el botón de "Enviar por correo" te avisará que falta configurarlo.
const EMAILJS_PUBLIC_KEY = "TU_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "TU_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "TU_TEMPLATE_ID";

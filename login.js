import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBWSoHAtgDJGuweTfHsCiQDMUcaR3WaPZs",
  authDomain: "operacao-codigo21.firebaseapp.com",
  projectId: "operacao-codigo21",
  storageBucket: "operacao-codigo21.appspot.com",
  messagingSenderId: "778213919692",
  appId: "1:778213919692:web:b2eb6a14d4846f5b14ab69"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Lógica de login ao clicar no botão "Entrar"
document.querySelector(".btn-left").addEventListener("click", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("error-message");
  if (errorMsg) errorMsg.textContent = "";

  if (!email || !password) {
    if (errorMsg) errorMsg.textContent = "Por favor, preencha e-mail e senha.";
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("Login bem-sucedido:", userCredential.user.email);
      window.location.href = "home.html";
    })
    .catch((error) => {
      console.error("Erro no login:", error);
      if (errorMsg) {
        errorMsg.textContent = "Erro: " + error.message;
      } else {
        alert("Erro: " + error.message);
      }
    });
});

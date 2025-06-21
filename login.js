import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Configuração Firebase corrigida
const firebaseConfig = {
  apiKey: "AIzaSyBWSoHAtgDJGuweTfHsCiQDMUcaR3WaPZs",
  authDomain: "operacao-codigo21.firebaseapp.com",
  projectId: "operacao-codigo21",
  storageBucket: "operacao-codigo21.appspot.com",  // corrigido aqui
  messagingSenderId: "778213919692",
  appId: "1:778213919692:web:b2eb6a14d4846f5b14ab69"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Evento no formulário de login
document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Limpa mensagem de erro
  const errorMsg = document.getElementById("error-message");
  if (errorMsg) errorMsg.textContent = "";

  // Validações simples (opcional)
  if (!email || !password) {
    if (errorMsg) errorMsg.textContent = "Por favor, preencha e-mail e senha.";
    return;
  }

  // Tenta autenticar
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("Login bem sucedido:", userCredential.user.email);
      // Redireciona para a página home.html
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

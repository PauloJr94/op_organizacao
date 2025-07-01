import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBWSoHAtgDJGuweTfHsCiQDMUcaR3WaPZs",
  authDomain: "operacao-codigo21.firebaseapp.com",
  projectId: "operacao-codigo21",
  storageBucket: "operacao-codigo21.appspot.com",
  messagingSenderId: "778213919692",
  appId: "1:778213919692:web:b2eb6a14d4846f5b14ab69"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Evento de cadastro
document.getElementById('cadastro-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('password').value;
  const confirmarSenha = document.getElementById('confirm-password').value;
  const mensagemErro = document.getElementById('error-message');

  mensagemErro.textContent = '';
  mensagemErro.style.color = 'red';

  if (senha !== confirmarSenha) {
    mensagemErro.textContent = 'As senhas não coincidem.';
    return;
  }

  try {
    // Cria o usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Salva o nome de usuário no Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      nome: username,
      email: email,
      criadoEm: new Date()
    });

    mensagemErro.style.color = 'green';
    mensagemErro.textContent = 'Cadastro realizado com sucesso!';

    // Redirecionar se desejar
    // window.location.href = "home.html";

  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    mensagemErro.textContent = "Erro: " + error.message;
  }
});

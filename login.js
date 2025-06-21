document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // Substitua com sua lógica real de autenticação
  if (username === 'admin' && password === '1234') {
    window.location.href = 'index.html';
  } else {
    document.getElementById('error-message').textContent = 'Usuário ou senha inválidos.';
  }
});

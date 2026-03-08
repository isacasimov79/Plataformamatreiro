# Templates HTML de Exemplo - Plataforma Matreiro

## 1. Template de Certificado - Estilo Clássico

### HTML
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Montserrat', Arial, sans-serif;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="border-decoration"></div>
    
    <div class="header">
      <img src="{{UNDERPROTECTION_LOGO}}" alt="Under Protection" class="logo-left">
      <img src="{{CLIENT_LOGO}}" alt="Cliente" class="logo-right">
    </div>
    
    <div class="content">
      <div class="award-icon">🏆</div>
      <h1>CERTIFICADO DE CONCLUSÃO</h1>
      <p class="subtitle">Outorgamos o presente certificado a</p>
      <h2 class="trainee-name">{{TRAINEE_NAME}}</h2>
      <p class="description">
        Pela conclusão bem-sucedida do treinamento
      </p>
      <h3 class="training-title">{{TRAINING_TITLE}}</h3>
      
      <div class="details">
        <div class="detail-item">
          <span class="label">Data de Conclusão:</span>
          <span class="value">{{COMPLETION_DATE}}</span>
        </div>
        <div class="detail-item">
          <span class="label">Aproveitamento:</span>
          <span class="value">{{SCORE}}%</span>
        </div>
      </div>
      
      <div class="footer-info">
        <p class="certificate-code">Certificado nº {{CERTIFICATE_CODE}}</p>
        <p class="issue-date">Emitido em {{CURRENT_DATE}}</p>
      </div>
    </div>
  </div>
</body>
</html>
```

### CSS
```css
.certificate-container {
  width: 297mm;
  height: 210mm;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  position: relative;
  padding: 40px;
  box-sizing: border-box;
}

.border-decoration {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  border: 3px solid #834a8b;
  border-radius: 10px;
  box-shadow: inset 0 0 0 2px #242545;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.logo-left, .logo-right {
  max-width: 150px;
  max-height: 80px;
  object-fit: contain;
}

.content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.award-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

h1 {
  font-size: 48px;
  font-weight: 700;
  color: #242545;
  margin: 0 0 20px 0;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.subtitle {
  font-size: 18px;
  color: #4a4a4a;
  margin: 0 0 10px 0;
}

.trainee-name {
  font-size: 42px;
  font-weight: 700;
  color: #834a8b;
  margin: 20px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.description {
  font-size: 18px;
  color: #4a4a4a;
  margin: 20px 0 10px 0;
}

.training-title {
  font-size: 28px;
  font-weight: 600;
  color: #242545;
  margin: 10px 0 30px 0;
  line-height: 1.4;
}

.details {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin: 40px 0;
}

.detail-item {
  text-align: center;
}

.label {
  display: block;
  font-size: 14px;
  color: #4a4a4a;
  margin-bottom: 5px;
}

.value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #834a8b;
}

.footer-info {
  margin-top: 40px;
  font-size: 12px;
  color: #4a4a4a;
}

.certificate-code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  margin: 5px 0;
}

.issue-date {
  margin: 5px 0;
}
```

---

## 2. Template de E-mail - Verificação Bancária (Phishing)

### HTML
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="{{CLIENT_LOGO}}" alt="Banco" class="logo">
      <h1>Banco Nacional</h1>
    </div>
    
    <div class="content">
      <h2>Ação Necessária: Verificação de Segurança</h2>
      
      <p>Prezado(a) <strong>{{TARGET_NAME}}</strong>,</p>
      
      <div class="alert-box">
        <span class="alert-icon">⚠️</span>
        <p><strong>Atividade suspeita detectada</strong></p>
      </div>
      
      <p>
        Identificamos uma tentativa de acesso à sua conta bancária a partir de um 
        dispositivo não reconhecido. Por motivos de segurança, bloqueamos 
        temporariamente o acesso à sua conta.
      </p>
      
      <p>
        Para restaurar o acesso completo, é necessário confirmar sua identidade 
        através do nosso sistema de verificação segura.
      </p>
      
      <div class="cta-section">
        <a href="{{PHISHING_LINK}}" class="btn-primary">Verificar Minha Conta Agora</a>
        <p class="urgency-text">⏰ Esta verificação expira em 24 horas</p>
      </div>
      
      <div class="info-box">
        <p><strong>Detalhes da Tentativa de Acesso:</strong></p>
        <ul>
          <li>Data e Hora: 08/03/2026 às 14:35</li>
          <li>Localização: São Paulo, SP</li>
          <li>Dispositivo: Smartphone Android</li>
          <li>IP: 201.76.xxx.xxx</li>
        </ul>
      </div>
      
      <p class="small-text">
        Se você não reconhece esta atividade, recomendamos que altere sua senha 
        imediatamente após a verificação.
      </p>
    </div>
    
    <div class="footer">
      <p>Atenciosamente,<br><strong>Equipe de Segurança - Banco Nacional</strong></p>
      <hr>
      <p class="disclaimer">
        Este é um e-mail automático. Por favor, não responda a esta mensagem.<br>
        Central de Atendimento: 0800 XXX XXXX | contato@banconacional.com.br
      </p>
      <p class="small-text">
        © 2026 Banco Nacional. Todos os direitos reservados.
      </p>
    </div>
  </div>
  {{TRACKING_PIXEL}}
</body>
</html>
```

### CSS
```css
body {
  margin: 0;
  padding: 0;
  font-family: 'Montserrat', Arial, Helvetica, sans-serif;
  background-color: #f4f4f4;
}

.email-container {
  max-width: 600px;
  margin: 20px auto;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header {
  background: linear-gradient(135deg, #003d7a 0%, #005ca8 100%);
  color: #ffffff;
  padding: 30px 20px;
  text-align: center;
}

.logo {
  max-width: 150px;
  height: auto;
  margin-bottom: 15px;
}

.header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.content {
  padding: 30px;
  line-height: 1.6;
  color: #333333;
}

h2 {
  color: #003d7a;
  font-size: 22px;
  margin-top: 0;
  border-bottom: 2px solid #005ca8;
  padding-bottom: 10px;
}

.alert-box {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 15px;
  margin: 20px 0;
  border-radius: 4px;
}

.alert-icon {
  font-size: 24px;
  margin-right: 10px;
}

.alert-box p {
  margin: 0;
  color: #856404;
}

.cta-section {
  text-align: center;
  margin: 30px 0;
}

.btn-primary {
  display: inline-block;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: #ffffff;
  text-decoration: none;
  padding: 15px 40px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #20c997 0%, #28a745 100%);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
  transform: translateY(-2px);
}

.urgency-text {
  color: #dc3545;
  font-weight: 600;
  margin-top: 15px;
  font-size: 14px;
}

.info-box {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  margin: 20px 0;
}

.info-box ul {
  margin: 10px 0;
  padding-left: 20px;
}

.info-box li {
  margin: 5px 0;
  color: #495057;
}

.small-text {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

.footer {
  background-color: #f8f9fa;
  padding: 20px 30px;
  border-top: 1px solid #dee2e6;
}

.footer hr {
  border: 0;
  border-top: 1px solid #dee2e6;
  margin: 15px 0;
}

.disclaimer {
  font-size: 12px;
  color: #6c757d;
  margin: 10px 0;
  line-height: 1.5;
}

p {
  margin: 15px 0;
}

strong {
  color: #003d7a;
}
```

---

## 3. Template de Landing Page - Login Falso Microsoft 365

### HTML
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Microsoft 365 - Entrar</title>
</head>
<body>
  <div class="container">
    <div class="login-box">
      <div class="logo-section">
        <svg class="ms-logo" viewBox="0 0 23 23">
          <rect fill="#f25022" width="11" height="11"/>
          <rect fill="#00a4ef" x="12" width="11" height="11"/>
          <rect fill="#7fba00" y="12" width="11" height="11"/>
          <rect fill="#ffb900" x="12" y="12" width="11" height="11"/>
        </svg>
        <h1>Microsoft</h1>
      </div>
      
      <h2>Entrar</h2>
      
      <form id="login-form">
        <div class="form-group">
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="Email, telefone ou Skype"
            value="{{TARGET_EMAIL}}"
            required
          >
        </div>
        
        <p class="no-account">
          Não tem uma conta? <a href="#">Crie uma!</a>
        </p>
        
        <button type="submit" class="btn-next">Avançar</button>
      </form>
      
      <div class="sign-in-options">
        <a href="#" class="option-link">
          <span class="option-icon">🔐</span>
          Opções de entrada
        </a>
      </div>
    </div>
    
    <div class="footer">
      <a href="#">Termos de uso</a>
      <a href="#">Privacidade e cookies</a>
      <a href="#">...</a>
    </div>
  </div>
</body>
</html>
```

### CSS
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: #1b1b1b;
}

.container {
  max-width: 440px;
  width: 100%;
  padding: 20px;
}

.login-box {
  background: #ffffff;
  padding: 40px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.logo-section {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.ms-logo {
  width: 108px;
  height: 24px;
  margin-right: 10px;
}

.logo-section h1 {
  font-size: 21px;
  font-weight: 600;
  color: #5e5e5e;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1b1b1b;
}

.form-group {
  margin-bottom: 15px;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #8c8c8c;
  font-size: 15px;
  transition: all 0.2s;
}

input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #0078d4;
  border-width: 2px;
}

input[type="email"]:hover,
input[type="password"]:hover {
  border-color: #616161;
}

.no-account {
  font-size: 13px;
  margin: 15px 0 20px 0;
  color: #5e5e5e;
}

.no-account a {
  color: #0067b8;
  text-decoration: none;
}

.no-account a:hover {
  text-decoration: underline;
}

.btn-next {
  background-color: #0067b8;
  color: #ffffff;
  border: none;
  padding: 12px 20px;
  font-size: 15px;
  cursor: pointer;
  width: 100%;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-next:hover {
  background-color: #005a9e;
}

.btn-next:active {
  background-color: #004578;
}

.sign-in-options {
  margin-top: 25px;
  text-align: left;
}

.option-link {
  display: inline-flex;
  align-items: center;
  color: #0067b8;
  text-decoration: none;
  font-size: 13px;
}

.option-link:hover {
  text-decoration: underline;
}

.option-icon {
  margin-right: 8px;
  font-size: 16px;
}

.footer {
  margin-top: 30px;
  text-align: center;
  font-size: 11px;
}

.footer a {
  color: #616161;
  text-decoration: none;
  margin: 0 10px;
}

.footer a:hover {
  text-decoration: underline;
}
```

### JavaScript
```javascript
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  
  // Simular loading
  const button = document.querySelector('.btn-next');
  button.textContent = 'Entrando...';
  button.disabled = true;
  
  // Capturar credenciais (em produção, enviar para backend)
  setTimeout(() => {
    // Criar campo de senha
    const passwordHtml = `
      <div class="form-group" style="animation: fadeIn 0.3s;">
        <input 
          type="password" 
          id="password" 
          name="password" 
          placeholder="Senha"
          required
          autofocus
        >
      </div>
      <p class="forgot-password">
        <a href="#">Esqueceu a senha?</a>
      </p>
    `;
    
    // Substituir o campo de email por um readonly
    document.getElementById('email').setAttribute('readonly', true);
    document.getElementById('email').style.borderColor = '#8c8c8c';
    
    // Adicionar campo de senha
    const formGroup = document.querySelector('.form-group');
    formGroup.insertAdjacentHTML('afterend', passwordHtml);
    
    // Mudar texto do botão
    button.textContent = 'Entrar';
    button.disabled = false;
    
    // Atualizar o submit do formulário
    const form = document.getElementById('login-form');
    form.removeEventListener('submit', arguments.callee);
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const password = document.getElementById('password').value;
      
      button.textContent = 'Verificando...';
      button.disabled = true;
      
      // Enviar dados para tracking
      console.log('Credenciais capturadas:', { email, password });
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = '{{REDIRECT_URL}}';
      }, 2000);
    });
  }, 1000);
});

// Estilo de animação
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .forgot-password {
    font-size: 13px;
    margin: 10px 0 20px 0;
  }
  .forgot-password a {
    color: #0067b8;
    text-decoration: none;
  }
  .forgot-password a:hover {
    text-decoration: underline;
  }
`;
document.head.appendChild(style);
```

---

## 💡 Dicas de Uso

1. **Teste sempre:** Visualize o preview antes de usar em produção
2. **Variáveis dinâmicas:** Sempre use as variáveis entre `{{}}` para substituição automática
3. **Responsividade:** Para e-mails, use tabelas HTML ao invés de divs para melhor compatibilidade
4. **Imagens:** Hospede imagens externamente ou use Base64 para garantir exibição
5. **Segurança:** Sanitize todo HTML em produção para prevenir XSS

## 📚 Recursos Adicionais

- **Testes de E-mail:** Use ferramentas como Litmus ou Email on Acid
- **Validação HTML:** W3C Validator
- **Compatibilidade:** Can I Email (caniemail.com)

---

**Plataforma Matreiro - Under Protection**

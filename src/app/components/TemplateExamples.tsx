// Exemplos de templates HTML completos para uso na plataforma Matreiro

export const emailTemplateExamples = {
  credentialHarvest: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinição de Senha</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #0066cc; padding: 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">{{empresa}}</h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 30px;">
                            <h2 style="color: #333333; margin-top: 0;">Olá, {{primeiro_nome}}!</h2>
                            
                            <p style="color: #666666; line-height: 1.6; font-size: 14px;">
                                Detectamos uma atividade incomum em sua conta de e-mail (<strong>{{email}}</strong>).
                                Por medidas de segurança, solicitamos que você redefina sua senha imediatamente.
                            </p>
                            
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                                <p style="margin: 0; color: #856404; font-size: 13px;">
                                    <strong>⚠️ Atenção:</strong> Sua conta será bloqueada em 24 horas se a senha não for alterada.
                                </p>
                            </div>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{link_phishing}}" style="background-color: #0066cc; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                            Redefinir Senha Agora
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #999999; font-size: 12px; line-height: 1.5;">
                                Se você não solicitou esta alteração, entre em contato imediatamente com o suporte técnico através do ramal 4000.
                            </p>
                            
                            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
                            
                            <p style="color: #666666; font-size: 13px; margin: 0;">
                                Atenciosamente,<br>
                                <strong>Equipe de Segurança da Informação</strong><br>
                                {{empresa}} | {{departamento}}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 11px; color: #999999;">
                            <p style="margin: 5px 0;">Este é um e-mail automático. Não responda.</p>
                            <p style="margin: 5px 0;">{{empresa_endereco}}, {{empresa_cidade}} - {{empresa_estado}}</p>
                            <p style="margin: 5px 0;">Data: {{data_atual}} às {{hora_atual}}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,

  ceoFraud: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitação Urgente</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff;">
        <div style="padding: 20px;">
            <p style="color: #333333; font-size: 14px; line-height: 1.6;">
                {{nome}},
            </p>
            
            <p style="color: #333333; font-size: 14px; line-height: 1.6;">
                Espero que esteja bem. Estou em uma reunião importante e preciso que você faça uma transferência urgente para fechar um negócio estratégico.
            </p>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404; font-size: 13px; font-weight: bold;">
                    🔒 CONFIDENCIAL - NÃO COMPARTILHE
                </p>
            </div>
            
            <p style="color: #333333; font-size: 14px; line-height: 1.6;">
                Preciso que acesse o link abaixo e autorize a transferência de R$ 150.000,00 para nossa nova conta operacional. Os dados bancários estão no portal seguro:
            </p>
            
            <p style="margin: 25px 0;">
                <a href="{{link_phishing}}" style="color: #0066cc; text-decoration: underline; font-size: 14px;">
                    Portal de Autorizações Financeiras
                </a>
            </p>
            
            <p style="color: #333333; font-size: 14px; line-height: 1.6;">
                Use suas credenciais normais ({{email}}) para acessar. É importante que isso seja feito ainda hoje.
            </p>
            
            <p style="color: #333333; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                Obrigado pela agilidade,
            </p>
            
            <p style="color: #333333; font-size: 14px; margin: 5px 0;">
                <strong>Carlos Eduardo Silva</strong><br>
                <span style="color: #666666;">CEO | {{empresa}}</span><br>
                <span style="color: #999999; font-size: 12px;">Enviado do meu iPhone</span>
            </p>
        </div>
    </div>
</body>
</html>`,
};

export const landingPageExamples = {
  credentialHarvest: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinição de Senha - {{empresa}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 450px;
            width: 100%;
            padding: 40px;
        }
        
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo h1 {
            color: #333;
            font-size: 28px;
            margin-bottom: 5px;
        }
        
        .logo p {
            color: #666;
            font-size: 14px;
        }
        
        .alert {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin-bottom: 25px;
            border-radius: 4px;
        }
        
        .alert p {
            color: #856404;
            font-size: 13px;
            line-height: 1.5;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            color: #333;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .submit-btn {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 14px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 10px;
            transition: transform 0.2s;
        }
        
        .submit-btn:hover {
            transform: translateY(-2px);
        }
        
        .footer {
            text-align: center;
            margin-top: 25px;
            color: #999;
            font-size: 12px;
        }
        
        .required {
            color: #dc3545;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>{{empresa}}</h1>
            <p>Portal de Segurança</p>
        </div>
        
        <div class="alert">
            <p><strong>⚠️ Ação Necessária:</strong> Por favor, redefina sua senha para manter sua conta segura.</p>
        </div>
        
        <form id="resetForm" method="POST" action="/capture">
            <div class="form-group">
                <label for="nome">Nome Completo <span class="required">*</span></label>
                <input type="text" id="nome" name="nome" value="{{nome}}" required>
            </div>
            
            <div class="form-group">
                <label for="email">E-mail Corporativo <span class="required">*</span></label>
                <input type="email" id="email" name="email" value="{{email}}" required>
            </div>
            
            <div class="form-group">
                <label for="cpf">CPF</label>
                <input type="text" id="cpf" name="cpf" placeholder="000.000.000-00">
            </div>
            
            <div class="form-group">
                <label for="senha_atual">Senha Atual <span class="required">*</span></label>
                <input type="password" id="senha_atual" name="senha_atual" placeholder="Digite sua senha atual" required>
            </div>
            
            <div class="form-group">
                <label for="senha">Nova Senha <span class="required">*</span></label>
                <input type="password" id="senha" name="senha" placeholder="Mínimo 8 caracteres" required>
            </div>
            
            <div class="form-group">
                <label for="senha_confirmacao">Confirmar Nova Senha <span class="required">*</span></label>
                <input type="password" id="senha_confirmacao" name="senha_confirmacao" placeholder="Digite novamente" required>
            </div>
            
            <button type="submit" class="submit-btn">Redefinir Senha</button>
        </form>
        
        <div class="footer">
            <p>{{empresa}} - Departamento de TI</p>
            <p>{{data_atual}} • Atendimento: {{celular}}</p>
        </div>
    </div>
    
    <script>
        document.getElementById('resetForm').addEventListener('submit', function(e) {
            e.preventDefault();
            // Aqui o backend da Matreiro captura os dados
            alert('Senha redefinida com sucesso! Você será redirecionado.');
            window.location.href = 'https://www.google.com';
        });
    </script>
</body>
</html>`,

  loginPortal: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - {{empresa}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f5f5f5;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .login-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 100%;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 35px;
        }
        
        .header h1 {
            color: #1a73e8;
            font-size: 24px;
            margin-bottom: 8px;
        }
        
        .header p {
            color: #5f6368;
            font-size: 14px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            color: #5f6368;
            font-size: 14px;
            margin-bottom: 6px;
        }
        
        input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #dadce0;
            border-radius: 4px;
            font-size: 14px;
        }
        
        input:focus {
            outline: none;
            border-color: #1a73e8;
        }
        
        .btn-login {
            width: 100%;
            background-color: #1a73e8;
            color: white;
            border: none;
            padding: 12px;
            font-size: 14px;
            font-weight: 500;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }
        
        .btn-login:hover {
            background-color: #1765cc;
        }
        
        .links {
            text-align: center;
            margin-top: 20px;
        }
        
        .links a {
            color: #1a73e8;
            text-decoration: none;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="header">
            <h1>{{empresa}}</h1>
            <p>Faça login na sua conta</p>
        </div>
        
        <form id="loginForm" method="POST" action="/capture">
            <div class="form-group">
                <label for="email">E-mail</label>
                <input type="email" id="email" name="email" value="{{email}}" required>
            </div>
            
            <div class="form-group">
                <label for="senha">Senha</label>
                <input type="password" id="senha" name="senha" required>
            </div>
            
            <button type="submit" class="btn-login">Entrar</button>
        </form>
        
        <div class="links">
            <a href="#">Esqueceu a senha?</a>
        </div>
    </div>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Login realizado com sucesso!');
        });
    </script>
</body>
</html>`,
};

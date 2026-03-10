-- #############################################
-- PLATAFORMA MATREIRO - SEED DATA
-- #############################################
-- Dados iniciais para desenvolvimento e testes
-- Under Protection © 2024-2026
-- #############################################

-- Limpar dados existentes (cuidado em produção!)
-- TRUNCATE TABLE audit_logs, training_completions, trainings, results, targets, 
-- landing_pages, templates, campaigns, azure_integrations, users, tenants CASCADE;

BEGIN;

-- #############################################
-- TENANTS (Organizações)
-- #############################################

INSERT INTO tenants (id, name, slug, domain, is_active, subscription_tier, max_users, max_campaigns, primary_color, secondary_color, contact_email, contact_phone, address_city, address_state, address_country) VALUES
-- Tenant principal (Under Protection)
('11111111-1111-1111-1111-111111111111', 'Under Protection', 'under-protection', 'underprotection.com.br', TRUE, 'enterprise', 1000, 100, '#242545', '#834a8b', 'contato@underprotection.com.br', '+55 11 98765-4321', 'São Paulo', 'SP', 'BR'),

-- Clientes de exemplo
('22222222-2222-2222-2222-222222222222', 'Acme Corporation', 'acme-corp', 'acmecorp.com', TRUE, 'pro', 500, 50, '#242545', '#834a8b', 'security@acmecorp.com', '+55 11 91234-5678', 'São Paulo', 'SP', 'BR'),

('33333333-3333-3333-3333-333333333333', 'TechStart Brasil', 'techstart-br', 'techstart.com.br', TRUE, 'basic', 100, 10, '#242545', '#834a8b', 'admin@techstart.com.br', '+55 21 98888-7777', 'Rio de Janeiro', 'RJ', 'BR'),

('44444444-4444-4444-4444-444444444444', 'Global Finance Inc', 'global-finance', 'globalfinance.com', TRUE, 'enterprise', 2000, 200, '#242545', '#834a8b', 'security@globalfinance.com', '+1 212 555-0100', 'New York', 'NY', 'US'),

-- Sub-tenant (filial)
('55555555-5555-5555-5555-555555555555', 'Acme Corp - Filial Rio', 'acme-corp-rio', NULL, TRUE, 'pro', 100, 20, '#242545', '#834a8b', 'security.rio@acmecorp.com', '+55 21 91111-2222', 'Rio de Janeiro', 'RJ', 'BR');

-- Definir hierarquia (sub-tenant)
UPDATE tenants SET parent_tenant_id = '22222222-2222-2222-2222-222222222222' WHERE id = '55555555-5555-5555-5555-555555555555';

-- #############################################
-- USERS (Usuários)
-- #############################################

INSERT INTO users (id, tenant_id, keycloak_id, email, username, first_name, last_name, role, is_active, is_verified, language, timezone) VALUES
-- Super Admin (Under Protection)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'admin@underprotection.com.br', 'admin', 'Super', 'Admin', 'super_admin', TRUE, TRUE, 'pt-BR', 'America/Sao_Paulo'),

-- Tenant Admins
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'admin@acmecorp.com', 'acme_admin', 'John', 'Smith', 'tenant_admin', TRUE, TRUE, 'en', 'America/New_York'),

('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'admin@techstart.com.br', 'techstart_admin', 'Maria', 'Silva', 'tenant_admin', TRUE, TRUE, 'pt-BR', 'America/Sao_Paulo'),

-- Managers
('10101010-1010-1010-1010-101010101010', '22222222-2222-2222-2222-222222222222', '20202020-2020-2020-2020-202020202020', 'security.manager@acmecorp.com', 'acme_manager', 'Alice', 'Johnson', 'manager', TRUE, TRUE, 'en', 'America/New_York'),

-- Analysts
('30303030-3030-3030-3030-303030303030', '33333333-3333-3333-3333-333333333333', '40404040-4040-4040-4040-404040404040', 'analyst@techstart.com.br', 'techstart_analyst', 'Carlos', 'Santos', 'analyst', TRUE, TRUE, 'pt-BR', 'America/Sao_Paulo'),

-- Regular Users (targets)
('50505050-5050-5050-5050-505050505050', '22222222-2222-2222-2222-222222222222', '60606060-6060-6060-6060-606060606060', 'employee1@acmecorp.com', 'acme_emp1', 'Bob', 'Williams', 'user', TRUE, TRUE, 'en', 'America/New_York'),

('70707070-7070-7070-7070-707070707070', '22222222-2222-2222-2222-222222222222', '80808080-8080-8080-8080-808080808080', 'employee2@acmecorp.com', 'acme_emp2', 'Carol', 'Brown', 'user', TRUE, TRUE, 'en', 'America/New_York');

-- #############################################
-- AZURE INTEGRATIONS
-- #############################################

INSERT INTO azure_integrations (id, tenant_id, azure_tenant_id, azure_client_id, azure_client_secret_encrypted, is_active, auto_sync, sync_frequency, allowed_domains, sync_groups) VALUES
-- Acme Corp Azure AD
('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', 'acme-tenant-id-placeholder', 'acme-client-id-placeholder', 'ENCRYPTED_SECRET_PLACEHOLDER', TRUE, TRUE, 'daily', ARRAY['acmecorp.com', 'acme-corp.com'], ARRAY['Security Team', 'IT Department']),

-- Global Finance Azure AD
('88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', 'global-tenant-id-placeholder', 'global-client-id-placeholder', 'ENCRYPTED_SECRET_PLACEHOLDER', TRUE, FALSE, 'weekly', ARRAY['globalfinance.com'], ARRAY['All Users']);

-- #############################################
-- TEMPLATES (Templates de E-mail)
-- #############################################

INSERT INTO templates (id, tenant_id, created_by, name, description, category, subject, html_content, text_content, is_active, is_public) VALUES
-- Template 1: Microsoft 365 Password Reset
('t1111111-1111-1111-1111-111111111111', NULL, NULL, 'Microsoft 365 - Password Reset', 'Simula e-mail de redefinição de senha do Microsoft 365', 'credential_harvest', 'Reset Your Microsoft 365 Password', 
'<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f2f1; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .button { background-color: #0078d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 2px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1 style="color: #0078d4;">Microsoft 365</h1>
        </div>
        <h2>Password Reset Required</h2>
        <p>Hello {{first_name}},</p>
        <p>We noticed unusual activity on your account. For security reasons, please reset your password within 24 hours.</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{{tracking_link}}" class="button">Reset Password Now</a>
        </p>
        <p>If you did not request this change, please contact your IT department immediately.</p>
        <p>Best regards,<br>Microsoft Security Team</p>
    </div>
</body>
</html>', 
'Password Reset Required - Hello {{first_name}}, please reset your password: {{tracking_link}}', 
TRUE, TRUE),

-- Template 2: Payroll Document
('t2222222-2222-2222-2222-222222222222', NULL, NULL, 'Payroll Document - Urgent', 'Simula e-mail de RH com documento importante', 'phishing', 'URGENT: Your Payroll Document - Action Required', 
'<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Human Resources Department</h2>
    <p>Dear {{first_name}} {{last_name}},</p>
    <p>Your payroll document for this month is ready. Please review and confirm the details by clicking the link below:</p>
    <p><a href="{{tracking_link}}" style="background: #2c5282; color: white; padding: 10px 20px; text-decoration: none;">View Payroll Document</a></p>
    <p>This link will expire in 48 hours.</p>
    <p>HR Department</p>
</body>
</html>', 
'Your payroll document is ready: {{tracking_link}}', 
TRUE, TRUE),

-- Template 3: Package Delivery
('t3333333-3333-3333-3333-333333333333', NULL, NULL, 'Package Delivery Notification', 'Simula notificação de entrega de encomenda', 'spear_phishing', 'Package Delivery Failed - Reschedule Now', 
'<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border: 1px solid #ddd;">
        <h2 style="color: #ff6b00;">Delivery Notice</h2>
        <p>Hello {{first_name}},</p>
        <p>We attempted to deliver your package but no one was available at the address.</p>
        <p><strong>Tracking Number:</strong> BR{{random_number}}BR</p>
        <p>Please reschedule your delivery:</p>
        <p><a href="{{tracking_link}}" style="background: #ff6b00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reschedule Delivery</a></p>
        <p>Delivery Services</p>
    </div>
</body>
</html>', 
'Package delivery failed. Reschedule: {{tracking_link}}', 
TRUE, TRUE);

-- #############################################
-- LANDING PAGES
-- #############################################

INSERT INTO landing_pages (id, tenant_id, created_by, name, description, slug, html_content, page_type, capture_credentials, redirect_url, is_active, is_public) VALUES
-- Landing Page 1: Fake Microsoft Login
('l1111111-1111-1111-1111-111111111111', NULL, NULL, 'Microsoft 365 Login', 'Página de login falsa do Microsoft 365', 'microsoft-365-login', 
'<!DOCTYPE html>
<html>
<head>
    <title>Sign in to your account</title>
    <style>
        body { font-family: "Segoe UI", Tahoma, sans-serif; background: #f3f2f1; margin: 0; padding: 0; }
        .container { max-width: 440px; margin: 100px auto; background: white; padding: 44px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
        .logo { text-align: center; margin-bottom: 20px; font-size: 24px; color: #0078d4; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #8a8886; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #0078d4; color: white; border: none; cursor: pointer; font-size: 15px; }
        button:hover { background: #106ebe; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Microsoft</div>
        <h2>Sign in</h2>
        <form id="loginForm" method="POST">
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Sign in</button>
        </form>
        <p style="text-align: center; margin-top: 20px; font-size: 13px; color: #605e5c;">
            Can''t access your account? Contact IT support
        </p>
    </div>
    <script>
        document.getElementById("loginForm").addEventListener("submit", function(e) {
            e.preventDefault();
            // Data will be captured by the platform
            setTimeout(() => window.location.href = "https://office.com", 1000);
        });
    </script>
</body>
</html>', 
'credential_harvest', TRUE, 'https://office.com', TRUE, TRUE),

-- Landing Page 2: Payroll Portal
('l2222222-2222-2222-2222-222222222222', NULL, NULL, 'Payroll Portal Login', 'Portal falso de folha de pagamento', 'payroll-portal', 
'<!DOCTYPE html>
<html>
<head>
    <title>Payroll Portal</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 0; }
        .container { max-width: 400px; margin: 80px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
        h1 { color: #333; text-align: center; }
        input { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 Payroll Portal</h1>
        <p style="text-align: center; color: #666;">Enter your credentials to view your payroll information</p>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Access Payroll</button>
        </form>
    </div>
</body>
</html>', 
'credential_harvest', TRUE, 'https://example.com/payroll', TRUE, TRUE);

-- #############################################
-- CAMPAIGNS
-- #############################################

INSERT INTO campaigns (id, tenant_id, created_by, name, description, status, start_date, end_date, template_id, landing_page_id, sender_name, sender_email, track_opens, track_clicks, track_submissions) VALUES
-- Campaign 1: Acme Corp - Q1 Security Test
('c1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Q1 2026 Security Awareness Test', 'Teste trimestral de conscientização de segurança', 'completed', '2026-01-15 09:00:00-03', '2026-01-30 18:00:00-03', 't1111111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111', 'Microsoft Security', 'no-reply@microsoft-security.com', TRUE, TRUE, TRUE),

-- Campaign 2: TechStart - Onboarding Test
('c2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'New Employee Phishing Awareness', 'Teste para novos funcionários', 'running', '2026-03-01 08:00:00-03', '2026-03-31 20:00:00-03', 't2222222-2222-2222-2222-222222222222', 'l2222222-2222-2222-2222-222222222222', 'HR Department', 'hr@techstart.com.br', TRUE, TRUE, TRUE),

-- Campaign 3: Acme Corp - Scheduled
('c3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Q2 2026 Advanced Phishing Test', 'Teste avançado de spear phishing', 'scheduled', '2026-04-01 09:00:00-03', '2026-04-15 18:00:00-03', 't3333333-3333-3333-3333-333333333333', 'l1111111-1111-1111-1111-111111111111', 'Delivery Service', 'delivery@shipping-br.com', TRUE, TRUE, TRUE);

-- #############################################
-- TARGETS
-- #############################################

INSERT INTO targets (id, tenant_id, campaign_id, email, first_name, last_name, department, position, source) VALUES
-- Targets for Campaign 1 (Acme Corp)
('tg111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'employee1@acmecorp.com', 'Bob', 'Williams', 'IT', 'Developer', 'manual'),
('tg222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'employee2@acmecorp.com', 'Carol', 'Brown', 'Finance', 'Analyst', 'manual'),
('tg333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'employee3@acmecorp.com', 'David', 'Miller', 'Marketing', 'Manager', 'azure_ad'),
('tg444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'employee4@acmecorp.com', 'Emma', 'Davis', 'HR', 'Specialist', 'azure_ad'),
('tg555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'employee5@acmecorp.com', 'Frank', 'Wilson', 'Operations', 'Coordinator', 'manual'),

-- Targets for Campaign 2 (TechStart)
('tg666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'newuser1@techstart.com.br', 'Ana', 'Costa', 'Engineering', 'Junior Developer', 'manual'),
('tg777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'newuser2@techstart.com.br', 'Bruno', 'Lima', 'Product', 'Product Manager', 'manual'),
('tg888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'newuser3@techstart.com.br', 'Carla', 'Souza', 'Design', 'UX Designer', 'manual');

-- #############################################
-- RESULTS
-- #############################################

INSERT INTO results (campaign_id, target_id, email_sent, email_sent_at, email_opened, email_opened_at, open_count, link_clicked, link_clicked_at, click_count, data_submitted, data_submitted_at, ip_address, user_agent, browser, os, device) VALUES
-- Results for Campaign 1
('c1111111-1111-1111-1111-111111111111', 'tg111111-1111-1111-1111-111111111111', TRUE, '2026-01-15 09:15:00-03', TRUE, '2026-01-15 10:30:00-03', 2, TRUE, '2026-01-15 10:32:00-03', 1, FALSE, NULL, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...', 'Chrome', 'Windows 10', 'Desktop'),

('c1111111-1111-1111-1111-111111111111', 'tg222222-2222-2222-2222-222222222222', TRUE, '2026-01-15 09:15:00-03', TRUE, '2026-01-15 11:45:00-03', 1, TRUE, '2026-01-15 11:47:00-03', 1, TRUE, '2026-01-15 11:48:00-03', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...', 'Safari', 'macOS', 'Desktop'),

('c1111111-1111-1111-1111-111111111111', 'tg333333-3333-3333-3333-333333333333', TRUE, '2026-01-15 09:15:00-03', TRUE, '2026-01-15 14:20:00-03', 3, FALSE, NULL, 0, FALSE, NULL, '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...', 'Safari', 'iOS', 'Mobile'),

('c1111111-1111-1111-1111-111111111111', 'tg444444-4444-4444-4444-444444444444', TRUE, '2026-01-15 09:15:00-03', FALSE, NULL, 0, FALSE, NULL, 0, FALSE, NULL, NULL, NULL, NULL, NULL, NULL),

('c1111111-1111-1111-1111-111111111111', 'tg555555-5555-5555-5555-555555555555', TRUE, '2026-01-15 09:15:00-03', TRUE, '2026-01-16 08:10:00-03', 1, TRUE, '2026-01-16 08:11:00-03', 1, TRUE, '2026-01-16 08:13:00-03', '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...', 'Edge', 'Windows 11', 'Desktop'),

-- Results for Campaign 2
('c2222222-2222-2222-2222-222222222222', 'tg666666-6666-6666-6666-666666666666', TRUE, '2026-03-01 08:30:00-03', TRUE, '2026-03-01 09:15:00-03', 1, TRUE, '2026-03-01 09:16:00-03', 1, FALSE, NULL, '10.0.0.50', 'Mozilla/5.0 (X11; Linux x86_64)...', 'Firefox', 'Linux', 'Desktop'),

('c2222222-2222-2222-2222-222222222222', 'tg777777-7777-7777-7777-777777777777', TRUE, '2026-03-01 08:30:00-03', TRUE, '2026-03-01 13:40:00-03', 2, FALSE, NULL, 0, FALSE, NULL, '10.0.0.51', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...', 'Chrome', 'macOS', 'Desktop'),

('c2222222-2222-2222-2222-222222222222', 'tg888888-8888-8888-8888-888888888888', TRUE, '2026-03-01 08:30:00-03', FALSE, NULL, 0, FALSE, NULL, 0, FALSE, NULL, NULL, NULL, NULL, NULL, NULL);

-- #############################################
-- TRAININGS
-- #############################################

INSERT INTO trainings (id, tenant_id, created_by, title, description, category, content_type, content_url, duration_minutes, has_quiz, passing_score, is_active, is_mandatory) VALUES
-- Training 1: Phishing Basics
('tr111111-1111-1111-1111-111111111111', NULL, NULL, 'Phishing Awareness 101', 'Introdução aos conceitos básicos de phishing e como identificar e-mails maliciosos', 'Phishing Awareness', 'video', 'https://youtube.com/watch?v=example1', 15, TRUE, 70, TRUE, TRUE),

-- Training 2: Password Security
('tr222222-2222-2222-2222-222222222222', NULL, NULL, 'Creating Strong Passwords', 'Aprenda a criar e gerenciar senhas fortes', 'Password Security', 'article', 'https://training.example.com/passwords', 10, TRUE, 80, TRUE, TRUE),

-- Training 3: Social Engineering
('tr333333-3333-3333-3333-333333333333', NULL, NULL, 'Social Engineering Tactics', 'Entenda as táticas de engenharia social usadas por atacantes', 'Social Engineering', 'interactive', 'https://training.example.com/social-eng', 25, TRUE, 75, TRUE, FALSE),

-- Training 4: Email Security (com IA)
('tr444444-4444-4444-4444-444444444444', NULL, NULL, 'Advanced Email Security', 'Segurança avançada de e-mail com validação por IA', 'Email Security', 'video', 'https://youtube.com/watch?v=example2', 20, TRUE, 85, TRUE, FALSE);

-- Configurar AI validation no training 4
UPDATE trainings SET ai_validation = TRUE, ai_model = 'gpt-4' WHERE id = 'tr444444-4444-4444-4444-444444444444';

-- Quiz questions para Training 1
UPDATE trainings SET quiz_questions = '[
    {
        "question": "What is phishing?",
        "options": [
            "A type of fishing technique",
            "A method to steal sensitive information via fake emails",
            "A computer virus",
            "A network protocol"
        ],
        "correct_answer": 1
    },
    {
        "question": "Which of these is a red flag in an email?",
        "options": [
            "Sender address matches the company domain",
            "Grammar and spelling errors",
            "Personalized greeting",
            "Expected attachment"
        ],
        "correct_answer": 1
    },
    {
        "question": "What should you do if you receive a suspicious email?",
        "options": [
            "Click the link to verify",
            "Reply asking for more information",
            "Report it to IT/Security team",
            "Forward it to colleagues"
        ],
        "correct_answer": 2
    }
]'::jsonb WHERE id = 'tr111111-1111-1111-1111-111111111111';

-- #############################################
-- TRAINING COMPLETIONS
-- #############################################

INSERT INTO training_completions (training_id, user_id, status, progress, quiz_score, quiz_attempts, completed_at) VALUES
-- User completed Training 1
('tr111111-1111-1111-1111-111111111111', '50505050-5050-5050-5050-505050505050', 'completed', 100.00, 85.00, 1, '2026-02-10 15:30:00-03'),

-- User in progress Training 2
('tr222222-2222-2222-2222-222222222222', '50505050-5050-5050-5050-505050505050', 'in_progress', 60.00, NULL, 0, NULL),

-- User completed Training 1 with low score
('tr111111-1111-1111-1111-111111111111', '70707070-7070-7070-7070-707070707070', 'completed', 100.00, 65.00, 2, '2026-02-12 10:20:00-03');

-- #############################################
-- KV STORE (Exemplos)
-- #############################################

INSERT INTO kv_store_99a65fc7 (key, value, tenant_id) VALUES
-- Settings gerais
('settings:global', '{"platform_name": "Plataforma Matreiro", "version": "1.0.0", "maintenance_mode": false}', NULL),

-- Configurações do tenant Acme
('settings:tenant:22222222-2222-2222-2222-222222222222', '{"email_signature": "Acme Security Team", "notification_email": "security@acmecorp.com"}', '22222222-2222-2222-2222-222222222222'),

-- Cache de estatísticas
('cache:stats:campaign:c1111111-1111-1111-1111-111111111111', '{"total_sent": 5, "total_opened": 4, "total_clicked": 3, "total_submitted": 2, "last_updated": "2026-03-10T12:00:00Z"}', '22222222-2222-2222-2222-222222222222'),

-- Feature flags
('feature_flags', '{"ai_validation": true, "azure_integration": true, "auto_campaigns": false}', NULL);

-- #############################################
-- AUDIT LOGS (Exemplos)
-- #############################################

INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, description, ip_address) VALUES
-- Login
('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'login', 'user', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'User logged in successfully', '192.168.1.100'),

-- Campaign created
('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'create', 'campaign', 'c1111111-1111-1111-1111-111111111111', 'Created campaign: Q1 2026 Security Awareness Test', '192.168.1.100'),

-- Campaign started
('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'start', 'campaign', 'c1111111-1111-1111-1111-111111111111', 'Started campaign with 5 targets', '192.168.1.100'),

-- Azure sync
('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'sync', 'azure_integration', '99999999-9999-9999-9999-999999999999', 'Synchronized 150 users from Azure AD', '192.168.1.100'),

-- Settings updated
('33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'update', 'tenant', '33333333-3333-3333-3333-333333333333', 'Updated tenant settings', '10.0.0.50');

-- #############################################
-- ATUALIZAR MÉTRICAS DAS CAMPANHAS
-- #############################################

-- Atualizar contadores da Campaign 1
UPDATE campaigns SET 
    total_targets = 5,
    emails_sent = 5,
    emails_opened = 4,
    links_clicked = 3,
    data_submitted = 2,
    open_rate = (4.0 / 5.0) * 100,
    click_rate = (3.0 / 5.0) * 100,
    submission_rate = (2.0 / 5.0) * 100
WHERE id = 'c1111111-1111-1111-1111-111111111111';

-- Atualizar contadores da Campaign 2
UPDATE campaigns SET 
    total_targets = 3,
    emails_sent = 3,
    emails_opened = 2,
    links_clicked = 1,
    data_submitted = 0,
    open_rate = (2.0 / 3.0) * 100,
    click_rate = (1.0 / 3.0) * 100,
    submission_rate = 0.00
WHERE id = 'c2222222-2222-2222-2222-222222222222';

-- #############################################
-- COMMIT
-- #############################################

COMMIT;

-- #############################################
-- VERIFICAÇÃO
-- #############################################

-- Mostrar resumo dos dados inseridos
DO $$
DECLARE
    tenant_count INTEGER;
    user_count INTEGER;
    campaign_count INTEGER;
    target_count INTEGER;
    template_count INTEGER;
    landing_page_count INTEGER;
    training_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tenant_count FROM tenants;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO campaign_count FROM campaigns;
    SELECT COUNT(*) INTO target_count FROM targets;
    SELECT COUNT(*) INTO template_count FROM templates;
    SELECT COUNT(*) INTO landing_page_count FROM landing_pages;
    SELECT COUNT(*) INTO training_count FROM trainings;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '✅ SEED DATA IMPORTADO COM SUCESSO!';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 RESUMO DOS DADOS:';
    RAISE NOTICE '  • Tenants: %', tenant_count;
    RAISE NOTICE '  • Users: %', user_count;
    RAISE NOTICE '  • Campaigns: %', campaign_count;
    RAISE NOTICE '  • Targets: %', target_count;
    RAISE NOTICE '  • Templates: %', template_count;
    RAISE NOTICE '  • Landing Pages: %', landing_page_count;
    RAISE NOTICE '  • Trainings: %', training_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔑 CREDENCIAIS DE TESTE:';
    RAISE NOTICE '  Super Admin:';
    RAISE NOTICE '    Email: admin@underprotection.com.br';
    RAISE NOTICE '    Role: super_admin';
    RAISE NOTICE '';
    RAISE NOTICE '  Tenant Admin (Acme Corp):';
    RAISE NOTICE '    Email: admin@acmecorp.com';
    RAISE NOTICE '    Role: tenant_admin';
    RAISE NOTICE '';
    RAISE NOTICE '  Tenant Admin (TechStart):';
    RAISE NOTICE '    Email: admin@techstart.com.br';
    RAISE NOTICE '    Role: tenant_admin';
    RAISE NOTICE '';
    RAISE NOTICE '🌐 PRÓXIMO PASSO:';
    RAISE NOTICE '  Configure os usuários no Keycloak com os mesmos e-mails';
    RAISE NOTICE '  Acesse: http://localhost:8080';
    RAISE NOTICE '';
    RAISE NOTICE '✅ ========================================';
END $$;

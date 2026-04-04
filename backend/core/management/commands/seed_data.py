"""
Seed command to populate database with sample data.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from tenants.models import Tenant
from campaigns.models import Campaign, Target, TargetGroup
from templates.models import EmailTemplate
from trainings.models import Training
from datetime import datetime, timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with sample data for development'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create Tenant
        tenant, created = Tenant.objects.get_or_create(
            slug='underprotection',
            defaults={
                'name': 'Under Protection',
                'status': 'active',
                'contact_name': 'Igor',
                'contact_email': 'igor@underprotection.com.br',
                'max_users': 100,
                'max_campaigns': 50,
            }
        )
        if created:
            self.stdout.write(f'Created tenant: {tenant.name}')
        else:
            self.stdout.write(f'Tenant already exists: {tenant.name}')

        # Create Superadmin User
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'igor@underprotection.com.br',
                'first_name': 'Igor',
                'last_name': 'Admin',
                'role': 'superadmin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(f'Created admin user: {admin.email}')
        else:
            self.stdout.write(f'User already exists: {admin.email}')

        # Create Tenant Admin
        tenant_admin, created = User.objects.get_or_create(
            username='tenant_admin',
            defaults={
                'email': 'admin@underprotection.com.br',
                'first_name': 'Admin',
                'last_name': 'Tenant',
                'role': 'tenant_admin',
                'tenant': tenant,
            }
        )
        if created:
            tenant_admin.set_password('admin123')
            tenant_admin.save()
            self.stdout.write(f'Created tenant admin: {tenant_admin.email}')

        # Create Email Templates
        templates_data = [
            {
                'name': 'Phishing Test - Credenciais',
                'category': 'credential_harvest',
                'subject': '⚠️ Ação Necessária: Sua Conta Requer Verificação',
                'body_html': '''<html>
<body style="font-family: Arial, sans-serif;">
    <h2>Prezado(a) {{first_name}},</h2>
    <p>Detectamos atividade suspeita em sua conta. Por favor, verify suas credenciais imediatamente.</p>
    <p><a href="http://localhost/phishing/{{campaign_id}}/{{target_id}}">Clique aqui para verificar</a></p>
    <p>Atenciosamente,<br>Equipe de Segurança</p>
</body>
</html>''',
                'body_text': 'Prezado(a) {{first_name}}, Por favor verifique suas credenciais.',
                'is_global': True,
            },
            {
                'name': 'Phishing Test - Link Suspenso',
                'category': 'social_engineering',
                'subject': '📎 Você recebeu um documento compartilhado',
                'body_html': '''<html>
<body style="font-family: Arial, sans-serif;">
    <h2>Olá {{first_name}},</h2>
    <p>Um documento foi compartilhado com você.</p>
    <p><a href="http://localhost/phishing/{{campaign_id}}/{{target_id}}">Abrir documento</a></p>
</body>
</html>''',
                'body_text': 'Olá {{first_name}}, Um documento foi compartilhado com você.',
                'is_global': True,
            },
            {
                'name': 'Phishing Test - Notificação de Segurança',
                'category': 'credential_harvest',
                'subject': '🚨 Alerta de Segurança: Login de Localização Desconhecida',
                'body_html': '''<html>
<body style="font-family: Arial, sans-serif;">
    <h2>Olá {{first_name}},</h2>
    <p>Detectamos um login de localização desconhecida:</p>
    <ul>
        <li>IP: 192.168.1.100</li>
        <li>Localização: Rusia</li>
        <li>Horário: Agora</li>
    </ul>
    <p>Se não foi você, <a href="http://localhost/phishing/{{campaign_id}}/{{target_id}}">clique aqui para bloquear</a>.</p>
</body>
</html>''',
                'body_text': 'Olá {{first_name}}, Detectamos login de localização desconhecida.',
                'is_global': True,
            },
        ]

        for template_data in templates_data:
            template, created = EmailTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults=template_data
            )
            if created:
                self.stdout.write(f'Created template: {template.name}')

        # Create Targets
        targets_data = [
            {'email': 'joao.silva@empresa.com', 'first_name': 'João', 'last_name': 'Silva', 'department': 'TI', 'position': 'Analista'},
            {'email': 'maria.santos@empresa.com', 'first_name': 'Maria', 'last_name': 'Santos', 'department': 'RH', 'position': 'Gerente'},
            {'email': 'pedro.oliveira@empresa.com', 'first_name': 'Pedro', 'last_name': 'Oliveira', 'department': 'Financeiro', 'position': 'Contador'},
            {'email': 'ana.ferreira@empresa.com', 'first_name': 'Ana', 'last_name': 'Ferreira', 'department': 'Marketing', 'position': 'Coordenadora'},
            {'email': 'carlos.souza@empresa.com', 'first_name': 'Carlos', 'last_name': 'Souza', 'department': 'Vendas', 'position': 'Vendedor'},
            {'email': 'fernanda.lima@empresa.com', 'first_name': 'Fernanda', 'last_name': 'Lima', 'department': 'TI', 'position': 'Desenvolvedor'},
            {'email': 'marcos.rodrigues@empresa.com', 'first_name': 'Marcos', 'last_name': 'Rodrigues', 'department': 'Operações', 'position': 'Coordenador'},
            {'email': 'lucia.martins@empresa.com', 'first_name': 'Lúcia', 'last_name': 'Martins', 'department': 'RH', 'position': 'Analista'},
            {'email': 'roberto.costa@empresa.com', 'first_name': 'Roberto', 'last_name': 'Costa', 'department': 'Financeiro', 'position': 'Analista'},
            {'email': 'patricia.andre@empresa.com', 'first_name': 'Patricia', 'last_name': 'André', 'department': 'Marketing', 'position': 'Analista'},
        ]

        created_targets = []
        for target_data in targets_data:
            target, created = Target.objects.get_or_create(
                tenant=tenant,
                email=target_data['email'],
                defaults={
                    **target_data,
                    'source': 'manual',
                    'status': 'active',
                }
            )
            created_targets.append(target)
            if created:
                self.stdout.write(f'Created target: {target.email}')

        # Create Target Group
        group, created = TargetGroup.objects.get_or_create(
            tenant=tenant,
            name='Todos os Funcionários',
            defaults={
                'description': 'Grupo com todos os colaboradores',
                'sync_enabled': False,
            }
        )
        if created:
            group.targets.set(created_targets)
            self.stdout.write(f'Created target group: {group.name}')

        # Create Campaigns
        template = EmailTemplate.objects.filter(name='Phishing Test - Credenciais').first()

        campaigns_data = [
            {
                'name': 'Campanha Phishing Q1 2026',
                'description': 'Teste de phishing do primeiro trimestre',
                'status': 'completed',
                'template': template,
                'start_date': datetime.now() - timedelta(days=30),
                'end_date': datetime.now() - timedelta(days=25),
                'emails_sent': 10,
                'emails_opened': 7,
                'links_clicked': 4,
                'credentials_submitted': 2,
            },
            {
                'name': 'Campanha Phishing Fevereiro',
                'description': 'Teste mensal de conscientização',
                'status': 'completed',
                'template': template,
                'start_date': datetime.now() - timedelta(days=15),
                'end_date': datetime.now() - timedelta(days=10),
                'emails_sent': 10,
                'emails_opened': 8,
                'links_clicked': 5,
                'credentials_submitted': 3,
            },
            {
                'name': 'Campanha Phishing Março',
                'description': 'Nova campanha de teste',
                'status': 'active',
                'template': template,
                'start_date': datetime.now() - timedelta(days=5),
                'emails_sent': 5,
                'emails_opened': 3,
                'links_clicked': 2,
                'credentials_submitted': 1,
            },
        ]

        for campaign_data in campaigns_data:
            campaign, created = Campaign.objects.get_or_create(
                tenant=tenant,
                name=campaign_data['name'],
                defaults={
                    **campaign_data,
                    'created_by': admin,
                }
            )
            if created:
                self.stdout.write(f'Created campaign: {campaign.name}')

        # Create Trainings
        trainings_data = [
            {
                'name': 'Segurança da Informação Básico',
                'description': 'Curso básico de conscientização em segurança',
                'content': '<h1>Módulo 1: Segurança da Informação</h1><p>Bem-vindo ao curso de segurança...</p>',
                'duration_minutes': 30,
                'passing_score': 70,
                'status': 'active',
            },
            {
                'name': 'Phishing: Como Identificar',
                'description': 'Aprenda a identificar emails de phishing',
                'content': '<h1>Módulo 2: Phishing</h1><p>Phishing é uma técnica de engenharia social...</p>',
                'duration_minutes': 45,
                'passing_score': 80,
                'status': 'active',
            },
            {
                'name': 'LGPD e Proteção de Dados',
                'description': 'Curso sobre lei de proteção de dados',
                'content': '<h1>Módulo 3: LGPD</h1><p>A Lei Geral de Proteção de Dados...</p>',
                'duration_minutes': 60,
                'passing_score': 75,
                'status': 'active',
            },
        ]

        for training_data in trainings_data:
            training, created = Training.objects.get_or_create(
                tenant=tenant,
                name=training_data['name'],
                defaults=training_data
            )
            if created:
                self.stdout.write(f'Created training: {training.name}')

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Loader2, Database, CheckCircle2 } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export function MockDataSeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seededData, setSeededData] = useState<string[]>([]);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-99a65fc7`;

  const seedMockData = async () => {
    setIsSeeding(true);
    setSeededData([]);

    try {
      // 1. Template Library - Templates pré-configurados
      toast.info('Criando biblioteca de templates...');
      
      const templatesLibrary = [
        {
          id: 'template-lib-banking-01',
          name: 'Confirmação de Conta Bancária',
          description: 'Simulação de e-mail de banco solicitando confirmação',
          category: 'banking',
          difficulty: 'basic',
          subject: '🔐 Ação Necessária: Confirme sua Conta',
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #242545;">Confirmação de Segurança</h2>
              <p>Olá {{.Nome}},</p>
              <p>Detectamos uma atividade incomum em sua conta. Por motivos de segurança, precisamos que você confirme seus dados.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="{{.TrackingURL}}" style="background: #834a8b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Confirmar Agora</a>
              </p>
              <p style="color: #666; font-size: 12px;">Se você não reconhece esta atividade, ignore este e-mail.</p>
            </div>
          `,
          thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
          uses: 234,
          avgClickRate: 45,
        },
        {
          id: 'template-lib-hr-01',
          name: 'Atualização de RH',
          description: 'E-mail de Recursos Humanos sobre benefícios',
          category: 'hr',
          difficulty: 'intermediate',
          subject: '📋 Atualização Importante: Política de Benefícios',
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #242545;">Recursos Humanos</h2>
              <p>Prezado(a) {{.Nome}},</p>
              <p>A área de Recursos Humanos atualizou a política de benefícios da empresa. É importante que todos os colaboradores revisem as mudanças.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="{{.TrackingURL}}" style="background: #834a8b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Ver Documento</a>
              </p>
              <p>Atenciosamente,<br><strong>Departamento de RH</strong></p>
            </div>
          `,
          thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
          uses: 189,
          avgClickRate: 38,
        },
        {
          id: 'template-lib-it-01',
          name: 'Alerta de Segurança TI',
          description: 'Notificação de TI sobre atualização obrigatória',
          category: 'it',
          difficulty: 'advanced',
          subject: '⚠️ URGENTE: Atualização de Segurança Obrigatória',
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border-left: 4px solid #f44336;">
              <div style="background: #ffebee; padding: 15px;">
                <h2 style="color: #d32f2f; margin: 0;">🔒 Atualização Crítica de Segurança</h2>
              </div>
              <div style="padding: 20px;">
                <p>Olá {{.Nome}},</p>
                <p><strong>A equipe de TI identificou uma vulnerabilidade crítica que requer ação imediata.</strong></p>
                <p>Você tem até <strong>23:59 de hoje</strong> para instalar a atualização de segurança clicando no botão abaixo:</p>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="{{.TrackingURL}}" style="background: #d32f2f; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">INSTALAR ATUALIZAÇÃO</a>
                </p>
                <p style="color: #666; font-size: 11px; border-top: 1px solid #ddd; padding-top: 15px;">
                  Departamento de TI - Segurança da Informação<br>
                  ID do Ticket: #SEC-2026-{{.RandomID}}
                </p>
              </div>
            </div>
          `,
          thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
          uses: 412,
          avgClickRate: 62,
        },
        {
          id: 'template-lib-delivery-01',
          name: 'Notificação de Entrega',
          description: 'Simulação de e-mail de transportadora',
          category: 'delivery',
          difficulty: 'basic',
          subject: '📦 Sua Encomenda Chegou! Confirme o Recebimento',
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #242545; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">📦 Entrega Realizada</h1>
              </div>
              <div style="padding: 20px;">
                <p>Olá {{.Nome}},</p>
                <p>Sua encomenda foi entregue com sucesso em seu endereço!</p>
                <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 5px 0;"><strong>Código de Rastreio:</strong> BR{{.RandomID}}2026</p>
                  <p style="margin: 5px 0;"><strong>Data:</strong> {{.Today}}</p>
                  <p style="margin: 5px 0;"><strong>Status:</strong> ✅ Entregue</p>
                </div>
                <p>Por favor, confirme o recebimento clicando no botão abaixo:</p>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="{{.TrackingURL}}" style="background: #834a8b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Confirmar Recebimento</a>
                </p>
              </div>
            </div>
          `,
          thumbnail: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400',
          uses: 567,
          avgClickRate: 51,
        },
        {
          id: 'template-lib-finance-01',
          name: 'Fatura Vencida',
          description: 'Notificação de fatura com urgência',
          category: 'finance',
          difficulty: 'intermediate',
          subject: '💳 Fatura Vencida - Evite Juros',
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #242545;">Lembrete de Pagamento</h2>
              <p>Prezado(a) {{.Nome}},</p>
              <p>Identificamos que sua fatura do mês anterior ainda não foi paga.</p>
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>⚠️ Valor:</strong> R$ {{.RandomAmount}}</p>
                <p style="margin: 5px 0;"><strong>Vencimento:</strong> {{.PastDate}}</p>
                <p style="margin: 5px 0;"><strong>Juros acumulados:</strong> R$ 45,00</p>
              </div>
              <p>Regularize agora para evitar mais encargos:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="{{.TrackingURL}}" style="background: #834a8b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Pagar Agora</a>
              </p>
            </div>
          `,
          thumbnail: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400',
          uses: 298,
          avgClickRate: 44,
        },
      ];

      for (const template of templatesLibrary) {
        await fetch(`${API_URL}/template-library`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(template),
        });
      }

      setSeededData(prev => [...prev, `✅ ${templatesLibrary.length} templates de biblioteca`]);
      toast.success('Biblioteca de templates criada!');

      // 2. Tracking Events - Eventos para analytics
      toast.info('Criando eventos de tracking...');
      
      const campaigns = ['campaign-1', 'campaign-2', 'campaign-3'];
      const targets = ['user1@example.com', 'user2@example.com', 'user3@example.com'];
      const eventTypes = ['email_sent', 'email_opened', 'link_clicked', 'data_submitted'];
      
      for (let i = 0; i < 50; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        await fetch(`${API_URL}/tracking-events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            campaignId: campaigns[Math.floor(Math.random() * campaigns.length)],
            targetEmail: targets[Math.floor(Math.random() * targets.length)],
            type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
            metadata: { source: 'mock_data' },
            timestamp: date.toISOString(),
          }),
        });
      }

      setSeededData(prev => [...prev, '✅ 50 eventos de tracking']);
      toast.success('Eventos de tracking criados!');

      // 3. Gamification Data - Badges e rankings
      toast.info('Criando dados de gamificação...');
      
      const badges = [
        { userId: 'user-1', badgeId: 'first-campaign', reason: 'Criou sua primeira campanha' },
        { userId: 'user-1', badgeId: 'perfect-month', reason: 'Não clicou em nenhum phishing por 30 dias' },
        { userId: 'user-2', badgeId: 'eagle-eye', reason: 'Reportou 5 tentativas de phishing' },
      ];

      for (const badge of badges) {
        await fetch(`${API_URL}/gamification/award-badge`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(badge),
        });
      }

      setSeededData(prev => [...prev, `✅ ${badges.length} badges atribuídos`]);

      // 4. Notifications - Notificações de teste
      toast.info('Criando notificações...');
      
      const notifications = [
        {
          userId: 'user-1',
          type: 'phishing_alert',
          title: 'Alguém Clicou!',
          message: 'João Silva clicou no link da campanha "Teste Bancário"',
          data: { campaignId: 'campaign-1' },
        },
        {
          userId: 'user-1',
          type: 'success',
          title: 'Campanha Concluída',
          message: 'A campanha "RH Q1 2026" foi concluída com sucesso',
          data: { campaignId: 'campaign-2' },
        },
        {
          userId: 'user-1',
          type: 'info',
          title: 'Novo Template Disponível',
          message: 'Um novo template de phishing foi adicionado à biblioteca',
          data: { templateId: 'template-lib-it-01' },
        },
      ];

      for (const notification of notifications) {
        await fetch(`${API_URL}/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(notification),
        });
      }

      setSeededData(prev => [...prev, `✅ ${notifications.length} notificações`]);

      // 5. Audit Logs - Logs de auditoria
      toast.info('Criando logs de auditoria...');
      
      const auditLogs = [
        {
          userId: 'user-1',
          userName: 'Admin User',
          action: 'create',
          resource: 'campaign',
          resourceId: 'campaign-1',
          details: 'Criou campanha "Teste Banking"',
          ipAddress: '192.168.1.100',
        },
        {
          userId: 'user-1',
          userName: 'Admin User',
          action: 'update',
          resource: 'settings',
          resourceId: 'settings:global',
          details: 'Atualizou configurações SMTP',
          ipAddress: '192.168.1.100',
        },
        {
          userId: 'user-2',
          userName: 'Manager User',
          action: 'export',
          resource: 'report',
          resourceId: 'report-1',
          details: 'Exportou relatório executivo',
          ipAddress: '192.168.1.101',
        },
      ];

      for (const log of auditLogs) {
        await fetch(`${API_URL}/audit-logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(log),
        });
      }

      setSeededData(prev => [...prev, `✅ ${auditLogs.length} logs de auditoria`]);

      // 6. Schedules - Campanhas recorrentes
      toast.info('Criando agendamentos...');
      
      const schedules = [
        {
          tenantId: 'tenant-1',
          name: 'Campanha Mensal RH',
          templateId: 'template-lib-hr-01',
          targetGroupIds: ['group-1'],
          recurrence: 'monthly',
          startDate: '2026-04-01',
          time: '09:00',
          timezone: 'America/Sao_Paulo',
        },
        {
          tenantId: 'tenant-1',
          name: 'Teste Semanal Banking',
          templateId: 'template-lib-banking-01',
          targetGroupIds: ['group-2'],
          recurrence: 'weekly',
          startDate: '2026-03-15',
          time: '14:30',
          timezone: 'America/Sao_Paulo',
        },
      ];

      for (const schedule of schedules) {
        await fetch(`${API_URL}/schedule-recurring`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(schedule),
        });
      }

      setSeededData(prev => [...prev, `✅ ${schedules.length} agendamentos recorrentes`]);

      toast.success('✅ Todos os dados mock foram criados com sucesso!');
      
    } catch (error) {
      console.error('Error seeding mock data:', error);
      toast.error('Erro ao criar dados mock. Veja o console para detalhes.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Mock Data Seeder
        </CardTitle>
        <CardDescription>
          Popula o banco de dados com dados de demonstração para todas as novas funcionalidades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={seedMockData} 
          disabled={isSeeding}
          className="w-full"
          size="lg"
        >
          {isSeeding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando dados mock...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Popular Banco com Dados Mock
            </>
          )}
        </Button>

        {seededData.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Dados Criados:
            </h4>
            <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
              {seededData.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>Nota:</strong> Este botão cria dados de demonstração incluindo:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>5 templates na biblioteca (Banking, RH, TI, Delivery, Finanças)</li>
            <li>50 eventos de tracking para analytics</li>
            <li>Badges e conquistas de gamificação</li>
            <li>Notificações de teste</li>
            <li>Logs de auditoria</li>
            <li>Agendamentos recorrentes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Mock data para desenvolvimento da Plataforma Matreiro

export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'superadmin' | 'admin' | 'user';
  tenantId?: string | null;
  isSuperadmin: boolean;
  roles: string[];
  avatar?: string;
}

export interface Tenant {
  id: string;
  parentId: string | null;
  name: string;
  document: string;
  status: 'active' | 'suspended' | 'inactive';
  createdAt: string;
  autoPhishingConfig?: {
    enabled: boolean;
    delayDays: number; // Dias após cadastro no AD
    templateId: string;
  };
}

export interface Target {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  department: string | null;
  position?: string;
  group?: string;
  status?: 'active' | 'bounced' | 'opted_out';
  source: 'manual' | 'azure_ad' | 'google_workspace';
  createdAt: string;
}

export interface TargetGroup {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  type: 'local' | 'integration';
  source: 'manual' | 'azure_ad' | 'entra_id' | 'office365' | 'google_workspace' | 'nested';
  integrationProvider?: 'Microsoft 365' | 'Google Workspace';
  memberCount: number;
  targetIds: string[]; // IDs dos targets neste grupo
  nestedGroupIds?: string[]; // IDs de outros grupos (para grupos de grupos)
  parentGroupId?: string | null; // Para hierarquia de grupos
  syncEnabled: boolean;
  lastSyncAt: string | null;
  createdAt: string;
}

export interface Template {
  id: string;
  tenantId: string | null;
  name: string;
  subject: string;
  bodyHtml: string;
  hasAttachment: boolean;
  category: string;
  htmlContent?: string;
  landingPageHtml?: string;
  captureFields?: string[];
  attachmentCount?: number;
  landingAttachmentCount?: number;
}

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  templateId: string;
  targetGroupIds: string[]; // Mudado de targetListId para targetGroupIds (array)
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  type: 'standard' | 'welcome_automation';
  scheduledAt: string | null;
  createdBy: string;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    submitted: number;
  };
}

export interface Training {
  id: string;
  tenantId: string | null;
  title: string;
  type: 'video' | 'presentation';
  mediaUrl: string;
  duration: number;
  description: string;
}

export interface Automation {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  trigger: 'new_user_ad' | 'new_user_google' | 'user_added_group' | 'user_removed_group';
  triggerDelay?: number; // dias
  condition: {
    type: 'always' | 'in_group' | 'not_in_group' | 'in_department' | 'custom';
    groupIds?: string[];
    department?: string;
    customLogic?: string;
  };
  campaignTemplateId: string;
  status: 'active' | 'paused';
  executionCount: number;
  lastExecutedAt: string | null;
  createdAt: string;
}

// Usuário Superadmin
export const superadminUser: User = {
  id: 'user-superadmin',
  email: 'igor@underprotection.com.br',
  name: 'Igor - Superadmin',
  tenantId: null,
  isSuperadmin: true,
  roles: ['superadmin'],
};

// Tenants (Clientes)
export const mockTenants: Tenant[] = [
  {
    id: 'tenant-1',
    parentId: null,
    name: 'Banco Nacional S.A.',
    document: '12.345.678/0001-90',
    status: 'active',
    createdAt: '2025-01-15T10:00:00Z',
    autoPhishingConfig: {
      enabled: true,
      delayDays: 30,
      templateId: 'template-1',
    },
  },
  {
    id: 'tenant-2',
    parentId: null,
    name: 'TechCorp Brasil',
    document: '98.765.432/0001-10',
    status: 'active',
    createdAt: '2025-02-20T14:30:00Z',
  },
  {
    id: 'tenant-3',
    parentId: 'tenant-1',
    name: 'Banco Nacional - Filial SP',
    document: '12.345.678/0002-71',
    status: 'active',
    createdAt: '2025-03-01T09:15:00Z',
  },
  {
    id: 'tenant-4',
    parentId: null,
    name: 'Indústria XYZ Ltda',
    document: '11.222.333/0001-44',
    status: 'suspended',
    createdAt: '2024-12-10T16:45:00Z',
  },
];

// Targets (Alvos/Colaboradores)
export const mockTargets: Target[] = [
  {
    id: 'target-1',
    tenantId: 'tenant-1',
    email: 'joao.silva@banconacional.com.br',
    name: 'João Silva',
    department: 'Tecnologia',
    position: 'Analista de Sistemas',
    group: 'TI',
    status: 'active',
    source: 'azure_ad',
    createdAt: '2025-01-16T08:00:00Z',
  },
  {
    id: 'target-2',
    tenantId: 'tenant-1',
    email: 'maria.santos@banconacional.com.br',
    name: 'Maria Santos',
    department: 'Financeiro',
    position: 'Gerente Financeira',
    group: 'Financeiro',
    status: 'active',
    source: 'azure_ad',
    createdAt: '2025-01-16T08:00:00Z',
  },
  {
    id: 'target-3',
    tenantId: 'tenant-1',
    email: 'pedro.oliveira@banconacional.com.br',
    name: 'Pedro Oliveira',
    department: 'RH',
    position: 'Coordenador de RH',
    group: 'RH',
    status: 'bounced',
    source: 'azure_ad',
    createdAt: '2025-01-16T08:00:00Z',
  },
  {
    id: 'target-4',
    tenantId: 'tenant-2',
    email: 'ana.costa@techcorp.com.br',
    name: 'Ana Costa',
    department: 'Engenharia',
    position: 'Engenheira de Software',
    group: 'TI',
    status: 'active',
    source: 'google_workspace',
    createdAt: '2025-02-21T10:30:00Z',
  },
  {
    id: 'target-5',
    tenantId: 'tenant-1',
    email: 'carlos.souza@banconacional.com.br',
    name: 'Carlos Souza',
    department: 'Comercial',
    position: 'Vendedor',
    group: 'Comercial',
    status: 'active',
    source: 'azure_ad',
    createdAt: '2025-01-16T08:00:00Z',
  },
  {
    id: 'target-6',
    tenantId: 'tenant-1',
    email: 'juliana.lima@banconacional.com.br',
    name: 'Juliana Lima',
    department: 'Marketing',
    position: 'Analista de Marketing',
    group: 'Marketing',
    status: 'opted_out',
    source: 'manual',
    createdAt: '2025-01-18T10:00:00Z',
  },
  {
    id: 'target-7',
    tenantId: 'tenant-2',
    email: 'roberto.alves@techcorp.com.br',
    name: 'Roberto Alves',
    department: 'Engenharia',
    position: 'Gerente de Projetos',
    group: 'Diretoria',
    status: 'active',
    source: 'google_workspace',
    createdAt: '2025-02-21T10:30:00Z',
  },
  {
    id: 'target-8',
    tenantId: 'tenant-3',
    email: 'fernanda.rocha@banconacional-sp.com.br',
    name: 'Fernanda Rocha',
    department: 'Operações',
    position: 'Supervisora',
    group: 'Operações',
    status: 'active',
    source: 'azure_ad',
    createdAt: '2025-03-02T09:00:00Z',
  },
];

// Target Groups
export const mockTargetGroups: TargetGroup[] = [
  // Grupos raiz do Banco Nacional
  {
    id: 'target-group-1',
    tenantId: 'tenant-1',
    name: 'Equipe de Tecnologia',
    description: 'Membros da equipe de tecnologia do Banco Nacional',
    type: 'integration',
    source: 'azure_ad',
    integrationProvider: 'Microsoft 365',
    parentGroupId: null,
    memberCount: 45,
    targetIds: ['target-1'],
    syncEnabled: true,
    lastSyncAt: '2026-03-08T09:15:00Z',
    createdAt: '2025-01-16T09:15:00Z',
  },
  {
    id: 'target-group-2',
    tenantId: 'tenant-1',
    name: 'Departamento Financeiro',
    description: 'Colaboradores do setor financeiro',
    type: 'integration',
    source: 'azure_ad',
    integrationProvider: 'Microsoft 365',
    parentGroupId: null,
    memberCount: 32,
    targetIds: ['target-2'],
    syncEnabled: true,
    lastSyncAt: '2026-03-08T09:15:00Z',
    createdAt: '2025-01-16T09:15:00Z',
  },
  {
    id: 'target-group-3',
    tenantId: 'tenant-1',
    name: 'Recursos Humanos',
    description: 'Equipe de RH',
    type: 'integration',
    source: 'azure_ad',
    integrationProvider: 'Microsoft 365',
    parentGroupId: null,
    memberCount: 12,
    targetIds: ['target-3'],
    syncEnabled: true,
    lastSyncAt: '2026-03-08T09:15:00Z',
    createdAt: '2025-01-16T09:15:00Z',
  },
  // Subgrupo de TI
  {
    id: 'target-group-1-1',
    tenantId: 'tenant-1',
    name: 'Desenvolvedores Backend',
    description: 'Time de desenvolvimento backend',
    type: 'integration',
    source: 'azure_ad',
    integrationProvider: 'Microsoft 365',
    parentGroupId: 'target-group-1',
    memberCount: 18,
    targetIds: ['target-1'],
    syncEnabled: true,
    lastSyncAt: '2026-03-08T09:15:00Z',
    createdAt: '2025-01-16T09:15:00Z',
  },
  {
    id: 'target-group-1-2',
    tenantId: 'tenant-1',
    name: 'Desenvolvedores Frontend',
    description: 'Time de desenvolvimento frontend',
    type: 'integration',
    source: 'azure_ad',
    integrationProvider: 'Microsoft 365',
    parentGroupId: 'target-group-1',
    memberCount: 15,
    targetIds: [],
    syncEnabled: true,
    lastSyncAt: '2026-03-08T09:15:00Z',
    createdAt: '2025-01-16T09:15:00Z',
  },
  {
    id: 'target-group-1-3',
    tenantId: 'tenant-1',
    name: 'Infraestrutura e DevOps',
    description: 'Time de infraestrutura',
    type: 'integration',
    source: 'azure_ad',
    integrationProvider: 'Microsoft 365',
    parentGroupId: 'target-group-1',
    memberCount: 12,
    targetIds: [],
    syncEnabled: true,
    lastSyncAt: '2026-03-08T09:15:00Z',
    createdAt: '2025-01-16T09:15:00Z',
  },
  // Subgrupo de Financeiro
  {
    id: 'target-group-2-1',
    tenantId: 'tenant-1',
    name: 'Contas a Pagar',
    description: 'Setor de contas a pagar',
    type: 'integration',
    source: 'azure_ad',
    integrationProvider: 'Microsoft 365',
    parentGroupId: 'target-group-2',
    memberCount: 16,
    targetIds: ['target-2'],
    syncEnabled: true,
    lastSyncAt: '2026-03-08T09:15:00Z',
    createdAt: '2025-01-16T09:15:00Z',
  },
  {
    id: 'target-group-2-2',
    tenantId: 'tenant-1',
    name: 'Contas a Receber',
    description: 'Setor de contas a receber',
    type: 'integration',
    source: 'azure_ad',
    integrationProvider: 'Microsoft 365',
    parentGroupId: 'target-group-2',
    memberCount: 16,
    targetIds: [],
    syncEnabled: true,
    lastSyncAt: '2026-03-08T09:15:00Z',
    createdAt: '2025-01-16T09:15:00Z',
  },
  // Grupos locais (manuais)
  {
    id: 'target-group-4',
    tenantId: 'tenant-1',
    name: 'Executivos C-Level',
    description: 'Lista manual de executivos C-Level',
    type: 'local',
    source: 'manual',
    parentGroupId: null,
    memberCount: 8,
    targetIds: ['target-1', 'target-2'],
    syncEnabled: false,
    lastSyncAt: null,
    createdAt: '2025-02-01T10:00:00Z',
  },
  {
    id: 'target-group-5',
    tenantId: 'tenant-1',
    name: 'Todos os Departamentos',
    description: 'Grupo nested que contém outros grupos',
    type: 'local',
    source: 'nested',
    parentGroupId: null,
    memberCount: 97,
    targetIds: [],
    nestedGroupIds: ['target-group-1', 'target-group-2', 'target-group-3'],
    syncEnabled: false,
    lastSyncAt: null,
    createdAt: '2025-02-15T14:30:00Z',
  },
  {
    id: 'target-group-8',
    tenantId: 'tenant-1',
    name: 'Marketing Digital',
    description: 'Time de marketing digital e mídias sociais',
    type: 'local',
    source: 'manual',
    parentGroupId: null,
    memberCount: 8,
    targetIds: ['target-6'],
    syncEnabled: false,
    lastSyncAt: null,
    createdAt: '2025-02-15T14:30:00Z',
  },
  // Grupos do TechCorp (Google Workspace)
  {
    id: 'target-group-6',
    tenantId: 'tenant-2',
    name: 'Equipe de Engenharia',
    description: 'Membros da equipe de engenharia da TechCorp',
    type: 'integration',
    source: 'google_workspace',
    integrationProvider: 'Google Workspace',
    parentGroupId: null,
    memberCount: 67,
    targetIds: ['target-4', 'target-7'],
    syncEnabled: true,
    lastSyncAt: '2026-03-08T09:15:00Z',
    createdAt: '2025-02-21T09:15:00Z',
  },
  {
    id: 'target-group-7',
    tenantId: 'tenant-2',
    name: 'Marketing e Vendas',
    description: 'Equipes comerciais',
    type: 'integration',
    source: 'google_workspace',
    integrationProvider: 'Google Workspace',
    parentGroupId: null,
    memberCount: 23,
    targetIds: [],
    syncEnabled: true,
    lastSyncAt: '2026-03-08T09:15:00Z',
    createdAt: '2025-02-21T09:15:00Z',
  },
  // Subgrupo de Engenharia TechCorp
  {
    id: 'target-group-6-1',
    tenantId: 'tenant-2',
    name: 'Engenharia de Software',
    description: 'Time de engenharia de software',
    type: 'integration',
    source: 'google_workspace',
    integrationProvider: 'Google Workspace',
    parentGroupId: 'target-group-6',
    memberCount: 42,
    targetIds: ['target-4'],
    syncEnabled: true,
    lastSyncAt: '2026-03-08T09:15:00Z',
    createdAt: '2025-02-21T09:15:00Z',
  },
  {
    id: 'target-group-6-2',
    tenantId: 'tenant-2',
    name: 'Engenharia de Dados',
    description: 'Time de engenharia de dados',
    type: 'integration',
    source: 'google_workspace',
    integrationProvider: 'Google Workspace',
    parentGroupId: 'target-group-6',
    memberCount: 25,
    targetIds: ['target-7'],
    syncEnabled: true,
    lastSyncAt: '2026-03-08T09:15:00Z',
    createdAt: '2025-02-21T09:15:00Z',
  },
];

// Templates
export const mockTemplates: Template[] = [
  {
    id: 'template-1',
    tenantId: null,
    name: 'Atualização Urgente de Senha',
    subject: '[URGENTE] Atualize sua senha corporativa',
    bodyHtml: '<p>Prezado(a) {{nome}},</p><p>Detectamos atividade suspeita em sua conta...</p>',
    hasAttachment: false,
    category: 'credential-harvest',
    htmlContent: '<html><body><p>Prezado(a) {{nome}},</p><p>Detectamos atividade suspeita em sua conta {{email}}. Por favor, clique em {{link_phishing}} para atualizar sua senha.</p></body></html>',
    landingPageHtml: '<html><body><h1>Redefinir Senha</h1><form><input name="email" /><input name="senha" type="password" /></form></body></html>',
    captureFields: ['nome', 'email', 'senha_atual', 'senha'],
    attachmentCount: 0,
    landingAttachmentCount: 0,
  },
  {
    id: 'template-2',
    tenantId: null,
    name: 'Notificação de RH - Benefícios',
    subject: 'Novos benefícios disponíveis para você',
    bodyHtml: '<p>Olá {{nome}},</p><p>Temos novidades sobre seus benefícios...</p>',
    hasAttachment: true,
    category: 'social-engineering',
    htmlContent: '<html><body><p>Olá {{primeiro_nome}},</p><p>Confira seus novos benefícios em {{link_phishing}}.</p></body></html>',
    attachmentCount: 1,
    landingAttachmentCount: 0,
  },
  {
    id: 'template-3',
    tenantId: 'tenant-1',
    name: 'Comunicado Banco Nacional',
    subject: 'Atualização de Política de Segurança',
    bodyHtml: '<p>Caro colaborador,</p><p>Informamos sobre as novas políticas...</p>',
    hasAttachment: false,
    category: 'link',
    htmlContent: '<html><body><p>Caro {{nome}},</p><p>Acesse {{link_phishing}} para conhecer as novas políticas de {{empresa}}.</p></body></html>',
  },
  {
    id: 'template-4',
    tenantId: null,
    name: 'CEO Fraud - Transferência Urgente',
    subject: 'URGENTE: Transferência necessária',
    bodyHtml: '<p>{{nome}},</p><p>Preciso que faça uma transferência...</p>',
    hasAttachment: false,
    category: 'ceo-fraud',
    htmlContent: '<html><body><p>{{nome}},</p><p>Estou em reunião e preciso que autorize uma transferência urgente. Acesse {{link_phishing}} com suas credenciais.</p><p>CEO - {{empresa}}</p></body></html>',
    landingPageHtml: '<html><body><h1>Autorização Financeira</h1><form><input name="email" /><input name="cpf" /><input name="senha" type="password" /><input name="token_2fa" /></form></body></html>',
    captureFields: ['nome', 'email', 'cpf', 'senha', 'token_2fa'],
    attachmentCount: 0,
    landingAttachmentCount: 1,
  },
  {
    id: 'template-5',
    tenantId: null,
    name: 'Atualização Cadastral Completa',
    subject: 'Atualize seus dados cadastrais',
    bodyHtml: '<p>Prezado {{nome}},</p><p>Precisamos atualizar suas informações...</p>',
    hasAttachment: false,
    category: 'credential-harvest',
    htmlContent: '<html><body><p>Prezado(a) {{nome}},</p><p>Atualize seus dados em {{link_phishing}} para continuar acessando os sistemas de {{empresa}}.</p></body></html>',
    landingPageHtml: '<html><body><h1>Atualização Cadastral - {{empresa}}</h1><form><input name="nome" /><input name="email" /><input name="celular" /><input name="cpf" /><input name="rg" /><input name="data_nascimento" type="date" /><input name="senha_atual" type="password" /></form></body></html>',
    captureFields: ['nome', 'email', 'celular', 'cpf', 'rg', 'data_nascimento', 'senha_atual'],
    attachmentCount: 0,
    landingAttachmentCount: 2,
  },
];

// Campanhas
export const mockCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    tenantId: 'tenant-1',
    name: 'Campanha Q1 2026 - Phishing Geral',
    templateId: 'template-1',
    targetGroupIds: ['target-group-1'],
    status: 'completed',
    type: 'standard',
    scheduledAt: '2026-01-20T09:00:00Z',
    createdBy: 'user-superadmin',
    stats: {
      sent: 150,
      opened: 120,
      clicked: 45,
      submitted: 12,
    },
  },
  {
    id: 'campaign-2',
    tenantId: 'tenant-1',
    name: 'Boas-vindas Automático',
    templateId: 'template-2',
    targetGroupIds: ['target-group-4'],
    status: 'running',
    type: 'welcome_automation',
    scheduledAt: null,
    createdBy: 'user-superadmin',
    stats: {
      sent: 23,
      opened: 18,
      clicked: 7,
      submitted: 2,
    },
  },
  {
    id: 'campaign-3',
    tenantId: 'tenant-2',
    name: 'Teste de Conscientização - TechCorp',
    templateId: 'template-1',
    targetGroupIds: ['target-group-2'],
    status: 'scheduled',
    type: 'standard',
    scheduledAt: '2026-03-10T14:00:00Z',
    createdBy: 'user-superadmin',
    stats: {
      sent: 0,
      opened: 0,
      clicked: 0,
      submitted: 0,
    },
  },
];

// Treinamentos
export const mockTrainings: Training[] = [
  {
    id: 'training-1',
    tenantId: null,
    title: 'Fundamentos de Segurança da Informação',
    type: 'video',
    mediaUrl: 'https://example.com/training-1.mp4',
    duration: 1200,
    description: 'Aprenda os conceitos básicos de segurança da informação e como se proteger.',
  },
  {
    id: 'training-2',
    tenantId: null,
    title: 'Como Identificar Phishing',
    type: 'video',
    mediaUrl: 'https://example.com/training-2.mp4',
    duration: 900,
    description: 'Técnicas práticas para identificar e-mails de phishing.',
  },
  {
    id: 'training-3',
    tenantId: 'tenant-1',
    title: 'Políticas de Segurança do Banco Nacional',
    type: 'presentation',
    mediaUrl: 'https://example.com/training-3.pdf',
    duration: 600,
    description: 'Conheça as políticas específicas de segurança da organização.',
  },
];

// Automações
export const mockAutomations: Automation[] = [
  {
    id: 'automation-1',
    tenantId: 'tenant-1',
    name: 'Boas-vindas para Novos Usuários AD',
    description: 'Enviar boas-vindas para novos usuários adicionados ao AD',
    trigger: 'new_user_ad',
    triggerDelay: 1,
    condition: {
      type: 'always',
    },
    campaignTemplateId: 'template-2',
    status: 'active',
    executionCount: 5,
    lastExecutedAt: '2026-01-25T10:00:00Z',
    createdAt: '2025-12-30T15:00:00Z',
  },
  {
    id: 'automation-2',
    tenantId: 'tenant-2',
    name: 'Atualização Cadastral para Novos Usuários Google',
    description: 'Enviar solicitação de atualização cadastral para novos usuários adicionados ao Google Workspace',
    trigger: 'new_user_google',
    triggerDelay: 2,
    condition: {
      type: 'always',
    },
    campaignTemplateId: 'template-5',
    status: 'active',
    executionCount: 3,
    lastExecutedAt: '2026-01-26T11:00:00Z',
    createdAt: '2025-12-30T15:00:00Z',
  },
  {
    id: 'automation-3',
    tenantId: 'tenant-1',
    name: 'Boas-vindas para Usuários Adicionados ao Grupo TI',
    description: 'Enviar boas-vindas para usuários adicionados ao grupo TI',
    trigger: 'user_added_group',
    triggerDelay: 1,
    condition: {
      type: 'in_group',
      groupIds: ['target-group-1'],
    },
    campaignTemplateId: 'template-2',
    status: 'active',
    executionCount: 2,
    lastExecutedAt: '2026-01-27T12:00:00Z',
    createdAt: '2025-12-30T15:00:00Z',
  },
];

// Funções auxiliares
export function getTenantById(id: string): Tenant | undefined {
  return mockTenants.find((t) => t.id === id);
}

export function getTargetsByTenant(tenantId: string): Target[] {
  return mockTargets.filter((t) => t.tenantId === tenantId);
}

export function getCampaignsByTenant(tenantId: string): Campaign[] {
  return mockCampaigns.filter((c) => c.tenantId === tenantId);
}

export function getTemplateById(id: string): Template | undefined {
  return mockTemplates.find((t) => t.id === id);
}

export function getTargetGroupById(id: string): TargetGroup | undefined {
  return mockTargetGroups.find((tg) => tg.id === id);
}

export function getTargetGroupsByTenant(tenantId: string): TargetGroup[] {
  return mockTargetGroups.filter((tg) => tg.tenantId === tenantId);
}
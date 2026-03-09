// Tipos e interfaces para a Plataforma Matreiro
// Os dados agora são armazenados no banco de dados Supabase via supabaseApi.ts

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
    delayDays: number;
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
  targetIds: string[];
  nestedGroupIds?: string[];
  parentGroupId?: string | null;
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
  targetGroupIds: string[];
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
  triggerDelay?: number;
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

// Usuário Superadmin padrão (usado para desenvolvimento/teste)
export const superadminUser: User = {
  id: 'user-superadmin',
  email: 'igor@underprotection.com.br',
  name: 'Igor - Superadmin',
  tenantId: null,
  isSuperadmin: true,
  roles: ['superadmin'],
};

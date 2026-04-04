// Re-exportação de tipos — arquivo mantido por compatibilidade
// Novos imports devem usar '../lib/types' diretamente
export type {
  User, Tenant, Target, TargetGroup, Template,
  Campaign, Training, Automation, PhishingDomain,
  Notification, Certificate,
} from './types';

// Superadmin default usado apenas quando Keycloak está offline
export const superadminUser = {
  id: 'user-superadmin',
  email: 'igor@underprotection.com.br',
  name: 'Igor - Superadmin',
  tenantId: null,
  isSuperadmin: true,
  roles: ['superadmin'],
};

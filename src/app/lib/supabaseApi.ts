// API Client para integração com Backend Django local
// Substitui supabaseApi.ts — Re-exporta tudo de apiLocal.ts
// Todas as importações existentes de supabaseApi continuam funcionando

export {
  // Tenants
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  // Templates
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  // Campaigns
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  // Targets
  getTargets,
  getTarget,
  createTarget,
  updateTarget,
  deleteTarget,
  deleteAllTargetsByTenant,
  // Target Groups
  getTargetGroups,
  getTargetGroup,
  createTargetGroup,
  updateTargetGroup,
  deleteTargetGroup,
  // Trainings
  getTrainings,
  getTraining,
  createTraining,
  updateTraining,
  deleteTraining,
  // Automations
  getAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  // Landing Pages
  getLandingPages,
  getLandingPage,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
  // Certificates
  getCertificates,
  getCertificate,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  // Reports
  getReportsOverview,
  getReportsTimeline,
  // Settings
  getSettings,
  updateSettings,
  // Health
  healthCheck,
  // Seed
  seedDatabase,
  // Azure / Microsoft Graph
  azureTestConnection,
  azureGetUsers,
  azureGetGroups,
  azureGetGroupMembers,
  azureSyncUsers,
  azureSyncGroups,
} from './apiLocal';
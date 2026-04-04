// API Client para integração com Backend Django local
// Substitui supabaseApi.ts para usar dados do banco local

const API_BASE_URL = 'http://localhost:80';

// Helper para obter token de autenticação (JWT do Keycloak ou local)
function getAuthToken(): string | null {
  try {
    const userStr = localStorage.getItem('matreiro_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.token || null;
    }
  } catch (e) {
    // Ignore parse errors
  }
  return null;
}

// Helper para obter tenant ID do contexto (impersonation)
function getTenantContext(): string | null {
  try {
    const tenantStr = localStorage.getItem('matreiro_impersonated_tenant');
    if (tenantStr) {
      const tenant = JSON.parse(tenantStr);
      return tenant.id || null;
    }
  } catch (e) {
    // Ignore parse errors
  }
  return null;
}

// Helper function para fazer requests
async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`🔄 API Request: ${method} ${fullUrl}`, body ? { bodyKeys: Object.keys(body) } : '');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add tenant context if impersonating
    const tenantId = getTenantContext();
    if (tenantId) {
      headers['X-Tenant-Id'] = tenantId;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Return structured errors for POST endpoints
      if (errorData.success === false || errorData.error) {
        return errorData as T;
      }
      
      throw new Error(errorData.error || errorData.details || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true } as T;
    }

    return response.json();
  } catch (error: any) {
    console.error(`❌ API request error on ${method} ${endpoint}:`, error);
    throw error;
  }
}

// =====================================================
// TENANTS (Clientes)
// =====================================================

export async function getTenants() {
  const data = await apiRequest<any[]>('/api/v1/tenants/');
  return data;
}

export async function getTenant(id: string) {
  return apiRequest<any>(`/api/v1/tenants/${id}/`);
}

export async function createTenant(data: any) {
  return apiRequest<any>('/api/v1/tenants/', 'POST', data);
}

export async function updateTenant(id: string, data: any) {
  return apiRequest<any>(`/api/v1/tenants/${id}/`, 'PUT', data);
}

export async function deleteTenant(id: string) {
  return apiRequest<any>(`/api/v1/tenants/${id}/`, 'DELETE');
}

// =====================================================
// TEMPLATES
// =====================================================

export async function getTemplates() {
  const data = await apiRequest<any[]>('/api/v1/templates/');
  return data;
}

export async function getTemplate(id: string) {
  return apiRequest<any>(`/api/v1/templates/${id}/`);
}

export async function createTemplate(data: any) {
  return apiRequest<any>('/api/v1/templates/', 'POST', data);
}

export async function updateTemplate(id: string, data: any) {
  return apiRequest<any>(`/api/v1/templates/${id}/`, 'PUT', data);
}

export async function deleteTemplate(id: string) {
  return apiRequest<any>(`/api/v1/templates/${id}/`, 'DELETE');
}

// =====================================================
// CAMPAIGNS
// =====================================================

export async function getCampaigns() {
  const data = await apiRequest<any[]>('/api/v1/campaigns/');
  return data;
}

export async function getCampaign(id: string) {
  return apiRequest<any>(`/api/v1/campaigns/${id}/`);
}

export async function createCampaign(data: any) {
  return apiRequest<any>('/api/v1/campaigns/', 'POST', data);
}

export async function updateCampaign(id: string, data: any) {
  return apiRequest<any>(`/api/v1/campaigns/${id}/`, 'PUT', data);
}

export async function deleteCampaign(id: string) {
  return apiRequest<any>(`/api/v1/campaigns/${id}/`, 'DELETE');
}

// =====================================================
// TARGETS (Alvos/Colaboradores)
// =====================================================

export async function getTargets() {
  const data = await apiRequest<any[]>('/api/v1/targets/');
  return data;
}

export async function getTarget(id: string) {
  return apiRequest<any>(`/api/v1/targets/${id}/`);
}

export async function createTarget(data: any) {
  return apiRequest<any>('/api/v1/targets/', 'POST', data);
}

export async function updateTarget(id: string, data: any) {
  return apiRequest<any>(`/api/v1/targets/${id}/`, 'PUT', data);
}

export async function deleteTarget(id: string) {
  return apiRequest<any>(`/api/v1/targets/${id}/`, 'DELETE');
}

export async function deleteAllTargetsByTenant(tenantId: string) {
  return apiRequest<{ success: boolean; deletedCount: number; tenantId: string }>(
    `/api/v1/targets/tenant/${tenantId}/`, 'DELETE'
  );
}

// =====================================================
// TARGET GROUPS
// =====================================================

export async function getTargetGroups() {
  const data = await apiRequest<any[]>('/api/v1/target-groups/');
  return data;
}

export async function getTargetGroup(id: string) {
  return apiRequest<any>(`/api/v1/target-groups/${id}/`);
}

export async function createTargetGroup(data: any) {
  return apiRequest<any>('/api/v1/target-groups/', 'POST', data);
}

export async function updateTargetGroup(id: string, data: any) {
  return apiRequest<any>(`/api/v1/target-groups/${id}/`, 'PUT', data);
}

export async function deleteTargetGroup(id: string) {
  return apiRequest<any>(`/api/v1/target-groups/${id}/`, 'DELETE');
}

// =====================================================
// TRAININGS
// =====================================================

export async function getTrainings() {
  const data = await apiRequest<any[]>('/api/v1/trainings/');
  return data;
}

export async function getTraining(id: string) {
  return apiRequest<any>(`/api/v1/trainings/${id}/`);
}

export async function createTraining(data: any) {
  return apiRequest<any>('/api/v1/trainings/', 'POST', data);
}

export async function updateTraining(id: string, data: any) {
  return apiRequest<any>(`/api/v1/trainings/${id}/`, 'PUT', data);
}

export async function deleteTraining(id: string) {
  return apiRequest<any>(`/api/v1/trainings/${id}/`, 'DELETE');
}

// =====================================================
// AUTOMATIONS
// =====================================================

export async function getAutomations() {
  return apiRequest<any[]>('/api/v1/automations/');
}

export async function getAutomation(id: string) {
  return apiRequest<any>(`/api/v1/automations/${id}/`);
}

export async function createAutomation(data: any) {
  return apiRequest<any>('/api/v1/automations/', 'POST', data);
}

export async function updateAutomation(id: string, data: any) {
  return apiRequest<any>(`/api/v1/automations/${id}/`, 'PUT', data);
}

export async function deleteAutomation(id: string) {
  return apiRequest<any>(`/api/v1/automations/${id}/`, 'DELETE');
}

// =====================================================
// LANDING PAGES
// =====================================================

export async function getLandingPages() {
  return apiRequest<any[]>('/api/v1/landing-pages/');
}

export async function getLandingPage(id: string) {
  return apiRequest<any>(`/api/v1/landing-pages/${id}/`);
}

export async function createLandingPage(data: any) {
  return apiRequest<any>('/api/v1/landing-pages/', 'POST', data);
}

export async function updateLandingPage(id: string, data: any) {
  return apiRequest<any>(`/api/v1/landing-pages/${id}/`, 'PUT', data);
}

export async function deleteLandingPage(id: string) {
  return apiRequest<any>(`/api/v1/landing-pages/${id}/`, 'DELETE');
}

// =====================================================
// CERTIFICATES
// =====================================================

export async function getCertificates() {
  return apiRequest<any[]>('/api/v1/certificates/');
}

export async function getCertificate(id: string) {
  return apiRequest<any>(`/api/v1/certificates/${id}/`);
}

export async function createCertificate(data: any) {
  return apiRequest<any>('/api/v1/certificates/', 'POST', data);
}

export async function updateCertificate(id: string, data: any) {
  return apiRequest<any>(`/api/v1/certificates/${id}/`, 'PUT', data);
}

export async function deleteCertificate(id: string) {
  return apiRequest<any>(`/api/v1/certificates/${id}/`, 'DELETE');
}

// =====================================================
// REPORTS
// =====================================================

export async function getReportsOverview() {
  return apiRequest<any>('/api/v1/reports/overview');
}

export async function getReportsTimeline() {
  return apiRequest<any[]>('/api/v1/reports/timeline');
}

// =====================================================
// SETTINGS
// =====================================================

export async function getSettings() {
  return apiRequest<any>('/api/v1/settings/');
}

export async function updateSettings(data: any) {
  return apiRequest<any>('/api/v1/settings/update', 'POST', data);
}

// =====================================================
// SEED DATABASE
// =====================================================

export async function seedDatabase() {
  return apiRequest<any>('/api/v1/seed/', 'POST');
}

// =====================================================
// NOTIFICATIONS
// =====================================================

export async function getNotifications() {
  return apiRequest<any[]>('/api/v1/notifications/');
}

export async function markNotificationRead(id: string) {
  return apiRequest<any>(`/api/v1/notifications/${id}/read/`, 'POST');
}

export async function markAllNotificationsRead() {
  return apiRequest<any>('/api/v1/notifications/read-all/', 'POST');
}

// =====================================================
// AUDIT LOGS
// =====================================================

export async function getAuditLogs(params?: { page?: number; action?: string; user?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.action) queryParams.set('action', params.action);
  if (params?.user) queryParams.set('user', params.user);
  const qs = queryParams.toString();
  return apiRequest<any[]>(`/api/v1/audit/logs/${qs ? '?' + qs : ''}`);
}

// =====================================================
// SYSTEM USERS
// =====================================================

export async function getSystemUsers() {
  return apiRequest<any[]>('/api/v1/users/');
}

export async function getSystemUser(id: string) {
  return apiRequest<any>(`/api/v1/users/${id}/`);
}

export async function createSystemUser(data: any) {
  return apiRequest<any>('/api/v1/users/', 'POST', data);
}

export async function updateSystemUser(id: string, data: any) {
  return apiRequest<any>(`/api/v1/users/${id}/`, 'PUT', data);
}

export async function deleteSystemUser(id: string) {
  return apiRequest<any>(`/api/v1/users/${id}/`, 'DELETE');
}

// =====================================================
// AUTH
// =====================================================

export async function authLogin(email: string, password: string) {
  return apiRequest<{ token: string; user: any }>('/api/v1/auth/login/', 'POST', { email, password });
}

export async function authMe() {
  return apiRequest<any>('/api/v1/auth/me/');
}

// =====================================================
// HEALTH CHECK
// =====================================================

export async function healthCheck() {
  return apiRequest<{ status: string }>('/api/health/');
}

// =====================================================
// PHISHING DOMAINS
// =====================================================

export async function getPhishingDomains() {
  return apiRequest<any[]>('/api/v1/phishing-domains/');
}

export async function createPhishingDomain(data: any) {
  return apiRequest<any>('/api/v1/phishing-domains/', 'POST', data);
}

export async function updatePhishingDomain(id: string, data: any) {
  return apiRequest<any>(`/api/v1/phishing-domains/${id}/`, 'PUT', data);
}

export async function deletePhishingDomain(id: string) {
  return apiRequest<any>(`/api/v1/phishing-domains/${id}/`, 'DELETE');
}

// =====================================================
// MICROSOFT AZURE / GRAPH API
// =====================================================

export async function azureTestConnection(tenantId: string, clientId: string, clientSecret: string) {
  return apiRequest<any>('/api/v1/azure/test-connection', 'POST', {
    tenantId,
    clientId,
    clientSecret,
  });
}

export async function azureGetUsers(tenantId: string, clientId: string, clientSecret: string, maxResults = 100) {
  return apiRequest<any>('/api/v1/azure/users', 'POST', {
    tenantId,
    clientId,
    clientSecret,
    maxResults,
  });
}

export async function azureGetGroups(tenantId: string, clientId: string, clientSecret: string, maxResults = 100) {
  return apiRequest<any>('/api/v1/azure/groups', 'POST', {
    tenantId,
    clientId,
    clientSecret,
    maxResults,
  });
}

export async function azureGetGroupMembers(tenantId: string, clientId: string, clientSecret: string, groupId: string) {
  return apiRequest<any>('/api/v1/azure/group-members', 'POST', {
    tenantId,
    clientId,
    clientSecret,
    groupId,
  });
}

export async function azureSyncUsers(tenantId: string, clientId: string, clientSecret: string, targetTenantId: string, allowedDomains?: string[]) {
  return apiRequest<any>('/api/v1/azure/sync-users', 'POST', {
    tenantId,
    clientId,
    clientSecret,
    targetTenantId,
    allowedDomains,
  });
}

export async function azureSyncGroups(tenantId: string, clientId: string, clientSecret: string, targetTenantId: string, allowedDomains?: string[]) {
  return apiRequest<any>('/api/v1/azure/sync-groups', 'POST', {
    tenantId,
    clientId,
    clientSecret,
    targetTenantId,
    allowedDomains,
  });
}

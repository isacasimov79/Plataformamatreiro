// API Client para integração com Supabase Edge Functions
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-99a65fc7`;

// Helper function para fazer requests
async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  try {
    console.log(`🔄 API Request: ${method} ${endpoint}`);
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      console.error(`❌ API Error on ${method} ${endpoint}:`, errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`✅ API Success: ${method} ${endpoint}`, data);
    return data;
  } catch (error: any) {
    console.error(`❌ API request error on ${method} ${endpoint}:`, error);
    
    // Verificar se é erro de rede
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Erro de conexão com o servidor. Verifique sua conexão com a internet.');
    }
    
    throw error;
  }
}

// =====================================================
// TENANTS (Clientes)
// =====================================================

export async function getTenants() {
  return apiRequest<any[]>('/tenants', 'GET');
}

export async function getTenant(id: string) {
  return apiRequest<any>(`/tenants/${id}`, 'GET');
}

export async function createTenant(data: any) {
  return apiRequest<any>('/tenants', 'POST', data);
}

export async function updateTenant(id: string, data: any) {
  return apiRequest<any>(`/tenants/${id}`, 'PUT', data);
}

export async function deleteTenant(id: string) {
  return apiRequest<any>(`/tenants/${id}`, 'DELETE');
}

// =====================================================
// TEMPLATES
// =====================================================

export async function getTemplates() {
  return apiRequest<any[]>('/templates', 'GET');
}

export async function getTemplate(id: string) {
  return apiRequest<any>(`/templates/${id}`, 'GET');
}

export async function createTemplate(data: any) {
  return apiRequest<any>('/templates', 'POST', data);
}

export async function updateTemplate(id: string, data: any) {
  return apiRequest<any>(`/templates/${id}`, 'PUT', data);
}

export async function deleteTemplate(id: string) {
  return apiRequest<any>(`/templates/${id}`, 'DELETE');
}

// =====================================================
// CAMPAIGNS
// =====================================================

export async function getCampaigns() {
  return apiRequest<any[]>('/campaigns', 'GET');
}

export async function getCampaign(id: string) {
  return apiRequest<any>(`/campaigns/${id}`, 'GET');
}

export async function createCampaign(data: any) {
  return apiRequest<any>('/campaigns', 'POST', data);
}

export async function updateCampaign(id: string, data: any) {
  return apiRequest<any>(`/campaigns/${id}`, 'PUT', data);
}

export async function deleteCampaign(id: string) {
  return apiRequest<any>(`/campaigns/${id}`, 'DELETE');
}

// =====================================================
// TARGETS (Alvos/Colaboradores)
// =====================================================

export async function getTargets() {
  return apiRequest<any[]>('/targets', 'GET');
}

export async function getTarget(id: string) {
  return apiRequest<any>(`/targets/${id}`, 'GET');
}

export async function createTarget(data: any) {
  return apiRequest<any>('/targets', 'POST', data);
}

export async function updateTarget(id: string, data: any) {
  return apiRequest<any>(`/targets/${id}`, 'PUT', data);
}

export async function deleteTarget(id: string) {
  return apiRequest<any>(`/targets/${id}`, 'DELETE');
}

// =====================================================
// SETTINGS
// =====================================================

export async function getSettings() {
  return apiRequest<any>('/settings', 'GET');
}

export async function updateSettings(data: any) {
  return apiRequest<any>('/settings', 'PUT', data);
}

// =====================================================
// TARGET GROUPS
// =====================================================

export async function getTargetGroups() {
  return apiRequest<any[]>('/target-groups', 'GET');
}

export async function getTargetGroup(id: string) {
  return apiRequest<any>(`/target-groups/${id}`, 'GET');
}

export async function createTargetGroup(data: any) {
  return apiRequest<any>('/target-groups', 'POST', data);
}

export async function updateTargetGroup(id: string, data: any) {
  return apiRequest<any>(`/target-groups/${id}`, 'PUT', data);
}

export async function deleteTargetGroup(id: string) {
  return apiRequest<any>(`/target-groups/${id}`, 'DELETE');
}

// =====================================================
// TRAININGS
// =====================================================

export async function getTrainings() {
  return apiRequest<any[]>('/trainings', 'GET');
}

export async function getTraining(id: string) {
  return apiRequest<any>(`/trainings/${id}`, 'GET');
}

export async function createTraining(data: any) {
  return apiRequest<any>('/trainings', 'POST', data);
}

export async function updateTraining(id: string, data: any) {
  return apiRequest<any>(`/trainings/${id}`, 'PUT', data);
}

export async function deleteTraining(id: string) {
  return apiRequest<any>(`/trainings/${id}`, 'DELETE');
}

// =====================================================
// AUTOMATIONS
// =====================================================

export async function getAutomations() {
  return apiRequest<any[]>('/automations', 'GET');
}

export async function getAutomation(id: string) {
  return apiRequest<any>(`/automations/${id}`, 'GET');
}

export async function createAutomation(data: any) {
  return apiRequest<any>('/automations', 'POST', data);
}

export async function updateAutomation(id: string, data: any) {
  return apiRequest<any>(`/automations/${id}`, 'PUT', data);
}

export async function deleteAutomation(id: string) {
  return apiRequest<any>(`/automations/${id}`, 'DELETE');
}

// =====================================================
// SEED DATA - Popular banco com dados iniciais
// =====================================================

export async function seedDatabase() {
  return apiRequest<any>('/seed', 'POST');
}

// =====================================================
// HEALTH CHECK
// =====================================================

export async function healthCheck() {
  return apiRequest<{ status: string }>('/health', 'GET');
}
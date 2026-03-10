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
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`🔄 API Request: ${method} ${fullUrl}`, body ? { bodyKeys: Object.keys(body) } : '');
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
      console.log(`📤 Request body size: ${options.body.length} bytes`);
    }

    console.log(`🌐 Fetching: ${fullUrl}`);
    const response = await fetch(fullUrl, options);
    
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    
    // Special handling for Supabase Edge Function errors (status 546)
    if (response.status === 546) {
      console.error(`❌ Supabase Edge Function error detected (status 546)`);
      console.error(`   This usually means the server function crashed or timed out.`);
      console.error(`   Endpoint: ${endpoint}`);
      
      // Try to get error details from response
      let errorText = '';
      try {
        errorText = await response.text();
        console.error(`   Error response:`, errorText.substring(0, 500));
      } catch (e) {
        console.error(`   Could not read error response`);
      }
      
      // Return structured error for Azure endpoints
      if (method === 'POST' && endpoint.includes('/azure/')) {
        return {
          success: false,
          error: 'Erro no Servidor',
          details: 'O servidor Edge Function encontrou um erro interno. Verifique os logs do Supabase ou tente novamente.',
          statusCode: 546
        } as T;
      }
      
      throw new Error('Servidor Edge Function encontrou um erro interno (status 546). Verifique os logs do Supabase.');
    }
    
    // Special handling for non-standard status codes
    if (response.status >= 500 && response.status !== 500 && response.status !== 502 && response.status !== 503 && response.status !== 546) {
      console.warn(`⚠️ Unusual status code detected: ${response.status}`);
    }
    
    // Try to parse JSON response - handle errors gracefully
    let data: any = {};
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn(`⚠️ Non-JSON response (${contentType}):`, text.substring(0, 200));
        data = { error: 'Resposta não-JSON do servidor', details: text.substring(0, 500) };
      }
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      data = { error: 'Falha ao processar resposta do servidor', details: 'Resposta inválida' };
    }
    
    if (!response.ok) {
      // Se o backend retornou um JSON estruturado com erro, retornar ele
      // ao invés de lançar exceção (para endpoints que retornam { success: false })
      if (data.success === false || data.error) {
        console.log(`⚠️ API returned structured error: ${method} ${endpoint}`, data);
        return data as T;
      }
      
      const errorMessage = data.error || data.details || `HTTP error! status: ${response.status}`;
      console.error(`❌ API Error on ${method} ${endpoint}:`, errorMessage);
      throw new Error(errorMessage);
    }

    console.log(`✅ API Success: ${method} ${endpoint}`);
    return data;
  } catch (error: any) {
    console.error(`❌ API request error on ${method} ${endpoint}:`, error);
    console.error(`❌ Error details:`, {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 300),
      cause: error.cause
    });
    
    // Verificar se é erro de rede
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
      console.error(`❌ Network error detected. Full URL was: ${API_BASE_URL}${endpoint}`);
      console.error(`❌ Attempting to reach: https://${projectId}.supabase.co`);
      
      // Retornar um erro estruturado para que o frontend possa lidar melhor
      const networkError: any = {
        success: false,
        error: 'Erro de Conexão',
        details: 'Não foi possível conectar ao servidor. Verifique se o Supabase Edge Functions está ativo.',
        originalError: error.message,
        endpoint: `${API_BASE_URL}${endpoint}`
      };
      
      // Para métodos que esperam retorno estruturado, retornar o erro estruturado
      // ao invés de lançar exceção
      if (method === 'POST' && endpoint.includes('/azure/')) {
        return networkError as T;
      }
      
      throw new Error('Erro de conexão com o servidor. Verifique sua conexão com a internet e se o servidor Supabase está ativo.');
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

export async function deleteAllTargetsByTenant(tenantId: string) {
  return apiRequest<{ success: boolean; deletedCount: number; tenantId: string }>(`/targets/tenant/${tenantId}`, 'DELETE');
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
// LANDING PAGES
// =====================================================

export async function getLandingPages() {
  return apiRequest<any[]>('/landing-pages', 'GET');
}

export async function getLandingPage(id: string) {
  return apiRequest<any>(`/landing-pages/${id}`, 'GET');
}

export async function createLandingPage(data: any) {
  return apiRequest<any>('/landing-pages', 'POST', data);
}

export async function updateLandingPage(id: string, data: any) {
  return apiRequest<any>(`/landing-pages/${id}`, 'PUT', data);
}

export async function deleteLandingPage(id: string) {
  return apiRequest<any>(`/landing-pages/${id}`, 'DELETE');
}

// =====================================================
// CERTIFICATES
// =====================================================

export async function getCertificates() {
  return apiRequest<any[]>('/certificates', 'GET');
}

export async function getCertificate(id: string) {
  return apiRequest<any>(`/certificates/${id}`, 'GET');
}

export async function createCertificate(data: any) {
  return apiRequest<any>('/certificates', 'POST', data);
}

export async function updateCertificate(id: string, data: any) {
  return apiRequest<any>(`/certificates/${id}`, 'PUT', data);
}

export async function deleteCertificate(id: string) {
  return apiRequest<any>(`/certificates/${id}`, 'DELETE');
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

// =====================================================
// MICROSOFT AZURE / GRAPH API
// =====================================================

export async function azureTestConnection(tenantId: string, clientId: string, clientSecret: string) {
  return apiRequest<any>('/azure/test-connection', 'POST', {
    tenantId,
    clientId,
    clientSecret,
  });
}

export async function azureGetUsers(tenantId: string, clientId: string, clientSecret: string, maxResults = 100) {
  return apiRequest<any>('/azure/users', 'POST', {
    tenantId,
    clientId,
    clientSecret,
    maxResults,
  });
}

export async function azureGetGroups(tenantId: string, clientId: string, clientSecret: string, maxResults = 100) {
  return apiRequest<any>('/azure/groups', 'POST', {
    tenantId,
    clientId,
    clientSecret,
    maxResults,
  });
}

export async function azureGetGroupMembers(tenantId: string, clientId: string, clientSecret: string, groupId: string) {
  return apiRequest<any>('/azure/group-members', 'POST', {
    tenantId,
    clientId,
    clientSecret,
    groupId,
  });
}

export async function azureSyncUsers(tenantId: string, clientId: string, clientSecret: string, targetTenantId: string, allowedDomains?: string[]) {
  return apiRequest<any>('/azure/sync-users', 'POST', {
    tenantId,
    clientId,
    clientSecret,
    targetTenantId,
    allowedDomains,
  });
}

export async function azureSyncGroups(tenantId: string, clientId: string, clientSecret: string, targetTenantId: string, allowedDomains?: string[]) {
  return apiRequest<any>('/azure/sync-groups', 'POST', {
    tenantId,
    clientId,
    clientSecret,
    targetTenantId,
    allowedDomains,
  });
}
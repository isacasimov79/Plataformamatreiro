/**
 * Exemplos de uso da API com autenticação Microsoft Entra ID
 * 
 * Todos os métodos automaticamente incluem o token JWT local
 * no header Authorization: Bearer <token>
 */

import api from './api';

// ============================================
// TENANTS
// ============================================

export const tenantsAPI = {
  // Listar todos os tenants
  getAll: async () => {
    try {
      const response = await api.get('/tenants/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tenants:', error);
      throw error;
    }
  },

  // Buscar tenant por ID
  getById: async (id: string) => {
    try {
      const response = await api.get(`/tenants/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tenant:', error);
      throw error;
    }
  },

  // Criar novo tenant
  create: async (data: {
    name: string;
    domain: string;
    settings?: any;
  }) => {
    try {
      const response = await api.post('/tenants/', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar tenant:', error);
      throw error;
    }
  },

  // Atualizar tenant
  update: async (id: string, data: Partial<{
    name: string;
    domain: string;
    settings: any;
    is_active: boolean;
  }>) => {
    try {
      const response = await api.put(`/tenants/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar tenant:', error);
      throw error;
    }
  },

  // Deletar tenant
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/tenants/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar tenant:', error);
      throw error;
    }
  },
};

// ============================================
// CAMPANHAS
// ============================================

export const campaignsAPI = {
  // Listar todas as campanhas
  getAll: async (filters?: {
    tenant_id?: string;
    status?: string;
  }) => {
    try {
      const response = await api.get('/campaigns/', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error);
      throw error;
    }
  },

  // Criar nova campanha
  create: async (data: {
    name: string;
    tenant_id: string;
    template_id: string;
    target_ids: string[];
    scheduled_at?: string;
  }) => {
    try {
      const response = await api.post('/campaigns/', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      throw error;
    }
  },

  // Obter métricas da campanha
  getMetrics: async (id: string) => {
    try {
      const response = await api.get(`/campaigns/${id}/metrics/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      throw error;
    }
  },

  // Cancelar campanha
  cancel: async (id: string) => {
    try {
      const response = await api.post(`/campaigns/${id}/cancel/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar campanha:', error);
      throw error;
    }
  },
};

// ============================================
// TARGETS (Usuários)
// ============================================

export const targetsAPI = {
  // Listar todos os targets
  getAll: async (tenant_id?: string) => {
    try {
      const response = await api.get('/targets/', {
        params: { tenant_id },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar targets:', error);
      throw error;
    }
  },

  // Criar target manualmente
  create: async (data: {
    name: string;
    email: string;
    tenant_id: string;
    department?: string;
    position?: string;
  }) => {
    try {
      const response = await api.post('/targets/', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar target:', error);
      throw error;
    }
  },

  // Importar targets de CSV
  importCSV: async (file: File, tenant_id: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tenant_id', tenant_id);

      const response = await api.post('/targets/import/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao importar targets:', error);
      throw error;
    }
  },

  // Sincronizar com Azure AD
  syncAzureAD: async (tenant_id: string) => {
    try {
      const response = await api.post(`/targets/sync/azure/`, { tenant_id });
      return response.data;
    } catch (error) {
      console.error('Erro ao sincronizar Azure AD:', error);
      throw error;
    }
  },

  // Sincronizar com Google Workspace
  syncGoogleWorkspace: async (tenant_id: string) => {
    try {
      const response = await api.post(`/targets/sync/google/`, { tenant_id });
      return response.data;
    } catch (error) {
      console.error('Erro ao sincronizar Google Workspace:', error);
      throw error;
    }
  },
};

// ============================================
// TEMPLATES
// ============================================

export const templatesAPI = {
  // Listar todos os templates
  getAll: async (filters?: {
    category?: string;
    tenant_id?: string;
  }) => {
    try {
      const response = await api.get('/templates/', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      throw error;
    }
  },

  // Criar novo template
  create: async (data: {
    name: string;
    subject: string;
    html_content: string;
    category: string;
    tenant_id?: string;
  }) => {
    try {
      const response = await api.post('/templates/', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar template:', error);
      throw error;
    }
  },

  // Testar template
  test: async (id: string, test_email: string) => {
    try {
      const response = await api.post(`/templates/${id}/test/`, {
        test_email,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao testar template:', error);
      throw error;
    }
  },
};

// ============================================
// TREINAMENTOS
// ============================================

export const trainingsAPI = {
  // Listar todos os treinamentos
  getAll: async (tenant_id?: string) => {
    try {
      const response = await api.get('/trainings/', {
        params: { tenant_id },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar treinamentos:', error);
      throw error;
    }
  },

  // Criar novo treinamento
  create: async (data: {
    title: string;
    content: string;
    tenant_id: string;
    duration_minutes: number;
  }) => {
    try {
      const response = await api.post('/trainings/', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar treinamento:', error);
      throw error;
    }
  },

  // Submeter prova
  submitExam: async (training_id: string, answers: any[]) => {
    try {
      const response = await api.post(`/trainings/${training_id}/submit/`, {
        answers,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao submeter prova:', error);
      throw error;
    }
  },
};

// ============================================
// INTEGRAÇÕES
// ============================================

export const integrationsAPI = {
  // Configurar Azure AD
  configureAzureAD: async (tenant_id: string, config: {
    tenant_id: string;
    client_id: string;
    client_secret: string;
    sync_enabled: boolean;
    sync_interval: number;
  }) => {
    try {
      const response = await api.post('/integrations/azure/', {
        tenant_id,
        ...config,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao configurar Azure AD:', error);
      throw error;
    }
  },

  // Configurar Google Workspace
  configureGoogleWorkspace: async (tenant_id: string, config: {
    domain: string;
    client_id: string;
    client_secret: string;
    sync_enabled: boolean;
    sync_interval: number;
  }) => {
    try {
      const response = await api.post('/integrations/google/', {
        tenant_id,
        ...config,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao configurar Google Workspace:', error);
      throw error;
    }
  },

  // Testar conexão
  testConnection: async (provider: 'azure' | 'google', tenant_id: string) => {
    try {
      const response = await api.post(`/integrations/${provider}/test/`, {
        tenant_id,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      throw error;
    }
  },
};

// ============================================
// EXEMPLO DE USO EM COMPONENTE
// ============================================

/*
import { useEffect, useState } from 'react';
import { tenantsAPI } from '../lib/apiExamples';
import { useAuth } from '../contexts/AuthContext';

export function MyComponent() {
  const { isAuthenticated } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Só buscar se estiver autenticado
    if (isAuthenticated) {
      loadTenants();
    }
  }, [isAuthenticated]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantsAPI.getAll();
      setTenants(data);
    } catch (error) {
      console.error('Erro ao carregar tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {tenants.map(tenant => (
        <div key={tenant.id}>{tenant.name}</div>
      ))}
    </div>
  );
}
*/

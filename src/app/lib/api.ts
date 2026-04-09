import axios from 'axios';

// URL base da API - ajuste conforme necessário
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper para obter token JWT local (armazenado após login via MSAL)
function getLocalToken(): string | null {
  try {
    const userStr = localStorage.getItem('matreiro_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.token || null;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

// Interceptor de requisição para adicionar token JWT local
api.interceptors.request.use(
  async (config) => {
    const token = getLocalToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Token inválido ou expirado — redirecionando para login');
      // Limpar sessão local e redirecionar
      localStorage.removeItem('matreiro_user');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Exemplos de uso:

// GET request
export const getTenants = async () => {
  const response = await api.get('/tenants/');
  return response.data;
};

// POST request
export const createTenant = async (data: any) => {
  const response = await api.post('/tenants/', data);
  return response.data;
};

// PUT request
export const updateTenant = async (id: string, data: any) => {
  const response = await api.put(`/tenants/${id}/`, data);
  return response.data;
};

// DELETE request
export const deleteTenant = async (id: string) => {
  const response = await api.delete(`/tenants/${id}/`);
  return response.data;
};

// Campanhas
export const getCampaigns = async () => {
  const response = await api.get('/campaigns/');
  return response.data;
};

export const createCampaign = async (data: any) => {
  const response = await api.post('/campaigns/', data);
  return response.data;
};

// Templates
export const getTemplates = async () => {
  const response = await api.get('/templates/');
  return response.data;
};

export const createTemplate = async (data: any) => {
  const response = await api.post('/templates/', data);
  return response.data;
};

// Usuários/Targets
export const getTargets = async () => {
  const response = await api.get('/targets/');
  return response.data;
};

export const createTarget = async (data: any) => {
  const response = await api.post('/targets/', data);
  return response.data;
};

export const importTargetsFromCSV = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/targets/import/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Treinamentos
export const getTrainings = async () => {
  const response = await api.get('/trainings/');
  return response.data;
};

export const createTraining = async (data: any) => {
  const response = await api.post('/trainings/', data);
  return response.data;
};

import { Configuration } from '@azure/msal-browser';

// Extraído das variáveis de ambiente .env do projeto
const clientId = import.meta.env.VITE_MSAUTH_CLIENTID || '';
const tenantId = import.meta.env.VITE_MSAUTH_TENANTID || 'common';

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin, // Redireciona para a raiz do site após o login
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage', // Usar localStorage para persistência de sessão entre abas
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'email', 'profile', 'openid'], // Escopos básicos para extrair as credenciais do AD
};

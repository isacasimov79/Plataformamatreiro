import Keycloak from 'keycloak-js';

// Configuração do Keycloak com variáveis de ambiente
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'https://iam.upn.com.br',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'underprotection',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'Matreiro',
};

// Apenas log em desenvolvimento
if (import.meta.env.DEV) {
  console.log('🔐 Keycloak Config:', {
    ...keycloakConfig,
    enabled: import.meta.env.VITE_KEYCLOAK_ENABLED !== 'false',
  });
}

// Instância do Keycloak
const keycloak = new Keycloak(keycloakConfig);

export default keycloak;

// Helper para obter o token
export const getToken = (): string | undefined => {
  return keycloak.token;
};

// Helper para obter o refresh token
export const getRefreshToken = (): string | undefined => {
  return keycloak.refreshToken;
};

// Helper para verificar se está autenticado
export const isAuthenticated = (): boolean => {
  return keycloak.authenticated || false;
};

// Helper para fazer logout
export const logout = (): void => {
  // Only call logout if keycloak is actually initialized and authenticated
  if (keycloak.authenticated && keycloak.adapter) {
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  } else {
    console.log('🔐 Keycloak not initialized, skipping logout call');
  }
};

// Helper para fazer login
export const login = (): void => {
  // Only call login if keycloak adapter is initialized
  if (keycloak.adapter) {
    keycloak.login({
      redirectUri: window.location.origin,
    });
  } else {
    console.log('🔐 Keycloak not initialized, skipping login call');
  }
};

// Helper para atualizar o token
export const updateToken = (minValidity: number = 5): Promise<boolean> => {
  return keycloak.updateToken(minValidity);
};

// Helper para obter informações do usuário
export const getUserInfo = () => {
  return keycloak.tokenParsed;
};

// Helper para verificar roles
export const hasRole = (role: string): boolean => {
  return keycloak.hasRealmRole(role) || keycloak.hasResourceRole(role);
};

// Helper para obter todas as roles
export const getRoles = (): string[] => {
  const realmRoles = keycloak.realmAccess?.roles || [];
  const resourceRoles = keycloak.resourceAccess?.[keycloakConfig.clientId]?.roles || [];
  return [...realmRoles, ...resourceRoles];
};
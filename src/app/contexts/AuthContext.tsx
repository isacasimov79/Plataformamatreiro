import React, { createContext, useContext, useState, useEffect } from 'react';
import { superadminUser, mockTenants, type User, type Tenant } from '../lib/mockData';
import keycloak, { logout as keycloakLogout, login as keycloakLogin, getUserInfo, getRoles } from '../lib/keycloak';
import { toast } from 'sonner';
import { LoadingScreen } from '../components/LoadingScreen';

interface AuthContextType {
  user: User | null;
  impersonatedTenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  impersonateTenant: (tenantId: string | null) => void;
  keycloakToken: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [impersonatedTenant, setImpersonatedTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [keycloakToken, setKeycloakToken] = useState<string | undefined>();

  // Inicializar Keycloak
  useEffect(() => {
    const initKeycloak = async () => {
      try {
        // Verificar se Keycloak está habilitado
        const keycloakEnabled = import.meta.env.VITE_KEYCLOAK_ENABLED !== 'false';
        const isDev = import.meta.env.DEV;
        
        // Se Keycloak está desabilitado, pular para modo fallback imediatamente
        if (!keycloakEnabled) {
          console.log('🔧 Keycloak desabilitado - usando modo desenvolvimento');
          throw new Error('Keycloak disabled');
        }
        
        // Timeout mais longo para produção (30s), curto para dev (2s)
        const timeoutDuration = isDev ? 2000 : 30000;
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout ao conectar com Keycloak')), timeoutDuration);
        });

        const initPromise = keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
          checkLoginIframe: false,
        });

        const authenticated = await Promise.race([initPromise, timeoutPromise]) as boolean;

        if (authenticated) {
          const tokenParsed = getUserInfo();
          const roles = getRoles();
          
          // Mapear usuário do Keycloak para o formato do sistema
          const keycloakUser: User = {
            id: tokenParsed?.sub || '1',
            name: tokenParsed?.name || tokenParsed?.preferred_username || 'Usuário',
            email: tokenParsed?.email || 'usuario@underprotection.com.br',
            role: roles.includes('superadmin') ? 'superadmin' : 
                  roles.includes('admin') ? 'admin' : 'user',
            tenantId: tokenParsed?.tenant_id,
            avatar: tokenParsed?.picture,
          };

          setUser(keycloakUser);
          setKeycloakToken(keycloak.token);
          localStorage.setItem('matreiro_user', JSON.stringify(keycloakUser));

          // Configurar refresh automático do token
          setInterval(() => {
            keycloak.updateToken(70).then((refreshed) => {
              if (refreshed) {
                setKeycloakToken(keycloak.token);
                console.log('Token was successfully refreshed');
              }
            }).catch(() => {
              console.error('Failed to refresh token');
            });
          }, 60000); // Verificar a cada 60 segundos

          toast.success('Autenticado com sucesso!', {
            description: `Bem-vindo, ${keycloakUser.name}`,
          });
        } else {
          // Não autenticado, mas Keycloak inicializou
          console.log('Keycloak inicializado, mas usuário não autenticado');
        }

        // Restaurar tenant impersonado
        const storedTenant = localStorage.getItem('matreiro_impersonated_tenant');
        if (storedTenant) {
          setImpersonatedTenant(JSON.parse(storedTenant));
        }
      } catch (error) {
        // Em desenvolvimento, não mostrar erro - apenas modo fallback silencioso
        if (import.meta.env.DEV) {
          console.log('🔧 Modo desenvolvimento: Keycloak não disponível, usando fallback local');
        } else {
          // Em produção, mostrar erro apenas se não for timeout esperado
          console.warn('Keycloak não disponível:', error);
          
          // Apenas mostrar toast se não for desabilitado explicitamente
          if (import.meta.env.VITE_KEYCLOAK_ENABLED !== 'false') {
            toast.warning('Servidor de autenticação indisponível', {
              description: 'Usando autenticação local temporariamente',
              duration: 3000,
            });
          }
        }
        
        // Modo fallback: tentar usar dados do localStorage ou auto-login para dev
        const storedUser = localStorage.getItem('matreiro_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else if (import.meta.env.DEV) {
          // Apenas em desenvolvimento: auto-login como superadmin
          console.log('🔧 Auto-login como superadmin (modo desenvolvimento)');
          setUser(superadminUser);
          localStorage.setItem('matreiro_user', JSON.stringify(superadminUser));
        }

        // Restaurar tenant impersonado
        const storedTenant = localStorage.getItem('matreiro_impersonated_tenant');
        if (storedTenant) {
          setImpersonatedTenant(JSON.parse(storedTenant));
        }
      } finally {
        setIsLoading(false);
      }
    };

    initKeycloak();
  }, []);

  const login = async (email: string, password: string) => {
    // Simulação de login - em produção seria via Keycloak
    if (email === 'igor@underprotection.com.br') {
      setUser(superadminUser);
      localStorage.setItem('matreiro_user', JSON.stringify(superadminUser));
    } else {
      throw new Error('Credenciais inválidas');
    }
  };

  const logout = () => {
    keycloakLogout();
    setUser(null);
    setImpersonatedTenant(null);
    localStorage.removeItem('matreiro_user');
    localStorage.removeItem('matreiro_impersonated_tenant');
  };

  const impersonateTenant = (tenantId: string | null) => {
    if (tenantId) {
      const tenant = mockTenants.find((t) => t.id === tenantId);
      if (tenant) {
        setImpersonatedTenant(tenant);
        localStorage.setItem('matreiro_impersonated_tenant', JSON.stringify(tenant));
      }
    } else {
      setImpersonatedTenant(null);
      localStorage.removeItem('matreiro_impersonated_tenant');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        impersonatedTenant,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        impersonateTenant,
        keycloakToken,
      }}
    >
      {isLoading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
import React, { createContext, useContext, useState, useEffect } from 'react';
import { type User, type Tenant } from '../lib/types';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../lib/msalConfig';
import { toast } from 'sonner';
import { LoadingScreen } from '../components/LoadingScreen';
import { getTenants, microsoftLogin } from '../lib/apiLocal';

interface AuthContextType {
  user: User | null;
  impersonatedTenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  impersonateTenant: (tenantId: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const [user, setUser] = useState<User | null>(null);
  const [impersonatedTenant, setImpersonatedTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contextReady, setContextReady] = useState(false);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        console.log('🔑 AuthProvider (MSAL) - Inicializando...');

        // 1. Verificar contas ativas no MSAL
        if (accounts.length > 0) {
          const activeAccount = accounts[0];
          instance.setActiveAccount(activeAccount);
          
          // 2. Silenciosamente capturar o Token para validar/criar a Sessão Local no backend
          try {
            const tokenResponse = await instance.acquireTokenSilent({
              ...loginRequest,
              account: activeAccount,
            });
            
            await syncLocalBackendSession(tokenResponse);
          } catch (error) {
            console.error('Falha ao adquirir token silenciosamente. Requerendo reautenticação.', error);
            // Ignore o erro aqui, forçará o usuário a clicar em Entrar novamente
          }
        }

        // 3. Restaurar tenant impersonado
        const storedTenant = localStorage.getItem('matreiro_impersonated_tenant');
        if (storedTenant) {
          setImpersonatedTenant(JSON.parse(storedTenant));
        }
      } catch (error) {
        console.error('Falha genérica no Bootstrap Auth:', error);
      } finally {
        setIsLoading(false);
        setContextReady(true);
        console.log('🔑 AuthProvider (MSAL) - Inicialização completa');
      }
    };

    if (inProgress === 'none') {
      bootstrapAuth();
    }
  }, [inProgress, accounts, instance]);

  const syncLocalBackendSession = async (msalResponse: any) => {
     try {
       // O Payload vai para o Endpoint customizado do Microsoft Login no backend
       const apiResponse = await microsoftLogin({
         accessToken: msalResponse.accessToken,
         idToken: msalResponse.idToken,
         account: msalResponse.account
       });

       if (apiResponse.tokens && apiResponse.user) {
         const localUser: User = {
           id: apiResponse.user.id.toString(),
           name: apiResponse.user.email,
           email: apiResponse.user.email,
           tenantId: apiResponse.user.tenant,
           role: apiResponse.user.role || 'viewer',
           isSuperadmin: apiResponse.user.role === 'superadmin',
           roles: [apiResponse.user.role || 'viewer'],
           token: apiResponse.tokens.access, // Save DRF Token
         };

         setUser(localUser);
         localStorage.setItem('matreiro_user', JSON.stringify(localUser));

         // Token Refresh Setup DRF if required, omitted for brevity as DRF SimpleJWT auto-expires 
         
         toast.success('Autenticado com sucesso!', {
           description: `Plataforma liberada, ${localUser.name}`,
         });
       } else {
         throw new Error("Resposta inválida da plataforma.");
       }
     } catch (err: any) {
        toast.error('Erro na Autorização', { description: err.message || 'Seu acesso ainda não foi aprovado pelo administrador.' });
        logout();
     }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      const loginResponse = await instance.loginPopup(loginRequest);
      if (loginResponse) {
         await syncLocalBackendSession(loginResponse);
      }
    } catch (error: any) {
      console.error('Erro ao fazer login popup', error);
      toast.error('Falha na conexão com Microsoft');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    instance.logoutPopup().catch(console.error);
    setUser(null);
    setImpersonatedTenant(null);
    localStorage.removeItem('matreiro_user');
    localStorage.removeItem('matreiro_impersonated_tenant');
  };

  const impersonateTenant = async (tenantId: string | null) => {
    if (tenantId) {
      try {
        const tenants = await getTenants();
        const tenant = tenants.find((t: any) => String(t.id) === String(tenantId));
        if (tenant) {
          setImpersonatedTenant(tenant);
          localStorage.setItem('matreiro_impersonated_tenant', JSON.stringify(tenant));
        }
      } catch (error) {
        console.error('Error loading tenant for impersonation:', error);
        toast.error('Erro ao trocar visualização de cliente');
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
      }}
    >
      {contextReady ? (isLoading ? <LoadingScreen /> : children) : <LoadingScreen />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      impersonatedTenant: null,
      isAuthenticated: false,
      isLoading: true,
      login: async () => {},
      logout: () => {},
      impersonateTenant: async () => {},
    } as AuthContextType;
  }
  return context;
}
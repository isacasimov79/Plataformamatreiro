import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, Shield, KeyRound } from 'lucide-react';
import logoMatreiro from '../../assets/a30d3ade4a75c608bfa9c14ebe020b7e956f0655.png';
import logoUnderProtection from '../../imports/Logo_Positiva_-_Vetor-01.svg';
import { login as keycloakLogin } from '../lib/keycloak';

export function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  // Se já autenticado, redirecionar
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleKeycloakLogin = () => {
    setIsLoading(true);
    keycloakLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#242545] via-[#2d2d51] to-[#834a8b] relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#834a8b] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#242545] rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0">
        <CardHeader className="text-center pb-8 space-y-6">
          {/* Logo Matreiro */}
          <div className="flex justify-center">
            <img src={logoMatreiro} alt="Matreiro" className="h-16" />
          </div>
          
          <div>
            <CardTitle className="text-2xl text-[#242545]">Plataforma Matreiro</CardTitle>
            <CardDescription className="mt-2">
              Simulação de Phishing e Security Awareness Training
            </CardDescription>
          </div>

          {/* Logo Under Protection */}
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 mb-3">Desenvolvido por</p>
            <img src={logoUnderProtection} alt="Under Protection" className="h-8 mx-auto" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Botão principal de Keycloak */}
            <Button 
              onClick={handleKeycloakLogin}
              className="w-full bg-[#242545] hover:bg-[#2d2d51] h-12" 
              disabled={isLoading}
            >
              <Shield className="w-5 h-5 mr-2" />
              {isLoading ? 'Conectando ao Keycloak...' : 'Entrar com Keycloak'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">SSO Unificado</span>
              </div>
            </div>

            {/* Informações sobre a autenticação */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-blue-900">Autenticação Segura</h4>
                  <p className="text-xs text-blue-700">
                    Sua autenticação é gerenciada pelo Keycloak IAM da Under Protection Network.
                  </p>
                  <div className="text-xs text-blue-600 font-mono bg-blue-100 px-2 py-1 rounded mt-2 inline-block">
                    iam.upn.com.br/realm/underprotection
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 text-center">
                Ambiente de produção protegido por Keycloak
                <br />
                <span className="text-gray-400 mt-1 inline-block">
                  OAuth 2.0 + OIDC + PKCE
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
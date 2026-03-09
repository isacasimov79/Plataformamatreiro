import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';

/**
 * AuthBoundary - Componente que protege rotas dentro do RouterProvider
 * Este componente é renderizado DENTRO do AuthProvider, portanto tem acesso ao contexto
 */
export function AuthBoundary() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Debug: verificar estado de autenticação
    console.log('🔐 AuthBoundary - Estado:', { user: !!user, isLoading });
    
    if (!isLoading && !user) {
      console.log('🔐 AuthBoundary - Redirecionando para /login');
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Mostrar loading screen enquanto carrega
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Se não há usuário, não renderizar nada (useEffect cuidará do redirect)
  if (!user) {
    return null;
  }

  return <Outlet />;
}
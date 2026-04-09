import { Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';

export function LoadingScreen() {
  const [showDevMode, setShowDevMode] = useState(false);

  // Após 5 segundos, mostrar opção de modo desenvolvimento
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDevMode(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDevMode = () => {
    // Forçar reload para ativar modo fallback
    window.location.reload();
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#242545]">
      <div className="text-center max-w-md px-4">
        <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-medium mb-2">Autenticando...</p>
        <p className="text-gray-400 text-sm">Conectando ao Microsoft Entra ID</p>
        
        {showDevMode && (
          <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-yellow-500 text-sm font-medium mb-1">
                  Demorando muito?
                </p>
                <p className="text-yellow-400 text-xs">
                  Se o serviço de autenticação não estiver respondendo, tente recarregar a página.
                </p>
              </div>
            </div>
            <Button
              onClick={handleDevMode}
              variant="outline"
              className="w-full bg-yellow-900/30 border-yellow-700 text-yellow-300 hover:bg-yellow-900/50"
            >
              Recarregar Página
            </Button>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>login.microsoftonline.com</p>
        </div>
      </div>
    </div>
  );
}
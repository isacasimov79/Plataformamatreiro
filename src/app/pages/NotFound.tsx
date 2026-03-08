import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';
import logoMatreiro from 'figma:asset/a30d3ade4a75c608bfa9c14ebe020b7e956f0655.png';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#242545] via-[#2d2d51] to-[#834a8b] relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#834a8b] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#242545] rounded-full blur-3xl"></div>
      </div>

      <div className="text-center relative z-10">
        <div className="flex justify-center mb-6">
          <img src={logoMatreiro} alt="Matreiro" className="h-16" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Página não encontrada</h2>
        <p className="text-gray-300 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button asChild className="bg-[#834a8b] hover:bg-[#9a5ba1]">
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
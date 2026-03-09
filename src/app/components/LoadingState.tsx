import { Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Carregando dados...' }: LoadingStateProps) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#834a8b]" />
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title = 'Nenhum dado encontrado', 
  description = 'Não há dados para exibir no momento.',
  icon 
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          {icon && <div className="text-gray-400">{icon}</div>}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 max-w-md">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

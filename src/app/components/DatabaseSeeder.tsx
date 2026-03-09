import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { toast } from 'sonner';
import { seedDatabase, getTenants } from '../lib/supabaseApi';
import { Database, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export function DatabaseSeeder() {
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      setChecking(true);
      setError(null);
      const tenants = await getTenants();
      const dataExists = tenants && tenants.length > 0;
      setHasData(dataExists);
      
      if (dataExists) {
        console.log('✅ Banco de dados já possui dados:', tenants.length, 'tenants encontrados');
      } else {
        console.log('⚠️ Banco de dados vazio - necessário popular com dados iniciais');
      }
    } catch (error: any) {
      console.error('❌ Error checking database:', error);
      setError(error.message || 'Erro ao verificar banco de dados');
      setHasData(false);
    } finally {
      setChecking(false);
    }
  };

  const handleSeed = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌱 Iniciando população do banco de dados...');
      const result = await seedDatabase();
      
      console.log('✅ Banco de dados populado com sucesso:', result);
      
      toast.success('Banco de dados populado!', {
        description: `Criados: ${result.created?.tenants || 0} clientes, ${result.created?.templates || 0} templates, ${result.created?.targets || 0} alvos, ${result.created?.targetGroups || 0} grupos, ${result.created?.campaigns || 0} campanhas, ${result.created?.trainings || 0} treinamentos, ${result.created?.automations || 0} automações`,
        duration: 5000,
      });
      
      await checkDatabase();
      
      // Recarregar página para atualizar dados
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('❌ Error seeding database:', error);
      
      if (error.message?.includes('already seeded')) {
        toast.info('Banco já possui dados', {
          description: 'O banco de dados já foi inicializado anteriormente.',
        });
        await checkDatabase();
      } else {
        const errorMsg = error.message || 'Não foi possível inicializar o banco de dados.';
        setError(errorMsg);
        toast.error('Erro ao popular banco', {
          description: errorMsg,
          duration: 7000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <p className="text-sm text-blue-900">Verificando banco de dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro de Conexão</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkDatabase}
              className="mr-2"
            >
              Tentar Novamente
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (hasData) {
    return null; // Não mostrar nada se já tem dados
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Database className="w-5 h-5" />
          Banco de Dados Vazio
        </CardTitle>
        <CardDescription className="text-orange-700">
          O banco de dados ainda não foi inicializado. Clique no botão abaixo para popular com dados de exemplo para começar a usar a plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button 
            onClick={handleSeed} 
            disabled={loading}
            className="bg-[#834a8b] hover:bg-[#9a5ba1] w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Populando banco de dados...
              </>
            ) : (
              <>
                <Database className="mr-2 w-4 h-4" />
                Popular Banco de Dados
              </>
            )}
          </Button>
          
          <p className="text-xs text-orange-600">
            Isso criará exemplos de clientes, templates, alvos, campanhas e treinamentos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
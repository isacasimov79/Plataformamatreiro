import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Database, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { seedDatabaseEnhanced } from '../lib/apiLocal';

export function MockDataSeeder() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const data = await seedDatabaseEnhanced();
      setResult(data);
      toast.success('Banco de dados populado com sucesso!');
    } catch (error) {
      console.error('Error seeding database:', error);
      toast.error('Erro ao popular banco de dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Administração do Banco de Dados
        </CardTitle>
        <CardDescription>
          Popule o banco de dados com dados iniciais (tenants, templates, campanhas, treinamentos).
          Alvos e grupos de alvos devem ser importados via integrações (Azure AD/O365).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleSeed} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Populando Banco...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Popular Banco de Dados
            </>
          )}
        </Button>

        {result && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800 dark:text-green-300">Banco populado com sucesso!</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(result.created || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">{key}:</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

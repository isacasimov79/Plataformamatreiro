import { MockDataSeeder } from '../components/MockDataSeeder';

export function MockDataPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ferramentas de Desenvolvimento</h2>
        <p className="text-muted-foreground">
          Popule o banco de dados com dados de demonstração para testar as novas funcionalidades
        </p>
      </div>
      
      <MockDataSeeder />
    </div>
  );
}

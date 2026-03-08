import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { Cloud, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface ConfigureIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationType: 'azure' | 'google' | null;
}

export function ConfigureIntegrationDialog({
  open,
  onOpenChange,
  integrationType,
}: ConfigureIntegrationDialogProps) {
  const [formData, setFormData] = useState({
    tenantId: '',
    clientId: '',
    clientSecret: '',
    domain: '',
    syncEnabled: true,
    syncInterval: '1',
    syncGroups: true,
  });

  const integrationConfig = {
    azure: {
      title: 'Integração Microsoft 365',
      subtitle: 'Azure Active Directory / Entra ID',
      color: 'blue',
      fields: [
        { id: 'tenantId', label: 'Tenant ID', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
        { id: 'clientId', label: 'Application (Client) ID', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
        { id: 'clientSecret', label: 'Client Secret', placeholder: 'Digite o secret', type: 'password' },
      ],
    },
    google: {
      title: 'Integração Google Workspace',
      subtitle: 'Directory API & Admin SDK',
      color: 'red',
      fields: [
        { id: 'domain', label: 'Domínio', placeholder: 'empresa.com.br' },
        { id: 'clientId', label: 'Client ID', placeholder: 'xxxxxxxx.apps.googleusercontent.com' },
        { id: 'clientSecret', label: 'Client Secret', placeholder: 'Digite o secret', type: 'password' },
      ],
    },
  };

  const config = integrationType ? integrationConfig[integrationType] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!config) return;

    // Validar campos obrigatórios
    const missingFields = config.fields.filter((field) => !formData[field.id as keyof typeof formData]);
    if (missingFields.length > 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    toast.success('Integração configurada com sucesso!', {
      description: 'A sincronização inicial será executada em instantes',
    });

    onOpenChange(false);
  };

  const testConnection = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Testando conexão...',
        success: 'Conexão estabelecida com sucesso!',
        error: 'Falha ao conectar. Verifique as credenciais.',
      }
    );
  };

  if (!config) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.subtitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Credenciais */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Credenciais de Autenticação</h3>
            {config.fields.map((field) => (
              <div key={field.id}>
                <Label htmlFor={field.id}>{field.label} *</Label>
                <Input
                  id={field.id}
                  type={field.type || 'text'}
                  value={formData[field.id as keyof typeof formData] as string}
                  onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                  placeholder={field.placeholder}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={testConnection} className="w-full">
              <Cloud className="w-4 h-4 mr-2" />
              Testar Conexão
            </Button>
          </div>

          {/* Configurações de Sincronização */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900">Configurações de Sincronização</h3>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Sincronização Automática</Label>
                <p className="text-xs text-gray-500">
                  Manter usuários sincronizados automaticamente
                </p>
              </div>
              <Switch
                checked={formData.syncEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, syncEnabled: checked })}
              />
            </div>

            {formData.syncEnabled && (
              <>
                <div>
                  <Label htmlFor="syncInterval">Intervalo de Sincronização</Label>
                  <Select
                    value={formData.syncInterval}
                    onValueChange={(value) => setFormData({ ...formData, syncInterval: value })}
                  >
                    <SelectTrigger id="syncInterval" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">A cada 30 minutos</SelectItem>
                      <SelectItem value="1">A cada 1 hora</SelectItem>
                      <SelectItem value="6">A cada 6 horas</SelectItem>
                      <SelectItem value="12">A cada 12 horas</SelectItem>
                      <SelectItem value="24">Uma vez por dia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Sincronizar Grupos</Label>
                    <p className="text-xs text-gray-500">
                      Importar estrutura de grupos/OUs
                    </p>
                  </div>
                  <Switch
                    checked={formData.syncGroups}
                    onCheckedChange={(checked) => setFormData({ ...formData, syncGroups: checked })}
                  />
                </div>
              </>
            )}
          </div>

          {/* Permissões Necessárias */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Permissões Necessárias
            </h4>
            <ul className="space-y-2 text-xs text-blue-700">
              {integrationType === 'azure' ? (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>User.Read.All - Ler perfis de usuários</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Group.Read.All - Ler grupos do diretório</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Directory.Read.All - Ler dados do diretório</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>https://www.googleapis.com/auth/admin.directory.user.readonly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>https://www.googleapis.com/auth/admin.directory.group.readonly</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#834a8b] hover:bg-[#9a5ba1]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Salvar e Sincronizar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

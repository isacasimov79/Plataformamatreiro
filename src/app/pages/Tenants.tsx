import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { getTenants, deleteTenant, updateTenant, getTemplates } from '../lib/supabaseApi';
import { NewTenantDialog } from '../components/NewTenantDialog';
import { EditTenantDialog } from '../components/EditTenantDialog';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Building2, Eye, Edit, Trash2, Search, Settings, Zap, Image as ImageIcon } from 'lucide-react';
import { ClientLogoUpload } from '../components/ClientLogoUpload';

export function Tenants() {
  const { impersonateTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [autoPhishingEnabled, setAutoPhishingEnabled] = useState(false);
  const [delayDays, setDelayDays] = useState(30);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Carregar tenants do banco
  useEffect(() => {
    loadTenants();
    loadTemplates();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await getTenants();
      setTenants(data);
    } catch (error) {
      console.error('Error loading tenants:', error);
      toast.error('Erro ao carregar clientes', {
        description: 'Não foi possível carregar a lista de clientes. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Erro ao carregar modelos', {
        description: 'Não foi possível carregar a lista de modelos. Tente novamente.',
      });
    }
  };

  const handleDeleteTenant = async (id: string, name: string) => {
    try {
      await deleteTenant(id);
      toast.success('Cliente removido', {
        description: `${name} foi removido com sucesso.`,
      });
      await loadTenants(); // Recarregar lista
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast.error('Erro ao remover cliente', {
        description: 'Não foi possível remover o cliente. Tente novamente.',
      });
    }
  };

  const handleConfigureAutoPhishing = (tenant: any) => {
    setSelectedTenant(tenant);
    setAutoPhishingEnabled(tenant.autoPhishingConfig?.enabled || false);
    setDelayDays(tenant.autoPhishingConfig?.delayDays || 30);
    setSelectedTemplate(tenant.autoPhishingConfig?.templateId || '');
    setIsConfigDialogOpen(true);
  };

  const handleSaveAutoPhishing = async () => {
    if (!selectedTenant) return;

    try {
      await updateTenant(selectedTenant.id, {
        ...selectedTenant,
        autoPhishingConfig: {
          enabled: autoPhishingEnabled,
          delayDays,
          templateId: selectedTemplate,
        },
      });

      toast.success('Configuração salva!', {
        description: `Phishing automático ${autoPhishingEnabled ? 'ativado' : 'desativado'} para ${selectedTenant?.name}`,
      });
      setIsConfigDialogOpen(false);
      await loadTenants(); // Recarregar lista
    } catch (error) {
      console.error('Error saving auto phishing config:', error);
      toast.error('Erro ao salvar configuração', {
        description: 'Não foi possível salvar as configurações. Tente novamente.',
      });
    }
  };

  const handleSaveLogo = (logoUrl: string) => {
    toast.success('Logo salva!', {
      description: `Logo de ${selectedTenant?.name} foi atualizada com sucesso`,
    });
    setIsLogoDialogOpen(false);
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.document.includes(searchQuery)
  );

  const getTenantById = (id: string) => {
    return tenants.find((t) => t.id === id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Ativo
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Suspenso
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Inativo
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">Gestão de Clientes</h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Gerencie tenants, sub-clientes e suas configurações
            </p>
          </div>
          <NewTenantDialog />
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por nome ou CNPJ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados</CardTitle>
          <CardDescription>
            {filteredTenants.length} {filteredTenants.length === 1 ? 'cliente' : 'clientes'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Cliente Pai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => {
                const parent = tenant.parentId ? getTenantById(tenant.parentId) : null;
                return (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{tenant.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{tenant.document}</span>
                    </TableCell>
                    <TableCell>
                      {parent ? (
                        <span className="text-sm text-gray-600">{parent.name}</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {format(new Date(tenant.createdAt), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            impersonateTenant(tenant.id);
                            toast.success(`Visualizando como ${tenant.name}`);
                          }}
                          title="Visualizar como este cliente"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <EditTenantDialog tenant={tenant} />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          title="Excluir cliente"
                          onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          title="Configurar phishing automático"
                          onClick={() => handleConfigureAutoPhishing(tenant)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-700"
                          title="Upload de Logo"
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setIsLogoDialogOpen(true);
                          }}
                        >
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Auto Phishing Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configurar Phishing Automático</DialogTitle>
            <DialogDescription>
              Configure as opções de phishing automático para {selectedTenant?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="autoPhishingEnabled">Ativar Phishing Automático</Label>
              <Switch
                id="autoPhishingEnabled"
                checked={autoPhishingEnabled}
                onCheckedChange={setAutoPhishingEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delayDays">Atraso em Dias</Label>
              <Input
                id="delayDays"
                type="number"
                value={delayDays}
                onChange={(e) => setDelayDays(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateId">Modelo de Phishing</Label>
              <Select
                id="templateId"
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfigDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveAutoPhishing}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Logo Upload Dialog */}
      {selectedTenant && (
        <ClientLogoUpload
          isOpen={isLogoDialogOpen}
          onClose={() => setIsLogoDialogOpen(false)}
          onSave={handleSaveLogo}
          clientName={selectedTenant.name}
        />
      )}
    </div>
  );
}
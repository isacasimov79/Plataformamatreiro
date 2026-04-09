import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getTenants, getTargets, deleteAllTargetsByTenant } from '../lib/apiLocal';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import {
  Mail,
  Plus,
  Search,
  Download,
  FolderTree,
  ChevronDown,
  ListPlus,
  Upload,
  Users,
  Building,
  Edit,
  FileText,
  Trash2,
  MoreHorizontal,
  Cloud,
  AlertTriangle,
} from 'lucide-react';

export function Targets() {
  const { user, impersonatedTenant } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [isNewTargetOpen, setIsNewTargetOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [bulkEmails, setBulkEmails] = useState('');
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  
  // Estados para dados do banco
  const [targets, setTargets] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do banco
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [targetsData, tenantsData] = await Promise.all([
        getTargets(),
        getTenants(),
      ]);
      setTargets(targetsData || []);
      setTenants(tenantsData || []);
    } catch (error) {
      console.error('Error loading targets data:', error);
      
      // Usar dados mock quando o servidor não estiver disponível
      console.warn('⚠️ Servidor não disponível. Usando dados mock para demonstração.');
      
      // Mock de tenants
      const mockTenants = [
        {
          id: 'tenant-underprotection',
          name: 'Under Protection',
          document: '12.345.678/0001-90',
          status: 'active',
          parentId: null,
        },
        {
          id: 'tenant-randon',
          name: 'Randon Corp',
          document: '98.765.432/0001-10',
          status: 'active',
          parentId: null,
        },
      ];
      
      // Mock de targets vazios (já que queremos limpar)
      const mockTargets: any[] = [];
      
      setTargets(mockTargets);
      setTenants(mockTenants);
      
      toast.warning(t('targets.messages.offlineWarning'), {
        description: t('targets.messages.offlineDesc'),
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar targets baseado em impersonation
  const isMasterView = !impersonatedTenant;
  const relevantTargets = isMasterView
    ? targets
    : targets.filter(t => t.tenantId === impersonatedTenant.id);

  // Filtrar targets com busca e filtro de origem
  const filteredTargets = relevantTargets.filter((target) => {
    const matchesSearch =
      target.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.department?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSource = sourceFilter === 'all' || target.source === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  const handleAddTarget = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success(t('targets.messages.added'), {
      description: t('targets.messages.addedDesc'),
    });
    setIsNewTargetOpen(false);
  };

  const handleBulkAddTarget = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emails = bulkEmails
      .split('\n')
      .map((email) => email.trim())
      .filter((email) => email.includes('@'));
    toast.success(t('targets.messages.bulkAdded'), {
      description: t('targets.messages.bulkAddedDesc', { count: emails.length }),
    });
    setIsBulkAddDialogOpen(false);
  };

  const handleImportCSV = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success(t('targets.messages.importStarted'), {
      description: t('targets.messages.importStartedDesc'),
    });
    setIsImportDialogOpen(false);
  };

  const handleDelete = (targetId: string) => {
    toast.success(t('targets.messages.deleted'), {
      description: t('targets.messages.deletedDesc'),
    });
  };

  const handleExport = () => {
    const csv = [
      ['Nome', 'Email', 'Departamento', 'Cargo', 'Grupo', 'Status'],
      ...filteredTargets.map((t) => [
        t.name,
        t.email,
        t.department,
        t.position,
        t.group,
        t.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alvos-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(t('targets.messages.exported'), {
      description: t('targets.messages.exportedDesc', { count: filteredTargets.length }),
    });
  };

  const handleCleanupTargets = async () => {
    if (!impersonatedTenant) {
      toast.error('Erro', {
        description: t('targets.messages.cleanupNoTenant'),
      });
      return;
    }

    setIsCleaningUp(true);
    try {
      const result = await deleteAllTargetsByTenant(impersonatedTenant.id);
      
      // Remover targets do tenant localmente ao invés de recarregar tudo
      setTargets(prevTargets => 
        prevTargets.filter(t => t.tenantId !== impersonatedTenant.id)
      );
      
      toast.success(t('targets.messages.cleanupSuccess'), {
        description: t('targets.messages.cleanupSuccessDesc', { count: result.deletedCount, name: impersonatedTenant.name }),
      });
      
      setIsCleanupDialogOpen(false);
    } catch (error: any) {
      console.error('Erro ao limpar alvos:', error);
      
      // Se estiver em modo offline, simular a limpeza
      if (error.message?.includes('conexão') || error.message?.includes('fetch')) {
        console.warn('⚠️ Modo offline: simulando limpeza de dados');
        
        // Remover targets do tenant selecionado localmente
        setTargets(prevTargets => 
          prevTargets.filter(t => t.tenantId !== impersonatedTenant.id)
        );
        
        toast.success(t('targets.messages.cleanupOffline'), {
          description: t('targets.messages.cleanupOfflineDesc'),
        });
        
        setIsCleanupDialogOpen(false);
      } else {
        toast.error(t('targets.messages.cleanupError'), {
          description: error.message || t('targets.messages.cleanupErrorDesc'),
        });
      }
    } finally {
      setIsCleaningUp(false);
    }
  };

  const stats = {
    total: relevantTargets.length,
    active: relevantTargets.filter((t) => t.status === 'active').length,
    bounced: relevantTargets.filter((t) => t.status === 'bounced').length,
    optedOut: relevantTargets.filter((t) => t.status === 'opted_out').length,
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">
              {t('targets.title')}
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              {isMasterView
                ? t('targets.descMaster')
                : t('targets.descTenant', { name: impersonatedTenant?.name })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/target-groups')}>
              <FolderTree className="w-4 h-4 mr-2" />
              {t('targets.actions.viewGroups')}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              {t('targets.actions.export')}
            </Button>
            
            {/* Botão de limpeza de dados (apenas para tenant selecionado) */}
            {impersonatedTenant && (
              <Button 
                variant="outline" 
                onClick={() => setIsCleanupDialogOpen(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Dados
              </Button>
            )}
            
            {/* Dropdown para adicionar alvos com múltiplas opções */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('targets.actions.addTargets')}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('targets.actions.chooseMethod')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsNewTargetOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('targets.actions.addIndividual')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsBulkAddDialogOpen(true)}>
                  <ListPlus className="w-4 h-4 mr-2" />
                  {t('targets.actions.addBulk')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/targets/import')}>
                  <Upload className="w-4 h-4 mr-2" />
                  {t('targets.actions.importCsv')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsIntegrationDialogOpen(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  {t('targets.actions.importIntegration')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Dialog Individual */}
            <Dialog open={isNewTargetOpen} onOpenChange={setIsNewTargetOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Alvo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddTarget}>
                  <DialogHeader>
                    <DialogTitle>{t('targets.actions.addIndividualDialogTitle')}</DialogTitle>
                    <DialogDescription>
                      {t('targets.actions.addIndividualDialogDesc')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name">{t('targets.labels.fullName')}</Label>
                      <Input
                        id="name"
                        placeholder={t('targets.placeholders.name')}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('targets.labels.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('targets.placeholders.email')}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Departamento</Label>
                      <Input
                        id="department"
                        placeholder="TI"
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Cargo</Label>
                      <Input
                        id="position"
                        placeholder="Analista de Sistemas"
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="group">{t('targets.labels.group')}</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t('targets.placeholders.selectGroup')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ti">{t('targets.groups.ti')}</SelectItem>
                          <SelectItem value="rh">{t('targets.groups.rh')}</SelectItem>
                          <SelectItem value="financeiro">{t('targets.groups.financeiro')}</SelectItem>
                          <SelectItem value="comercial">{t('targets.groups.comercial')}</SelectItem>
                          <SelectItem value="diretoria">{t('targets.groups.diretoria')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {isMasterView && (
                      <div>
                        <Label htmlFor="tenant">{t('targets.labels.tenant')}</Label>
                        <Select>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder={t('targets.placeholders.selectTenant')} />
                          </SelectTrigger>
                          <SelectContent>
                            {tenants.map((tenant) => (
                              <SelectItem key={tenant.id} value={tenant.id}>
                                {tenant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsNewTargetOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                      Adicionar
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog
              open={isBulkAddDialogOpen}
              onOpenChange={setIsBulkAddDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                  <ListPlus className="w-4 h-4 mr-2" />
                  Adicionar em Massa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleBulkAddTarget}>
                  <DialogHeader>
                    <DialogTitle>{t('targets.actions.addBulkDialogTitle')}</DialogTitle>
                    <DialogDescription>
                      {t('targets.actions.addBulkDialogDesc')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="emails">{t('targets.labels.emails')}</Label>
                      <Textarea
                        id="emails"
                        placeholder={t('targets.placeholders.emailsBulk')}
                        required
                        className="mt-2"
                        value={bulkEmails}
                        onChange={(e) => setBulkEmails(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">{t('targets.labels.department')}</Label>
                      <Input
                        id="department"
                        placeholder={t('targets.placeholders.department')}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">{t('targets.labels.position')}</Label>
                      <Input
                        id="position"
                        placeholder={t('targets.placeholders.position')}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="group">{t('targets.labels.group')}</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t('targets.placeholders.selectGroup')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ti">{t('targets.groups.ti')}</SelectItem>
                          <SelectItem value="rh">{t('targets.groups.rh')}</SelectItem>
                          <SelectItem value="financeiro">{t('targets.groups.financeiro')}</SelectItem>
                          <SelectItem value="comercial">{t('targets.groups.comercial')}</SelectItem>
                          <SelectItem value="diretoria">{t('targets.groups.diretoria')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {isMasterView && (
                      <div>
                        <Label htmlFor="tenant">Cliente</Label>
                        <Select>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {tenants.map((tenant) => (
                              <SelectItem key={tenant.id} value={tenant.id}>
                                {tenant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsBulkAddDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#834a8b] hover:bg-[#6d3d75]"
                    >
                      Adicionar
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            {/* Dialog Importação da Integração */}
            <Dialog
              open={isIntegrationDialogOpen}
              onOpenChange={setIsIntegrationDialogOpen}
            >
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('targets.integration.title')}</DialogTitle>
                  <DialogDescription>
                    {t('targets.integration.desc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="cursor-pointer hover:border-[#834a8b] transition-colors">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Microsoft 365</CardTitle>
                          <Badge variant="secondary">{t('targets.integration.connected')}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          {t('targets.integration.m365Desc')}
                        </p>
                        <Button
                          className="w-full bg-[#0078d4] hover:bg-[#106ebe]"
                          onClick={() => {
                            toast.success(t('targets.messages.importStarted'), {
                              description: 'Sincronizando usuários do Microsoft 365...',
                            });
                            setIsIntegrationDialogOpen(false);
                          }}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          {t('targets.integration.btnM365')}
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:border-[#834a8b] transition-colors">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Google Workspace</CardTitle>
                          <Badge variant="secondary">{t('targets.integration.connected')}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          {t('targets.integration.googleDesc')}
                        </p>
                        <Button
                          className="w-full bg-[#4285f4] hover:bg-[#3367d6]"
                          onClick={() => {
                            toast.success(t('targets.messages.importStarted'), {
                              description: 'Sincronizando usuários do Google Workspace...',
                            });
                            setIsIntegrationDialogOpen(false);
                          }}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          {t('targets.integration.btnGoogle')}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="text-blue-600">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                          {t('targets.integration.configTitle')}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {t('targets.integration.configDesc1')}
                          <button
                            onClick={() => {
                              navigate('/integrations');
                              setIsIntegrationDialogOpen(false);
                            }}
                            className="font-medium underline hover:text-blue-900"
                          >
                            {t('targets.integration.configLink')}
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsIntegrationDialogOpen(false)}
                  >
                    Fechar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('targets.stats.total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('targets.stats.active')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('targets.stats.bounced')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.bounced}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('targets.stats.optedOut')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.optedOut}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={t('targets.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('targets.filters.source')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('targets.filters.sourceAll')}</SelectItem>
                <SelectItem value="manual">{t('targets.filters.sourceManual')}</SelectItem>
                <SelectItem value="azure-ad">{t('targets.filters.sourceAzure')}</SelectItem>
                <SelectItem value="import">{t('targets.filters.sourceCsv')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Targets Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('targets.table.title')}</CardTitle>
          <CardDescription>
            {t('targets.table.desc', { count: filteredTargets.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('targets.table.cols.name')}</TableHead>
                <TableHead>{t('targets.table.cols.email')}</TableHead>
                <TableHead>{t('targets.table.cols.department')}</TableHead>
                <TableHead>{t('targets.table.cols.position')}</TableHead>
                <TableHead>{t('targets.table.cols.group')}</TableHead>
                {isMasterView && <TableHead>{t('targets.table.cols.tenant')}</TableHead>}
                <TableHead>{t('targets.table.cols.status')}</TableHead>
                <TableHead className="text-right">{t('targets.table.cols.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTargets.map((target) => (
                <TableRow key={target.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {target.name}
                      {target.source === 'azure-ad' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          <Cloud className="w-3 h-3 mr-1" />
                          Azure AD
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{target.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{target.department}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {target.position}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{target.group}</Badge>
                  </TableCell>
                  {isMasterView && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {tenants.find((t) => t.id === target.tenantId)?.name ||
                            'N/A'}
                        </span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    {target.status === 'active' && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        {t('targets.status.active')}
                      </Badge>
                    )}
                    {target.status === 'bounced' && (
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200"
                      >
                        {t('targets.status.bounced')}
                      </Badge>
                    )}
                    {target.status === 'opted_out' && (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        {t('targets.status.optedOut')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('targets.table.cols.actions')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          {t('targets.table.actions.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="w-4 h-4 mr-2" />
                          {t('targets.table.actions.history')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(target.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('targets.table.actions.remove')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação para Limpar Dados */}
      <Dialog open={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle>{t('targets.cleanupDialog.title')}</DialogTitle>
                <DialogDescription>
                  {t('targets.cleanupDialog.desc', { name: impersonatedTenant?.name })}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-900 font-medium mb-2">
                ⚠️ Você está prestes a deletar TODOS os alvos do tenant:
              </p>
              <p className="text-sm text-red-700 font-semibold">
                {impersonatedTenant?.name}
              </p>
              <p className="text-sm text-red-600 mt-2">
                Total de alvos que serão removidos: <strong>{relevantTargets.length}</strong>
              </p>
            </div>
            
            <p className="text-sm text-gray-600">
              Isso irá remover permanentemente todos os e-mails alvo, incluindo:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
              <li>Alvos importados do Azure AD</li>
              <li>Alvos adicionados manualmente</li>
              <li>Alvos importados via CSV/Excel</li>
              <li>Todo o histórico associado</li>
            </ul>
            
            <p className="text-sm font-medium text-gray-900">
              Tem certeza de que deseja continuar?
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCleanupDialogOpen(false)}
              disabled={isCleaningUp}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCleanupTargets}
              disabled={isCleaningUp}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isCleaningUp ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t('targets.cleanupDialog.btnCleaning')}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('targets.cleanupDialog.btnClean')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getTenants, getTargets } from '../lib/supabaseApi';
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
      setTargets(targetsData);
      setTenants(tenantsData);
    } catch (error) {
      console.error('Error loading targets data:', error);
      toast.error('Erro ao carregar targets');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar targets baseado em impersonation
  const isMasterView = !impersonatedTenant;
  const relevantTargets = isMasterView
    ? targets
    : targets.filter(t => t.tenantId === impersonatedTenant.id);

  // Filtrar targets com busca
  const filteredTargets = relevantTargets.filter(
    (target) =>
      target.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTarget = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('E-mail alvo adicionado!', {
      description: 'O alvo foi adicionado com sucesso à lista',
    });
    setIsNewTargetOpen(false);
  };

  const handleBulkAddTarget = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emails = bulkEmails
      .split('\n')
      .map((email) => email.trim())
      .filter((email) => email.includes('@'));
    toast.success('E-mails alvos adicionados!', {
      description: `${emails.length} alvos foram adicionados à lista`,
    });
    setIsBulkAddDialogOpen(false);
  };

  const handleImportCSV = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Importação iniciada!', {
      description: 'Os e-mails alvos estão sendo processados',
    });
    setIsImportDialogOpen(false);
  };

  const handleDelete = (targetId: string) => {
    toast.success('E-mail alvo removido!', {
      description: 'O alvo foi removido da lista',
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

    toast.success('Lista exportada!', {
      description: `${filteredTargets.length} alvos exportados em CSV`,
    });
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
              E-mails Alvo
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              {isMasterView
                ? 'Gerencie todos os alvos de campanhas'
                : `Cliente: ${impersonatedTenant?.name}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/target-groups')}>
              <FolderTree className="w-4 h-4 mr-2" />
              Ver Grupos
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            
            {/* Dropdown para adicionar alvos com múltiplas opções */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Alvos
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Escolha o método</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsNewTargetOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Individual
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsBulkAddDialogOpen(true)}>
                  <ListPlus className="w-4 h-4 mr-2" />
                  Adicionar em Massa (Lista)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/targets/import')}>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar CSV/Excel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsIntegrationDialogOpen(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  Importar da Integração
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
                    <DialogTitle>Adicionar E-mail Alvo</DialogTitle>
                    <DialogDescription>
                      Adicione um novo alvo para campanhas de phishing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        placeholder="João Silva"
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="joao.silva@empresa.com.br"
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
                      <Label htmlFor="group">Grupo</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione o grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ti">TI</SelectItem>
                          <SelectItem value="rh">RH</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                          <SelectItem value="comercial">Comercial</SelectItem>
                          <SelectItem value="diretoria">Diretoria</SelectItem>
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
                    <DialogTitle>Adicionar E-mails Alvo em Massa</DialogTitle>
                    <DialogDescription>
                      Adicione múltiplos e-mails alvos para campanhas de phishing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="emails">E-mails</Label>
                      <Textarea
                        id="emails"
                        placeholder="joao.silva@empresa.com.br\nmaria.souza@empresa.com.br"
                        required
                        className="mt-2"
                        value={bulkEmails}
                        onChange={(e) => setBulkEmails(e.target.value)}
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
                      <Label htmlFor="group">Grupo</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione o grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ti">TI</SelectItem>
                          <SelectItem value="rh">RH</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                          <SelectItem value="comercial">Comercial</SelectItem>
                          <SelectItem value="diretoria">Diretoria</SelectItem>
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
                  <DialogTitle>Importar da Integração</DialogTitle>
                  <DialogDescription>
                    Importe usuários diretamente do Microsoft 365 ou Google Workspace
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="cursor-pointer hover:border-[#834a8b] transition-colors">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Microsoft 365</CardTitle>
                          <Badge variant="secondary">Conectado</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          Importar usuários do Azure AD/Entra ID
                        </p>
                        <Button
                          className="w-full bg-[#0078d4] hover:bg-[#106ebe]"
                          onClick={() => {
                            toast.success('Importação iniciada!', {
                              description: 'Sincronizando usuários do Microsoft 365...',
                            });
                            setIsIntegrationDialogOpen(false);
                          }}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Importar do M365
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:border-[#834a8b] transition-colors">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Google Workspace</CardTitle>
                          <Badge variant="secondary">Conectado</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          Importar usuários do Google Directory
                        </p>
                        <Button
                          className="w-full bg-[#4285f4] hover:bg-[#3367d6]"
                          onClick={() => {
                            toast.success('Importação iniciada!', {
                              description: 'Sincronizando usuários do Google Workspace...',
                            });
                            setIsIntegrationDialogOpen(false);
                          }}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Importar do Google
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
                          Configuração de Integrações
                        </h4>
                        <p className="text-sm text-blue-700">
                          Para configurar ou reconectar integrações, acesse a página de{' '}
                          <button
                            onClick={() => {
                              navigate('/integrations');
                              setIsIntegrationDialogOpen(false);
                            }}
                            className="font-medium underline hover:text-blue-900"
                          >
                            Integrações
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
            <CardTitle className="text-sm text-gray-600">Total de Alvos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Bounced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.bounced}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Opted Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.optedOut}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar por nome, e-mail ou departamento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Targets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de E-mails Alvo</CardTitle>
          <CardDescription>
            {filteredTargets.length} alvos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Grupo</TableHead>
                {isMasterView && <TableHead>Cliente</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTargets.map((target) => (
                <TableRow key={target.id}>
                  <TableCell className="font-medium">{target.name}</TableCell>
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
                        Ativo
                      </Badge>
                    )}
                    {target.status === 'bounced' && (
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200"
                      >
                        Bounced
                      </Badge>
                    )}
                    {target.status === 'opted_out' && (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        Opted Out
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
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="w-4 h-4 mr-2" />
                          Ver Histórico
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(target.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
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
    </div>
  );
}
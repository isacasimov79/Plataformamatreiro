import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import {
  Plus,
  Search,
  Users,
  MoreHorizontal,
  Trash2,
  Edit,
  FolderTree,
  ChevronDown,
  ChevronRight,
  Download,
  UserPlus,
  Mail,
  Building,
  Network,
} from 'lucide-react';
import { toast } from 'sonner';
import { mockTargetGroups, mockTargets, mockTenants } from '../lib/mockData';

export function TargetGroups() {
  const { user, impersonatedTenant } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false);
  const [isImportIntegrationOpen, setIsImportIntegrationOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<typeof mockTargetGroups[0] | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const isMasterView = !impersonatedTenant;

  // Filtrar grupos baseado em impersonation
  const relevantGroups = isMasterView
    ? mockTargetGroups
    : mockTargetGroups.filter((g) => g.tenantId === impersonatedTenant?.id);

  // Filtrar grupos com busca
  const filteredGroups = relevantGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Grupo criado!', {
      description: 'O grupo de alvos foi criado com sucesso',
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Grupo atualizado!', {
      description: 'O grupo de alvos foi atualizado com sucesso',
    });
    setIsEditDialogOpen(false);
  };

  const handleAddMembers = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Membros adicionados!', {
      description: 'Os membros foram adicionados ao grupo',
    });
    setIsAddMembersDialogOpen(false);
  };

  const handleDelete = (groupId: string) => {
    toast.success('Grupo removido!', {
      description: 'O grupo foi removido com sucesso',
    });
  };

  const toggleExpand = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Construir hierarquia de grupos
  const buildHierarchy = (parentId: string | null = null, level: number = 0): any[] => {
    return filteredGroups
      .filter((g) => g.parentGroupId === parentId)
      .map((group) => ({
        ...group,
        level,
        children: buildHierarchy(group.id, level + 1),
      }));
  };

  const hierarchy = buildHierarchy();

  const renderGroupRow = (group: any): JSX.Element[] => {
    const isExpanded = expandedGroups.has(group.id);
    const hasChildren = group.children && group.children.length > 0;

    const rows: JSX.Element[] = [
      <TableRow key={group.id}>
        <TableCell>
          <div className="flex items-center gap-2" style={{ paddingLeft: `${group.level * 24}px` }}>
            {hasChildren && (
              <button
                onClick={() => toggleExpand(group.id)}
                className="hover:bg-gray-100 rounded p-1"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            <FolderTree className="w-4 h-4 text-[#834a8b]" />
            <span className="font-medium">{group.name}</span>
            {group.source === 'integration' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {group.integrationProvider}
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="text-sm text-gray-600">{group.description}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{group.memberCount}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="secondary">{group.type === 'local' ? 'Local' : 'Integração'}</Badge>
        </TableCell>
        {isMasterView && (
          <TableCell>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {mockTenants.find((t) => t.id === group.tenantId)?.name || 'N/A'}
              </span>
            </div>
          </TableCell>
        )}
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
              <DropdownMenuItem
                onClick={() => {
                  setSelectedGroup(group.id);
                  setIsAddMembersDialogOpen(true);
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar Membros
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedGroup(group);
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Grupo
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Exportar Membros
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(group.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remover Grupo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>,
    ];

    // Adicionar linhas de filhos se expandido
    if (isExpanded && hasChildren) {
      group.children.forEach((child: any) => {
        rows.push(...renderGroupRow(child));
      });
    }

    return rows;
  };

  const stats = {
    total: relevantGroups.length,
    local: relevantGroups.filter((g) => g.type === 'local').length,
    integration: relevantGroups.filter((g) => g.type === 'integration').length,
    totalMembers: relevantGroups.reduce((sum, g) => sum + g.memberCount, 0),
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">
              Grupos de Alvos
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              {isMasterView
                ? 'Gerencie grupos de alvos para campanhas'
                : `Cliente: ${impersonatedTenant?.name}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/targets')}>
              <Mail className="w-4 h-4 mr-2" />
              Ver Alvos Individuais
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Grupo
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Escolha o método</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Grupo Local
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsImportIntegrationOpen(true)}>
                  <Network className="w-4 h-4 mr-2" />
                  Importar da Integração
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total de Grupos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Grupos Locais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#834a8b]">{stats.local}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Da Integração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.integration}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total de Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalMembers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar grupos por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Grupos</CardTitle>
          <CardDescription>
            {filteredGroups.length} grupos encontrados (hierarquia expandível)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Grupo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Membros</TableHead>
                <TableHead>Tipo</TableHead>
                {isMasterView && <TableHead>Cliente</TableHead>}
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hierarchy.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMasterView ? 6 : 5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <FolderTree className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">Nenhum grupo encontrado</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Grupo
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                hierarchy.map((group) => renderGroupRow(group))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog: Criar Grupo Local */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleCreateGroup}>
            <DialogHeader>
              <DialogTitle>Criar Grupo de Alvos</DialogTitle>
              <DialogDescription>
                Crie um grupo local para organizar alvos de campanhas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Nome do Grupo</Label>
                <Input
                  id="name"
                  placeholder="Departamento de TI"
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição do grupo..."
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="parentGroup">Grupo Pai (opcional)</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Nenhum (grupo raiz)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum (grupo raiz)</SelectItem>
                    {relevantGroups
                      .filter((g) => g.type === 'local')
                      .map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Crie uma hierarquia adicionando este grupo dentro de outro
                </p>
              </div>
              {isMasterView && (
                <div>
                  <Label htmlFor="tenant">Cliente</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="border-t pt-4">
                <Label>Adicionar Membros Iniciais</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button type="button" variant="outline" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Emails
                  </Button>
                  <Button type="button" variant="outline" size="sm">
                    <FolderTree className="w-4 h-4 mr-2" />
                    Adicionar Grupos
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                Criar Grupo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Grupo */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleEditGroup}>
            <DialogHeader>
              <DialogTitle>Editar Grupo de Alvos</DialogTitle>
              <DialogDescription>
                Edite um grupo local para organizar alvos de campanhas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Nome do Grupo</Label>
                <Input
                  id="name"
                  placeholder="Departamento de TI"
                  required
                  className="mt-2"
                  defaultValue={selectedGroup?.name}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição do grupo..."
                  className="mt-2"
                  rows={3}
                  defaultValue={selectedGroup?.description}
                />
              </div>
              <div>
                <Label htmlFor="parentGroup">Grupo Pai (opcional)</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Nenhum (grupo raiz)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum (grupo raiz)</SelectItem>
                    {relevantGroups
                      .filter((g) => g.type === 'local')
                      .map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Crie uma hierarquia adicionando este grupo dentro de outro
                </p>
              </div>
              {isMasterView && (
                <div>
                  <Label htmlFor="tenant">Cliente</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="border-t pt-4">
                <Label>Adicionar Membros Iniciais</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button type="button" variant="outline" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Emails
                  </Button>
                  <Button type="button" variant="outline" size="sm">
                    <FolderTree className="w-4 h-4 mr-2" />
                    Adicionar Grupos
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                Atualizar Grupo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Adicionar Membros */}
      <Dialog open={isAddMembersDialogOpen} onOpenChange={setIsAddMembersDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleAddMembers}>
            <DialogHeader>
              <DialogTitle>Adicionar Membros ao Grupo</DialogTitle>
              <DialogDescription>
                Adicione emails individuais ou outros grupos como membros
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:border-[#834a8b] transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">Emails Individuais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="emails">Lista de E-mails</Label>
                    <Textarea
                      id="emails"
                      placeholder="joao@empresa.com&#10;maria@empresa.com"
                      className="mt-2"
                      rows={6}
                    />
                    <p className="text-sm text-gray-500 mt-2">Um email por linha</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-[#834a8b] transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">Grupos Existentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="groups">Selecionar Grupos</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Escolha grupos" />
                      </SelectTrigger>
                      <SelectContent>
                        {relevantGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name} ({group.memberCount} membros)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-2">
                      Grupos dentro de grupos (hierarquia)
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddMembersDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                Adicionar Membros
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Importar da Integração */}
      <Dialog open={isImportIntegrationOpen} onOpenChange={setIsImportIntegrationOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar Grupos da Integração</DialogTitle>
            <DialogDescription>
              Sincronize grupos do Microsoft 365 ou Google Workspace
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
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Importar grupos de segurança e distribuição do Azure AD
                  </p>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Tipos disponíveis:</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Security Groups</Badge>
                      <Badge variant="outline" className="text-xs">Distribution Lists</Badge>
                      <Badge variant="outline" className="text-xs">Microsoft 365 Groups</Badge>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-[#0078d4] hover:bg-[#106ebe]"
                    onClick={() => {
                      toast.success('Importação iniciada!', {
                        description: 'Sincronizando grupos do Microsoft 365...',
                      });
                      setIsImportIntegrationOpen(false);
                    }}
                  >
                    <Network className="w-4 h-4 mr-2" />
                    Importar Grupos M365
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
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Importar grupos do Google Directory
                  </p>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Tipos disponíveis:</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Security Groups</Badge>
                      <Badge variant="outline" className="text-xs">Email Lists</Badge>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-[#4285f4] hover:bg-[#3367d6]"
                    onClick={() => {
                      toast.success('Importação iniciada!', {
                        description: 'Sincronizando grupos do Google Workspace...',
                      });
                      setIsImportIntegrationOpen(false);
                    }}
                  >
                    <Network className="w-4 h-4 mr-2" />
                    Importar Grupos Google
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="text-yellow-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-yellow-900 mb-1">
                    Sincronização Automática
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Os grupos importados serão sincronizados automaticamente a cada 24 horas.
                    Membros adicionados/removidos na integração serão refletidos aqui.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImportIntegrationOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
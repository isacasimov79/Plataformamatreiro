import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  DialogTrigger,
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
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Shield,
  Key,
  Building,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { mockTenants } from '../lib/mockData';
import { format } from 'date-fns';

// Mock data para usuários do sistema
const mockSystemUsers = [
  {
    id: 'user-1',
    name: 'Igor Feitosa',
    email: 'igor@underprotection.com.br',
    role: 'superadmin',
    tenantId: null,
    status: 'active',
    lastLogin: '2026-03-08T10:30:00Z',
    createdAt: '2025-01-15T00:00:00Z',
    keycloakId: 'kc-123456',
  },
  {
    id: 'user-2',
    name: 'Carlos Admin',
    email: 'admin@banconacional.com.br',
    role: 'admin',
    tenantId: 'tenant-1',
    status: 'active',
    lastLogin: '2026-03-07T16:45:00Z',
    createdAt: '2025-02-01T00:00:00Z',
    keycloakId: 'kc-234567',
  },
  {
    id: 'user-3',
    name: 'Maria Gestora',
    email: 'gestor@techcorp.com.br',
    role: 'user',
    tenantId: 'tenant-2',
    status: 'active',
    lastLogin: '2026-03-08T09:15:00Z',
    createdAt: '2025-03-10T00:00:00Z',
    keycloakId: 'kc-345678',
  },
  {
    id: 'user-4',
    name: 'João Silva',
    email: 'joao@empresaabc.com.br',
    role: 'user',
    tenantId: 'tenant-3',
    status: 'inactive',
    lastLogin: '2026-02-20T14:00:00Z',
    createdAt: '2025-04-05T00:00:00Z',
    keycloakId: 'kc-456789',
  },
];

type Role = 'superadmin' | 'admin' | 'user';

const roleLabels: Record<Role, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  user: 'Usuário',
};

const roleColors: Record<Role, string> = {
  superadmin: 'bg-purple-100 text-purple-700 border-purple-300',
  admin: 'bg-blue-100 text-blue-700 border-blue-300',
  user: 'bg-gray-100 text-gray-700 border-gray-300',
};

export function SystemUsers() {
  const { user, impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof mockSystemUsers[0] | null>(null);

  // Apenas superadmin pode ver TODOS os usuários
  const isSuperAdmin = user?.role === 'superadmin' && !impersonatedTenant;
  
  // Filtrar usuários baseado no contexto
  const relevantUsers = isSuperAdmin
    ? mockSystemUsers
    : mockSystemUsers.filter(
        (u) => u.tenantId === (impersonatedTenant?.id || user?.tenantId)
      );

  // Filtrar usuários com busca
  const filteredUsers = relevantUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roleLabels[user.role as Role].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Usuário adicionado!', {
      description: 'Um e-mail de boas-vindas foi enviado com instruções de acesso',
    });
    setIsAddDialogOpen(false);
  };

  const handleEditUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Usuário atualizado!', {
      description: 'As alterações foram salvas com sucesso',
    });
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = (userId: string) => {
    toast.success('Usuário removido!', {
      description: 'O acesso do usuário foi revogado',
    });
  };

  const handleResetPassword = (userId: string) => {
    toast.success('E-mail enviado!', {
      description: 'Instruções para redefinir senha foram enviadas',
    });
  };

  const stats = {
    total: relevantUsers.length,
    active: relevantUsers.filter((u) => u.status === 'active').length,
    superadmins: relevantUsers.filter((u) => u.role === 'superadmin').length,
    admins: relevantUsers.filter((u) => u.role === 'admin').length,
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">
              Usuários do Sistema
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              {isSuperAdmin
                ? 'Gerencie todos os usuários com acesso à plataforma'
                : `Usuários do cliente: ${impersonatedTenant?.name || 'Seu cliente'}`}
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddUser}>
                <DialogHeader>
                  <DialogTitle>Adicionar Usuário do Sistema</DialogTitle>
                  <DialogDescription>
                    Crie um novo usuário com acesso à plataforma via Keycloak
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="add-name">Nome Completo</Label>
                    <Input
                      id="add-name"
                      placeholder="João Silva"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-email">E-mail</Label>
                    <Input
                      id="add-email"
                      type="email"
                      placeholder="joao.silva@empresa.com.br"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-role">Permissão (Role)</Label>
                    <Select>
                      <SelectTrigger className="mt-2" id="add-role">
                        <SelectValue placeholder="Selecione a permissão" />
                      </SelectTrigger>
                      <SelectContent>
                        {isSuperAdmin && (
                          <SelectItem value="superadmin">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-purple-600" />
                              Super Admin (Acesso Total)
                            </div>
                          </SelectItem>
                        )}
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-600" />
                            Administrador (Gestão do Cliente)
                          </div>
                        </SelectItem>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-gray-600" />
                            Usuário (Somente Leitura)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="add-tenant">Cliente</Label>
                    <Select>
                      <SelectTrigger className="mt-2" id="add-tenant">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {isSuperAdmin && (
                          <SelectItem value="null">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-purple-600" />
                              Master (Todos os clientes)
                            </div>
                          </SelectItem>
                        )}
                        {mockTenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-gray-600" />
                              {tenant.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      ℹ️ Um e-mail será enviado com link para criar senha no Keycloak
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                    Criar Usuário
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total</CardTitle>
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
        {isSuperAdmin && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Super Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.superadmins}
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.admins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar por nome, e-mail ou permissão..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários com Acesso à Plataforma</CardTitle>
          <CardDescription>
            {filteredUsers.length} usuários encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Permissão</TableHead>
                {isSuperAdmin && <TableHead>Cliente</TableHead>}
                <TableHead>Último Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((systemUser) => (
                <TableRow key={systemUser.id}>
                  <TableCell className="font-medium">{systemUser.name}</TableCell>
                  <TableCell>{systemUser.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={roleColors[systemUser.role as Role]}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {roleLabels[systemUser.role as Role]}
                    </Badge>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      {systemUser.tenantId ? (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {mockTenants.find((t) => t.id === systemUser.tenantId)
                              ?.name || 'N/A'}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          Master
                        </Badge>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {format(new Date(systemUser.lastLogin), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {systemUser.status === 'active' ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Inativo
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
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(systemUser);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleResetPassword(systemUser.id)}
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Redefinir Senha
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(systemUser.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover Acesso
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

      {/* Edit Dialog */}
      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <form onSubmit={handleEditUser}>
              <DialogHeader>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogDescription>
                  Atualize as informações e permissões do usuário
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-name">Nome Completo</Label>
                  <Input
                    id="edit-name"
                    defaultValue={selectedUser.name}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">E-mail</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    defaultValue={selectedUser.email}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">Permissão (Role)</Label>
                  <Select defaultValue={selectedUser.role}>
                    <SelectTrigger className="mt-2" id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {isSuperAdmin && (
                        <SelectItem value="superadmin">
                          Super Admin (Acesso Total)
                        </SelectItem>
                      )}
                      <SelectItem value="admin">
                        Administrador (Gestão do Cliente)
                      </SelectItem>
                      <SelectItem value="user">Usuário (Somente Leitura)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select defaultValue={selectedUser.status}>
                    <SelectTrigger className="mt-2" id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

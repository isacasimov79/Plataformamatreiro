import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Users, Lock, Plus, Edit, Trash2, Save, X, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

// Types
interface Permission {
  id: string;
  name: string;
  codename: string;
  module: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  customPermissions: Permission[];
}

// Mock Data
const mockPermissions: Permission[] = [
  // Campaigns
  { id: '1', name: 'Criar Campanhas', codename: 'campaigns.create', module: 'campaigns', description: 'Criar novas campanhas de phishing' },
  { id: '2', name: 'Visualizar Campanhas', codename: 'campaigns.read', module: 'campaigns', description: 'Visualizar campanhas existentes' },
  { id: '3', name: 'Editar Campanhas', codename: 'campaigns.update', module: 'campaigns', description: 'Editar campanhas existentes' },
  { id: '4', name: 'Deletar Campanhas', codename: 'campaigns.delete', module: 'campaigns', description: 'Deletar campanhas' },
  { id: '5', name: 'Iniciar Campanhas', codename: 'campaigns.start', module: 'campaigns', description: 'Iniciar campanhas' },
  { id: '6', name: 'Pausar Campanhas', codename: 'campaigns.pause', module: 'campaigns', description: 'Pausar campanhas' },
  { id: '7', name: 'Ver Resultados', codename: 'campaigns.view_results', module: 'campaigns', description: 'Visualizar resultados de campanhas' },
  { id: '8', name: 'Exportar Dados', codename: 'campaigns.export', module: 'campaigns', description: 'Exportar dados de campanhas' },
  
  // Targets
  { id: '9', name: 'Criar Alvos', codename: 'targets.create', module: 'targets', description: 'Criar novos alvos' },
  { id: '10', name: 'Visualizar Alvos', codename: 'targets.read', module: 'targets', description: 'Visualizar alvos' },
  { id: '11', name: 'Editar Alvos', codename: 'targets.update', module: 'targets', description: 'Editar alvos' },
  { id: '12', name: 'Deletar Alvos', codename: 'targets.delete', module: 'targets', description: 'Deletar alvos' },
  { id: '13', name: 'Importar Alvos', codename: 'targets.import', module: 'targets', description: 'Importar alvos de CSV/Excel' },
  { id: '14', name: 'Exportar Alvos', codename: 'targets.export', module: 'targets', description: 'Exportar alvos' },
  
  // Templates
  { id: '15', name: 'Criar Templates', codename: 'templates.create', module: 'templates', description: 'Criar novos templates' },
  { id: '16', name: 'Visualizar Templates', codename: 'templates.read', module: 'templates', description: 'Visualizar templates' },
  { id: '17', name: 'Editar Templates', codename: 'templates.update', module: 'templates', description: 'Editar templates' },
  { id: '18', name: 'Deletar Templates', codename: 'templates.delete', module: 'templates', description: 'Deletar templates' },
  { id: '19', name: 'Templates Globais', codename: 'templates.create_global', module: 'templates', description: 'Criar templates globais' },
  
  // Users
  { id: '20', name: 'Criar Usuários', codename: 'users.create', module: 'users', description: 'Criar novos usuários' },
  { id: '21', name: 'Visualizar Usuários', codename: 'users.read', module: 'users', description: 'Visualizar usuários' },
  { id: '22', name: 'Editar Usuários', codename: 'users.update', module: 'users', description: 'Editar usuários' },
  { id: '23', name: 'Deletar Usuários', codename: 'users.delete', module: 'users', description: 'Deletar usuários' },
  { id: '24', name: 'Impersonar Usuários', codename: 'users.impersonate', module: 'users', description: 'Impersonar outros usuários' },
  { id: '25', name: 'Gerenciar Permissões', codename: 'users.manage_roles', module: 'users', description: 'Gerenciar permissões de usuários' },
  
  // Tenants
  { id: '26', name: 'Criar Tenants', codename: 'tenants.create', module: 'tenants', description: 'Criar novos clientes' },
  { id: '27', name: 'Visualizar Tenants', codename: 'tenants.read', module: 'tenants', description: 'Visualizar clientes' },
  { id: '28', name: 'Editar Tenants', codename: 'tenants.update', module: 'tenants', description: 'Editar clientes' },
  { id: '29', name: 'Deletar Tenants', codename: 'tenants.delete', module: 'tenants', description: 'Deletar clientes' },
  { id: '30', name: 'Configurar Tenants', codename: 'tenants.configure', module: 'tenants', description: 'Configurar clientes' },
  { id: '31', name: 'Criar Sub-tenants', codename: 'tenants.create_sub', module: 'tenants', description: 'Criar sub-clientes' },
  
  // Trainings
  { id: '32', name: 'Criar Treinamentos', codename: 'trainings.create', module: 'trainings', description: 'Criar treinamentos' },
  { id: '33', name: 'Visualizar Treinamentos', codename: 'trainings.read', module: 'trainings', description: 'Visualizar treinamentos' },
  { id: '34', name: 'Editar Treinamentos', codename: 'trainings.update', module: 'trainings', description: 'Editar treinamentos' },
  { id: '35', name: 'Deletar Treinamentos', codename: 'trainings.delete', module: 'trainings', description: 'Deletar treinamentos' },
  { id: '36', name: 'Atribuir Treinamentos', codename: 'trainings.assign', module: 'trainings', description: 'Atribuir treinamentos a usuários' },
  { id: '37', name: 'Ver Resultados', codename: 'trainings.view_results', module: 'trainings', description: 'Ver resultados de treinamentos' },
  
  // Reports
  { id: '38', name: 'Ver Relatórios', codename: 'reports.view', module: 'reports', description: 'Visualizar relatórios' },
  { id: '39', name: 'Exportar Relatórios', codename: 'reports.export', module: 'reports', description: 'Exportar relatórios em PDF/Excel' },
  { id: '40', name: 'Relatórios Globais', codename: 'reports.global', module: 'reports', description: 'Ver relatórios de todos os tenants' },
  { id: '41', name: 'Dados Capturados', codename: 'reports.captured_data', module: 'reports', description: 'Ver dados capturados' },
  
  // System
  { id: '42', name: 'Logs de Auditoria', codename: 'system.audit_logs', module: 'system', description: 'Ver logs de auditoria' },
  { id: '43', name: 'Configurações', codename: 'system.settings', module: 'system', description: 'Gerenciar configurações do sistema' },
  { id: '44', name: 'Gerenciar Papéis', codename: 'system.roles', module: 'system', description: 'Gerenciar papéis e permissões' },
  { id: '45', name: 'Integrações', codename: 'system.integrations', module: 'system', description: 'Configurar integrações' },
];

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Superadmin',
    description: 'Acesso total ao sistema',
    permissions: mockPermissions,
    isSystem: true,
  },
  {
    id: '2',
    name: 'Admin de Tenant',
    description: 'Administrador completo do tenant',
    permissions: mockPermissions.filter(p => !p.codename.startsWith('tenants.') && !p.codename.startsWith('system.')),
    isSystem: true,
  },
  {
    id: '3',
    name: 'Gerente',
    description: 'Gerenciar campanhas e alvos',
    permissions: mockPermissions.filter(p => 
      p.module === 'campaigns' || 
      p.module === 'targets' || 
      p.module === 'templates' ||
      (p.module === 'reports' && p.codename !== 'reports.global')
    ),
    isSystem: false,
  },
  {
    id: '4',
    name: 'Analista',
    description: 'Visualizar e analisar dados',
    permissions: mockPermissions.filter(p => 
      p.codename.includes('.read') || 
      p.codename.includes('.view') ||
      p.codename === 'reports.view' ||
      p.codename === 'reports.export'
    ),
    isSystem: false,
  },
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Igor Bedesqui',
    email: 'igor@underprotection.com.br',
    role: 'Superadmin',
    customPermissions: [],
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@cliente.com.br',
    role: 'Admin de Tenant',
    customPermissions: [],
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria@cliente.com.br',
    role: 'Gerente',
    customPermissions: [mockPermissions[37]], // reports.view extra
  },
];

const moduleColors: Record<string, string> = {
  campaigns: 'bg-blue-500',
  targets: 'bg-green-500',
  templates: 'bg-purple-500',
  users: 'bg-orange-500',
  tenants: 'bg-red-500',
  trainings: 'bg-indigo-500',
  reports: 'bg-yellow-500',
  system: 'bg-gray-500',
};

const moduleIcons: Record<string, React.ReactNode> = {
  campaigns: '🎣',
  targets: '🎯',
  templates: '📄',
  users: '👥',
  tenants: '🏢',
  trainings: '🎓',
  reports: '📊',
  system: '⚙️',
};

export default function Permissions() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUserPermissionsDialogOpen, setIsUserPermissionsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Partial<Role>>({});

  // Group permissions by module
  const permissionsByModule = mockPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleCreateRole = () => {
    setEditingRole({ permissions: [] });
    setIsRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsRoleDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (!editingRole.name) {
      toast.error('Nome do papel é obrigatório');
      return;
    }

    if (editingRole.id) {
      // Update
      setRoles(roles.map(r => r.id === editingRole.id ? editingRole as Role : r));
      toast.success('Papel atualizado com sucesso');
    } else {
      // Create
      const newRole: Role = {
        id: Date.now().toString(),
        name: editingRole.name,
        description: editingRole.description || '',
        permissions: editingRole.permissions || [],
        isSystem: false,
      };
      setRoles([...roles, newRole]);
      toast.success('Papel criado com sucesso');
    }

    setIsRoleDialogOpen(false);
    setEditingRole({});
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      toast.error('Não é possível deletar papéis do sistema');
      return;
    }

    setRoles(roles.filter(r => r.id !== roleId));
    toast.success('Papel deletado com sucesso');
  };

  const togglePermission = (permission: Permission) => {
    const currentPermissions = editingRole.permissions || [];
    const hasPermission = currentPermissions.some(p => p.id === permission.id);

    if (hasPermission) {
      setEditingRole({
        ...editingRole,
        permissions: currentPermissions.filter(p => p.id !== permission.id),
      });
    } else {
      setEditingRole({
        ...editingRole,
        permissions: [...currentPermissions, permission],
      });
    }
  };

  const toggleModulePermissions = (module: string) => {
    const modulePermissions = permissionsByModule[module];
    const currentPermissions = editingRole.permissions || [];
    const allSelected = modulePermissions.every(p => 
      currentPermissions.some(cp => cp.id === p.id)
    );

    if (allSelected) {
      // Deselect all from module
      setEditingRole({
        ...editingRole,
        permissions: currentPermissions.filter(p => p.module !== module),
      });
    } else {
      // Select all from module
      const otherPermissions = currentPermissions.filter(p => p.module !== module);
      setEditingRole({
        ...editingRole,
        permissions: [...otherPermissions, ...modulePermissions],
      });
    }
  };

  const handleManageUserPermissions = (user: User) => {
    setSelectedUser(user);
    setIsUserPermissionsDialogOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#834a8b]" />
            {t('permissions.title', 'Gerenciamento de Permissões')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('permissions.subtitle', 'Gerencie papéis e permissões de usuários')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Papéis
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Todas as Permissões
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {roles.length} {roles.length === 1 ? 'papel' : 'papéis'} cadastrados
            </p>
            <Button onClick={handleCreateRole}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Papel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map(role => (
              <Card key={role.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {role.name}
                        {role.isSystem && (
                          <Badge variant="secondary" className="text-xs">
                            Sistema
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                    {!role.isSystem && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {role.permissions.length} permissões
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(permissionsByModule).map(module => {
                        const count = role.permissions.filter(p => p.module === module).length;
                        const total = permissionsByModule[module].length;
                        if (count === 0) return null;
                        
                        return (
                          <Badge
                            key={module}
                            className={`${moduleColors[module]} text-white`}
                          >
                            {moduleIcons[module]} {count}/{total}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {users.length} {users.length === 1 ? 'usuário' : 'usuários'}
          </p>

          <div className="space-y-2">
            {users.map(user => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#834a8b] text-white flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant="outline">{user.role}</Badge>
                        {user.customPermissions.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            +{user.customPermissions.length} permissões extras
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManageUserPermissions(user)}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Permissões
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* All Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {mockPermissions.length} permissões disponíveis
          </p>

          {Object.entries(permissionsByModule).map(([module, permissions]) => (
            <Card key={module}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-lg ${moduleColors[module]} flex items-center justify-center text-white text-lg`}>
                    {moduleIcons[module]}
                  </span>
                  {module.charAt(0).toUpperCase() + module.slice(1)}
                </CardTitle>
                <CardDescription>
                  {permissions.length} permissões disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {permissions.map(permission => (
                    <div
                      key={permission.id}
                      className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{permission.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {permission.description}
                        </p>
                        <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
                          {permission.codename}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole.id ? 'Editar Papel' : 'Novo Papel'}
            </DialogTitle>
            <DialogDescription>
              Configure o nome, descrição e permissões do papel
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={editingRole.name || ''}
                onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                placeholder="Ex: Gerente de Campanhas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={editingRole.description || ''}
                onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                placeholder="Ex: Pode criar e gerenciar campanhas"
              />
            </div>

            <div className="space-y-4">
              <Label>Permissões ({editingRole.permissions?.length || 0} selecionadas)</Label>
              
              {Object.entries(permissionsByModule).map(([module, permissions]) => {
                const selectedCount = permissions.filter(p => 
                  editingRole.permissions?.some(ep => ep.id === p.id)
                ).length;
                const allSelected = selectedCount === permissions.length;

                return (
                  <Card key={module}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={() => toggleModulePermissions(module)}
                          />
                          <span className={`w-6 h-6 rounded ${moduleColors[module]} flex items-center justify-center text-white text-sm`}>
                            {moduleIcons[module]}
                          </span>
                          <CardTitle className="text-base">
                            {module.charAt(0).toUpperCase() + module.slice(1)}
                          </CardTitle>
                        </div>
                        <Badge variant="secondary">
                          {selectedCount}/{permissions.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {permissions.map(permission => {
                        const isChecked = editingRole.permissions?.some(p => p.id === permission.id);
                        
                        return (
                          <div
                            key={permission.id}
                            className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                            onClick={() => togglePermission(permission)}
                          >
                            <Checkbox checked={isChecked} />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{permission.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveRole}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Permissions Dialog */}
      <Dialog open={isUserPermissionsDialogOpen} onOpenChange={setIsUserPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Permissões de {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Papel atual: <Badge>{selectedUser?.role}</Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Alterar Papel</Label>
              <Select defaultValue={selectedUser?.role}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Permissões Extras ({selectedUser?.customPermissions.length || 0})</Label>
              <p className="text-sm text-muted-foreground">
                Adicione permissões específicas além do papel base
              </p>
              
              {selectedUser?.customPermissions.map(permission => (
                <div
                  key={permission.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <p className="text-sm font-medium">{permission.name}</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {permission.codename}
                    </code>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Permissão Extra
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserPermissionsDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              toast.success('Permissões atualizadas com sucesso');
              setIsUserPermissionsDialogOpen(false);
            }}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

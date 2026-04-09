import React, { useState, useEffect } from 'react';
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
const getMockPermissions = (t: any): Permission[] => [
  // Campaigns
  { id: '1', name: t('permissions.data.campaigns.create.name'), codename: 'campaigns.create', module: 'campaigns', description: t('permissions.data.campaigns.create.desc') },
  { id: '2', name: t('permissions.data.campaigns.read.name'), codename: 'campaigns.read', module: 'campaigns', description: t('permissions.data.campaigns.read.desc') },
  { id: '3', name: t('permissions.data.campaigns.update.name'), codename: 'campaigns.update', module: 'campaigns', description: t('permissions.data.campaigns.update.desc') },
  { id: '4', name: t('permissions.data.campaigns.delete.name'), codename: 'campaigns.delete', module: 'campaigns', description: t('permissions.data.campaigns.delete.desc') },
  { id: '5', name: t('permissions.data.campaigns.start.name'), codename: 'campaigns.start', module: 'campaigns', description: t('permissions.data.campaigns.start.desc') },
  { id: '6', name: t('permissions.data.campaigns.pause.name'), codename: 'campaigns.pause', module: 'campaigns', description: t('permissions.data.campaigns.pause.desc') },
  { id: '7', name: t('permissions.data.campaigns.results.name'), codename: 'campaigns.view_results', module: 'campaigns', description: t('permissions.data.campaigns.results.desc') },
  { id: '8', name: t('permissions.data.campaigns.export.name'), codename: 'campaigns.export', module: 'campaigns', description: t('permissions.data.campaigns.export.desc') },
  
  // Targets
  { id: '9', name: t('permissions.data.targets.create.name'), codename: 'targets.create', module: 'targets', description: t('permissions.data.targets.create.desc') },
  { id: '10', name: t('permissions.data.targets.read.name'), codename: 'targets.read', module: 'targets', description: t('permissions.data.targets.read.desc') },
  { id: '11', name: t('permissions.data.targets.update.name'), codename: 'targets.update', module: 'targets', description: t('permissions.data.targets.update.desc') },
  { id: '12', name: t('permissions.data.targets.delete.name'), codename: 'targets.delete', module: 'targets', description: t('permissions.data.targets.delete.desc') },
  { id: '13', name: t('permissions.data.targets.import.name'), codename: 'targets.import', module: 'targets', description: t('permissions.data.targets.import.desc') },
  { id: '14', name: t('permissions.data.targets.export.name'), codename: 'targets.export', module: 'targets', description: t('permissions.data.targets.export.desc') },
  
  // Templates
  { id: '15', name: t('permissions.data.templates.create.name'), codename: 'templates.create', module: 'templates', description: t('permissions.data.templates.create.desc') },
  { id: '16', name: t('permissions.data.templates.read.name'), codename: 'templates.read', module: 'templates', description: t('permissions.data.templates.read.desc') },
  { id: '17', name: t('permissions.data.templates.update.name'), codename: 'templates.update', module: 'templates', description: t('permissions.data.templates.update.desc') },
  { id: '18', name: t('permissions.data.templates.delete.name'), codename: 'templates.delete', module: 'templates', description: t('permissions.data.templates.delete.desc') },
  { id: '19', name: t('permissions.data.templates.global.name'), codename: 'templates.create_global', module: 'templates', description: t('permissions.data.templates.global.desc') },
  
  // Users
  { id: '20', name: t('permissions.data.users.create.name'), codename: 'users.create', module: 'users', description: t('permissions.data.users.create.desc') },
  { id: '21', name: t('permissions.data.users.read.name'), codename: 'users.read', module: 'users', description: t('permissions.data.users.read.desc') },
  { id: '22', name: t('permissions.data.users.update.name'), codename: 'users.update', module: 'users', description: t('permissions.data.users.update.desc') },
  { id: '23', name: t('permissions.data.users.delete.name'), codename: 'users.delete', module: 'users', description: t('permissions.data.users.delete.desc') },
  { id: '24', name: t('permissions.data.users.impersonate.name'), codename: 'users.impersonate', module: 'users', description: t('permissions.data.users.impersonate.desc') },
  { id: '25', name: t('permissions.data.users.roles.name'), codename: 'users.manage_roles', module: 'users', description: t('permissions.data.users.roles.desc') },
  
  // Tenants
  { id: '26', name: t('permissions.data.tenants.create.name'), codename: 'tenants.create', module: 'tenants', description: t('permissions.data.tenants.create.desc') },
  { id: '27', name: t('permissions.data.tenants.read.name'), codename: 'tenants.read', module: 'tenants', description: t('permissions.data.tenants.read.desc') },
  { id: '28', name: t('permissions.data.tenants.update.name'), codename: 'tenants.update', module: 'tenants', description: t('permissions.data.tenants.update.desc') },
  { id: '29', name: t('permissions.data.tenants.delete.name'), codename: 'tenants.delete', module: 'tenants', description: t('permissions.data.tenants.delete.desc') },
  { id: '30', name: t('permissions.data.tenants.configure.name'), codename: 'tenants.configure', module: 'tenants', description: t('permissions.data.tenants.configure.desc') },
  { id: '31', name: t('permissions.data.tenants.sub.name'), codename: 'tenants.create_sub', module: 'tenants', description: t('permissions.data.tenants.sub.desc') },
  
  // Trainings
  { id: '32', name: t('permissions.data.trainings.create.name'), codename: 'trainings.create', module: 'trainings', description: t('permissions.data.trainings.create.desc') },
  { id: '33', name: t('permissions.data.trainings.read.name'), codename: 'trainings.read', module: 'trainings', description: t('permissions.data.trainings.read.desc') },
  { id: '34', name: t('permissions.data.trainings.update.name'), codename: 'trainings.update', module: 'trainings', description: t('permissions.data.trainings.update.desc') },
  { id: '35', name: t('permissions.data.trainings.delete.name'), codename: 'trainings.delete', module: 'trainings', description: t('permissions.data.trainings.delete.desc') },
  { id: '36', name: t('permissions.data.trainings.assign.name'), codename: 'trainings.assign', module: 'trainings', description: t('permissions.data.trainings.assign.desc') },
  { id: '37', name: t('permissions.data.trainings.results.name'), codename: 'trainings.view_results', module: 'trainings', description: t('permissions.data.trainings.results.desc') },
  
  // Reports
  { id: '38', name: t('permissions.data.reports.view.name'), codename: 'reports.view', module: 'reports', description: t('permissions.data.reports.view.desc') },
  { id: '39', name: t('permissions.data.reports.export.name'), codename: 'reports.export', module: 'reports', description: t('permissions.data.reports.export.desc') },
  { id: '40', name: t('permissions.data.reports.global.name'), codename: 'reports.global', module: 'reports', description: t('permissions.data.reports.global.desc') },
  { id: '41', name: t('permissions.data.reports.captured.name'), codename: 'reports.captured_data', module: 'reports', description: t('permissions.data.reports.captured.desc') },
  
  // System
  { id: '42', name: t('permissions.data.system.audit.name'), codename: 'system.audit_logs', module: 'system', description: t('permissions.data.system.audit.desc') },
  { id: '43', name: t('permissions.data.system.settings.name'), codename: 'system.settings', module: 'system', description: t('permissions.data.system.settings.desc') },
  { id: '44', name: t('permissions.data.system.roles.name'), codename: 'system.roles', module: 'system', description: t('permissions.data.system.roles.desc') },
  { id: '45', name: t('permissions.data.system.integrations.name'), codename: 'system.integrations', module: 'system', description: t('permissions.data.system.integrations.desc') },
];

const getMockRoles = (t: any, permissions: Permission[]): Role[] => [
  {
    id: '1',
    name: 'Superadmin',
    description: t('permissions.roles.superadmin.desc'),
    permissions: permissions,
    isSystem: true,
  },
  {
    id: '2',
    name: 'Admin de Tenant',
    description: t('permissions.roles.admin.desc'),
    permissions: permissions.filter(p => !p.codename.startsWith('tenants.') && !p.codename.startsWith('system.')),
    isSystem: true,
  },
  {
    id: '3',
    name: 'Gerente',
    description: t('permissions.roles.manager.desc'),
    permissions: permissions.filter(p => 
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
    description: t('permissions.roles.analyst.desc'),
    permissions: permissions.filter(p => 
      p.codename.includes('.read') || 
      p.codename.includes('.view') ||
      p.codename === 'reports.view' ||
      p.codename === 'reports.export'
    ),
    isSystem: false,
  },
];

const getMockUsers = (permissions: Permission[]): User[] => [
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
    customPermissions: [permissions[37]], // reports.view extra
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
  
  // Use React.useMemo to ensure these references are stable if needed
  const permissionsData = React.useMemo(() => getMockPermissions(t), [t]);
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUserPermissionsDialogOpen, setIsUserPermissionsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Partial<Role>>({});

  useEffect(() => {
    // Only initialize once on mount
    setRoles(getMockRoles(t, permissionsData));
    setUsers(getMockUsers(permissionsData));
  }, [t, permissionsData]);

  // Group permissions by module
  const permissionsByModule = permissionsData.reduce((acc, permission) => {
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
      toast.error(t('permissions.errors.nameRequired'));
      return;
    }

    if (editingRole.id) {
      // Update
      setRoles(roles.map(r => r.id === editingRole.id ? editingRole as Role : r));
      toast.success(t('permissions.success.roleUpdated'));
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
      toast.success(t('permissions.success.roleCreated'));
    }

    setIsRoleDialogOpen(false);
    setEditingRole({});
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      toast.error(t('permissions.errors.systemRole'));
      return;
    }

    setRoles(roles.filter(r => r.id !== roleId));
    toast.success(t('permissions.success.roleDeleted'));
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
            {t('permissions.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('permissions.subtitle')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {t('permissions.tabs.roles')}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('permissions.tabs.users')}
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {t('permissions.tabs.allPermissions')}
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t('permissions.tabs.rolesCount', { count: roles.length })}
            </p>
            <Button onClick={handleCreateRole}>
              <Plus className="w-4 h-4 mr-2" />
              {t('permissions.buttons.newRole')}
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
                            {t('permissions.badges.system')}
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
                      {t('permissions.roles.permissionsCount', { count: role.permissions.length })}
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
            {t('permissions.tabs.usersCount', { count: users.length })}
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
                            {t('permissions.users.extraPermissions', { count: user.customPermissions.length })}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManageUserPermissions(user)}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        {t('permissions.buttons.managePermissions')}
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
            {t('permissions.tabs.permissionsCount', { count: permissionsData.length })}
          </p>

          {Object.entries(permissionsByModule).map(([module, permissions]) => (
            <Card key={module}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-lg ${moduleColors[module]} flex items-center justify-center text-white text-lg`}>
                    {moduleIcons[module]}
                  </span>
                  {t(`permissions.modules.${module}`)}
                </CardTitle>
                <CardDescription>
                  {t('permissions.tabs.permissionsModuleCount', { count: permissions.length })}
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
              {editingRole.id ? t('permissions.dialogs.role.edit') : t('permissions.dialogs.role.new')}
            </DialogTitle>
            <DialogDescription>
              {t('permissions.dialogs.role.desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('permissions.fields.name')}</Label>
              <Input
                id="name"
                value={editingRole.name || ''}
                onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                placeholder={t('permissions.fields.namePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('permissions.fields.desc')}</Label>
              <Input
                id="description"
                value={editingRole.description || ''}
                onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                placeholder={t('permissions.fields.descPlaceholder')}
              />
            </div>

            <div className="space-y-4">
              <Label>{t('permissions.dialogs.role.permissionsLabel', { count: editingRole.permissions?.length || 0 })}</Label>
              
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
                            {t(`permissions.modules.${module}`)}
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
              {t('permissions.buttons.cancel')}
            </Button>
            <Button onClick={handleSaveRole}>
              <Save className="w-4 h-4 mr-2" />
              {t('permissions.buttons.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Permissions Dialog */}
      <Dialog open={isUserPermissionsDialogOpen} onOpenChange={setIsUserPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t('permissions.dialogs.user.title', { name: selectedUser?.name })}
            </DialogTitle>
            <DialogDescription>
              {t('permissions.dialogs.user.currentRole')} <Badge>{selectedUser?.role}</Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">{t('permissions.dialogs.user.changeRole')}</Label>
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
              <Label>{t('permissions.dialogs.user.extraRoles', { count: selectedUser?.customPermissions.length || 0 })}</Label>
              <p className="text-sm text-muted-foreground">
                {t('permissions.dialogs.user.extraRolesDesc')}
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
                {t('permissions.buttons.addExtraRole')}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserPermissionsDialogOpen(false)}>
              {t('permissions.buttons.close')}
            </Button>
            <Button onClick={() => {
              toast.success(t('permissions.success.permissionsUpdated'));
              setIsUserPermissionsDialogOpen(false);
            }}>
              <Save className="w-4 h-4 mr-2" />
              {t('permissions.buttons.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

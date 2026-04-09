import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { getTenants } from '../lib/apiLocal';
import { format } from 'date-fns';

// mock data removed

type Role = 'superadmin' | 'admin' | 'user';

const getRoleLabels = (t: any): Record<Role, string> => ({
  superadmin: t('systemUsers.roles.superadmin'),
  admin: t('systemUsers.roles.admin'),
  user: t('systemUsers.roles.user'),
});

const roleColors: Record<Role, string> = {
  superadmin: 'bg-purple-100 text-purple-700 border-purple-300',
  admin: 'bg-blue-100 text-blue-700 border-blue-300',
  user: 'bg-gray-100 text-gray-700 border-gray-300',
};

export function SystemUsers() {
  const { t } = useTranslation();
  const { user, impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [tenants, setTenants] = useState([]);
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const roleLabels = getRoleLabels(t);

  // Apenas superadmin pode ver TODOS os usuários
  const isSuperAdmin = user?.role === 'superadmin' && !impersonatedTenant;
  
  // Filtrar usuários baseado no contexto
  const relevantUsers = isSuperAdmin
    ? systemUsers
    : systemUsers.filter(
        (u) => parseInt(u.tenant) === parseInt((impersonatedTenant?.id || user?.tenantId) as unknown as string)
      );

  // Filtrar usuários com busca
  const filteredUsers = relevantUsers.filter(
    (userItem) => {
      const name = `${userItem.first_name || ''} ${userItem.last_name || ''}`.trim() || userItem.username || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (userItem.email && userItem.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (userItem.role && roleLabels[userItem.role as Role] && roleLabels[userItem.role as Role].toLowerCase().includes(searchQuery.toLowerCase()))
    }
  );

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success(t('systemUsers.success.added'), {
      description: t('systemUsers.success.addedDesc'),
    });
    setIsAddDialogOpen(false);
  };

  const handleEditUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success(t('systemUsers.success.updated'), {
      description: t('systemUsers.success.updatedDesc'),
    });
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = (userId: string) => {
    toast.success(t('systemUsers.success.removed'), {
      description: t('systemUsers.success.removedDesc'),
    });
  };

  const handleResetPassword = (userId: string) => {
    toast.success(t('systemUsers.success.resetSent'), {
      description: t('systemUsers.success.resetSentDesc'),
    });
  };

  const stats = {
    total: relevantUsers.length,
    active: relevantUsers.filter((u) => u.status === 'active').length,
    superadmins: relevantUsers.filter((u) => u.role === 'superadmin').length,
    admins: relevantUsers.filter((u) => u.role === 'admin').length,
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tenantsData, usersResponse] = await Promise.all([
          getTenants(),
          import('../lib/api').then((m) => m.default.get('/api/v1/users/'))
        ]);
        if (active) {
          setTenants(tenantsData);
          setSystemUsers(usersResponse.data);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        if (active) toast.error('Erro ao buscar usuários');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [impersonatedTenant]);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">
              {t('systemUsers.title')}
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              {isSuperAdmin
                ? t('systemUsers.subtitleSuper')
                : t('systemUsers.subtitleClient', { name: impersonatedTenant?.name || t('systemUsers.yourClient') })}
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                <UserPlus className="w-4 h-4 mr-2" />
                {t('systemUsers.btnAdd')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddUser}>
                <DialogHeader>
                  <DialogTitle>{t('systemUsers.dialogs.add.title')}</DialogTitle>
                  <DialogDescription>
                    {t('systemUsers.dialogs.add.desc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="add-name">{t('systemUsers.fields.name')}</Label>
                    <Input
                      id="add-name"
                      placeholder={t('systemUsers.fields.namePlaceholder')}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-email">{t('systemUsers.fields.email')}</Label>
                    <Input
                      id="add-email"
                      type="email"
                      placeholder={t('systemUsers.fields.emailPlaceholder')}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-role">{t('systemUsers.fields.role')}</Label>
                    <Select>
                      <SelectTrigger className="mt-2" id="add-role">
                        <SelectValue placeholder={t('systemUsers.fields.rolePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {isSuperAdmin && (
                          <SelectItem value="superadmin">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-purple-600" />
                              {t('systemUsers.roles.superadminFull')}
                            </div>
                          </SelectItem>
                        )}
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-600" />
                            {t('systemUsers.roles.adminFull')}
                          </div>
                        </SelectItem>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-gray-600" />
                            {t('systemUsers.roles.userFull')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="add-tenant">{t('systemUsers.fields.client')}</Label>
                    <Select>
                      <SelectTrigger className="mt-2" id="add-tenant">
                        <SelectValue placeholder={t('systemUsers.fields.clientPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {isSuperAdmin && (
                          <SelectItem value="null">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-purple-600" />
                              {t('systemUsers.roles.masterClient')}
                            </div>
                          </SelectItem>
                        )}
                        {tenants.map((tenant: any) => (
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
                      ℹ️ {t('systemUsers.dialogs.add.info')}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    {t('systemUsers.buttons.cancel')}
                  </Button>
                  <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                    {t('systemUsers.buttons.create')}
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
            <CardTitle className="text-sm text-gray-600">{t('systemUsers.stats.total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('systemUsers.stats.active')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        {isSuperAdmin && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">{t('systemUsers.stats.superadmins')}</CardTitle>
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
            <CardTitle className="text-sm text-gray-600">{t('systemUsers.stats.admins')}</CardTitle>
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
              placeholder={t('systemUsers.filters.search')}
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
          <CardTitle>{t('systemUsers.table.title')}</CardTitle>
          <CardDescription>
            {t('systemUsers.table.desc', { count: filteredUsers.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('systemUsers.table.colName')}</TableHead>
                <TableHead>{t('systemUsers.table.colEmail')}</TableHead>
                <TableHead>{t('systemUsers.table.colRole')}</TableHead>
                {isSuperAdmin && <TableHead>{t('systemUsers.table.colClient')}</TableHead>}
                <TableHead>{t('systemUsers.table.colLastLogin')}</TableHead>
                <TableHead>{t('systemUsers.table.colStatus')}</TableHead>
                <TableHead className="text-right">{t('systemUsers.table.colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 border-4 border-t-[#834a8b] border-gray-200 rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : filteredUsers.map((systemUser) => (
                <TableRow key={systemUser.id}>
                  <TableCell className="font-medium">
                    {systemUser.first_name ? `${systemUser.first_name} ${systemUser.last_name || ''}` : systemUser.username}
                  </TableCell>
                  <TableCell>{systemUser.email || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={roleColors[(systemUser.role as Role) || 'user']}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {roleLabels[(systemUser.role as Role) || 'user'] || roleLabels['user']}
                    </Badge>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      {systemUser.tenant ? (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {tenants.find((t: any) => parseInt(t.id) === parseInt(systemUser.tenant))
                              ?.name || 'N/A'}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {t('systemUsers.table.master')}
                        </Badge>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {systemUser.last_login ? format(new Date(systemUser.last_login), 'dd/MM/yyyy HH:mm') : 'Nunca'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {systemUser.is_active ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t('systemUsers.status.active')}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        {t('systemUsers.status.inactive')}
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
                        <DropdownMenuLabel>{t('systemUsers.table.colActions')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(systemUser);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {t('systemUsers.actions.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleResetPassword(systemUser.id)}
                        >
                          <Key className="w-4 h-4 mr-2" />
                          {t('systemUsers.actions.resetPassword')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(systemUser.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('systemUsers.actions.removeAccess')}
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
                <DialogTitle>{t('systemUsers.dialogs.edit.title')}</DialogTitle>
                <DialogDescription>
                  {t('systemUsers.dialogs.edit.desc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-name">{t('systemUsers.fields.name')}</Label>
                  <Input
                    id="edit-name"
                    defaultValue={selectedUser.first_name ? `${selectedUser.first_name} ${selectedUser.last_name || ''}` : selectedUser.username}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">{t('systemUsers.fields.email')}</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    defaultValue={selectedUser.email}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">{t('systemUsers.fields.role')}</Label>
                  <Select defaultValue={selectedUser.role}>
                    <SelectTrigger className="mt-2" id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {isSuperAdmin && (
                        <SelectItem value="superadmin">
                          {t('systemUsers.roles.superadminFull')}
                        </SelectItem>
                      )}
                      <SelectItem value="admin">
                        {t('systemUsers.roles.adminFull')}
                      </SelectItem>
                      <SelectItem value="user">{t('systemUsers.roles.userFull')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">{t('systemUsers.fields.status')}</Label>
                  <Select defaultValue={selectedUser.is_active ? 'active' : 'inactive'}>
                    <SelectTrigger className="mt-2" id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('systemUsers.status.active')}</SelectItem>
                      <SelectItem value="inactive">{t('systemUsers.status.inactive')}</SelectItem>
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
                  {t('systemUsers.buttons.cancel')}
                </Button>
                <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                  {t('systemUsers.buttons.save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
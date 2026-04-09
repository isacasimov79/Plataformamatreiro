import { useState, useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getTargetGroups, getTargets, getTenants, createTargetGroup, updateTargetGroup, deleteTargetGroup, getTargetGroup } from '../lib/apiLocal';

export function TargetGroups() {
  const { t } = useTranslation();
  const { user, impersonatedTenant } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false);
  const [isImportIntegrationOpen, setIsImportIntegrationOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [addMemberMode, setAddMemberMode] = useState<'none' | 'emails' | 'groups'>('none');
  const [emailsToAdd, setEmailsToAdd] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  
  // Form state for create/edit
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTenantId, setFormTenantId] = useState('');
  const [formParentGroup, setFormParentGroup] = useState('none');
  
  // Members view
  const [viewingGroupMembers, setViewingGroupMembers] = useState<any>(null);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  
  // Estados para dados do banco
  const [targetGroups, setTargetGroups] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar dados do banco
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [groupsData, targetsData, tenantsData] = await Promise.all([
        getTargetGroups(),
        getTargets(),
        getTenants(),
      ]);
      // Map Django snake_case fields to frontend camelCase
      const mapped = (groupsData || []).map((g: any) => ({
        id: String(g.id),
        name: g.name || t('common.unnamed', 'Sem Nome'),
        description: g.description || '',
        memberCount: g.target_count ?? g.memberCount ?? 0,
        type: g.sync_source && g.sync_source !== 'manual' ? 'integration' : 'local',
        integrationProvider: g.sync_source === 'azure_ad' || g.sync_source === 'azure_ad_group' ? 'Azure AD' : g.sync_source || '',
        source: g.sync_enabled ? 'integration' : 'local',
        tenantId: g.tenantId || String(g.tenant || ''),
        parentGroupId: g.parentGroupId || g.parent_group || null,
        syncEnabled: g.sync_enabled || false,
        createdAt: g.created_at || g.createdAt || '',
      }));
      setTargetGroups(mapped);
      setTargets(targetsData || []);
      setTenants(tenantsData || []);
    } catch (error) {
      console.error('Error loading target groups data:', error);
      toast.error(t('targetGroups.messages.loadError', 'Erro ao carregar grupos de alvos'));
    } finally {
      setLoading(false);
    }
  };

  const isMasterView = !impersonatedTenant;

  // Filtrar grupos baseado em impersonation
  const relevantGroups = isMasterView
    ? targetGroups
    : targetGroups.filter(g => String(g.tenantId) === String(impersonatedTenant?.id));

  // Filtrar grupos com busca
  const filteredGroups = relevantGroups.filter(
    (group) =>
      (group.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setSaving(true);
    try {
      const tenantId = impersonatedTenant?.id || formTenantId;
      if (!tenantId) {
        toast.error('Selecione um cliente');
        setSaving(false);
        return;
      }
      const payload: any = {
        name: formName,
        description: formDescription,
        tenant: Number(tenantId),
      };
      
      if (emailsToAdd.trim()) {
        payload.manual_emails = emailsToAdd
          .split(/[\n,;]+/)
          .map(e => e.trim())
          .filter(e => e);
      }
      if (formParentGroup && formParentGroup !== 'none') {
        payload.parent_group = Number(formParentGroup);
      }
      await createTargetGroup(payload);
      toast.success(t('targetGroups.messages.created'), {
        description: t('targetGroups.messages.createdDesc'),
      });
      setIsCreateDialogOpen(false);
      setFormName('');
      setFormDescription('');
      setFormTenantId('');
      await loadData();
      setFormParentGroup('none');
      setEmailsToAdd('');
      await loadData();
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast.error('Erro ao criar grupo: ' + (error?.message || 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  const handleEditGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGroup) return;
    setSaving(true);
    try {
      await updateTargetGroup(selectedGroup.id, {
        name: formName || selectedGroup.name,
        description: formDescription || selectedGroup.description,
      });
      toast.success(t('targetGroups.messages.updated'), {
        description: t('targetGroups.messages.updatedDesc'),
      });
      setIsEditDialogOpen(false);
      await loadData();
    } catch (error: any) {
      console.error('Error updating group:', error);
      toast.error('Erro ao atualizar grupo: ' + (error?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleAddMembers = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success(t('targetGroups.messages.membersAdded'), {
      description: t('targetGroups.messages.membersAddedDesc'),
    });
    setIsAddMembersDialogOpen(false);
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) return;
    try {
      await deleteTargetGroup(groupId);
      toast.success(t('targetGroups.messages.deleted'), {
        description: t('targetGroups.messages.deletedDesc'),
      });
      await loadData();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      toast.error('Erro ao excluir grupo: ' + (error?.message || ''));
    }
  };

  const handleViewMembers = async (group: any) => {
    setViewingGroupMembers(group);
    try {
      const detail = await getTargetGroup(group.id);
      setGroupMembers(detail?.targets_list || []);
    } catch {
      setGroupMembers([]);
    }
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

  // Construir hierarquia de grupos — flat list if no parentGroupId found
  const hasHierarchy = filteredGroups.some(g => g.parentGroupId != null);
  
  const buildHierarchy = (parentId: string | null = null, level: number = 0): any[] => {
    return filteredGroups
      .filter((g) => (g.parentGroupId || null) === parentId)
      .map((group) => ({
        ...group,
        level,
        children: buildHierarchy(group.id, level + 1),
      }));
  };

  // If no hierarchy data, show flat list
  const hierarchy = hasHierarchy ? buildHierarchy() : filteredGroups.map(g => ({ ...g, level: 0, children: [] }));

  const renderGroupRow = (group: any): React.ReactNode[] => {
    const isExpanded = expandedGroups.has(group.id);
    const hasChildren = group.children && group.children.length > 0;

    const rows: React.ReactNode[] = [
      <TableRow key={group.id}>
        <TableCell>
          <div className="flex items-center gap-2">
            {Array.from({ length: group.level }).map((_, i) => (
              <div key={i} className="w-6 shrink-0" />
            ))}
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
          <Badge variant="secondary">
            {group.type === 'local' ? t('targetGroups.types.local') : t('targetGroups.types.integration')}
          </Badge>
        </TableCell>
        {isMasterView && (
          <TableCell>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {tenants.find((t) => t.id === group.tenantId)?.name || 'N/A'}
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
              <DropdownMenuLabel>{t('targetGroups.table.cols.actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleViewMembers(group)}
              >
                <Users className="w-4 h-4 mr-2" />
                {t('targetGroups.actions.viewMembers', 'Ver Membros')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedGroup(group.id);
                  setIsAddMembersDialogOpen(true);
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {t('targetGroups.actions.addMembers')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedGroup(group);
                  setFormName(group.name);
                  setFormDescription(group.description);
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                {t('targetGroups.actions.editGroup')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                {t('targetGroups.actions.exportMembers')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(group.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('targetGroups.actions.removeGroup')}
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
    totalMembers: relevantGroups.reduce((sum, g) => sum + (g.memberCount || 0), 0),
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">
              {t('targetGroups.title')}
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              {isMasterView
                ? t('targetGroups.descMaster')
                : t('targetGroups.descTenant', { name: impersonatedTenant?.name })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/targets')}>
              <Mail className="w-4 h-4 mr-2" />
              {t('targetGroups.actions.viewTargets')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('targetGroups.actions.addGroup')}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('targetGroups.actions.chooseMethod')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('targetGroups.actions.createLocal')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsImportIntegrationOpen(true)}>
                  <Network className="w-4 h-4 mr-2" />
                  {t('targetGroups.actions.importIntegration')}
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
            <CardTitle className="text-sm text-gray-600">{t('targetGroups.stats.total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('targetGroups.stats.local')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#834a8b]">{stats.local}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('targetGroups.stats.integration')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.integration}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('targetGroups.stats.totalMembers')}</CardTitle>
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
              placeholder={t('targetGroups.searchPlaceholder')}
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
          <CardTitle>{t('targetGroups.table.title')}</CardTitle>
          <CardDescription>
            {t('targetGroups.table.desc', { count: filteredGroups.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('targetGroups.table.cols.name')}</TableHead>
                <TableHead>{t('targetGroups.table.cols.description')}</TableHead>
                <TableHead>{t('targetGroups.table.cols.members')}</TableHead>
                <TableHead>{t('targetGroups.table.cols.type')}</TableHead>
                {isMasterView && <TableHead>{t('targetGroups.table.cols.tenant')}</TableHead>}
                <TableHead className="text-right">{t('targetGroups.table.cols.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hierarchy.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMasterView ? 6 : 5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <FolderTree className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">{t('targetGroups.table.emptyTitle')}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('targetGroups.table.emptyBtn')}
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
              <DialogTitle>{t('targetGroups.dialogs.createTitle')}</DialogTitle>
              <DialogDescription>
                {t('targetGroups.dialogs.createDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">{t('targetGroups.dialogs.labels.name')}</Label>
                <Input
                  id="name"
                  placeholder={t('targetGroups.dialogs.labels.nameHolder')}
                  required
                  className="mt-2"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">{t('targetGroups.dialogs.labels.desc')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('targetGroups.dialogs.labels.descHolder')}
                  className="mt-2"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="parentGroup">{t('targetGroups.dialogs.labels.parentGroup')}</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t('targetGroups.dialogs.labels.parentGroupHolder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('targetGroups.dialogs.labels.parentGroupHolder')}</SelectItem>
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
                  <Select value={formTenantId} onValueChange={setFormTenantId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={String(tenant.id)}>
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
                  <Button
                    type="button"
                    variant={addMemberMode === 'emails' ? 'default' : 'outline'}
                    size="sm"
                    className={addMemberMode === 'emails' ? 'bg-[#834a8b] hover:bg-[#6d3d75]' : ''}
                    onClick={() => setAddMemberMode(addMemberMode === 'emails' ? 'none' : 'emails')}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Emails
                  </Button>
                  <Button
                    type="button"
                    variant={addMemberMode === 'groups' ? 'default' : 'outline'}
                    size="sm"
                    className={addMemberMode === 'groups' ? 'bg-[#834a8b] hover:bg-[#6d3d75]' : ''}
                    onClick={() => setAddMemberMode(addMemberMode === 'groups' ? 'none' : 'groups')}
                  >
                    <FolderTree className="w-4 h-4 mr-2" />
                    Adicionar Grupos
                  </Button>
                </div>
                {addMemberMode === 'emails' && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder={"joao@empresa.com\nmaria@empresa.com\npedro@empresa.com"}
                      rows={4}
                      value={emailsToAdd}
                      onChange={(e) => setEmailsToAdd(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">{t('targetGroups.dialogs.labels.emailsHint')}</p>
                  </div>
                )}
                {addMemberMode === 'groups' && (
                  <div className="mt-3 space-y-1 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {relevantGroups.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">Nenhum grupo disponível</p>
                    ) : (
                      relevantGroups.map((group) => (
                        <label
                          key={group.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedGroupIds.has(group.id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedGroupIds);
                              if (e.target.checked) newSet.add(group.id);
                              else newSet.delete(group.id);
                              setSelectedGroupIds(newSet);
                            }}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{group.name}</div>
                            <div className="text-xs text-gray-500">{group.memberCount} membros</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                {t('targetGroups.dialogs.buttons.cancel')}
              </Button>
              <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                {t('targetGroups.dialogs.buttons.create')}
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
              <DialogTitle>{t('targetGroups.dialogs.editTitle')}</DialogTitle>
              <DialogDescription>
                {t('targetGroups.dialogs.editDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">{t('targetGroups.dialogs.labels.name')}</Label>
                <Input
                  id="name"
                  placeholder={t('targetGroups.dialogs.labels.nameHolder')}
                  required
                  className="mt-2"
                  defaultValue={selectedGroup?.name}
                />
              </div>
              <div>
                <Label htmlFor="description">{t('targetGroups.dialogs.labels.desc')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('targetGroups.dialogs.labels.descHolder')}
                  className="mt-2"
                  rows={3}
                  defaultValue={selectedGroup?.description}
                />
              </div>
              <div>
                <Label htmlFor="parentGroup">{t('targetGroups.dialogs.labels.parentGroup')}</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t('targetGroups.dialogs.labels.parentGroupHolder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('targetGroups.dialogs.labels.parentGroupHolder')}</SelectItem>
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
                  {t('targetGroups.dialogs.labels.parentGroupHint')}
                </p>
              </div>
              {isMasterView && (
                <div>
                  <Label htmlFor="tenant">{t('targetGroups.dialogs.labels.tenant')}</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder={t('targetGroups.dialogs.labels.tenantHolder')} />
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
              <div className="border-t pt-4">
                <Label>{t('targetGroups.dialogs.labels.addInitialMembers')}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    type="button"
                    variant={addMemberMode === 'emails' ? 'default' : 'outline'}
                    size="sm"
                    className={addMemberMode === 'emails' ? 'bg-[#834a8b] hover:bg-[#6d3d75]' : ''}
                    onClick={() => setAddMemberMode(addMemberMode === 'emails' ? 'none' : 'emails')}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('targetGroups.dialogs.labels.btnEmails')}
                  </Button>
                  <Button
                    type="button"
                    variant={addMemberMode === 'groups' ? 'default' : 'outline'}
                    size="sm"
                    className={addMemberMode === 'groups' ? 'bg-[#834a8b] hover:bg-[#6d3d75]' : ''}
                    onClick={() => setAddMemberMode(addMemberMode === 'groups' ? 'none' : 'groups')}
                  >
                    <FolderTree className="w-4 h-4 mr-2" />
                    {t('targetGroups.dialogs.labels.btnGroups')}
                  </Button>
                </div>
                {addMemberMode === 'emails' && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder={"joao@empresa.com\nmaria@empresa.com"}
                      rows={4}
                      value={emailsToAdd}
                      onChange={(e) => setEmailsToAdd(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">{t('targetGroups.dialogs.labels.emailsHint')}</p>
                  </div>
                )}
                {addMemberMode === 'groups' && (
                  <div className="mt-3 space-y-1 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {relevantGroups.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">Nenhum grupo disponível</p>
                    ) : (
                      relevantGroups.map((group) => (
                        <label
                          key={group.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedGroupIds.has(group.id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedGroupIds);
                              if (e.target.checked) newSet.add(group.id);
                              else newSet.delete(group.id);
                              setSelectedGroupIds(newSet);
                            }}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{group.name}</div>
                            <div className="text-xs text-gray-500">{group.memberCount} membros</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                {t('targetGroups.dialogs.buttons.cancel')}
              </Button>
              <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                {t('targetGroups.dialogs.buttons.update')}
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
              <DialogTitle>{t('targetGroups.dialogs.addMembersTitle')}</DialogTitle>
              <DialogDescription>
                {t('targetGroups.dialogs.addMembersDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:border-[#834a8b] transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">{t('targetGroups.dialogs.labels.emailsCardTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="emails">{t('targetGroups.dialogs.labels.emailsCardList')}</Label>
                    <Textarea
                      id="emails"
                      placeholder="joao@empresa.com&#10;maria@empresa.com"
                      className="mt-2"
                      rows={6}
                    />
                    <p className="text-sm text-gray-500 mt-2">{t('targetGroups.dialogs.labels.emailsHint')}</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-[#834a8b] transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">{t('targetGroups.dialogs.labels.groupsCardTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="groups">{t('targetGroups.dialogs.labels.groupsCardDesc')}</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={t('targetGroups.dialogs.labels.groupsCardDesc')} />
                      </SelectTrigger>
                      <SelectContent>
                        {relevantGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name} ({group.memberCount} {t('targetGroups.dialogs.labels.membersCount')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-2">
                      {t('targetGroups.dialogs.labels.groupsCardHint')}
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
                {t('targetGroups.dialogs.buttons.cancel')}
              </Button>
              <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                {t('targetGroups.actions.addMembers')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Importar da Integração */}
      <Dialog open={isImportIntegrationOpen} onOpenChange={setIsImportIntegrationOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('targetGroups.actions.importIntegration')}</DialogTitle>
            <DialogDescription>
              {t('targetGroups.stats.integration')}
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
              {t('targetGroups.dialogs.buttons.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: View Members */}
      <Dialog open={!!viewingGroupMembers} onOpenChange={(open) => { if (!open) setViewingGroupMembers(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingGroupMembers?.name} — {t('targetGroups.actions.viewMembers', 'Membros')}</DialogTitle>
            <DialogDescription>
              {groupMembers.length} {t('targetGroups.table.cols.members', 'membros')}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-1 py-2">
            {groupMembers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum membro neste grupo</p>
            ) : (
              groupMembers.map((email, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{email}</span>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingGroupMembers(null)}>
              {t('common.close', 'Fechar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  Zap,
  MoreHorizontal,
  Trash2,
  Edit,
  Play,
  Pause,
  Clock,
  Users,
  Mail,
  Building,
  Check,
  X,
  AlertTriangle,
  Activity,
  Filter,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAutomations, getTenants, getTargetGroups, getTemplates } from '../lib/apiLocal';

export function Automations() {
  const { t } = useTranslation();
  const { user, impersonatedTenant } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');
  const [selectedConditionType, setSelectedConditionType] = useState<string>('');
  
  // Estados para dados do banco
  const [automations, setAutomations] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [targetGroups, setTargetGroups] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do banco
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [automationsData, tenantsData, groupsData, templatesData] = await Promise.all([
        getAutomations(),
        getTenants(),
        getTargetGroups(),
        getTemplates(),
      ]);
      setAutomations(automationsData);
      setTenants(tenantsData);
      setTargetGroups(groupsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading automations data:', error);
      toast.error(t('automations.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const isMasterView = !impersonatedTenant;

  // Filtrar automações baseado em impersonation
  const relevantAutomations = isMasterView
    ? automations
    : automations.filter((a) => a.tenantId === impersonatedTenant?.id);

  // Filtrar automações com busca
  const filteredAutomations = relevantAutomations.filter(
    (automation) =>
      automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateAutomation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAutomation = {
      id: `auto-${Date.now()}`,
      name: formData.get('name') as string || t('automations.form.defaultName'),
      description: formData.get('description') as string || '',
      trigger: selectedTrigger || 'new_user_ad',
      triggerDelay: parseInt(formData.get('delay') as string || '7'),
      condition: {
        type: selectedConditionType || 'always',
        groupIds: [],
      },
      campaignTemplateId: '',
      tenantId: impersonatedTenant?.id || '',
      status: 'active',
      executionCount: 0,
      lastExecutedAt: null,
    };
    setAutomations(prev => [...prev, newAutomation]);
    toast.success(t('automations.success.created'), {
      description: t('automations.success.createdDesc'),
    });
    setIsCreateDialogOpen(false);
    setSelectedTrigger('');
    setSelectedConditionType('');
  };

  const handleToggleStatus = (automationId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    toast.success(
      newStatus === 'active' ? t('automations.success.activated') : t('automations.success.paused'),
      {
        description:
          newStatus === 'active'
            ? t('automations.success.activatedDesc')
            : t('automations.success.pausedDesc'),
      }
    );
  };

  const handleDelete = (automationId: string) => {
    toast.success(t('automations.success.removed'), {
      description: t('automations.success.removedDesc'),
    });
  };

  const stats = {
    total: relevantAutomations.length,
    active: relevantAutomations.filter((a) => a.status === 'active').length,
    paused: relevantAutomations.filter((a) => a.status === 'paused').length,
    totalExecutions: relevantAutomations.reduce((sum, a) => sum + a.executionCount, 0),
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">
              {t('automations.title')}
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              {isMasterView
                ? t('automations.subtitle')
                : `${t('automations.client')}: ${impersonatedTenant?.name}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="bg-[#834a8b] hover:bg-[#6d3d75]"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('automations.buttons.newAutomation')}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('automations.stats.total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('automations.stats.active')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('automations.stats.paused')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.paused}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('automations.stats.executed')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalExecutions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={t('automations.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Automations Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('automations.table.title')}</CardTitle>
          <CardDescription>
            {t('automations.table.desc', { count: filteredAutomations.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('automations.table.colName')}</TableHead>
                <TableHead>{t('automations.table.colTrigger')}</TableHead>
                <TableHead>{t('automations.table.colCondition')}</TableHead>
                <TableHead>{t('automations.table.colCampaign')}</TableHead>
                <TableHead>{t('automations.table.colExecutions')}</TableHead>
                {isMasterView && <TableHead>{t('automations.table.colClient')}</TableHead>}
                <TableHead>{t('automations.table.colStatus')}</TableHead>
                <TableHead className="text-right">{t('automations.table.colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAutomations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMasterView ? 8 : 7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Zap className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">{t('automations.empty.message')}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('automations.empty.action')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAutomations.map((automation) => (
                  <TableRow key={automation.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{automation.name}</span>
                        <span className="text-sm text-gray-500">{automation.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {automation.trigger === 'new_user_ad' && t('automations.triggers.newAd')}
                            {automation.trigger === 'new_user_google' && t('automations.triggers.newGoogle')}
                            {automation.trigger === 'user_added_group' && t('automations.triggers.addedGroup')}
                          </span>
                          {automation.triggerDelay && (
                            <span className="text-xs text-gray-500">
                              {t('automations.delayLabel', { days: automation.triggerDelay })}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-purple-500" />
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {automation.condition.type === 'in_group' && t('automations.conditions.inGroup')}
                            {automation.condition.type === 'not_in_group' && t('automations.conditions.notInGroup')}
                            {automation.condition.type === 'in_department' && t('automations.conditions.inDepartment')}
                            {automation.condition.type === 'always' && t('automations.conditions.always')}
                          </span>
                          {automation.condition.groupIds && automation.condition.groupIds.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {t('automations.groupsCount', { count: automation.condition.groupIds.length })}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">
                          {templates.find((t) => t.id === automation.campaignTemplateId)?.name ||
                            t('automations.templateNotFound')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{automation.executionCount}</span>
                      </div>
                    </TableCell>
                    {isMasterView && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {tenants.find((t) => t.id === automation.tenantId)?.name || t('common.na')}
                          </span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      {automation.status === 'active' && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          {t('automations.status.active')}
                        </Badge>
                      )}
                      {automation.status === 'paused' && (
                        <Badge
                          variant="outline"
                          className="bg-orange-50 text-orange-700 border-orange-200"
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          {t('automations.status.paused')}
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
                          <DropdownMenuLabel>{t('automations.menu.actions')}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(automation.id, automation.status)}
                          >
                            {automation.status === 'active' ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                {t('automations.menu.pause')}
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                {t('automations.menu.activate')}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('automations.menu.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Activity className="w-4 h-4 mr-2" />
                            {t('automations.menu.history')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(automation.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('automations.menu.remove')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog: Criar Automação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleCreateAutomation}>
            <DialogHeader>
              <DialogTitle>{t('automations.dialog.title')}</DialogTitle>
              <DialogDescription>
                {t('automations.dialog.desc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('automations.dialog.basicInfo.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t('automations.dialog.basicInfo.nameLabel')}</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder={t('automations.dialog.basicInfo.namePlaceholder')}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">{t('automations.dialog.basicInfo.descLabel')}</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder={t('automations.dialog.basicInfo.descPlaceholder')}
                      className="mt-2"
                      rows={2}
                    />
                  </div>
                  {isMasterView && (
                    <div>
                      <Label htmlFor="tenant">{t('automations.dialog.basicInfo.clientLabel')}</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t('automations.dialog.basicInfo.clientPlaceholder')} />
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
                </CardContent>
              </Card>

              {/* Trigger (Gatilho) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    {t('automations.dialog.trigger.title')}
                  </CardTitle>
                  <CardDescription>{t('automations.dialog.trigger.desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="trigger">{t('automations.dialog.trigger.eventLabel')}</Label>
                    <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={t('automations.dialog.trigger.eventPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new_user_ad">
                          {t('automations.dialog.trigger.events.newAd')}
                        </SelectItem>
                        <SelectItem value="new_user_google">
                          {t('automations.dialog.trigger.events.newGoogle')}
                        </SelectItem>
                        <SelectItem value="user_added_group">
                          {t('automations.dialog.trigger.events.addedGroup')}
                        </SelectItem>
                        <SelectItem value="user_removed_group">
                          {t('automations.dialog.trigger.events.removedGroup')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="delay">
                      {t('automations.dialog.trigger.delayLabel')}
                      <span className="text-gray-500 font-normal ml-2">{t('automations.dialog.trigger.delayUnit')}</span>
                    </Label>
                    <Input
                      id="delay"
                      name="delay"
                      type="number"
                      min="0"
                      placeholder="0"
                      defaultValue="7"
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {t('automations.dialog.trigger.delayHelper')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Condições */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Filter className="w-4 h-4 text-purple-500" />
                    {t('automations.dialog.conditions.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('automations.dialog.conditions.desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="conditionType">{t('automations.dialog.conditions.typeLabel')}</Label>
                    <Select
                      value={selectedConditionType}
                      onValueChange={setSelectedConditionType}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={t('automations.dialog.conditions.typePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">
                          {t('automations.dialog.conditions.types.always')}
                        </SelectItem>
                        <SelectItem value="in_group">
                          {t('automations.dialog.conditions.types.inGroup')}
                        </SelectItem>
                        <SelectItem value="not_in_group">
                          {t('automations.dialog.conditions.types.notInGroup')}
                        </SelectItem>
                        <SelectItem value="in_department">
                          {t('automations.dialog.conditions.types.inDepartment')}
                        </SelectItem>
                        <SelectItem value="custom">
                          {t('automations.dialog.conditions.types.custom')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedConditionType === 'in_group' && (
                    <div>
                      <Label>{t('automations.dialog.conditions.groupsInLabel')}</Label>
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                        {targetGroups.slice(0, 8).map((group) => (
                          <label
                            key={group.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input type="checkbox" className="rounded" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{group.name}</div>
                              <div className="text-xs text-gray-500">
                                {t('automations.dialog.conditions.membersCount', { count: group.memberCount })}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedConditionType === 'not_in_group' && (
                    <div>
                      <Label>{t('automations.dialog.conditions.groupsNotInLabel')}</Label>
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                        {targetGroups.slice(0, 8).map((group) => (
                          <label
                            key={group.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input type="checkbox" className="rounded" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{group.name}</div>
                              <div className="text-xs text-gray-500">
                                {t('automations.dialog.conditions.membersCount', { count: group.memberCount })}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-yellow-800" dangerouslySetInnerHTML={{ __html: t('automations.dialog.conditions.warningHtml')}} />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedConditionType === 'in_department' && (
                    <div>
                      <Label htmlFor="department">{t('automations.dialog.conditions.departmentLabel')}</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t('automations.dialog.conditions.departmentPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ti">{t('automations.dialog.conditions.departments.ti')}</SelectItem>
                          <SelectItem value="rh">{t('automations.dialog.conditions.departments.rh')}</SelectItem>
                          <SelectItem value="financeiro">{t('automations.dialog.conditions.departments.finance')}</SelectItem>
                          <SelectItem value="comercial">{t('automations.dialog.conditions.departments.commercial')}</SelectItem>
                          <SelectItem value="diretoria">{t('automations.dialog.conditions.departments.board')}</SelectItem>
                          <SelectItem value="marketing">{t('automations.dialog.conditions.departments.marketing')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ação (Campanha) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Send className="w-4 h-4 text-orange-500" />
                    {t('automations.dialog.action.title')}
                  </CardTitle>
                  <CardDescription>{t('automations.dialog.action.desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template">{t('automations.dialog.action.templateLabel')}</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={t('automations.dialog.action.templatePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={String(template.id)}>
                            {template.name}{template.subject ? ` - ${template.subject}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      {t('automations.dialog.action.helperText')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Exemplo Visual */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    {t('automations.dialog.flowExample.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                        1
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm font-medium">
                          {selectedTrigger === 'new_user_ad' && t('automations.dialog.flowExample.step1.newAd')}
                          {selectedTrigger === 'new_user_google' && t('automations.dialog.flowExample.step1.newGoogle')}
                          {!selectedTrigger && t('automations.dialog.flowExample.step1.empty')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full text-sm font-bold">
                        2
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm font-medium">
                          {selectedConditionType === 'in_group' && t('automations.dialog.flowExample.step2.inGroup')}
                          {selectedConditionType === 'not_in_group' && t('automations.dialog.flowExample.step2.notInGroup')}
                          {selectedConditionType === 'in_department' && t('automations.dialog.flowExample.step2.inDepartment')}
                          {selectedConditionType === 'always' && t('automations.dialog.flowExample.step2.always')}
                          {!selectedConditionType && t('automations.dialog.flowExample.step2.empty')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-bold">
                        3
                      </div>
                      <div className="flex flex-1 bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm font-medium">{t('automations.dialog.flowExample.step3.text')}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                {t('automations.dialog.buttons.cancel')}
              </Button>
              <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                <Zap className="w-4 h-4 mr-2" />
                {t('automations.dialog.buttons.create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
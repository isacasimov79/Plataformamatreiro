import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { getTemplates, getTenants, getTargetGroups, createCampaign } from '../lib/apiLocal';
import { useAuth } from '../contexts/AuthContext';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Plus, Users, Cloud, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useTranslation } from 'react-i18next';

export function NewCampaignDialog() {
  const { t } = useTranslation();
  const { impersonatedTenant } = useAuth();
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateId: '',
    targetGroupIds: [] as string[],
    tenantId: impersonatedTenant?.id || '',
    scheduledDate: undefined as Date | undefined,
    type: 'standard',
  });
  
  // Estados para dados do banco
  const [templates, setTemplates] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [targetGroups, setTargetGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do banco
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, tenantsData, groupsData] = await Promise.all([
        getTemplates(),
        getTenants(),
        getTargetGroups(),
      ]);
      setTemplates(templatesData);
      setTenants(tenantsData);
      // Map groups from Django snake_case to frontend camelCase
      const mapped = (groupsData || []).map((g: any) => ({
        id: String(g.id),
        name: g.name || 'Sem Nome',
        description: g.description || '',
        memberCount: g.target_count ?? 0,
        source: g.sync_source || 'manual',
        syncEnabled: g.sync_enabled || false,
        lastSyncAt: g.last_sync_at || null,
        tenantId: String(g.tenant || ''),
      }));
      setTargetGroups(mapped);
    } catch (error) {
      console.error('Error loading campaign dialog data:', error);
      toast.error(t('common.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Fechar calendário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
    };

    if (calendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [calendarOpen]);

  const availableTemplates = impersonatedTenant
    ? templates.filter(t => t.tenantId === null || t.tenantId === impersonatedTenant.id)
    : templates;

  const availableGroups = impersonatedTenant
    ? targetGroups.filter(g => String(g.tenantId) === String(impersonatedTenant.id))
    : formData.tenantId
      ? targetGroups.filter(g => String(g.tenantId) === String(formData.tenantId))
      : targetGroups;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.templateId || formData.targetGroupIds.length === 0) {
      toast.error(t('common.fillRequired'));
      return;
    }

    if (!impersonatedTenant && !formData.tenantId) {
      toast.error(t('campaigns.messages.selectTenant'));
      return;
    }

    const totalTargets = formData.targetGroupIds.reduce((sum, groupId) => {
      const group = availableGroups.find(g => g.id === groupId);
      return sum + (group?.memberCount || 0);
    }, 0);

    try {
      const tenantId = impersonatedTenant?.id || formData.tenantId;
      // Collect all target emails from selected groups
      const targetEmails = availableGroups
        .filter(g => formData.targetGroupIds.includes(g.id))
        .flatMap(g => g.targets_list || []);
      
      await createCampaign({
        name: formData.name,
        description: formData.description,
        tenant: Number(tenantId),
        template: Number(formData.templateId),
        status: formData.scheduledDate ? 'scheduled' : 'draft',
        target_count: totalTargets,
        target_list: targetEmails,
        start_date: formData.scheduledDate?.toISOString() || new Date().toISOString(),
      });

      toast.success(t('campaigns.messages.created', { name: formData.name }), {
        description: formData.scheduledDate 
          ? t('campaigns.messages.scheduledFor', { date: format(formData.scheduledDate, "dd/MM/yyyy 'às' HH:mm"), targets: totalTargets })
          : t('campaigns.messages.readyToStart', { targets: totalTargets }),
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        templateId: '',
        targetGroupIds: [],
        tenantId: impersonatedTenant?.id || '',
        scheduledDate: undefined,
        type: 'standard',
      });

      setOpen(false);
      // Trigger page reload
      window.dispatchEvent(new CustomEvent('campaign-created'));
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error('Erro ao criar campanha: ' + (error?.message || ''));
    }
  };

  const toggleGroup = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      targetGroupIds: prev.targetGroupIds.includes(groupId)
        ? prev.targetGroupIds.filter(id => id !== groupId)
        : [...prev.targetGroupIds, groupId]
    }));
  };

  const getSourceBadge = (source: string) => {
    const sourceConfig = {
      manual: { label: t('sources.manual'), className: 'bg-gray-100 text-gray-700' },
      azure_ad: { label: t('sources.azure_ad'), className: 'bg-blue-100 text-blue-700' },
      entra_id: { label: t('sources.entra_id'), className: 'bg-purple-100 text-purple-700' },
      office365: { label: t('sources.office365'), className: 'bg-orange-100 text-orange-700' },
      google_workspace: { label: t('sources.google_workspace'), className: 'bg-green-100 text-green-700' },
      nested: { label: t('sources.nested'), className: 'bg-indigo-100 text-indigo-700' },
    };
    const config = sourceConfig[source as keyof typeof sourceConfig] || sourceConfig.manual;
    return <Badge variant="outline" className={`text-xs ${config.className}`}>{config.label}</Badge>;
  };

  const totalSelectedTargets = formData.targetGroupIds.reduce((sum, groupId) => {
    const group = availableGroups.find(g => g.id === groupId);
    return sum + (group?.memberCount || 0);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#834a8b] hover:bg-[#9a5ba1] text-white w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('campaigns.newCampaign')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('campaigns.newCampaign')}</DialogTitle>
          <DialogDescription>
            Configure uma nova campanha de simulação de phishing
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome da Campanha */}
          <div>
            <Label htmlFor="name">{t('campaigns.new.fields.name.label')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('campaigns.new.fields.name.placeholder')}
              className="mt-1"
            />
          </div>

          {/* Cliente (apenas para master view) */}
          {!impersonatedTenant && (
            <div>
              <Label htmlFor="tenant">{t('campaigns.new.fields.tenant.label')}</Label>
              <Select
                value={String(formData.tenantId)}
                onValueChange={(value) => setFormData({ ...formData, tenantId: value })}
              >
                <SelectTrigger id="tenant" className="mt-1">
                  <SelectValue placeholder={t('campaigns.new.fields.tenant.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {tenants.filter(t => t.status === 'active').map((tenant) => (
                    <SelectItem key={tenant.id} value={String(tenant.id)}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Template */}
            <div>
              <Label htmlFor="template">{t('campaigns.new.fields.template.label')}</Label>
              <Select
                value={String(formData.templateId)}
                onValueChange={(value) => setFormData({ ...formData, templateId: value })}
              >
                <SelectTrigger id="template" className="mt-1">
                  <SelectValue placeholder={t('campaigns.new.fields.template.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map((template) => (
                    <SelectItem key={template.id} value={String(template.id)}>
                      {template.name} - {template.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Campanha */}
            <div>
              <Label htmlFor="type">{t('campaigns.new.fields.type.label')}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">{t('campaigns.type.standard')}</SelectItem>
                  <SelectItem value="welcome_automation">{t('campaigns.type.welcomeAutomation')}</SelectItem>
                  <SelectItem value="scheduled">{t('campaigns.type.recurring')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data de Agendamento */}
          <div className="space-y-2">
            <Label>{t('campaigns.new.fields.date.label')}</Label>
            <div className="relative">
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCalendarOpen(!calendarOpen)}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduledDate ? (
                    format(formData.scheduledDate, "dd/MM/yyyy")
                  ) : (
                    <span>{t('campaigns.new.fields.date.placeholder')}</span>
                  )}
                </Button>
              </div>
              
              {calendarOpen && (
                <div className="absolute z-50 mt-2 bg-white border rounded-lg shadow-lg" ref={calendarRef}>
                  <Calendar
                    mode="single"
                    selected={formData.scheduledDate}
                    onSelect={(date) => {
                      setFormData((prev) => ({ ...prev, scheduledDate: date }));
                      if (date) {
                        setCalendarOpen(false);
                      }
                    }}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </div>
              )}
            </div>
            {formData.scheduledDate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFormData((prev) => ({ ...prev, scheduledDate: undefined }))}
                className="h-8 text-xs text-gray-500 hover:text-gray-700"
              >
                {t('campaigns.new.fields.date.clear')}
              </Button>
            )}
          </div>

          {/* Grupos de Alvos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>{t('campaigns.new.fields.targets.label')}</Label>
              {formData.targetGroupIds.length > 0 && (
                <Badge variant="outline" className="bg-[#834a8b] text-white">
                  <Users className="w-3 h-3 mr-1" />
                  {totalSelectedTargets} {t('campaigns.new.fields.targets.selected')}
                </Badge>
              )}
            </div>
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
              {availableGroups.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {t('campaigns.new.fields.targets.empty')}
                </p>
              ) : (
                availableGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      id={group.id}
                      checked={formData.targetGroupIds.includes(group.id)}
                      onCheckedChange={() => toggleGroup(group.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={group.id}
                        className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                      >
                        {group.name}
                        {getSourceBadge(group.source)}
                        {group.syncEnabled && (
                          <span title={t('campaigns.new.fields.targets.syncActive')} className="inline-flex">
                            <Cloud className="w-3 h-3 text-blue-500" />
                          </span>
                        )}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">{group.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-600">
                          <Users className="w-3 h-3 inline mr-1" />
                          {group.memberCount} {t('campaigns.new.fields.targets.members')}
                        </span>
                        {group.syncEnabled && group.lastSyncAt && (
                          <span className="text-xs text-gray-500">
                            <RefreshCw className="w-3 h-3 inline mr-1" />
                            {t('campaigns.new.fields.targets.lastSync')} {format(new Date(group.lastSyncAt), 'dd/MM/yyyy HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">{t('campaigns.new.fields.desc.label')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('campaigns.new.fields.desc.placeholder')}
              rows={3}
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="bg-[#834a8b] hover:bg-[#9a5ba1]">
              {t('campaigns.new.actions.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
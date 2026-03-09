import { useState, useEffect, useRef } from 'react';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { getTemplates, getTargetGroups } from '../lib/supabaseApi';
import { useAuth } from '../contexts/AuthContext';
import { Calendar } from './ui/calendar';
import { CalendarIcon, Users, Cloud, RefreshCw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Campaign } from '../lib/mockData';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';

interface EditCampaignDialogProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCampaignDialog({ campaign, isOpen, onClose }: EditCampaignDialogProps) {
  const { impersonatedTenant } = useAuth();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: campaign.name,
    templateId: campaign.templateId,
    targetGroupIds: campaign.targetGroupIds,
    scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt) : undefined,
    status: campaign.status,
  });
  
  // Estados para dados do banco
  const [templates, setTemplates] = useState<any[]>([]);
  const [targetGroups, setTargetGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do banco
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, groupsData] = await Promise.all([
        getTemplates(),
        getTargetGroups(),
      ]);
      setTemplates(templatesData);
      setTargetGroups(groupsData);
    } catch (error) {
      console.error('Error loading edit campaign dialog data:', error);
      toast.error('Erro ao carregar dados');
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
    ? targetGroups.filter(g => g.tenantId === impersonatedTenant.id)
    : targetGroups;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.templateId || formData.targetGroupIds.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const totalTargets = formData.targetGroupIds.reduce((sum, groupId) => {
      const group = availableGroups.find(g => g.id === groupId);
      return sum + (group?.memberCount || 0);
    }, 0);

    toast.success(`Campanha "${formData.name}" atualizada com sucesso!`, {
      description: `${totalTargets} alvos selecionados`,
    });

    onClose();
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
      manual: { label: 'Manual', className: 'bg-gray-100 text-gray-700' },
      azure_ad: { label: 'Azure AD', className: 'bg-blue-100 text-blue-700' },
      entra_id: { label: 'Entra ID', className: 'bg-purple-100 text-purple-700' },
      office365: { label: 'Office 365', className: 'bg-orange-100 text-orange-700' },
      google_workspace: { label: 'Google Workspace', className: 'bg-green-100 text-green-700' },
      nested: { label: 'Grupo de Grupos', className: 'bg-indigo-100 text-indigo-700' },
    };
    const config = sourceConfig[source as keyof typeof sourceConfig] || sourceConfig.manual;
    return <Badge variant="outline" className={`text-xs ${config.className}`}>{config.label}</Badge>;
  };

  const totalSelectedTargets = formData.targetGroupIds.reduce((sum, groupId) => {
    const group = availableGroups.find(g => g.id === groupId);
    return sum + (group?.memberCount || 0);
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Campanha</DialogTitle>
          <DialogDescription>
            Atualize as informações da campanha "{campaign.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome da Campanha */}
          <div>
            <Label htmlFor="name">Nome da Campanha *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Teste de Segurança Q1 2024"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Template */}
            <div>
              <Label htmlFor="template">Template *</Label>
              <Select
                value={formData.templateId}
                onValueChange={(value) => setFormData({ ...formData, templateId: value })}
              >
                <SelectTrigger id="template" className="mt-1">
                  <SelectValue placeholder="Selecione o template" />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} - {template.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Campanha */}
            <div>
              <Label htmlFor="type">Tipo de Campanha</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Padrão</SelectItem>
                  <SelectItem value="welcome_automation">Automação Boas-vindas</SelectItem>
                  <SelectItem value="scheduled">Agendada Recorrente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data de Agendamento */}
          <div className="space-y-2">
            <Label>Data de Agendamento (Opcional)</Label>
            <div className="relative">
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCalendarOpen(!calendarOpen)}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.scheduledAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduledAt ? (
                    format(formData.scheduledAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </div>
              
              {calendarOpen && (
                <div className="absolute z-50 mt-2 bg-white border rounded-lg shadow-lg" ref={calendarRef}>
                  <Calendar
                    mode="single"
                    selected={formData.scheduledAt}
                    onSelect={(date) => {
                      setFormData((prev) => ({ ...prev, scheduledAt: date }));
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
            {formData.scheduledAt && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFormData((prev) => ({ ...prev, scheduledAt: undefined }))}
                className="h-8 text-xs text-gray-500 hover:text-gray-700"
              >
                Limpar data
              </Button>
            )}
          </div>

          {/* Grupos de Alvos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Grupos de Alvos *</Label>
              {formData.targetGroupIds.length > 0 && (
                <Badge variant="outline" className="bg-[#834a8b] text-white">
                  <Users className="w-3 h-3 mr-1" />
                  {totalSelectedTargets} alvos selecionados
                </Badge>
              )}
            </div>
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
              {availableGroups.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum grupo disponível. Crie grupos de alvos primeiro.
                </p>
              ) : (
                availableGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      id={`edit-${group.id}`}
                      checked={formData.targetGroupIds.includes(group.id)}
                      onCheckedChange={() => toggleGroup(group.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`edit-${group.id}`}
                        className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                      >
                        {group.name}
                        {getSourceBadge(group.source)}
                        {group.syncEnabled && (
                          <Cloud className="w-3 h-3 text-blue-500" title="Sincronização ativa" />
                        )}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">{group.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-600">
                          <Users className="w-3 h-3 inline mr-1" />
                          {group.memberCount} membros
                        </span>
                        {group.syncEnabled && group.lastSyncAt && (
                          <span className="text-xs text-gray-500">
                            <RefreshCw className="w-3 h-3 inline mr-1" />
                            Última sync: {format(new Date(group.lastSyncAt), 'dd/MM/yyyy HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#834a8b] hover:bg-[#9a5ba1]">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
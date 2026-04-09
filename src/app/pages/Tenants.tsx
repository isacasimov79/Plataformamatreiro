import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getTenants, deleteTenant, updateTenant, getTemplates } from '../lib/apiLocal';
import { NewTenantDialog } from '../components/NewTenantDialog';
import { EditTenantDialog } from '../components/EditTenantDialog';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Building2, Eye, Edit, Trash2, Search, Settings, Zap, Image as ImageIcon } from 'lucide-react';
import { ClientLogoUpload } from '../components/ClientLogoUpload';

export function Tenants() {
  const { t } = useTranslation();
  const { impersonateTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [autoPhishingEnabled, setAutoPhishingEnabled] = useState(false);
  const [delayDays, setDelayDays] = useState(30);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Carregar tenants do banco
  useEffect(() => {
    loadTenants();
    loadTemplates();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await getTenants();
      setTenants(data);
    } catch (error) {
      console.error('Error loading tenants:', error);
      toast.error(t('tenants.errorLoading'), {
        description: t('tenants.errorLoadingDesc'),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error(t('tenants.errorLoadingTemplates'), {
        description: t('tenants.errorLoadingTemplatesDesc'),
      });
    }
  };

  const handleDeleteTenant = async (id: string, name: string) => {
    try {
      await deleteTenant(id);
      toast.success(t('tenants.success.removed'), {
        description: t('tenants.success.removedDesc', { name }),
      });
      await loadTenants(); // Recarregar lista
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast.error(t('tenants.errorRemoving'), {
        description: t('tenants.errorRemovingDesc'),
      });
    }
  };

  const handleConfigureAutoPhishing = (tenant: any) => {
    setSelectedTenant(tenant);
    setAutoPhishingEnabled(tenant.autoPhishingConfig?.enabled || false);
    setDelayDays(tenant.autoPhishingConfig?.delayDays || 30);
    setSelectedTemplate(tenant.autoPhishingConfig?.templateId || '');
    setIsConfigDialogOpen(true);
  };

  const handleSaveAutoPhishing = async () => {
    if (!selectedTenant) return;

    try {
      await updateTenant(selectedTenant.id, {
        ...selectedTenant,
        autoPhishingConfig: {
          enabled: autoPhishingEnabled,
          delayDays,
          templateId: selectedTemplate,
        },
      });

      toast.success(t('tenants.success.configSaved'), {
        description: autoPhishingEnabled
          ? t('tenants.success.phishingEnabled', { name: selectedTenant?.name })
          : t('tenants.success.phishingDisabled', { name: selectedTenant?.name }),
      });
      setIsConfigDialogOpen(false);
      await loadTenants(); // Recarregar lista
    } catch (error) {
      console.error('Error saving auto phishing config:', error);
      toast.error(t('tenants.errorSavingConfig'), {
        description: t('tenants.errorSavingConfigDesc'),
      });
    }
  };

  const handleSaveLogo = (logoUrl: string) => {
    toast.success(t('tenants.success.logoSaved'), {
      description: t('tenants.success.logoSavedDesc', { name: selectedTenant?.name }),
    });
    setIsLogoDialogOpen(false);
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      (tenant.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant.contact_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTenantById = (id: string) => {
    return tenants.find((t) => t.id === id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {t('tenants.status.active')}
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {t('tenants.status.suspended')}
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {t('tenants.status.inactive')}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Header com gradiente */}
        <div className="page-header">
          <div className="page-header-gradient">
            <h1 className="page-title">{t('tenants.title')}</h1>
            <p className="page-subtitle">
              {t('tenants.subtitle')}
            </p>
          </div>
        </div>

        {/* Ação principal */}
        <div className="flex justify-end mb-6">
          <NewTenantDialog />
        </div>

        {/* Search */}
        <Card className="mb-6 content-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder={t('tenants.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenants Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('tenants.table.title')}</CardTitle>
            <CardDescription>
              {t('tenants.table.desc', { count: filteredTenants.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tenants.table.colName')}</TableHead>
                  <TableHead>{t('tenants.table.colCnpj')}</TableHead>
                  <TableHead>{t('tenants.table.colParent')}</TableHead>
                  <TableHead>{t('tenants.table.colStatus')}</TableHead>
                  <TableHead>{t('tenants.table.colCreatedAt')}</TableHead>
                  <TableHead className="text-right">{t('tenants.table.colActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => {
                  const parentId = tenant.parentId || tenant.parent_tenant;
                  const parent = parentId ? getTenantById(parentId) : null;
                  return (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{tenant.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{tenant.contact_email || tenant.slug || '—'}</span>
                      </TableCell>
                      <TableCell>
                        {parent ? (
                          <span className="text-sm text-gray-600">{parent.name}</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(tenant.status || 'active')}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {tenant.created_at || tenant.createdAt ? format(new Date(tenant.created_at || tenant.createdAt), 'dd/MM/yyyy') : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              impersonateTenant(tenant.id);
                              toast.success(t('tenants.table.impersonating', { name: tenant.name }));
                            }}
                            title={t('tenants.table.impersonateTitle')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <EditTenantDialog tenant={tenant} />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            title={t('tenants.table.deleteTitle')}
                            onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                            title={t('tenants.table.configureTitle')}
                            onClick={() => handleConfigureAutoPhishing(tenant)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-700"
                            title={t('tenants.table.uploadLogoTitle')}
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setIsLogoDialogOpen(true);
                            }}
                          >
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Auto Phishing Configuration Dialog */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('tenants.dialogConfig.title')}</DialogTitle>
              <DialogDescription>
                {t('tenants.dialogConfig.desc', { name: selectedTenant?.name })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="autoPhishingEnabled">{t('tenants.dialogConfig.enable')}</Label>
                <Switch
                  id="autoPhishingEnabled"
                  checked={autoPhishingEnabled}
                  onCheckedChange={setAutoPhishingEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delayDays">{t('tenants.dialogConfig.delayDays')}</Label>
                <Input
                  id="delayDays"
                  type="number"
                  value={delayDays}
                  onChange={(e) => setDelayDays(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateId">{t('tenants.dialogConfig.template')}</Label>
                <Select
                  id="templateId"
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('tenants.dialogConfig.templatePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfigDialogOpen(false)}
              >
                {t('tenants.buttons.cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleSaveAutoPhishing}
              >
                {t('tenants.buttons.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Client Logo Upload Dialog */}
        {selectedTenant && (
          <ClientLogoUpload
            isOpen={isLogoDialogOpen}
            onClose={() => setIsLogoDialogOpen(false)}
            onSave={handleSaveLogo}
            clientName={selectedTenant.name}
          />
        )}
      </div>
    </div>
  );
}
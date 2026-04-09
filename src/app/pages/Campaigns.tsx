import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getTenants, getTemplates, getTargets, getCampaigns, launchCampaign, deleteCampaign } from '../lib/apiLocal';
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
import { Progress } from '../components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Mail,
  Calendar,
  Eye,
  Pause,
  Play,
  Edit,
  Trash2,
  Search,
  Rocket,
} from 'lucide-react';
import { NewCampaignDialog } from '../components/NewCampaignDialog';
import { EditCampaignDialog } from '../components/EditCampaignDialog';
import { ViewCampaignDialog } from '../components/ViewCampaignDialog';
import { PhishingSyslogDialog } from '../components/PhishingSyslogDialog';

export function Campaigns() {
  const { t } = useTranslation();
  const { impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para dados do banco
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCampaignForEdit, setSelectedCampaignForEdit] = useState<any>(null);
  const [selectedCampaignForView, setSelectedCampaignForView] = useState<any>(null);

  // Carregar dados do banco
  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener('campaign-created', handler);
    return () => window.removeEventListener('campaign-created', handler);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campaignsData, templatesData, targetsData, tenantsData] = await Promise.all([
        getCampaigns(),
        getTemplates(),
        getTargets(),
        getTenants(),
      ]);
      
      console.log('📧 Campaigns data loaded:', {
        campaigns: campaignsData?.length || 0,
        templates: templatesData?.length || 0,
        targets: targetsData?.length || 0,
        tenants: tenantsData?.length || 0,
      });
      
      setCampaigns(campaignsData || []);
      setTemplates(templatesData || []);
      setTargets(targetsData || []);
      setTenants(tenantsData || []);
    } catch (error) {
      console.error('❌ Error loading campaigns data:', error);
      toast.error(t('campaigns.messages.loadError'), {
        description: error instanceof Error ? error.message : t('common.unknownError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const getTemplateById = (id: string) => {
    return templates.find((t) => t.id === id);
  };

  const getTenantById = (id: string) => {
    return tenants.find((t) => t.id === id);
  };

  const isMasterView = !impersonatedTenant;
  const relevantCampaigns = impersonatedTenant
    ? campaigns.filter(c => c.tenantId === impersonatedTenant.id)
    : campaigns;

  const filteredCampaigns = relevantCampaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {t('campaigns.status.completed')}
          </Badge>
        );
      case 'running':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {t('campaigns.status.running')}
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {t('campaigns.status.scheduled')}
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {t('campaigns.status.paused')}
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {t('campaigns.status.draft')}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'welcome_automation':
        return (
          <Badge variant="outline" className="text-xs">
            {t('campaigns.type.welcomeAutomation')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {t('campaigns.type.standard')}
          </Badge>
        );
    }
  };

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Header com gradiente */}
        <div className="page-header">
          <div className="page-header-gradient">
            <h1 className="page-title">{t('campaigns.title')}</h1>
            <p className="page-subtitle">
              {isMasterView
                ? t('campaigns.subtitle.master', { count: campaigns.length })
                : t('campaigns.subtitle.tenant', { count: campaigns.length, tenant: impersonatedTenant?.name })}
            </p>
          </div>
        </div>

        {/* Ação principal */}
        <div className="flex justify-end mb-6">
          <NewCampaignDialog />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="stat-card stat-card-purple">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('campaigns.stats.total')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value-gradient">{filteredCampaigns.length}</div>
            </CardContent>
          </Card>

          <Card className="stat-card stat-card-blue">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('campaigns.stats.running')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value-blue">
                {filteredCampaigns.filter((c) => c.status === 'running').length}
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card stat-card-orange">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">{t('campaigns.stats.scheduled')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value-orange">
                {filteredCampaigns.filter((c) => c.status === 'scheduled').length}
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card stat-card-green">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">{t('campaigns.stats.completed')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value-green">
                {filteredCampaigns.filter((c) => c.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={t('campaigns.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('campaigns.table.title')}</CardTitle>
            <CardDescription>{t('campaigns.table.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('campaigns.table.col.campaign')}</TableHead>
                  {!impersonatedTenant && <TableHead>{t('campaigns.table.col.client')}</TableHead>}
                  <TableHead>{t('campaigns.table.col.type')}</TableHead>
                  <TableHead>{t('campaigns.table.col.status')}</TableHead>
                  <TableHead>{t('campaigns.table.col.progress')}</TableHead>
                  <TableHead>{t('campaigns.table.col.metrics')}</TableHead>
                  <TableHead className="text-right">{t('campaigns.table.col.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => {
                  const template = getTemplateById(campaign.templateId);
                  const tenant = getTenantById(campaign.tenantId);
                  const phishedRate =
                    campaign.stats.sent > 0
                      ? ((campaign.stats.submitted / campaign.stats.sent) * 100).toFixed(1)
                      : '0';
                  const progressValue =
                    campaign.stats.sent > 0
                      ? (campaign.stats.opened / campaign.stats.sent) * 100
                      : 0;

                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            {campaign.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Template: {template?.name || t('common.na')}
                          </div>
                          {campaign.scheduledAt && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(campaign.scheduledAt), 'dd/MM/yyyy HH:mm')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      {!impersonatedTenant && (
                        <TableCell>
                          <span className="text-sm text-gray-600">{tenant?.name || t('common.na')}</span>
                        </TableCell>
                      )}
                      <TableCell>{getTypeBadge(campaign.type)}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">{t('campaigns.progress.openings')}</span>
                            <span className="font-medium">{progressValue.toFixed(0)}%</span>
                          </div>
                          <Progress value={progressValue} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">{t('campaigns.metrics.sent')}</span>
                            <span className="font-medium">{campaign.stats.sent}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">{t('campaigns.metrics.opened')}</span>
                            <span className="font-medium">{campaign.stats.opened}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">{t('campaigns.metrics.clicked')}</span>
                            <span className="font-medium">{campaign.stats.clicked}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-red-600">{t('campaigns.metrics.compromised')}</span>
                            <span className="font-bold text-red-600">
                              {campaign.stats.submitted} ({phishedRate}%)
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <PhishingSyslogDialog
                            campaignId={campaign.id}
                            campaignName={campaign.name}
                          />
                          {/* Launch button */}
                          {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title={t('campaigns.actions.launch', 'Lançar Campanha')}
                              onClick={async () => {
                                if (!confirm(t('campaigns.messages.confirmLaunch', `Deseja lançar "${campaign.name}"? E-mails serão enviados.`))) return;
                                try {
                                  await launchCampaign(campaign.id);
                                  toast.success(t('campaigns.messages.launched', 'Campanha lançada!'));
                                  loadData();
                                } catch (error) {
                                  console.error('Launch error:', error);
                                  toast.error(t('campaigns.messages.launchError', 'Erro ao lançar'));
                                }
                              }}
                            >
                              <Rocket className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            title={t('campaigns.actions.viewReport')}
                            onClick={() => {
                              setSelectedCampaignForView(campaign);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {campaign.status === 'running' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title={t('campaigns.actions.pause')}
                              onClick={() =>
                                toast.success(t('campaigns.messages.paused', { name: campaign.name }))
                              }
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                          {campaign.status === 'paused' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title={t('campaigns.actions.resume')}
                              onClick={() =>
                                toast.success(t('campaigns.messages.resumed', { name: campaign.name }))
                              }
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            title={t('campaigns.actions.edit')}
                            onClick={() => {
                              setSelectedCampaignForEdit(campaign);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            title={t('campaigns.actions.delete')}
                            onClick={async () => {
                              if (confirm(t('campaigns.messages.deleted', { name: campaign.name }))) {
                                try {
                                  await deleteCampaign(String(campaign.id));
                                  toast.success(t('campaigns.messages.deleted', { name: campaign.name }));
                                  loadData();
                                } catch (error) {
                                  toast.error('Erro ao deletar campanha');
                                }
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {selectedCampaignForView && (
        <ViewCampaignDialog
          campaign={selectedCampaignForView}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />
      )}

      {selectedCampaignForEdit && (
        <EditCampaignDialog
          campaign={selectedCampaignForEdit}
          isOpen={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
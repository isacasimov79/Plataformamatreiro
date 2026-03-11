import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getTenants, getTemplates, getTargets, getCampaigns } from '../lib/supabaseApi';
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
} from 'lucide-react';
import { NewCampaignDialog } from '../components/NewCampaignDialog';
import { PhishingSyslogDialog } from '../components/PhishingSyslogDialog';

export function Campaigns() {
  const { impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para dados do banco
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do banco
  useEffect(() => {
    loadData();
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
      toast.error('Erro ao carregar campanhas', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
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
            Concluída
          </Badge>
        );
      case 'running':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Em execução
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Agendada
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Pausada
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Rascunho
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
            Automação Boas-vindas
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Padrão
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
            <h1 className="page-title">Campanhas</h1>
            <p className="page-subtitle">
              {isMasterView
                ? `${campaigns.length} campanhas em todos os clientes`
                : `${campaigns.length} campanhas para ${impersonatedTenant?.name}`}
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
                Total de Campanhas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value-gradient">{filteredCampaigns.length}</div>
            </CardContent>
          </Card>

          <Card className="stat-card stat-card-blue">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Em Execução
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
              <CardTitle className="text-sm font-medium text-gray-600">Agendadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value-orange">
                {filteredCampaigns.filter((c) => c.status === 'scheduled').length}
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card stat-card-green">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Concluídas</CardTitle>
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
                placeholder="Buscar campanhas..."
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
            <CardTitle>Campanhas Cadastradas</CardTitle>
            <CardDescription>Histórico e status das campanhas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  {!impersonatedTenant && <TableHead>Cliente</TableHead>}
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Métricas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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
                            Template: {template?.name || 'N/A'}
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
                          <span className="text-sm text-gray-600">{tenant?.name || 'N/A'}</span>
                        </TableCell>
                      )}
                      <TableCell>{getTypeBadge(campaign.type)}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">Aberturas</span>
                            <span className="font-medium">{progressValue.toFixed(0)}%</span>
                          </div>
                          <Progress value={progressValue} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Enviados:</span>
                            <span className="font-medium">{campaign.stats.sent}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Abertos:</span>
                            <span className="font-medium">{campaign.stats.opened}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Cliques:</span>
                            <span className="font-medium">{campaign.stats.clicked}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-red-600">Comprometidos:</span>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Ver relatório"
                            onClick={() =>
                              toast.info(`Relatório da campanha "${campaign.name}"`, {
                                description: 'Funcionalidade em desenvolvimento',
                              })
                            }
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {campaign.status === 'running' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Pausar campanha"
                              onClick={() =>
                                toast.success(`Campanha "${campaign.name}" pausada`)
                              }
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                          {campaign.status === 'paused' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Retomar campanha"
                              onClick={() =>
                                toast.success(`Campanha "${campaign.name}" retomada`)
                              }
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Editar"
                            onClick={() =>
                              toast.info(`Editando "${campaign.name}"`, {
                                description: 'Funcionalidade em desenvolvimento',
                              })
                            }
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            title="Excluir"
                            onClick={() =>
                              toast.error(`Campanha "${campaign.name}" removida`, {
                                description: 'Esta é uma simulação. Nada foi excluído.',
                              })
                            }
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
    </div>
  );
}
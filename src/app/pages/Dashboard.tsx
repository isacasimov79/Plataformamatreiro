import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { DatabaseSeeder } from '../components/DatabaseSeeder';
import { LoadingState } from '../components/LoadingState';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Users,
  Mail,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  MousePointer,
} from 'lucide-react';
import { getTenants, getTargets, getCampaigns, getTemplates } from '../lib/apiLocal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

export function Dashboard() {
  const { user, impersonatedTenant } = useAuth();
  const { t } = useTranslation();
  
  // Estados para dados do banco
  const [tenants, setTenants] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do banco
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantsData, targetsData, campaignsData, templatesData] = await Promise.all([
        getTenants().catch(err => { console.warn('Tenants load failed:', err); return []; }),
        getTargets().catch(err => { console.warn('Targets load failed:', err); return []; }),
        getCampaigns().catch(err => { console.warn('Campaigns load failed:', err); return []; }),
        getTemplates().catch(err => { console.warn('Templates load failed:', err); return []; }),
      ]);
      
      console.log('📊 Dashboard data loaded:', {
        tenants: tenantsData?.length || 0,
        targets: targetsData?.length || 0,
        campaigns: campaignsData?.length || 0,
        templates: templatesData?.length || 0,
      });
      
      setTenants(tenantsData || []);
      setTargets(targetsData || []);
      setCampaigns(campaignsData || []);
      setTemplates(templatesData || []);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      // Não mostrar toast de erro, apenas logar
      // A aplicação continuará funcionando com arrays vazios
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas baseadas no contexto (Master ou Cliente)
  const isMasterView = !impersonatedTenant;
  
  const relevantTargets = isMasterView
    ? targets
    : targets.filter(t => t.tenantId === impersonatedTenant?.id);

  const relevantCampaigns = isMasterView
    ? campaigns
    : campaigns.filter(c => c.tenantId === impersonatedTenant?.id);

  const relevantTemplates = isMasterView
    ? templates
    : templates.filter(t => t.tenantId === null || t.tenantId === impersonatedTenant?.id);
  
  const stats = isMasterView
    ? {
        tenants: tenants.filter((t) => t.status === 'active').length,
        targets: targets.length,
        campaigns: campaigns.length,
        templates: templates.length,
      }
    : {
        tenants: 1,
        targets: relevantTargets.length,
        campaigns: relevantCampaigns.length,
        templates: relevantTemplates.length,
      };

  // Calcular métricas de campanhas
  const totalSent = relevantCampaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
  const totalOpened = relevantCampaigns.reduce((sum, c) => sum + (c.stats?.opened || 0), 0);
  const totalClicked = relevantCampaigns.reduce((sum, c) => sum + (c.stats?.clicked || 0), 0);
  const totalSubmitted = relevantCampaigns.reduce((sum, c) => sum + (c.stats?.submitted || 0), 0);

  const activeCampaigns = relevantCampaigns.filter(c => c.status === 'running').length;
  const totalCampaigns = relevantCampaigns.length;
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0';
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0';
  const compromiseRate = totalSent > 0 ? ((totalSubmitted / totalSent) * 100).toFixed(1) : '0.0';

  // Dados para gráficos
  const campaignData =
    relevantCampaigns.length > 0
      ? relevantCampaigns.slice(0, 5).map((campaign) => {
          const stats = campaign.stats || { sent: 0, opened: 0, clicked: 0, submitted: 0 };
          return {
            id: campaign.id,
            name: campaign.name.length > 20 ? campaign.name.substring(0, 20) + '...' : campaign.name,
            [t('dashboard.stats.sent')]: stats.sent || 0,
            [t('dashboard.stats.opened')]: stats.opened || 0,
            [t('dashboard.stats.clicked')]: stats.clicked || 0,
            [t('dashboard.stats.submitted')]: stats.submitted || 0,
          };
        })
      : [
        {
          id: 'empty-campaign-1',
          name: t('dashboard.emptyData'),
          [t('dashboard.stats.sent')]: 0,
          [t('dashboard.stats.opened')]: 0,
          [t('dashboard.stats.clicked')]: 0,
          [t('dashboard.stats.submitted')]: 0,
        }
      ];

  const pieData = totalSent > 0 
    ? [
        { id: 'pie-safe', name: t('dashboard.stats.notCompromised'), value: totalSent - totalSubmitted, color: '#10b981' },
        { id: 'pie-compromised', name: t('dashboard.stats.compromised'), value: totalSubmitted, color: '#834a8b' },
      ]
    : [
        { id: 'pie-empty-data', name: t('dashboard.emptyData'), value: 1, color: '#e5e7eb' }
      ];

  const COLORS = ['#10b981', '#834a8b'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Header com gradiente */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#242545] to-[#834a8b] rounded-2xl p-6 md:p-8 shadow-xl">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              {t('dashboard.title')}
            </h1>
            <p className="text-purple-100 text-sm md:text-base">
              {isMasterView
                ? t('dashboard.overview')
                : `${t('dashboard.client')}: ${impersonatedTenant?.name}`}
            </p>
          </div>
        </div>

        {/* Database Seeder - Mostrar apenas se necessário */}
        <div className="mb-6">
          <DatabaseSeeder />
        </div>

        {/* Cards de Estatísticas com gradientes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Card 1 - Campanhas Ativas */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">
                {t('dashboard.activeCampaigns')}
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mail className="w-5 h-5 text-[#834a8b]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#242545] to-[#834a8b] bg-clip-text text-transparent">
                {activeCampaigns}
              </div>
              <p className="text-xs text-gray-600 mt-2 font-medium">
                {totalCampaigns} {t('dashboard.totalCampaigns')}
              </p>
            </CardContent>
          </Card>

          {/* Card 2 - Emails Enviados */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">
                {t('dashboard.emailsSent')}
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-blue-600">
                {totalSent.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-2 font-medium">{t('dashboard.last30Days')}</p>
            </CardContent>
          </Card>

          {/* Card 3 - Taxa de Cliques */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">
                {t('dashboard.clickRate')}
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <MousePointer className="w-5 h-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-orange-600">{clickRate}%</div>
              <p className="text-xs text-gray-600 mt-2 font-medium">
                {totalClicked.toLocaleString()} {t('dashboard.clicks')}
              </p>
            </CardContent>
          </Card>

          {/* Card 4 - Taxa de Comprometimento */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-red-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">
                {t('dashboard.compromiseRate')}
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-red-600">{compromiseRate}%</div>
              <p className="text-xs text-gray-600 mt-2 font-medium">
                {totalSubmitted.toLocaleString()} {t('dashboard.compromises')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.charts.campaignPerformance.title')}</CardTitle>
              <CardDescription>
                {t('dashboard.charts.campaignPerformance.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] md:h-[350px] min-h-[300px] w-full">
                {!loading && campaignData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <BarChart data={campaignData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} tickMargin={10} interval={0} />
                      <YAxis fontSize={12} width={40} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar key="bar-enviados" dataKey={t('dashboard.stats.sent')} fill="#242545" />
                      <Bar key="bar-abertos" dataKey={t('dashboard.stats.opened')} fill="#10b981" />
                      <Bar key="bar-clicados" dataKey={t('dashboard.stats.clicked')} fill="#f59e0b" />
                      <Bar key="bar-comprometidos" dataKey={t('dashboard.stats.submitted')} fill="#834a8b" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    {loading ? t('dashboard.loading') : t('dashboard.emptyDataAvailable')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.charts.compromiseRate.title')}</CardTitle>
              <CardDescription>
                {t('dashboard.charts.compromiseRate.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] md:h-[350px] min-h-[300px] w-full flex items-center justify-center">
                {!loading && pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-gray-400">
                    {loading ? t('dashboard.loading') : t('dashboard.emptyDataAvailable')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campanhas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentCampaigns.title')}</CardTitle>
            <CardDescription>{t('dashboard.recentCampaigns.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {relevantCampaigns.length > 0 ? (
              <div className="space-y-4">
                {relevantCampaigns.slice(0, 5).map((campaign) => {
                  const stats = campaign.stats || { sent: 0, opened: 0, clicked: 0, submitted: 0 };
                  return (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <Mail className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                          <p className="text-sm text-gray-500">
                            {stats.sent} {t('dashboard.stats.sent').toLowerCase()} • {stats.submitted} {t('dashboard.stats.compromised').toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {campaign.status === 'completed' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {t('campaigns.status.completed')}
                          </Badge>
                        )}
                        {campaign.status === 'running' && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Clock className="w-3 h-3 mr-1" />
                            {t('campaigns.status.running')}
                          </Badge>
                        )}
                        {campaign.status === 'scheduled' && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <Clock className="w-3 h-3 mr-1" />
                            {t('campaigns.status.scheduled')}
                          </Badge>
                        )}
                        {campaign.status === 'draft' && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            {t('campaigns.status.draft')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">{t('dashboard.recentCampaigns.empty')}</p>
                <p className="text-xs mt-1">{t('dashboard.recentCampaigns.emptyDesc')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
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
import { getTenants, getTargets, getCampaigns, getTemplates } from '../lib/supabaseApi';
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
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';
  const compromiseRate = totalSent > 0 ? ((totalSubmitted / totalSent) * 100).toFixed(1) : '0';

  // Dados para gráficos
  const campaignData = relevantCampaigns.length > 0 
    ? relevantCampaigns.slice(0, 5).map((c, index) => ({
        id: `campaign-${c.id}-${index}`,
        name: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
        Enviados: c.stats.sent,
        Abertos: c.stats.opened,
        Clicados: c.stats.clicked,
        Comprometidos: c.stats.submitted,
      }))
    : [
        {
          id: 'empty-campaign-1',
          name: 'Sem dados',
          Enviados: 0,
          Abertos: 0,
          Clicados: 0,
          Comprometidos: 0,
        }
      ];

  const pieData = totalSent > 0 
    ? [
        { id: 'pie-safe', name: 'Não Comprometidos', value: totalSent - totalSubmitted, color: '#10b981' },
        { id: 'pie-compromised', name: 'Comprometidos', value: totalSubmitted, color: '#834a8b' },
      ]
    : [
        { id: 'pie-empty', name: 'Sem dados', value: 1, color: '#e5e7eb' }
      ];

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">{t('dashboard.title')}</h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          {isMasterView
            ? t('dashboard.overview')
            : `${t('dashboard.client')}: ${impersonatedTenant?.name}`}
        </p>
      </div>

      {/* Database Seeder - Mostrar apenas se necessário */}
      <div className="mb-6">
        <DatabaseSeeder />
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('dashboard.activeCampaigns')}
            </CardTitle>
            <Mail className="w-4 h-4 text-[#834a8b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#242545]">{activeCampaigns}</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalCampaigns} {t('dashboard.totalCampaigns')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('dashboard.emailsSent')}
            </CardTitle>
            <Send className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#242545]">
              {totalSent.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('dashboard.last30Days')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('dashboard.clickRate')}
            </CardTitle>
            <MousePointer className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#242545]">{clickRate}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalClicked.toLocaleString()} {t('dashboard.clicks')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('dashboard.compromiseRate')}
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-red-600">{compromiseRate}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalSubmitted.toLocaleString()} {t('dashboard.compromises')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Desempenho de Campanhas</CardTitle>
            <CardDescription>
              Comparação das 5 campanhas mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] md:h-[350px] min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={300} debounce={50}>
                <BarChart data={campaignData} width={500} height={300} key={`bar-chart-${campaignData.length}`}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Enviados" fill="#242545" isAnimationActive={false} />
                  <Bar dataKey="Abertos" fill="#3b82f6" isAnimationActive={false} />
                  <Bar dataKey="Clicados" fill="#f59e0b" isAnimationActive={false} />
                  <Bar dataKey="Comprometidos" fill="#834a8b" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Comprometimento</CardTitle>
            <CardDescription>
              Distribuição de usuários comprometidos vs não comprometidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] md:h-[350px] min-h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%" minHeight={300} debounce={50}>
                <PieChart width={400} height={300} key={`pie-chart-${pieData.length}`}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {pieData.map((entry) => (
                      <Cell key={`cell-${entry.id}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campanhas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Recentes</CardTitle>
          <CardDescription>Status das últimas campanhas executadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {relevantCampaigns.slice(0, 5).map((campaign) => (
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
                      {campaign.stats.sent} enviados • {campaign.stats.submitted} comprometidos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {campaign.status === 'completed' && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Concluída
                    </Badge>
                  )}
                  {campaign.status === 'running' && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Clock className="w-3 h-3 mr-1" />
                      Em execução
                    </Badge>
                  )}
                  {campaign.status === 'scheduled' && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      <Clock className="w-3 h-3 mr-1" />
                      Agendada
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
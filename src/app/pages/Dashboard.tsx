import { useAuth } from '../contexts/AuthContext';
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
import {
  mockTenants,
  mockTargets,
  mockCampaigns,
  mockTemplates,
  getCampaignsByTenant,
  getTargetsByTenant,
} from '../lib/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function Dashboard() {
  const { user, impersonatedTenant } = useAuth();

  // Estatísticas baseadas no contexto (Master ou Cliente)
  const isMasterView = !impersonatedTenant;
  
  const stats = isMasterView
    ? {
        tenants: mockTenants.filter((t) => t.status === 'active').length,
        targets: mockTargets.length,
        campaigns: mockCampaigns.length,
        templates: mockTemplates.length,
      }
    : {
        tenants: 1,
        targets: getTargetsByTenant(impersonatedTenant.id).length,
        campaigns: getCampaignsByTenant(impersonatedTenant.id).length,
        templates: mockTemplates.filter(
          (t) => t.tenantId === null || t.tenantId === impersonatedTenant.id
        ).length,
      };

  // Calcular métricas de campanhas
  const relevantCampaigns = isMasterView
    ? mockCampaigns
    : getCampaignsByTenant(impersonatedTenant!.id);

  const totalSent = relevantCampaigns.reduce((sum, c) => sum + c.stats.sent, 0);
  const totalOpened = relevantCampaigns.reduce((sum, c) => sum + c.stats.opened, 0);
  const totalClicked = relevantCampaigns.reduce((sum, c) => sum + c.stats.clicked, 0);
  const totalSubmitted = relevantCampaigns.reduce((sum, c) => sum + c.stats.submitted, 0);

  const activeCampaigns = relevantCampaigns.filter(c => c.status === 'running').length;
  const totalCampaigns = relevantCampaigns.length;
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';
  const compromiseRate = totalSent > 0 ? ((totalSubmitted / totalSent) * 100).toFixed(1) : '0';

  // Dados para gráficos
  const campaignData = relevantCampaigns.length > 0 
    ? relevantCampaigns.slice(0, 5).map((c, index) => ({
        id: `${c.id}-${index}`,
        name: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
        Enviados: c.stats.sent,
        Abertos: c.stats.opened,
        Clicados: c.stats.clicked,
        Comprometidos: c.stats.submitted,
      }))
    : [
        {
          id: 'empty-1',
          name: 'Sem dados',
          Enviados: 0,
          Abertos: 0,
          Clicados: 0,
          Comprometidos: 0,
        }
      ];

  const pieData = totalSent > 0 
    ? [
        { id: 'safe-1', name: 'Não Comprometidos', value: totalSent - totalSubmitted, color: '#10b981' },
        { id: 'compromised-1', name: 'Comprometidos', value: totalSubmitted, color: '#834a8b' },
      ]
    : [
        { id: 'empty-1', name: 'Sem dados', value: 1, color: '#e5e7eb' }
      ];

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          {isMasterView
            ? 'Visão geral de todos os clientes'
            : `Cliente: ${impersonatedTenant?.name}`}
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Campanhas Ativas
            </CardTitle>
            <Mail className="w-4 h-4 text-[#834a8b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#242545]">{activeCampaigns}</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalCampaigns} no total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              E-mails Enviados
            </CardTitle>
            <Send className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#242545]">
              {totalSent.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taxa de Cliques
            </CardTitle>
            <MousePointer className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#242545]">{clickRate}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalClicked.toLocaleString()} cliques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taxa de Comprometimento
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-red-600">{compromiseRate}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalSubmitted.toLocaleString()} comprometimentos
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
            <div className="h-[300px] md:h-[350px] min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <BarChart data={campaignData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar key="bar-enviados" dataKey="Enviados" fill="#242545" />
                  <Bar key="bar-abertos" dataKey="Abertos" fill="#3b82f6" />
                  <Bar key="bar-clicados" dataKey="Clicados" fill="#f59e0b" />
                  <Bar key="bar-comprometidos" dataKey="Comprometidos" fill="#834a8b" />
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
            <div className="h-[300px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
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
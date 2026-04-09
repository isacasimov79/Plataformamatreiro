import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  Target,
  AlertTriangle,
  Download,
  Calendar,
  Clock,
  Award,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock Data
const campaignTrendsData = [
  { month: 'Jan', enviados: 1200, cliques: 480, capturas: 156 },
  { month: 'Fev', enviados: 1500, cliques: 675, capturas: 203 },
  { month: 'Mar', enviados: 1800, cliques: 810, capturas: 259 },
  { month: 'Abr', enviados: 2000, cliques: 900, capturas: 288 },
  { month: 'Mai', enviados: 1900, cliques: 855, capturas: 274 },
  { month: 'Jun', enviados: 2200, cliques: 1100, capturas: 352 },
];

const userVulnerabilityData = [
  { id: 'vuln-1', name: 'Muito Baixo', value: 15, color: '#10b981' },
  { id: 'vuln-2', name: 'Baixo', value: 30, color: '#84cc16' },
  { id: 'vuln-3', name: 'Médio', value: 35, color: '#f59e0b' },
  { id: 'vuln-4', name: 'Alto', value: 15, color: '#ef4444' },
  { id: 'vuln-5', name: 'Crítico', value: 5, color: '#991b1b' },
];

const departmentData = [
  { department: 'TI', vulnerabilidade: 18, treinamentos: 95 },
  { department: 'RH', vulnerabilidade: 42, treinamentos: 78 },
  { department: 'Financeiro', vulnerabilidade: 58, treinamentos: 65 },
  { department: 'Vendas', vulnerabilidade: 65, treinamentos: 52 },
  { department: 'Marketing', vulnerabilidade: 38, treinamentos: 80 },
  { department: 'Operações', vulnerabilidade: 48, treinamentos: 70 },
];

const hourlyHeatmapData = [
  { hour: '00h', seg: 2, ter: 1, qua: 3, qui: 2, sex: 1 },
  { hour: '02h', seg: 1, ter: 0, qua: 1, qui: 0, sex: 2 },
  { hour: '04h', seg: 0, ter: 1, qua: 0, qui: 1, sex: 0 },
  { hour: '06h', seg: 3, ter: 4, qua: 5, qui: 3, sex: 2 },
  { hour: '08h', seg: 15, ter: 18, qua: 22, qui: 19, sex: 16 },
  { hour: '10h', seg: 28, ter: 32, qua: 35, qui: 30, sex: 25 },
  { hour: '12h', seg: 22, ter: 25, qua: 20, qui: 23, sex: 18 },
  { hour: '14h', seg: 30, ter: 35, qua: 38, qui: 33, sex: 28 },
  { hour: '16h', seg: 25, ter: 28, qua: 30, qui: 27, sex: 22 },
  { hour: '18h', seg: 12, ter: 15, qua: 18, qui: 14, sex: 10 },
  { hour: '20h', seg: 5, ter: 8, qua: 6, qui: 7, sex: 4 },
  { hour: '22h', seg: 3, ter: 4, qua: 5, qui: 3, sex: 2 },
];

const topVulnerableUsers = [
  { name: 'João Silva', email: 'joao.silva@empresa.com', captures: 8, rate: 88 },
  { name: 'Maria Santos', email: 'maria.santos@empresa.com', captures: 7, rate: 82 },
  { name: 'Pedro Oliveira', email: 'pedro.oliveira@empresa.com', captures: 6, rate: 75 },
  { name: 'Ana Costa', email: 'ana.costa@empresa.com', captures: 5, rate: 71 },
  { name: 'Carlos Souza', email: 'carlos.souza@empresa.com', captures: 5, rate: 68 },
];

export function AdvancedDashboard() {
  const { user, impersonatedTenant } = useAuth();
  const [dateRange, setDateRange] = useState('30days');
  const { t } = useTranslation();

  const handleExport = () => {
    toast.success(t('advancedDashboard.messages.exportedTitle'), {
      description: t('advancedDashboard.messages.exportedDesc'),
    });
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">
              {t('advancedDashboard.title')}
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              {t('advancedDashboard.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              {t('advancedDashboard.filters.last30days')}
            </Button>
            <Button onClick={handleExport} className="bg-[#834a8b] hover:bg-[#6d3d75]">
              <Download className="w-4 h-4 mr-2" />
              {t('advancedDashboard.actions.export')}
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {t('advancedDashboard.cards.clickRate.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-[#242545]">45.2%</div>
              <Badge className="bg-red-100 text-red-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5.3%
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('advancedDashboard.cards.vsLastMonth')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Target className="w-4 h-4" />
              {t('advancedDashboard.cards.captureRate.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-red-600">32.1%</div>
              <Badge className="bg-red-100 text-red-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2.8%
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('advancedDashboard.cards.vsLastMonth')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('advancedDashboard.cards.criticalUsers.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-orange-600">28</div>
              <Badge className="bg-green-100 text-green-700">
                <TrendingDown className="w-3 h-3 mr-1" />
                -12
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('advancedDashboard.cards.criticalUsers.desc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Award className="w-4 h-4" />
              {t('advancedDashboard.cards.completionRate.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-green-600">78.4%</div>
              <Badge className="bg-green-100 text-green-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.2%
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('advancedDashboard.cards.completionRate.desc')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Campaign Trends */}
        <Card>
          <CardHeader>
            <CardTitle>{t('advancedDashboard.charts.campaignTrends.title')}</CardTitle>
            <CardDescription>{t('advancedDashboard.charts.campaignTrends.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={campaignTrendsData}>
                <defs>
                  <linearGradient id="colorEnviados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCliques" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCapturas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Area
                  key="area-enviados"
                  type="monotone"
                  dataKey="enviados"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorEnviados)"
                  name={t('advancedDashboard.charts.campaignTrends.sent')}
                />
                <Area
                  key="area-cliques"
                  type="monotone"
                  dataKey="cliques"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#colorCliques)"
                  name={t('advancedDashboard.charts.campaignTrends.clicks')}
                />
                <Area
                  key="area-capturas"
                  type="monotone"
                  dataKey="capturas"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#colorCapturas)"
                  name={t('advancedDashboard.charts.campaignTrends.captures')}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Vulnerability Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('advancedDashboard.charts.vulnerabilityDistribution.title')}</CardTitle>
            <CardDescription>{t('advancedDashboard.charts.vulnerabilityDistribution.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userVulnerabilityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userVulnerabilityData.map((entry, index) => (
                    <Cell key={`cell-${entry.id}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('advancedDashboard.charts.departmentAnalysis.title')}</CardTitle>
          <CardDescription>
            {t('advancedDashboard.charts.departmentAnalysis.desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="department" stroke="#6b7280" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} tickMargin={10} interval={0} />
              <YAxis stroke="#6b7280" width={40} />
              <Tooltip />
              <Legend />
              <Bar key="bar-vulnerabilidade" dataKey="vulnerabilidade" fill="#ef4444" name={t('advancedDashboard.charts.departmentAnalysis.vulnPercent')} />
              <Bar key="bar-treinamentos" dataKey="treinamentos" fill="#10b981" name={t('advancedDashboard.charts.departmentAnalysis.trainingsPercent')} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hourly Heatmap & Top Vulnerable Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {t('advancedDashboard.charts.heatmap.title')}
            </CardTitle>
            <CardDescription>{t('advancedDashboard.charts.heatmap.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyHeatmapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line key="line-seg" type="monotone" dataKey="seg" stroke="#3b82f6" name={t('advancedDashboard.charts.heatmap.days.mon')} />
                <Line key="line-ter" type="monotone" dataKey="ter" stroke="#10b981" name={t('advancedDashboard.charts.heatmap.days.tue')} />
                <Line key="line-qua" type="monotone" dataKey="qua" stroke="#f59e0b" name={t('advancedDashboard.charts.heatmap.days.wed')} />
                <Line key="line-qui" type="monotone" dataKey="qui" stroke="#8b5cf6" name={t('advancedDashboard.charts.heatmap.days.thu')} />
                <Line key="line-sex" type="monotone" dataKey="sex" stroke="#ef4444" name={t('advancedDashboard.charts.heatmap.days.fri')} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Vulnerable Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              {t('advancedDashboard.charts.topVulnerable.title')}
            </CardTitle>
            <CardDescription>{t('advancedDashboard.charts.topVulnerable.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVulnerableUsers.map((user, index) => (
                <div
                  key={user.email}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{user.rate}%</p>
                    <p className="text-xs text-gray-500">{user.captures} {t('advancedDashboard.charts.topVulnerable.captures')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            {t('advancedDashboard.insights.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">
                    {t('advancedDashboard.insights.item1.title')}
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    {t('advancedDashboard.insights.item1.desc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900">
                    {t('advancedDashboard.insights.item2.title')}
                  </h4>
                  <p className="text-sm text-orange-700 mt-1">
                    {t('advancedDashboard.insights.item2.desc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">
                    {t('advancedDashboard.insights.item3.title')}
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    {t('advancedDashboard.insights.item3.desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
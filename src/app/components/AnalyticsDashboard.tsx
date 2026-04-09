import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, Mail, MousePointer, FileCheck, Activity } from 'lucide-react';
import { getAnalyticsMetrics, getAnalyticsTimeSeries, getAnalyticsDepartments } from '../lib/apiLocal';
import { useTranslation } from 'react-i18next';

interface AnalyticsMetrics {
  overview: {
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalSubmitted: number;
    openRate: string;
    clickRate: string;
    submitRate: string;
  };
  campaigns: number;
  timeRange: string;
  comparison?: {
    openRateChange: number;
    clickRateChange: number;
  };
}

interface TimeSeriesData {
  date: string;
  opened: number;
  clicked: number;
  submitted: number;
}

interface DepartmentMetrics {
  department: string;
  total: number;
  clicked: number;
  submitted: number;
  clickRate: string;
}

export function AnalyticsDashboard() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('30d');
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [departments, setDepartments] = useState<DepartmentMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [metricsData, timeSeriesData, deptData] = await Promise.allSettled([
        getAnalyticsMetrics(timeRange),
        getAnalyticsTimeSeries(timeRange),
        getAnalyticsDepartments(),
      ]);

      if (metricsData.status === 'fulfilled') {
        setMetrics(metricsData.value);
      }
      if (timeSeriesData.status === 'fulfilled') {
        setTimeSeries(timeSeriesData.value.timeSeries || []);
      }
      if (deptData.status === 'fulfilled') {
        setDepartments(deptData.value.departments || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#242545', '#834a8b', '#4a4a4a', '#6c5ce7', '#a29bfe'];

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    trend
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: any;
    trend?: 'up' | 'down';
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-2">{value}</h3>
            {change && (
              <p className={`text-sm mt-2 flex items-center gap-1 ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {change}
              </p>
            )}
          </div>
          <div className={`p-4 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-600' :
            trend === 'down' ? 'bg-red-100 text-red-600' :
            'bg-primary/10 text-primary'
          }`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('enhancedAnalytics.title')}</h2>
          <p className="text-muted-foreground">{t('enhancedAnalytics.subtitle')}</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('enhancedAnalytics.timeRange')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">{t('enhancedAnalytics.timeRanges.7d', 'Últimos 7 dias')}</SelectItem>
            <SelectItem value="30d">{t('enhancedAnalytics.timeRanges.30d', 'Últimos 30 dias')}</SelectItem>
            <SelectItem value="90d">{t('enhancedAnalytics.timeRanges.90d', 'Últimos 90 dias')}</SelectItem>
            <SelectItem value="1y">{t('enhancedAnalytics.timeRanges.1y', 'Último ano')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t('enhancedAnalytics.metrics.sent')}
            value={metrics.overview.totalSent.toLocaleString()}
            icon={Mail}
          />
          <StatCard
            title={t('enhancedAnalytics.metrics.openRate')}
            value={`${metrics.overview.openRate}%`}
            change={metrics.comparison ? `${metrics.comparison.openRateChange > 0 ? '+' : ''}${metrics.comparison.openRateChange}% vs ${t('reports.kpis.vsLastMonth', { count: '' }).trim()}` : undefined}
            icon={MousePointer}
            trend={metrics.comparison && metrics.comparison.openRateChange < 0 ? 'up' : 'down'}
          />
          <StatCard
            title={t('enhancedAnalytics.metrics.clickRate')}
            value={`${metrics.overview.clickRate}%`}
            change={metrics.comparison ? `${metrics.comparison.clickRateChange > 0 ? '+' : ''}${metrics.comparison.clickRateChange}% vs ${t('reports.kpis.vsLastMonth', { count: '' }).trim()}` : undefined}
            icon={FileCheck}
            trend={metrics.comparison && metrics.comparison.clickRateChange < 0 ? 'up' : 'down'}
          />
          <StatCard
            title={t('enhancedAnalytics.metrics.submitRate')}
            value={`${metrics.overview.submitRate}%`}
            icon={Users}
          />
        </div>
      )}

      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('enhancedAnalytics.charts.timeSeriesTitle')}</CardTitle>
          <CardDescription>{t('enhancedAnalytics.charts.timeSeriesDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {timeSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height={350} minHeight={350}>
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                />
                <Legend />
                <Line
                  key="line-opened"
                  type="monotone"
                  dataKey="opened"
                  stroke="#242545"
                  name={t('enhancedAnalytics.charts.timeSeriesOpened') || "Abertos"}
                  strokeWidth={2}
                />
                <Line
                  key="line-clicked"
                  type="monotone"
                  dataKey="clicked"
                  stroke="#834a8b"
                  name={t('enhancedAnalytics.charts.timeSeriesClicked') || "Clicados"}
                  strokeWidth={2}
                />
                <Line
                  key="line-submitted"
                  type="monotone"
                  dataKey="submitted"
                  stroke="#4a4a4a"
                  name={t('enhancedAnalytics.charts.timeSeriesSubmitted') || "Submetidos"}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('enhancedAnalytics.charts.noData', 'Sem dados temporais para o período selecionado')}</p>
                <p className="text-sm mt-1">{t('enhancedAnalytics.charts.runCampaigns', 'Execute campanhas para gerar dados')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('enhancedAnalytics.departments.title', 'Vulnerabilidade por Departamento')}</CardTitle>
            <CardDescription>
              {t('enhancedAnalytics.departments.subtitle', 'Taxa de cliques em phishing por departamento')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {departments.length > 0 ? (
              <ResponsiveContainer width="100%" height={300} minHeight={300}>
                <BarChart data={departments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="department"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 11 }} tickMargin={10} interval={0}
                  />
                  <YAxis width={40} />
                  <Tooltip />
                  <Legend />
                  <Bar key="bar-clicked" dataKey="clicked" fill="#834a8b" name={t('enhancedAnalytics.departments.clicked', 'Clicaram')} />
                  <Bar key="bar-total" dataKey="total" fill="#242545" name={t('enhancedAnalytics.departments.total', 'Total')} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>{t('enhancedAnalytics.departments.noData', 'Sem dados de departamento. Importe alvos com departamentos via integração.')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('enhancedAnalytics.distribution.title', 'Distribuição de Eventos')}</CardTitle>
            <CardDescription>
              {t('enhancedAnalytics.distribution.subtitle', 'Proporção de cada tipo de evento')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics && metrics.overview.totalSent > 0 ? (
              <ResponsiveContainer width="100%" height={300} minHeight={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: t('enhancedAnalytics.distribution.sent', 'Enviados'), value: metrics.overview.totalSent },
                      { name: t('enhancedAnalytics.distribution.opened', 'Abertos'), value: metrics.overview.totalOpened },
                      { name: t('enhancedAnalytics.distribution.clicked', 'Clicados'), value: metrics.overview.totalClicked },
                      { name: t('enhancedAnalytics.distribution.submitted', 'Submetidos'), value: metrics.overview.totalSubmitted },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: t('enhancedAnalytics.distribution.sent', 'Enviados'), value: metrics.overview.totalSent },
                      { name: t('enhancedAnalytics.distribution.opened', 'Abertos'), value: metrics.overview.totalOpened },
                      { name: t('enhancedAnalytics.distribution.clicked', 'Clicados'), value: metrics.overview.totalClicked },
                      { name: t('enhancedAnalytics.distribution.submitted', 'Submetidos'), value: metrics.overview.totalSubmitted },
                    ].map((entry, index) => (
                      <Cell key={`pie-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>{t('enhancedAnalytics.distribution.noData', 'Sem dados de campanha para exibir')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Table */}
      {departments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('enhancedAnalytics.ranking.title', 'Ranking de Departamentos')}</CardTitle>
            <CardDescription>
              {t('enhancedAnalytics.ranking.subtitle', 'Classificação por taxa de cliques (menor é melhor)')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">{t('enhancedAnalytics.ranking.position', 'Posição')}</th>
                    <th className="text-left p-3 font-semibold">{t('enhancedAnalytics.ranking.department', 'Departamento')}</th>
                    <th className="text-right p-3 font-semibold">{t('enhancedAnalytics.ranking.total', 'Total')}</th>
                    <th className="text-right p-3 font-semibold">{t('enhancedAnalytics.ranking.clicked', 'Clicaram')}</th>
                    <th className="text-right p-3 font-semibold">{t('enhancedAnalytics.ranking.rate', 'Taxa')}</th>
                    <th className="text-right p-3 font-semibold">{t('enhancedAnalytics.ranking.status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {departments
                    .sort((a, b) => parseFloat(a.clickRate) - parseFloat(b.clickRate))
                    .map((dept, index) => {
                      const rate = parseFloat(dept.clickRate);
                      const status = rate < 20 ? t('enhancedAnalytics.status.excellent', 'Excelente') : 
                                     rate < 40 ? t('enhancedAnalytics.status.good', 'Bom') : 
                                     rate < 60 ? t('enhancedAnalytics.status.regular', 'Regular') : 
                                     t('enhancedAnalytics.status.critical', 'Crítico');
                      const statusColor = rate < 20 ? 'text-green-600 bg-green-50' :
                                         rate < 40 ? 'text-blue-600 bg-blue-50' :
                                         rate < 60 ? 'text-yellow-600 bg-yellow-50' :
                                         'text-red-600 bg-red-50';

                      return (
                        <tr key={dept.department} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <span className="font-bold text-lg">{index + 1}º</span>
                          </td>
                          <td className="p-3 font-medium">{dept.department}</td>
                          <td className="p-3 text-right">{dept.total}</td>
                          <td className="p-3 text-right">{dept.clicked}</td>
                          <td className="p-3 text-right font-bold">{dept.clickRate}%</td>
                          <td className="p-3 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
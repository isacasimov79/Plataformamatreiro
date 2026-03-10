import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, Mail, MousePointer, FileCheck, Activity } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
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

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-99a65fc7`;

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch metrics
      const metricsRes = await fetch(`${API_URL}/analytics/metrics?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);

      // Fetch time series
      const timeSeriesRes = await fetch(`${API_URL}/analytics/timeseries?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const timeSeriesData = await timeSeriesRes.json();
      setTimeSeries(timeSeriesData.timeSeries || []);

      // Fetch department metrics
      const deptRes = await fetch(`${API_URL}/analytics/by-department`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const deptData = await deptRes.json();
      setDepartments(deptData.departments || []);

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
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Análise avançada de campanhas e comportamento de usuários
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="1y">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="E-mails Enviados"
            value={metrics.overview.totalSent.toLocaleString()}
            icon={Mail}
          />
          <StatCard
            title="Taxa de Abertura"
            value={`${metrics.overview.openRate}%`}
            change="+2.5% vs período anterior"
            icon={MousePointer}
            trend="down"
          />
          <StatCard
            title="Taxa de Cliques"
            value={`${metrics.overview.clickRate}%`}
            change="-1.2% vs período anterior"
            icon={FileCheck}
            trend="up"
          />
          <StatCard
            title="Taxa de Submissão"
            value={`${metrics.overview.submitRate}%`}
            change="-0.8% vs período anterior"
            icon={Users}
            trend="up"
          />
        </div>
      )}

      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Temporal</CardTitle>
          <CardDescription>
            Comportamento de usuários ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
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
                type="monotone" 
                dataKey="opened" 
                stroke="#242545" 
                name="Abertos"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="clicked" 
                stroke="#834a8b" 
                name="Clicados"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="submitted" 
                stroke="#4a4a4a" 
                name="Submetidos"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vulnerabilidade por Departamento</CardTitle>
            <CardDescription>
              Taxa de cliques em phishing por departamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="department" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clicked" fill="#834a8b" name="Clicaram" />
                <Bar dataKey="total" fill="#242545" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Eventos</CardTitle>
            <CardDescription>
              Proporção de cada tipo de evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Enviados', value: metrics?.overview.totalSent || 0 },
                    { name: 'Abertos', value: metrics?.overview.totalOpened || 0 },
                    { name: 'Clicados', value: metrics?.overview.totalClicked || 0 },
                    { name: 'Submetidos', value: metrics?.overview.totalSubmitted || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Enviados', value: metrics?.overview.totalSent || 0 },
                    { name: 'Abertos', value: metrics?.overview.totalOpened || 0 },
                    { name: 'Clicados', value: metrics?.overview.totalClicked || 0 },
                    { name: 'Submetidos', value: metrics?.overview.totalSubmitted || 0 },
                  ].map((entry, index) => (
                    <Cell key={`pie-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Departamentos</CardTitle>
          <CardDescription>
            Classificação por taxa de cliques (menor é melhor)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Posição</th>
                  <th className="text-left p-3 font-semibold">Departamento</th>
                  <th className="text-right p-3 font-semibold">Total</th>
                  <th className="text-right p-3 font-semibold">Clicaram</th>
                  <th className="text-right p-3 font-semibold">Taxa</th>
                  <th className="text-right p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {departments
                  .sort((a, b) => parseFloat(a.clickRate) - parseFloat(b.clickRate))
                  .map((dept, index) => {
                    const rate = parseFloat(dept.clickRate);
                    const status = rate < 20 ? 'Excelente' : rate < 40 ? 'Bom' : rate < 60 ? 'Regular' : 'Crítico';
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
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  MousePointer,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { getCampaigns } from '../lib/supabaseApi';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

export function Reports() {
  const { user, impersonatedTenant } = useAuth();
  
  // Estados para dados do banco
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do banco
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const campaignsData = await getCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error loading reports data:', error);
      toast.error('Erro ao carregar dados de relatórios');
    } finally {
      setLoading(false);
    }
  };

  const relevantCampaigns = impersonatedTenant
    ? campaigns.filter(c => c.tenantId === impersonatedTenant.id)
    : campaigns;

  const handleExportPDF = async () => {
    try {
      const element = document.getElementById('reports-content');
      if (!element) {
        throw new Error('Conteúdo do relatório não encontrado');
      }

      toast.loading('Gerando PDF...', { id: 'pdf-export' });

      // Use html2canvas with options to handle modern CSS
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        ignoreElements: (element) => {
          return false;
        },
        onclone: (clonedDoc) => {
          // Replace ALL oklch/CSS variables with hex/rgb equivalents
          const style = clonedDoc.createElement('style');
          style.textContent = `
            /* Override all problematic colors with rgb */
            * {
              color: inherit !important;
              border-color: inherit !important;
              background-color: inherit !important;
            }
            
            /* Text colors */
            .text-gray-900, .text-foreground { color: rgb(17, 24, 39) !important; }
            .text-gray-800 { color: rgb(31, 41, 55) !important; }
            .text-gray-700 { color: rgb(55, 65, 81) !important; }
            .text-gray-600 { color: rgb(75, 85, 99) !important; }
            .text-gray-500, .text-muted-foreground { color: rgb(107, 114, 128) !important; }
            .text-gray-400 { color: rgb(156, 163, 175) !important; }
            .text-gray-300 { color: rgb(209, 213, 219) !important; }
            .text-gray-200 { color: rgb(229, 231, 235) !important; }
            
            /* Brand colors */
            .text-\\[\\#834a8b\\], .text-purple-600 { color: rgb(131, 74, 139) !important; }
            .text-\\[\\#242545\\] { color: rgb(36, 37, 69) !important; }
            
            /* Status colors */
            .text-green-600 { color: rgb(22, 163, 74) !important; }
            .text-green-500 { color: rgb(34, 197, 94) !important; }
            .text-blue-600 { color: rgb(37, 99, 235) !important; }
            .text-blue-500 { color: rgb(59, 130, 246) !important; }
            .text-red-600 { color: rgb(220, 38, 38) !important; }
            .text-red-500 { color: rgb(239, 68, 68) !important; }
            .text-orange-600 { color: rgb(234, 88, 12) !important; }
            .text-orange-500 { color: rgb(249, 115, 22) !important; }
            .text-yellow-600 { color: rgb(202, 138, 4) !important; }
            
            /* Background colors */
            .bg-white { background-color: rgb(255, 255, 255) !important; }
            .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
            .bg-gray-100 { background-color: rgb(243, 244, 246) !important; }
            .bg-gray-200 { background-color: rgb(229, 231, 235) !important; }
            
            .bg-\\[\\#834a8b\\], .bg-purple-500 { background-color: rgb(131, 74, 139) !important; }
            .bg-\\[\\#242545\\] { background-color: rgb(36, 37, 69) !important; }
            
            .bg-blue-500 { background-color: rgb(59, 130, 246) !important; }
            .bg-blue-100 { background-color: rgb(219, 234, 254) !important; }
            .bg-green-500 { background-color: rgb(34, 197, 94) !important; }
            .bg-green-100 { background-color: rgb(220, 252, 231) !important; }
            .bg-red-500 { background-color: rgb(239, 68, 68) !important; }
            .bg-red-100 { background-color: rgb(254, 226, 226) !important; }
            .bg-red-600 { background-color: rgb(220, 38, 38) !important; }
            .bg-orange-100 { background-color: rgb(255, 237, 213) !important; }
            .bg-yellow-100 { background-color: rgb(254, 249, 195) !important; }
            
            /* Border colors */
            .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
            .border-gray-300 { border-color: rgb(209, 213, 219) !important; }
            .border-blue-500 { border-color: rgb(59, 130, 246) !important; }
            
            /* Card and surface colors */
            .bg-card { background-color: rgb(255, 255, 255) !important; }
            .bg-background { background-color: rgb(255, 255, 255) !important; }
            .bg-muted { background-color: rgb(243, 244, 246) !important; }
          `;
          clonedDoc.head.appendChild(style);
          
          // Also remove any CSS custom properties that might use oklch
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el: any) => {
            if (el.style) {
              // Remove any style that might contain oklch
              const computedStyle = el.style.cssText;
              if (computedStyle && computedStyle.includes('oklch')) {
                el.style.cssText = '';
              }
            }
          });
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Adicionar logo e header
      pdf.setFontSize(20);
      pdf.text('Relatório de Campanhas - Matreiro', 10, 15);
      pdf.setFontSize(10);
      pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 10, 22);
      
      if (impersonatedTenant) {
        pdf.text(`Cliente: ${impersonatedTenant.name}`, 10, 27);
      }

      position = 35;

      // Adicionar conteúdo
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Adicionar páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`relatorio-matreiro-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast.success('PDF exportado com sucesso!', { 
        id: 'pdf-export',
        description: 'O relatório foi baixado para seu computador',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao exportar PDF', {
        id: 'pdf-export',
        description: error instanceof Error ? error.message : 'Tente novamente ou entre em contato com o suporte',
      });
    }
  };

  // Dados para gráficos
  const timelineData = [
    { id: 'month-1', month: 'Jan', enviados: 450, abertos: 380, cliques: 150, comprometidos: 45 },
    { id: 'month-2', month: 'Fev', enviados: 380, abertos: 320, cliques: 120, comprometidos: 38 },
    { id: 'month-3', month: 'Mar', enviados: 520, abertos: 430, cliques: 180, comprometidos: 52 },
  ];

  const departmentData = [
    { id: 'dept-1', name: 'Tecnologia', comprometidos: 12, total: 150 },
    { id: 'dept-2', name: 'Financeiro', comprometidos: 8, total: 100 },
    { id: 'dept-3', name: 'RH', comprometidos: 15, total: 80 },
    { id: 'dept-4', name: 'Vendas', comprometidos: 20, total: 200 },
    { id: 'dept-5', name: 'Marketing', comprometidos: 6, total: 70 },
  ];

  const riskDistribution = [
    { id: 'risk-1', name: 'Baixo Risco', value: 65, color: '#10b981' },
    { id: 'risk-2', name: 'Médio Risco', value: 25, color: '#f59e0b' },
    { id: 'risk-3', name: 'Alto Risco', value: 10, color: '#834a8b' },
  ];

  const topVulnerable = [
    { id: 'user-1', name: 'João Silva', department: 'Financeiro', incidents: 5 },
    { id: 'user-2', name: 'Maria Santos', department: 'RH', incidents: 4 },
    { id: 'user-3', name: 'Pedro Oliveira', department: 'Vendas', incidents: 4 },
    { id: 'user-4', name: 'Ana Costa', department: 'Marketing', incidents: 3 },
    { id: 'user-5', name: 'Carlos Souza', department: 'Tecnologia', incidents: 3 },
  ];

  return (
    <div className="p-8" id="reports-content">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios e Analytics</h1>
            <p className="text-gray-500 mt-1">
              Análise detalhada das campanhas e métricas de segurança
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="last-30-days">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Últimos 7 dias</SelectItem>
                <SelectItem value="last-30-days">Últimos 30 dias</SelectItem>
                <SelectItem value="last-90-days">Últimos 90 dias</SelectItem>
                <SelectItem value="this-year">Este ano</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Taxa de Abertura
              </CardTitle>
              <Mail className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82.3%</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+5.2% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Taxa de Cliques
              </CardTitle>
              <MousePointer className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34.6%</div>
            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+2.1% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Taxa de Comprometimento
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">9.8%</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingDown className="w-3 h-3" />
              <span>-1.5% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Colaboradores Avaliados
              </CardTitle>
              <Users className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,350</div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <span>100% da base ativa</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="departments">Por Departamento</TabsTrigger>
          <TabsTrigger value="vulnerable">Usuários Vulneráveis</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evolução Temporal */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução das Métricas</CardTitle>
                <CardDescription>Últimos 3 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData} id="timeline-chart">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      key="line-enviados"
                      type="monotone"
                      dataKey="enviados"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                    <Line
                      key="line-abertos"
                      type="monotone"
                      dataKey="abertos"
                      stroke="#10b981"
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                    <Line
                      key="line-cliques"
                      type="monotone"
                      dataKey="cliques"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                    <Line
                      key="line-comprometidos"
                      type="monotone"
                      dataKey="comprometidos"
                      stroke="#ef4444"
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição de Risco */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Risco</CardTitle>
                <CardDescription>Classificação dos colaboradores</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300} minHeight={300}>
                  <PieChart key={`risk-pie-${riskDistribution.length}`}>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`risk-cell-${entry.id}-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise por Departamento</CardTitle>
              <CardDescription>Taxa de comprometimento por área</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentData} id="dept-chart">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar key="bar-total" dataKey="total" fill="#3b82f6" name="Total de Colaboradores" isAnimationActive={false} />
                  <Bar key="bar-comprometidos" dataKey="comprometidos" fill="#ef4444" name="Comprometidos" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vulnerable" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuários Mais Vulneráveis</CardTitle>
              <CardDescription>
                Colaboradores que caíram em múltiplas simulações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVulnerable.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-700 font-bold">#{topVulnerable.indexOf(user) + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.department}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">{user.incidents} incidentes</Badge>
                      <Button variant="outline" size="sm">
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo de Campanhas</CardTitle>
              <CardDescription>Histórico detalhado de execuções</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relevantCampaigns.slice(0, 10).map((campaign) => {
                  const phishedRate =
                    campaign.stats.sent > 0
                      ? ((campaign.stats.submitted / campaign.stats.sent) * 100).toFixed(1)
                      : '0';
                  return (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 border-l-4 border-blue-500 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {campaign.stats.sent} enviados • {campaign.stats.opened} abertos •{' '}
                          {campaign.stats.clicked} cliques
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">{phishedRate}%</div>
                        <div className="text-xs text-gray-500">comprometidos</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
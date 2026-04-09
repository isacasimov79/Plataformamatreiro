import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Play,
  Upload,
  FileText,
  Video,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getTrainings, deleteTraining, getTenants } from '../lib/apiLocal';
import { NewTrainingDialog } from '../components/NewTrainingDialog';

interface Training {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'slides';
  duration: number; // minutos
  category: string;
  enrolledCount: number;
  completedCount: number;
  averageScore: number;
  mediaUrl?: string;
  createdAt: string;
  tenantId?: string | null;
}

interface TrainingResult {
  id: string;
  trainingId: string;
  userName: string;
  userEmail: string;
  completedAt: string;
  score: number;
  timeSpent: number; // minutos
  status: 'completed' | 'in_progress' | 'failed';
}

export function Trainings() {
  const { t } = useTranslation();
  const { user, impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [isWatchDialogOpen, setIsWatchDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [selectedResults, setSelectedResults] = useState<TrainingResult[]>([]);
  
  // Estados para dados do banco
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do banco
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trainingsData, tenantsData] = await Promise.all([
        getTrainings(),
        getTenants(),
      ]);
      
      console.log('🎓 Trainings data loaded:', {
        trainings: trainingsData?.length || 0,
        tenants: tenantsData?.length || 0,
      });
      
      // Map Django snake_case fields to frontend camelCase
      const mapped = (trainingsData || []).map((t: any) => ({
        id: String(t.id),
        title: t.title || t.name || t('trainings.emptyState', 'Sem Título'),
        description: t.description || '',
        type: t.type || (t.content?.includes('video') ? 'video' : 'slides'),
        duration: t.duration || t.duration_minutes || 30,
        category: t.category || 'basico',
        enrolledCount: t.enrolledCount ?? t.enrolled_count ?? 0,
        completedCount: t.completedCount ?? t.completed_count ?? 0,
        averageScore: t.averageScore ?? t.average_score ?? 0,
        mediaUrl: t.mediaUrl || t.media_url || '',
        createdAt: t.createdAt || t.created_at || '',
        tenantId: t.tenantId || t.tenant || null,
      }));
      
      setTrainings(mapped);
      setTenants(tenantsData || []);
    } catch (error) {
      console.error('❌ Error loading trainings data:', error);
      toast.error(t('trainings.messages.loadError', 'Erro ao carregar treinamentos'));
    } finally {
      setLoading(false);
    }
  };

  // Filtrar trainings baseado em impersonation
  const isMasterView = !impersonatedTenant;
  const relevantTrainings = isMasterView
    ? trainings
    : trainings.filter(t => !t.tenantId || t.tenantId === impersonatedTenant.id);

  const filteredTrainings = relevantTrainings.filter((training) => {
    const matchesSearch = (training.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (training.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || training.category === selectedCategory;
    const matchesType = selectedType === 'all' || training.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleDelete = async (trainingId: string) => {
    if (!confirm(t('trainings.deleteConfirm'))) {
      return;
    }

    try {
      await deleteTraining(trainingId);
      toast.success(t('trainings.deleteSuccess'));
      loadData();
    } catch (error) {
      console.error('Error deleting training:', error);
      toast.error(t('trainings.deleteError'));
    }
  };

  const handleWatchTraining = (training: Training) => {
    setSelectedTraining(training);
    setIsWatchDialogOpen(true);
  };

  const handleViewResults = (training: Training) => {
    setSelectedTraining(training);
    setSelectedResults(mockResults);
    setIsResultsDialogOpen(true);
  };

  const handleEditTraining = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('trainings.updateSuccess'));
    setIsEditDialogOpen(false);
    loadData();
  };

  // Dados mock para resultados (por enquanto)
  const mockResults: TrainingResult[] = [];

  const stats = {
    total: trainings.length,
    totalEnrolled: trainings.reduce((sum, t) => sum + (t.enrolledCount || 0), 0),
    totalCompleted: trainings.reduce((sum, t) => sum + (t.completedCount || 0), 0),
    avgScore: trainings.length > 0 ? Math.round(
      trainings.reduce((sum, t) => sum + (t.averageScore || 0), 0) / trainings.length
    ) : 0,
  };

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Header com gradiente */}
        <div className="page-header">
          <div className="page-header-gradient">
            <h1 className="page-title">{t('trainings.title')}</h1>
            <p className="page-subtitle">
              {t('trainings.subtitle')}
            </p>
          </div>
        </div>

        {/* Ação principal */}
        <div className="flex justify-end mb-6">
          <NewTrainingDialog onTrainingCreated={loadData} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="stat-card stat-card-purple">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">{t('trainings.statsTotal')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value-gradient">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="stat-card stat-card-blue">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">{t('trainings.statsEnrolled')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value-blue">{stats.totalEnrolled}</div>
            </CardContent>
          </Card>
          <Card className="stat-card stat-card-green">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">{t('trainings.statsCompleted')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value-green">{stats.totalCompleted}</div>
            </CardContent>
          </Card>
          <Card className="stat-card stat-card-purple">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">{t('trainings.statsAvgScore')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value-purple">{stats.avgScore}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6 content-card">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={t('trainings.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Trainings Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('trainings.listTitle')}</CardTitle>
            <CardDescription>
              {t('trainings.availableCount', { count: filteredTrainings.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('trainings.tableTitle')}</TableHead>
                  <TableHead>{t('trainings.tableType')}</TableHead>
                  <TableHead>{t('trainings.tableCategory')}</TableHead>
                  <TableHead>{t('trainings.tableDuration')}</TableHead>
                  <TableHead>{t('trainings.tableProgress')}</TableHead>
                  <TableHead>{t('trainings.tableAvgScore')}</TableHead>
                  <TableHead className="text-right">{t('trainings.tableActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainings.map((training) => {
                  const completionRate = training.enrolledCount > 0 ? Math.round(
                    (training.completedCount / training.enrolledCount) * 100
                  ) : 0;
                  return (
                    <TableRow key={training.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{training.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {training.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {training.type === 'video' ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <Video className="w-3 h-3 mr-1" />
                            {t('trainings.typeVideo')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            <FileText className="w-3 h-3 mr-1" />
                            {t('trainings.typeSlides')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{training.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{training.duration} min</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>{training.completedCount}/{training.enrolledCount}</span>
                            <span className="font-medium">{completionRate}%</span>
                          </div>
                          <Progress value={completionRate} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-bold text-green-600">
                          {training.averageScore}%
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t('trainings.tableActions')}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleWatchTraining(training)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              {t('trainings.actionWatch')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewResults(training)}>
                              <BarChart3 className="w-4 h-4 mr-2" />
                              {t('trainings.actionViewResults')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTraining(training);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(training.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Watch Training Dialog */}
        {selectedTraining && (
          <Dialog open={isWatchDialogOpen} onOpenChange={setIsWatchDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTraining.type === 'video' ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                  {selectedTraining.title}
                </DialogTitle>
                <DialogDescription>{selectedTraining.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedTraining.type === 'video' && selectedTraining.mediaUrl ? (
                  <div className="relative w-full pb-[56.25%]">
                    <iframe
                      src={selectedTraining.mediaUrl}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={selectedTraining.title}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-12 bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">
                        {t('trainings.modals.watch.slidePlaceholder', 'Visualização de slides será carregada aqui')}
                      </p>
                      <Button className="mt-4">
                        <Upload className="w-4 h-4 mr-2" />
                        {t('trainings.actions.download', 'Baixar Apresentação')}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">{t('trainings.tableDuration')}</p>
                    <p className="font-medium">{selectedTraining.duration} {t('common.minutes')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('trainings.tableCategory')}</p>
                    <p className="font-medium">{selectedTraining.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('trainings.statsEnrolled')}</p>
                    <p className="font-medium">{selectedTraining.enrolledCount} {t('common.people')}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsWatchDialogOpen(false)}>
                  {t('trainings.actions.close', 'Fechar')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Training Dialog */}
        {selectedTraining && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleEditTraining}>
                <DialogHeader>
                  <DialogTitle>{t('trainings.editTitle', 'Editar Treinamento')}</DialogTitle>
                  <DialogDescription>
                    {t('trainings.editSubtitle', { title: selectedTraining.title })}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="edit-title">{t('trainings.tableTitle')}</Label>
                    <Input
                      id="edit-title"
                      placeholder={t('trainings.editTitle', 'Ex: Identificando Phishing')}
                      required
                      className="mt-2"
                      defaultValue={selectedTraining.title}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-description">{t('common.description', 'Descrição')}</Label>
                    <Textarea
                      id="edit-description"
                      placeholder={t('trainings.editSubtitle', 'Descreva o conteúdo do treinamento')}
                      rows={3}
                      required
                      className="mt-2"
                      defaultValue={selectedTraining.description}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-type">{t('trainings.tableType', 'Tipo de Conteúdo')}</Label>
                      <Select defaultValue={selectedTraining.type}>
                        <SelectTrigger className="mt-2" id="edit-type">
                          <SelectValue placeholder={t('common.select')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4" />
                              {t('trainings.typeVideo')}
                            </div>
                          </SelectItem>
                          <SelectItem value="slides">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              {t('trainings.typeSlides')}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="edit-category">{t('trainings.tableCategory')}</Label>
                      <Select defaultValue={selectedTraining.category.toLowerCase()}>
                        <SelectTrigger className="mt-2" id="edit-category">
                          <SelectValue placeholder={t('common.select')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basico">{t('trainings.categories.basic')}</SelectItem>
                          <SelectItem value="intermediario">{t('trainings.categories.intermediate')}</SelectItem>
                          <SelectItem value="avancado">{t('trainings.categories.advanced')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-duration">{t('trainings.tableDuration')}</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      placeholder="15"
                      required
                      className="mt-2"
                      defaultValue={selectedTraining.duration}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-media">{t('trainings.modals.edit.fields.currentFile', 'Arquivo Atual')}</Label>
                    {selectedTraining.mediaUrl && (
                      <div className="p-3 bg-gray-50 rounded-lg mt-2 mb-2">
                        <p className="text-sm text-gray-600 truncate">
                          {selectedTraining.mediaUrl}
                        </p>
                      </div>
                    )}
                    <Label htmlFor="edit-media-file" className="text-sm text-gray-600">
                      {t('trainings.modals.edit.fields.replaceFile', 'Substituir arquivo (opcional)')}
                    </Label>
                    <Input
                      id="edit-media-file"
                      type="file"
                      accept="video/*,.pdf,.ppt,.pptx"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {t('trainings.modals.edit.fields.orUrl', 'Ou atualize a URL do vídeo')}
                    </p>
                    <Input
                      id="edit-media-url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="mt-2"
                      defaultValue={selectedTraining.mediaUrl}
                    />
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      ℹ️ <strong>{t('trainings.statsEnrolled')}:</strong> {selectedTraining.enrolledCount} {' '}
                      <strong>{t('trainings.statsCompleted')}:</strong> {selectedTraining.completedCount} ({selectedTraining.enrolledCount > 0 ? Math.round((selectedTraining.completedCount / selectedTraining.enrolledCount) * 100) : 0}%)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                    {t('common.save')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Results Dialog */}
        {selectedTraining && (
          <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('trainings.modals.results.title', 'Resultados do Treinamento')}</DialogTitle>
                <DialogDescription>
                  {t('trainings.modals.results.subtitle', { title: selectedTraining.title, count: selectedResults.length })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedResults.length}
                        </div>
                        <div className="text-xs text-gray-500">{t('trainings.modals.results.stats.total', 'Total')}</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedResults.filter((r) => r.status === 'completed').length}
                        </div>
                        <div className="text-xs text-gray-500">{t('trainings.modals.results.stats.completed', 'Concluídos')}</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedResults.filter((r) => r.status === 'in_progress').length}
                        </div>
                        <div className="text-xs text-gray-500">{t('trainings.modals.results.stats.inProgress', 'Em Progresso')}</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {selectedResults.filter((r) => r.status === 'failed').length}
                        </div>
                        <div className="text-xs text-gray-500">{t('trainings.modals.results.stats.failed', 'Reprovados')}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Results Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('trainings.modals.results.table.participant', 'Participante')}</TableHead>
                      <TableHead>{t('trainings.modals.results.table.status', 'Status')}</TableHead>
                      <TableHead>{t('trainings.modals.results.table.score', 'Nota')}</TableHead>
                      <TableHead>{t('trainings.modals.results.table.time', 'Tempo')}</TableHead>
                      <TableHead>{t('trainings.modals.results.table.completedAt', 'Concluído em')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{result.userName}</div>
                            <div className="text-xs text-gray-500">{result.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {result.status === 'completed' && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {t('trainings.modals.results.status.completed', 'Concluído')}
                            </Badge>
                          )}
                          {result.status === 'in_progress' && (
                            <Badge
                              variant="outline"
                              className="bg-orange-50 text-orange-700 border-orange-200"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {t('trainings.modals.results.status.inProgress', 'Em Progresso')}
                            </Badge>
                          )}
                          {result.status === 'failed' && (
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              {t('trainings.modals.results.status.failed', 'Reprovado')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`text-lg font-bold ${
                                result.score >= 70
                                  ? 'text-green-600'
                                  : result.score >= 50
                                  ? 'text-orange-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {result.score}%
                            </div>
                            <Progress value={result.score} className="w-20 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{result.timeSpent} {t('common.min')}</TableCell>
                        <TableCell>
                          {result.completedAt
                            ? format(new Date(result.completedAt), 'dd/MM/yyyy HH:mm')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsResultsDialogOpen(false)}>
                  {t('trainings.actions.close', 'Fechar')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
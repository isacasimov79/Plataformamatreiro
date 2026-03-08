import { useState } from 'react';
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

const mockTrainings: Training[] = [
  {
    id: 'trn-1',
    title: 'Introdução à Segurança da Informação',
    description: 'Conceitos básicos de segurança digital e proteção de dados',
    type: 'video',
    duration: 15,
    category: 'Básico',
    enrolledCount: 450,
    completedCount: 380,
    averageScore: 87,
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'trn-2',
    title: 'Identificando Ataques de Phishing',
    description: 'Aprenda a reconhecer e-mails maliciosos e golpes comuns',
    type: 'video',
    duration: 20,
    category: 'Intermediário',
    enrolledCount: 380,
    completedCount: 310,
    averageScore: 82,
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    createdAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'trn-3',
    title: 'Boas Práticas de Senha',
    description: 'Como criar e gerenciar senhas fortes e seguras',
    type: 'slides',
    duration: 10,
    category: 'Básico',
    enrolledCount: 420,
    completedCount: 390,
    averageScore: 91,
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'trn-4',
    title: 'Engenharia Social Avançada',
    description: 'Técnicas sofisticadas de manipulação e como se proteger',
    type: 'video',
    duration: 25,
    category: 'Avançado',
    enrolledCount: 200,
    completedCount: 145,
    averageScore: 78,
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    createdAt: '2026-02-10T00:00:00Z',
  },
];

const mockResults: TrainingResult[] = [
  {
    id: 'res-1',
    trainingId: 'trn-1',
    userName: 'João Silva',
    userEmail: 'joao.silva@empresa.com.br',
    completedAt: '2026-03-05T14:30:00Z',
    score: 95,
    timeSpent: 18,
    status: 'completed',
  },
  {
    id: 'res-2',
    trainingId: 'trn-1',
    userName: 'Maria Santos',
    userEmail: 'maria.santos@empresa.com.br',
    completedAt: '2026-03-04T10:15:00Z',
    score: 82,
    timeSpent: 22,
    status: 'completed',
  },
  {
    id: 'res-3',
    trainingId: 'trn-2',
    userName: 'Pedro Oliveira',
    userEmail: 'pedro.oliveira@empresa.com.br',
    completedAt: '2026-03-03T16:45:00Z',
    score: 88,
    timeSpent: 25,
    status: 'completed',
  },
  {
    id: 'res-4',
    trainingId: 'trn-1',
    userName: 'Ana Costa',
    userEmail: 'ana.costa@empresa.com.br',
    completedAt: '',
    score: 0,
    timeSpent: 5,
    status: 'in_progress',
  },
  {
    id: 'res-5',
    trainingId: 'trn-4',
    userName: 'Carlos Souza',
    userEmail: 'carlos.souza@empresa.com.br',
    completedAt: '2026-03-01T11:20:00Z',
    score: 62,
    timeSpent: 30,
    status: 'failed',
  },
];

export function Trainings() {
  const { impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isWatchDialogOpen, setIsWatchDialogOpen] = useState(false);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [selectedResults, setSelectedResults] = useState<TrainingResult[]>([]);

  const filteredTrainings = mockTrainings.filter((trn) =>
    trn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trn.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTraining = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Treinamento criado!', {
      description: 'O treinamento foi adicionado com sucesso',
    });
    setIsAddDialogOpen(false);
  };

  const handleEditTraining = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Treinamento atualizado!', {
      description: 'As alterações foram salvas com sucesso',
    });
    setIsEditDialogOpen(false);
  };

  const handleWatchTraining = (training: Training) => {
    setSelectedTraining(training);
    setIsWatchDialogOpen(true);
  };

  const handleViewResults = (training: Training) => {
    const results = mockResults.filter((r) => r.trainingId === training.id);
    setSelectedResults(results);
    setSelectedTraining(training);
    setIsResultsDialogOpen(true);
  };

  const handleDelete = (trainingId: string) => {
    const training = mockTrainings.find((t) => t.id === trainingId);
    toast.success('Treinamento removido!', {
      description: `"${training?.title}" foi deletado`,
    });
  };

  const stats = {
    total: mockTrainings.length,
    totalEnrolled: mockTrainings.reduce((sum, t) => sum + t.enrolledCount, 0),
    totalCompleted: mockTrainings.reduce((sum, t) => sum + t.completedCount, 0),
    avgScore: Math.round(
      mockTrainings.reduce((sum, t) => sum + t.averageScore, 0) / mockTrainings.length
    ),
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">
              Treinamentos
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Gerencie vídeos e slides de conscientização em segurança
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                <Plus className="w-4 h-4 mr-2" />
                Novo Treinamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleAddTraining}>
                <DialogHeader>
                  <DialogTitle>Criar Novo Treinamento</DialogTitle>
                  <DialogDescription>
                    Adicione um vídeo ou apresentação de slides
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">Título do Treinamento</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Identificando Phishing"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o conteúdo do treinamento"
                      rows={3}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Tipo de Conteúdo</Label>
                      <Select>
                        <SelectTrigger className="mt-2" id="type">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4" />
                              Vídeo
                            </div>
                          </SelectItem>
                          <SelectItem value="slides">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Slides (PDF/PPT)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select>
                        <SelectTrigger className="mt-2" id="category">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basico">Básico</SelectItem>
                          <SelectItem value="intermediario">Intermediário</SelectItem>
                          <SelectItem value="avancado">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duração (minutos)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="15"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="media">Upload de Arquivo / URL</Label>
                    <Input
                      id="media"
                      type="file"
                      accept="video/*,.pdf,.ppt,.pptx"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Ou cole a URL do vídeo (YouTube, Vimeo)
                    </p>
                    <Input
                      id="media-url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="mt-2"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Dica:</strong> Vídeos são mais engajantes. Recomendamos
                      duração entre 10-25 minutos para melhor retenção.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                    Criar Treinamento
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Treinamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Inscritos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalEnrolled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalCompleted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Nota Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgScore}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar treinamentos..."
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
          <CardTitle>Lista de Treinamentos</CardTitle>
          <CardDescription>
            {filteredTrainings.length} treinamentos disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Nota Média</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrainings.map((training) => {
                const completionRate = Math.round(
                  (training.completedCount / training.enrolledCount) * 100
                );
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
                          Vídeo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          <FileText className="w-3 h-3 mr-1" />
                          Slides
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
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleWatchTraining(training)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Assistir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewResults(training)}>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Ver Resultados
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTraining(training);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(training.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover
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
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
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
                      Visualização de slides será carregada aqui
                    </p>
                    <Button className="mt-4">
                      <Upload className="w-4 h-4 mr-2" />
                      Baixar Apresentação
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Duração</p>
                  <p className="font-medium">{selectedTraining.duration} minutos</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Categoria</p>
                  <p className="font-medium">{selectedTraining.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Inscritos</p>
                  <p className="font-medium">{selectedTraining.enrolledCount} pessoas</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsWatchDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Results Dialog */}
      {selectedTraining && (
        <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Resultados do Treinamento</DialogTitle>
              <DialogDescription>
                {selectedTraining.title} • {selectedResults.length} participantes
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
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedResults.filter((r) => r.status === 'completed').length}
                      </div>
                      <div className="text-xs text-gray-500">Concluídos</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedResults.filter((r) => r.status === 'in_progress').length}
                      </div>
                      <div className="text-xs text-gray-500">Em Progresso</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {selectedResults.filter((r) => r.status === 'failed').length}
                      </div>
                      <div className="text-xs text-gray-500">Reprovados</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participante</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Tempo</TableHead>
                    <TableHead>Concluído em</TableHead>
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
                            Concluído
                          </Badge>
                        )}
                        {result.status === 'in_progress' && (
                          <Badge
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Em Progresso
                          </Badge>
                        )}
                        {result.status === 'failed' && (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reprovado
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
                      <TableCell>{result.timeSpent} min</TableCell>
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
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
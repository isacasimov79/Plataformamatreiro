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
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Code,
  Globe,
  ExternalLink,
  Copy,
  Download,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface LandingPage {
  id: string;
  name: string;
  description: string;
  url: string;
  type: 'login' | 'prize' | 'update' | 'survey' | 'support' | 'custom';
  template: string;
  capturesCount: number;
  clicksCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'draft' | 'archived';
}

const mockLandingPages: LandingPage[] = [
  {
    id: 'lp-1',
    name: 'Login Microsoft 365',
    description: 'Página de login falsa do Microsoft 365',
    url: 'https://login-microsoft.example.com/auth',
    type: 'login',
    template: 'microsoft-365-login',
    capturesCount: 45,
    clicksCount: 120,
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    status: 'active',
  },
  {
    id: 'lp-2',
    name: 'Prêmio RH',
    description: 'Landing page de pesquisa falsa com prêmio',
    url: 'https://premio-empresa.example.com',
    type: 'prize',
    template: 'prize-survey',
    capturesCount: 32,
    clicksCount: 88,
    createdAt: '2026-02-20T00:00:00Z',
    updatedAt: '2026-02-28T00:00:00Z',
    status: 'active',
  },
  {
    id: 'lp-3',
    name: 'Atualização de Senha',
    description: 'Solicitação de atualização de credenciais',
    url: 'https://update-password.example.com',
    type: 'update',
    template: 'password-reset',
    capturesCount: 28,
    clicksCount: 75,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
    status: 'active',
  },
  {
    id: 'lp-4',
    name: 'Suporte TI',
    description: 'Página de suporte técnico falso',
    url: 'https://support-it.example.com',
    type: 'support',
    template: 'it-support',
    capturesCount: 0,
    clicksCount: 0,
    createdAt: '2026-03-06T00:00:00Z',
    updatedAt: '2026-03-06T00:00:00Z',
    status: 'draft',
  },
];

export function LandingPages() {
  const { impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);

  const filteredPages = mockLandingPages.filter((page) =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Landing page criada!', {
      description: 'A página foi criada com sucesso',
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditPage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Landing page atualizada!', {
      description: 'As alterações foram salvas',
    });
    setIsEditDialogOpen(false);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiada!', {
      description: 'O link foi copiado para a área de transferência',
    });
  };

  const handleDelete = (pageId: string) => {
    const page = mockLandingPages.find((p) => p.id === pageId);
    toast.success('Landing page removida!', {
      description: `"${page?.name}" foi deletada`,
    });
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      login: 'Login',
      prize: 'Prêmio',
      update: 'Atualização',
      survey: 'Pesquisa',
      support: 'Suporte',
      custom: 'Customizada',
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      login: 'bg-blue-100 text-blue-700',
      prize: 'bg-yellow-100 text-yellow-700',
      update: 'bg-orange-100 text-orange-700',
      survey: 'bg-green-100 text-green-700',
      support: 'bg-purple-100 text-purple-700',
      custom: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">
              Landing Pages
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Gerencie páginas de captura para campanhas de phishing
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                <Plus className="w-4 h-4 mr-2" />
                Nova Landing Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleCreatePage}>
                <DialogHeader>
                  <DialogTitle>Criar Nova Landing Page</DialogTitle>
                  <DialogDescription>
                    Configure uma página de captura para sua campanha
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Nome da Página</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Login Microsoft 365"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o propósito desta página"
                      rows={2}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Tipo de Página</Label>
                      <Select>
                        <SelectTrigger className="mt-2" id="type">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="login">Login</SelectItem>
                          <SelectItem value="prize">Prêmio</SelectItem>
                          <SelectItem value="update">Atualização</SelectItem>
                          <SelectItem value="survey">Pesquisa</SelectItem>
                          <SelectItem value="support">Suporte</SelectItem>
                          <SelectItem value="custom">Customizada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="template">Template Base</Label>
                      <Select>
                        <SelectTrigger className="mt-2" id="template">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="microsoft-365-login">Microsoft 365 Login</SelectItem>
                          <SelectItem value="google-workspace-login">Google Workspace</SelectItem>
                          <SelectItem value="prize-survey">Pesquisa com Prêmio</SelectItem>
                          <SelectItem value="password-reset">Reset de Senha</SelectItem>
                          <SelectItem value="it-support">Suporte TI</SelectItem>
                          <SelectItem value="blank">Página em Branco</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="url">URL da Página (opcional)</Label>
                    <Input
                      id="url"
                      placeholder="https://exemplo.com/pagina"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se não preenchido, será gerada automaticamente
                    </p>
                  </div>

                  <div>
                    <Label>Editor HTML/CSS</Label>
                    <Tabs defaultValue="html" className="mt-2">
                      <TabsList>
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="css">CSS</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      <TabsContent value="html" className="space-y-2">
                        <Textarea
                          placeholder="Cole ou edite o HTML da página..."
                          rows={10}
                          className="font-mono text-sm"
                        />
                      </TabsContent>
                      <TabsContent value="css" className="space-y-2">
                        <Textarea
                          placeholder="Cole ou edite o CSS da página..."
                          rows={10}
                          className="font-mono text-sm"
                        />
                      </TabsContent>
                      <TabsContent value="preview" className="space-y-2">
                        <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                          <p className="text-center text-gray-500">Preview será exibido aqui</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Dica:</strong> Use templates pré-construídos e personalize conforme necessário. Todas as credenciais inseridas são capturadas automaticamente.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                    Criar Página
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
            <CardTitle className="text-sm text-gray-600">Total de Páginas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">
              {mockLandingPages.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Páginas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockLandingPages.filter((p) => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total de Capturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {mockLandingPages.reduce((sum, p) => sum + p.capturesCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total de Cliques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockLandingPages.reduce((sum, p) => sum + p.clicksCount, 0)}
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
              placeholder="Buscar landing pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Landing Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Landing Pages</CardTitle>
          <CardDescription>
            {filteredPages.length} páginas de captura configuradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Capturas</TableHead>
                <TableHead>Taxa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => {
                const captureRate = page.clicksCount > 0
                  ? Math.round((page.capturesCount / page.clicksCount) * 100)
                  : 0;

                return (
                  <TableRow key={page.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{page.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {page.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(page.type)}>
                        {getTypeLabel(page.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-xs truncate max-w-[150px]">
                          {page.url}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyUrl(page.url)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-lg font-bold">{page.capturesCount}</div>
                        <div className="text-xs text-gray-500">
                          {page.clicksCount} cliques
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-600">{captureRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {page.status === 'active' && (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativa
                        </Badge>
                      )}
                      {page.status === 'draft' && (
                        <Badge variant="outline">Rascunho</Badge>
                      )}
                      {page.status === 'archived' && (
                        <Badge variant="secondary">Arquivada</Badge>
                      )}
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
                            onClick={() => {
                              setSelectedPage(page);
                              setIsPreviewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPage(page);
                              setIsCodeDialogOpen(true);
                            }}
                          >
                            <Code className="w-4 h-4 mr-2" />
                            Ver Código
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyUrl(page.url)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar URL
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPage(page);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Abrir em Nova Aba
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(page.id)}
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

      {/* Preview Dialog */}
      {selectedPage && (
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{selectedPage.name} - Preview</DialogTitle>
              <DialogDescription>Visualização da landing page</DialogDescription>
            </DialogHeader>
            <div className="border rounded-lg bg-white" style={{ height: '70vh' }}>
              <iframe
                src={selectedPage.url}
                className="w-full h-full rounded-lg"
                title={selectedPage.name}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Code Dialog */}
      {selectedPage && (
        <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPage.name} - Código</DialogTitle>
              <DialogDescription>HTML e CSS da landing page</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="html">
              <TabsList>
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
              </TabsList>
              <TabsContent value="html">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${selectedPage.name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Login</h1>
    <form action="/capture" method="POST">
      <input type="email" name="email" placeholder="Email" required>
      <input type="password" name="password" placeholder="Senha" required>
      <button type="submit">Entrar</button>
    </form>
  </div>
</body>
</html>`}</pre>
                </div>
              </TabsContent>
              <TabsContent value="css">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.container {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 400px;
}`}</pre>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCodeDialogOpen(false)}>
                Fechar
              </Button>
              <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

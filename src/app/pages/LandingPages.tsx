import { useState, useEffect } from 'react';
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
import { HtmlTemplateEditor } from '../components/HtmlTemplateEditor';
import { NewLandingPageDialog } from '../components/NewLandingPageDialog';
import * as supabaseApi from '../lib/supabaseApi';

interface LandingPage {
  id: string;
  name: string;
  description: string;
  url: string;
  type: 'login' | 'prize' | 'update' | 'survey' | 'support' | 'custom';
  template: string;
  htmlContent?: string;
  cssContent?: string;
  jsContent?: string;
  capturesCount: number;
  clicksCount: number;
  createdAt: string;
  updatedAt?: string;
  status: 'active' | 'draft' | 'archived';
}

export function LandingPages() {
  const { impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [isHtmlEditorOpen, setIsHtmlEditorOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar landing pages do banco
  useEffect(() => {
    loadLandingPages();
  }, []);

  const loadLandingPages = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Carregando landing pages do banco...');
      const pages = await supabaseApi.getLandingPages();
      console.log('✅ Landing pages carregadas:', pages);
      setLandingPages(pages);
    } catch (error: any) {
      console.error('❌ Erro ao carregar landing pages:', error);
      toast.error('Erro ao carregar landing pages', {
        description: error.message || 'Não foi possível carregar as landing pages',
      });
      setLandingPages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPages = landingPages.filter((page) =>
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
    setSelectedPage(null);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiada!', {
      description: 'O link foi copiado para a área de transferência',
    });
  };

  const handleDelete = (pageId: string) => {
    const page = landingPages.find((p) => p.id === pageId);
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-[#834a8b] text-[#834a8b] hover:bg-[#834a8b] hover:text-white"
              onClick={() => setIsHtmlEditorOpen(true)}
            >
              <Code className="w-4 h-4 mr-2" />
              Editor HTML Avançado
            </Button>
            <Button 
              className="bg-[#834a8b] hover:bg-[#6d3d75]"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Landing Page
            </Button>
          </div>
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
              {landingPages.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Páginas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {landingPages.filter((p) => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total de Capturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {landingPages.reduce((sum, p) => sum + p.capturesCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total de Cliques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {landingPages.reduce((sum, p) => sum + p.clicksCount, 0)}
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
                          <DropdownMenuItem onClick={() => window.open(page.url, '_blank')}>
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

      {/* Preview Dialog - Mock com conteúdo simulado */}
      {selectedPage && (
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{selectedPage.name} - Preview</DialogTitle>
              <DialogDescription>Visualização simulada da landing page</DialogDescription>
            </DialogHeader>
            <div className="border rounded-lg bg-gradient-to-br from-blue-50 to-white p-8" style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-12 h-12" viewBox="0 0 23 23">
                      <rect fill="#f25022" width="11" height="11"/>
                      <rect fill="#00a4ef" x="12" width="11" height="11"/>
                      <rect fill="#7fba00" y="12" width="11" height="11"/>
                      <rect fill="#ffb900" x="12" y="12" width="11" height="11"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">Microsoft 365</h2>
                  <p className="text-gray-600 text-sm">Entrar na sua conta</p>
                </div>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email, telefone ou Skype"
                    className="w-full p-3 border border-gray-300 rounded"
                    disabled
                  />
                  <button
                    className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700"
                    disabled
                  >
                    Avançar
                  </button>
                  <p className="text-sm text-center text-gray-600">
                    Não tem uma conta? <a href="#" className="text-blue-600">Crie uma!</a>
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                Fechar
              </Button>
              <Button className="bg-[#834a8b] hover:bg-[#6d3d75]" onClick={() => {
                setIsPreviewDialogOpen(false);
                setSelectedPage(page);
                setIsEditDialogOpen(true);
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
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
                <TabsTrigger value="js">JavaScript</TabsTrigger>
              </TabsList>
              <TabsContent value="html">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${selectedPage.name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="{{CLIENT_LOGO}}" alt="Logo">
    </div>
    <h1>Login</h1>
    <form id="loginForm" action="/capture" method="POST">
      <input type="email" name="email" placeholder="Email" required>
      <input type="password" name="password" placeholder="Senha" required>
      <button type="submit">Entrar</button>
    </form>
    <p class="footer-text">
      Ao entrar, você concorda com nossos <a href="#">Termos de Uso</a>
    </p>
  </div>
  <script src="script.js"></script>
</body>
</html>`}</pre>
                </div>
              </TabsContent>
              <TabsContent value="css">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.container {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.logo img {
  max-width: 150px;
  margin-bottom: 20px;
}

h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

button {
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

button:hover {
  transform: translateY(-2px);
}

.footer-text {
  margin-top: 20px;
  font-size: 12px;
  color: #666;
}

.footer-text a {
  color: #667eea;
  text-decoration: none;
}

.footer-text a:hover {
  text-decoration: underline;
}`}</pre>
                </div>
              </TabsContent>
              <TabsContent value="js">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = this.email.value;
  const password = this.password.value;
  
  // Capturar credenciais
  console.log('Credenciais capturadas:', { email, password });
  
  // Enviar para backend
  fetch('/api/capture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password,
      page: '${selectedPage.id}',
      timestamp: new Date().toISOString()
    })
  }).then(response => {
    // Redirecionar após captura
    window.location.href = '{{REDIRECT_URL}}';
  }).catch(error => {
    console.error('Erro:', error);
    alert('Erro ao processar. Tente novamente.');
  });
});`}</pre>
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

      {/* Edit Dialog */}
      {selectedPage && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleEditPage}>
              <DialogHeader>
                <DialogTitle>Editar Landing Page</DialogTitle>
                <DialogDescription>
                  Atualize as informações da página de captura
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-name">Nome da Página</Label>
                  <Input
                    id="edit-name"
                    defaultValue={selectedPage.name}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    defaultValue={selectedPage.description}
                    rows={2}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-type">Tipo de Página</Label>
                    <Select defaultValue={selectedPage.type}>
                      <SelectTrigger className="mt-2" id="edit-type">
                        <SelectValue />
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
                    <Label htmlFor="edit-status">Status</Label>
                    <Select defaultValue={selectedPage.status}>
                      <SelectTrigger className="mt-2" id="edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativa</SelectItem>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="archived">Arquivada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-url">URL da Página</Label>
                  <Input
                    id="edit-url"
                    defaultValue={selectedPage.url}
                    className="mt-2"
                  />
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-700">
                    ✏️ <strong>Edição Avançada:</strong> Use o Editor HTML Avançado para modificar o código da página.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedPage(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#834a8b] text-[#834a8b] hover:bg-[#834a8b] hover:text-white"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setIsHtmlEditorOpen(true);
                  }}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Editor HTML
                </Button>
                <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* HTML Template Editor */}
      <HtmlTemplateEditor
        isOpen={isHtmlEditorOpen}
        onClose={() => setIsHtmlEditorOpen(false)}
        onSave={(data) => {
          toast.success('Landing page salva!', {
            description: 'Template HTML criado com sucesso',
          });
          setIsHtmlEditorOpen(false);
        }}
        title="Editor de Landing Page"
        description="Crie landing pages HTML personalizadas com JavaScript e captura de dados"
        templateType="landing"
        initialHtml={selectedPage ? `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${selectedPage.name}</title>
</head>
<body>
  <h1>${selectedPage.name}</h1>
  <p>Edite seu código aqui</p>
</body>
</html>` : ''}
      />

      {/* New Landing Page Dialog */}
      <NewLandingPageDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={loadLandingPages}
      />
    </div>
  );
}
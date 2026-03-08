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
  Copy,
  Mail,
  Globe,
  Code,
} from 'lucide-react';
import { toast } from 'sonner';
import { HtmlTemplateEditor } from '../components/HtmlTemplateEditor';

type TemplateType = 'email' | 'web';

interface Template {
  id: string;
  name: string;
  type: TemplateType;
  subject?: string; // Apenas para email
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  usageCount: number;
  lastUsed: string;
  content: string;
  htmlContent?: string; // Para web phishing
}

const mockTemplates: Template[] = [
  {
    id: 'tpl-1',
    name: 'Verificação de Conta - Banco',
    type: 'email',
    subject: 'Ação necessária: Verifique sua conta',
    category: 'Financeiro',
    difficulty: 'hard',
    usageCount: 45,
    lastUsed: '2026-03-05T10:30:00Z',
    content: `Prezado cliente,

Detectamos uma atividade suspeita em sua conta. Por favor, clique no link abaixo para verificar suas informações:

[LINK DE VERIFICAÇÃO]

Caso não realize esta verificação em 24h, sua conta será suspensa temporariamente.

Atenciosamente,
Equipe de Segurança`,
  },
  {
    id: 'tpl-2',
    name: 'Atualização Office 365',
    type: 'email',
    subject: 'Urgente: Atualize seu Office 365',
    category: 'TI',
    difficulty: 'medium',
    usageCount: 32,
    lastUsed: '2026-03-03T14:20:00Z',
    content: `Olá,

Sua licença do Office 365 expirará em breve. Clique aqui para renovar:

[LINK DE RENOVAÇÃO]

Equipe de TI`,
  },
  {
    id: 'tpl-3',
    name: 'Login - Banco Nacional',
    type: 'web',
    category: 'Financeiro',
    difficulty: 'hard',
    usageCount: 28,
    lastUsed: '2026-03-01T09:15:00Z',
    content: 'Landing page de login falso',
    htmlContent: `<div class="login-container">
  <img src="/banco-logo.png" alt="Banco Nacional" />
  <h2>Internet Banking</h2>
  <form>
    <input type="text" placeholder="Agência" />
    <input type="text" placeholder="Conta" />
    <input type="password" placeholder="Senha" />
    <button type="submit">Entrar</button>
  </form>
</div>`,
  },
  {
    id: 'tpl-4',
    name: 'Portal Microsoft 365',
    type: 'web',
    category: 'TI',
    difficulty: 'medium',
    usageCount: 19,
    lastUsed: '2026-02-28T16:45:00Z',
    content: 'Landing page Microsoft 365 falsa',
    htmlContent: `<div class="ms-login">
  <img src="/microsoft-logo.png" />
  <h1>Microsoft 365</h1>
  <input type="email" placeholder="Email, telefone ou Skype" />
  <button>Avançar</button>
</div>`,
  },
  {
    id: 'tpl-5',
    name: 'Notificação RH - Documentos',
    type: 'email',
    subject: 'Documentos pendentes - Ação imediata necessária',
    category: 'RH',
    difficulty: 'easy',
    usageCount: 15,
    lastUsed: '2026-02-25T11:00:00Z',
    content: `Caro colaborador,

Identificamos documentos pendentes em seu cadastro. Por favor, acesse o portal RH e atualize:

[PORTAL RH]

Recursos Humanos`,
  },
];

export function Templates() {
  const { user, impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TemplateType>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHtmlEditorOpen, setIsHtmlEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [newTemplateType, setNewTemplateType] = useState<TemplateType>('email');

  // Filtrar templates
  const filteredTemplates = mockTemplates.filter((tpl) => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tpl.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesType = selectedType === 'all' || tpl.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleAddTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Template criado!', {
      description: 'O template foi adicionado com sucesso',
    });
    setIsAddDialogOpen(false);
  };

  const handleEditTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Template atualizado!', {
      description: 'As alterações foram salvas',
    });
    setIsEditDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleSaveHtmlTemplate = (data: {
    html: string;
    css: string;
    javascript: string;
    images: Array<{ id: string; url: string; name: string }>;
  }) => {
    toast.success('Template HTML salvo!', {
      description: 'Template criado com editor avançado',
    });
    setIsHtmlEditorOpen(false);
  };

  const handleClone = (templateId: string) => {
    const template = mockTemplates.find((t) => t.id === templateId);
    toast.success('Template clonado!', {
      description: `Cópia de "${template?.name}" criada com sucesso`,
    });
  };

  const handleDelete = (templateId: string) => {
    const template = mockTemplates.find((t) => t.id === templateId);
    toast.success('Template removido!', {
      description: `"${template?.name}" foi deletado`,
    });
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Fácil
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Médio
          </Badge>
        );
      case 'hard':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Difícil
          </Badge>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: mockTemplates.length,
    email: mockTemplates.filter((t) => t.type === 'email').length,
    web: mockTemplates.filter((t) => t.type === 'web').length,
    mostUsed: mockTemplates.reduce((max, t) => (t.usageCount > max ? t.usageCount : max), 0),
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">
              Templates
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Gerencie templates de e-mail e landing pages de phishing
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleAddTemplate}>
                <DialogHeader>
                  <DialogTitle>Criar Novo Template</DialogTitle>
                  <DialogDescription>
                    Crie um template de e-mail ou landing page web
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Tipo de Template</Label>
                    <Select
                      value={newTemplateType}
                      onValueChange={(value) => setNewTemplateType(value as TemplateType)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            E-mail de Phishing
                          </div>
                        </SelectItem>
                        <SelectItem value="web">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Landing Page Web
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="name">Nome do Template</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Verificação de Conta"
                      required
                      className="mt-2"
                    />
                  </div>

                  {newTemplateType === 'email' && (
                    <div>
                      <Label htmlFor="subject">Assunto do E-mail</Label>
                      <Input
                        id="subject"
                        placeholder="Ex: Ação necessária: Verifique sua conta"
                        required
                        className="mt-2"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select>
                      <SelectTrigger className="mt-2" id="category">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="ti">TI / Tecnologia</SelectItem>
                        <SelectItem value="rh">Recursos Humanos</SelectItem>
                        <SelectItem value="vendas">Vendas</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Nível de Dificuldade</Label>
                    <Select>
                      <SelectTrigger className="mt-2" id="difficulty">
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Fácil (Alto engajamento)</SelectItem>
                        <SelectItem value="medium">Médio (Moderado)</SelectItem>
                        <SelectItem value="hard">Difícil (Sofisticado)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="content">
                      {newTemplateType === 'email' ? 'Conteúdo do E-mail' : 'HTML da Landing Page'}
                    </Label>
                    <Textarea
                      id="content"
                      placeholder={
                        newTemplateType === 'email'
                          ? 'Digite o corpo do e-mail. Use [LINK] para inserir o link de tracking.'
                          : 'Cole o código HTML da landing page'
                      }
                      rows={10}
                      required
                      className="mt-2 font-mono text-sm"
                    />
                  </div>

                  {newTemplateType === 'web' && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        💡 <strong>Dica:</strong> Use variáveis como {'{{user.name}}'} e {'{{user.email}}'} para
                        personalização automática
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                    Criar Template
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
            <CardTitle className="text-sm text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              E-mails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.email}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Web
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.web}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Mais Usado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.mostUsed}x</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as typeof selectedType)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="email">E-mails</SelectItem>
                <SelectItem value="web">Landing Pages</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Templates</CardTitle>
          <CardDescription>
            {filteredTemplates.length} templates encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Dificuldade</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{template.name}</div>
                      {template.type === 'email' && template.subject && (
                        <div className="text-xs text-gray-500 mt-1">
                          Assunto: {template.subject}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {template.type === 'email' ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        <Mail className="w-3 h-3 mr-1" />
                        E-mail
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        <Globe className="w-3 h-3 mr-1" />
                        Web
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{template.category}</Badge>
                  </TableCell>
                  <TableCell>{getDifficultyBadge(template.difficulty)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{template.usageCount}x</span>
                      <span className="text-xs text-gray-500">usado</span>
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
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleClone(template.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Clonar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      {selectedTemplate && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTemplate.type === 'email' ? (
                  <Mail className="w-5 h-5" />
                ) : (
                  <Globe className="w-5 h-5" />
                )}
                {selectedTemplate.name}
              </DialogTitle>
              <DialogDescription>
                Visualização do template • {selectedTemplate.usageCount} usos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Tipo</Label>
                  <p className="font-medium capitalize">{selectedTemplate.type}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Categoria</Label>
                  <p className="font-medium">{selectedTemplate.category}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Dificuldade</Label>
                  <div className="mt-1">{getDifficultyBadge(selectedTemplate.difficulty)}</div>
                </div>
              </div>

              {selectedTemplate.type === 'email' && selectedTemplate.subject && (
                <div>
                  <Label className="text-xs text-gray-500">Assunto</Label>
                  <p className="font-medium mt-1">{selectedTemplate.subject}</p>
                </div>
              )}

              <div>
                <Label className="text-xs text-gray-500 mb-2 block">Conteúdo</Label>
                {selectedTemplate.type === 'email' ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg whitespace-pre-wrap">
                    {selectedTemplate.content}
                  </div>
                ) : (
                  <Tabs defaultValue="preview">
                    <TabsList>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="code">Código HTML</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview">
                      <div
                        className="p-4 bg-white border border-gray-200 rounded-lg"
                        dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent || '' }}
                      />
                    </TabsContent>
                    <TabsContent value="code">
                      <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-xs">
                        {selectedTemplate.htmlContent}
                      </pre>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Fechar
              </Button>
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setIsEditDialogOpen(true);
                }}
                className="bg-[#834a8b] hover:bg-[#6d3d75]"
              >
                Editar Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {selectedTemplate && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleEditTemplate}>
              <DialogHeader>
                <DialogTitle>Editar Template</DialogTitle>
                <DialogDescription>
                  Faça alterações no template selecionado
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-name">Nome do Template</Label>
                  <Input
                    id="edit-name"
                    defaultValue={selectedTemplate.name}
                    required
                    className="mt-2"
                  />
                </div>

                {selectedTemplate.type === 'email' && (
                  <div>
                    <Label htmlFor="edit-subject">Assunto do E-mail</Label>
                    <Input
                      id="edit-subject"
                      defaultValue={selectedTemplate.subject}
                      required
                      className="mt-2"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="edit-content">Conteúdo</Label>
                  <Textarea
                    id="edit-content"
                    defaultValue={
                      selectedTemplate.type === 'email'
                        ? selectedTemplate.content
                        : selectedTemplate.htmlContent
                    }
                    rows={12}
                    required
                    className="mt-2 font-mono text-sm"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedTemplate(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* HTML Editor Dialog */}
      <HtmlTemplateEditor
        isOpen={isHtmlEditorOpen}
        onClose={() => setIsHtmlEditorOpen(false)}
        onSave={handleSaveHtmlTemplate}
        title="Editor de Template HTML"
        description="Crie templates HTML avançados com suporte a imagens e JavaScript"
        templateType="email"
      />
    </div>
  );
}
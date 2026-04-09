import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTemplates, deleteTemplate, updateTemplate } from '../lib/apiLocal';
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
import { NewTemplateDialog } from '../components/NewTemplateDialog';

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

export const formatCategory = (cat: string) => {
  if (!cat) return 'Outros';
  return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

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

import { useTranslation } from 'react-i18next';

export function Templates() {
  const { t } = useTranslation();
  const { user, impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TemplateType>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHtmlEditorOpen, setIsHtmlEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [newTemplateType, setNewTemplateType] = useState<TemplateType>('email');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar templates do banco
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplates();
      console.log('✅ Templates loaded:', data);
      
      // Verificar se data é um array válido
      if (!Array.isArray(data)) {
        console.warn('Templates data is not an array:', data);
        setTemplates([]);
        return;
      }
      
      // Mapear dados do banco para o formato esperado
      const mappedTemplates = data.map((t: any) => ({
        id: t.id || `temp-${Date.now()}`,
        name: t.name || 'Sem nome',
        type: 'email' as TemplateType, // Por enquanto todos são email
        subject: t.subject || '',
        category: t.category || 'Outros',
        difficulty: 'medium' as const, // Default
        usageCount: 0, // TODO: implementar contagem
        lastUsed: t.createdAt || new Date().toISOString(),
        content: t.bodyHtml || t.htmlContent || '',
        htmlContent: t.landingPageHtml || undefined,
      }));
      
      setTemplates(mappedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error(t('templates.messages.loadError'), {
        description: t('templates.messages.loadErrorDesc'),
      });
      // Em caso de erro, usar mock templates
      setTemplates(mockTemplates);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar templates
  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tpl.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesType = selectedType === 'all' || tpl.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleAddTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success(t('templates.messages.created'), {
      description: t('templates.messages.createdDesc'),
    });
    setIsAddDialogOpen(false);
  };

  const handleEditTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      subject: formData.get('subject') as string,
      content: formData.get('content') as string,
    };

    try {
      await updateTemplate(selectedTemplate.id, {
        name: data.name,
        subject: data.subject || '',
        bodyHtml: selectedTemplate.type === 'email' ? data.content : '',
        landingPageHtml: selectedTemplate.type === 'web' ? data.content : '',
      });
      toast.success(t('templates.messages.updated'), {
        description: t('templates.messages.updatedDesc'),
      });
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (e) {
      toast.error('Erro ao atualizar template');
    }
  };

  const handleSaveHtmlTemplate = (data: {
    html: string;
    css: string;
    javascript: string;
    images: Array<{ id: string; url: string; name: string }>;
  }) => {
    toast.success(t('templates.messages.htmlSaved'), {
      description: t('templates.messages.htmlSavedDesc'),
    });
    setIsHtmlEditorOpen(false);
  };

  const handleClone = async (templateId: string) => {
    try {
      // Fetch the template to clone
      const templatesList = await getTemplates();
      const template = templatesList.find((t: any) => t.id === templateId);
      if (!template) throw new Error('Template not found');
      
      const { createTemplate } = await import('../lib/apiLocal');
      await createTemplate({
        name: `${template.name} (Clone)`,
        type: template.type || 'email',
        subject: template.subject || '',
        category: template.category || 'Outros',
        bodyHtml: template.bodyHtml || '',
        landingPageHtml: template.landingPageHtml || '',
      });
      toast.success(t('templates.messages.cloned'), {
        description: t('templates.messages.clonedDesc', { name: template.name }),
      });
      loadTemplates();
    } catch (e) {
      toast.error('Erro ao clonar template');
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      toast.success(t('templates.messages.deleted'));
    } catch (e) {
      toast.error('Erro ao deletar template');
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {t('templates.difficulty.easy')}
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {t('templates.difficulty.medium')}
          </Badge>
        );
      case 'hard':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {t('templates.difficulty.hard')}
          </Badge>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: templates.length,
    email: templates.filter((t) => t.type === 'email').length,
    web: templates.filter((t) => t.type === 'web').length,
    mostUsed: templates.reduce((max, t) => (t.usageCount > max ? t.usageCount : max), 0),
  };

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Header com gradiente */}
        <div className="page-header">
          <div className="page-header-gradient">
            <h1 className="page-title">{t('templates.title')}</h1>
            <p className="page-subtitle">
              {t('templates.desc')}
            </p>
          </div>
        </div>

        {/* Ações principais */}
        <div className="flex justify-end gap-2 mb-6">
          <Button
            variant="outline"
            className="border-[#834a8b] text-[#834a8b] hover:bg-[#834a8b] hover:text-white"
            onClick={() => setIsHtmlEditorOpen(true)}
          >
            <Code className="w-4 h-4 mr-2" />
            {t('templates.actions.htmlEditor')}
          </Button>
          <Button 
            className="bg-[#834a8b] hover:bg-[#6d3d75]"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('templates.actions.new')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="stat-card stat-card-purple">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">{t('templates.stats.total')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value-gradient">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="stat-card stat-card-blue">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('templates.stats.emails')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.email}</div>
            </CardContent>
          </Card>
          <Card className="stat-card stat-card-purple">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t('templates.stats.web')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.web}</div>
            </CardContent>
          </Card>
          <Card className="stat-card stat-card-green">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">{t('templates.stats.mostUsed')}</CardTitle>
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
                  placeholder={t('templates.searchPlaceholder')}
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
                  <SelectValue placeholder={t('templates.filters.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('templates.filters.all')}</SelectItem>
                  <SelectItem value="email">{t('templates.filters.emails')}</SelectItem>
                  <SelectItem value="web">{t('templates.filters.landingPages')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Templates Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('templates.table.title')}</CardTitle>
            <CardDescription>
              {t('templates.table.desc', { count: filteredTemplates.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('templates.table.cols.name')}</TableHead>
                  <TableHead>{t('templates.table.cols.type')}</TableHead>
                  <TableHead>{t('templates.table.cols.category')}</TableHead>
                  <TableHead>{t('templates.table.cols.difficulty')}</TableHead>
                  <TableHead>{t('templates.table.cols.usage')}</TableHead>
                  <TableHead className="text-right">{t('templates.table.cols.actions')}</TableHead>
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
                            {t('templates.table.subject')} {template.subject}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.type === 'email' ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <Mail className="w-3 h-3 mr-1" />
                          {t('common.email')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          <Globe className="w-3 h-3 mr-1" />
                          {t('common.web')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatCategory(template.category)}</Badge>
                    </TableCell>
                    <TableCell>{getDifficultyBadge(template.difficulty)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.usageCount}x</span>
                        <span className="text-xs text-gray-500">{t('templates.table.used')}</span>
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
                          <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {t('common.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleClone(template.id)}>
                            <Copy className="w-4 h-4 mr-2" />
                            {t('common.clone')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(template.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('common.remove')}
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
                  {t('templates.view.desc', { usage: selectedTemplate.usageCount })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">{t('templates.view.labels.type')}</Label>
                    <p className="font-medium capitalize">{selectedTemplate.type === 'email' ? t('common.email') : t('common.web')}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">{t('templates.view.labels.category')}</Label>
                    <p className="font-medium">{formatCategory(selectedTemplate.category)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">{t('templates.view.labels.difficulty')}</Label>
                    <div className="mt-1">{getDifficultyBadge(selectedTemplate.difficulty)}</div>
                  </div>
                </div>

                {selectedTemplate.type === 'email' && selectedTemplate.subject && (
                  <div>
                    <Label className="text-xs text-gray-500">{t('templates.view.labels.subject')}</Label>
                    <p className="font-medium mt-1">{selectedTemplate.subject}</p>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">{t('templates.view.labels.content')}</Label>
                  {selectedTemplate.type === 'email' ? (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg whitespace-pre-wrap">
                      {selectedTemplate.content}
                    </div>
                  ) : (
                    <Tabs defaultValue="preview">
                      <TabsList>
                        <TabsTrigger value="preview">{t('templates.view.tabs.preview')}</TabsTrigger>
                        <TabsTrigger value="code">{t('templates.view.tabs.code')}</TabsTrigger>
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
                  {t('common.close')}
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                  className="bg-[#834a8b] hover:bg-[#6d3d75]"
                >
                  {t('common.editTemplate')}
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
                  <DialogTitle>{t('templates.edit.title')}</DialogTitle>
                  <DialogDescription>
                    {t('templates.edit.desc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="edit-name">{t('templates.edit.labels.name')}</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      defaultValue={selectedTemplate.name}
                      required
                      className="mt-2"
                    />
                  </div>

                  {selectedTemplate.type === 'email' && (
                    <div>
                      <Label htmlFor="edit-subject">{t('templates.edit.labels.subject')}</Label>
                      <Input
                        id="edit-subject"
                        name="subject"
                        defaultValue={selectedTemplate.subject}
                        required
                        className="mt-2"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="edit-content">{t('templates.edit.labels.content')}</Label>
                    <Textarea
                      id="edit-content"
                      name="content"
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
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                    {t('common.saveChanges')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* New Template Dialog */}
        <NewTemplateDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onTemplateCreated={loadTemplates}
        />

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
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, Copy, Eye, TrendingUp, Award, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { useTranslation } from 'react-i18next';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  subject: string;
  bodyHtml: string;
  thumbnail?: string;
  uses?: number;
  avgClickRate?: number;
}

export function TemplateLibrary() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-99a65fc7`;

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [category, difficulty, search, templates]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/template-library`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (category !== 'all') {
      filtered = filtered.filter(t => t.category === category);
    }

    if (difficulty !== 'all') {
      filtered = filtered.filter(t => t.difficulty === difficulty);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTemplates(filtered);
  };

  const cloneTemplate = async (template: Template) => {
    try {
      const res = await fetch(`${API_URL}/template-library/${template.id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          tenantId: 'tenant-1',
          name: `${template.name} (Cópia)`,
        }),
      });

      if (res.ok) {
        toast.success('Template clonado com sucesso!');
      } else {
        throw new Error('Failed to clone template');
      }
    } catch (error) {
      console.error('Error cloning template:', error);
      toast.error('Erro ao clonar template');
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      banking: 'Bancário',
      hr: 'RH',
      it: 'TI',
      delivery: 'Entrega',
      finance: 'Finanças',
      covid: 'COVID-19',
    };
    return labels[cat] || cat;
  };

  const getDifficultyColor = (diff: string) => {
    const colors: Record<string, string> = {
      basic: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[diff] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyLabel = (diff: string) => {
    const labels: Record<string, string> = {
      basic: 'Básico',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
    };
    return labels[diff] || diff;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Biblioteca de Templates</h2>
        <p className="text-muted-foreground">
          Templates profissionais prontos para suas campanhas de phishing
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="banking">Bancário</SelectItem>
                <SelectItem value="hr">RH</SelectItem>
                <SelectItem value="it">TI</SelectItem>
                <SelectItem value="delivery">Entrega</SelectItem>
                <SelectItem value="finance">Finanças</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Dificuldades</SelectItem>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              {template.thumbnail && (
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${template.thumbnail})` }}
                />
              )}

              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary">
                    {getCategoryLabel(template.category)}
                  </Badge>
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {getDifficultyLabel(template.difficulty)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Usado {template.uses || 0}x
                    </span>
                    {template.avgClickRate !== undefined && (
                      <span className="font-medium text-primary">
                        {template.avgClickRate}% taxa de clique
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setPreviewOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => cloneTemplate(template)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Clonar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou criar seus próprios templates
            </p>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Assunto:</h4>
                <p className="text-sm bg-muted p-3 rounded">{selectedTemplate.subject}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Corpo do E-mail:</h4>
                <div 
                  className="text-sm bg-white p-4 rounded border"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.bodyHtml }}
                />
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {getCategoryLabel(selectedTemplate.category)}
                  </Badge>
                  <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                    {getDifficultyLabel(selectedTemplate.difficulty)}
                  </Badge>
                </div>
                {selectedTemplate.avgClickRate !== undefined && (
                  <div className="ml-auto">
                    <span className="text-sm text-muted-foreground">Taxa média: </span>
                    <span className="font-bold text-primary">{selectedTemplate.avgClickRate}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              if (selectedTemplate) {
                cloneTemplate(selectedTemplate);
                setPreviewOpen(false);
              }
            }}>
              <Copy className="h-4 w-4 mr-2" />
              Clonar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

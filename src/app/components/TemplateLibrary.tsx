import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, Copy, Eye, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { getTemplateLibrary, cloneTemplateFromLibrary } from '../lib/apiLocal';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

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
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [category, difficulty, search, templates]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await getTemplateLibrary();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error(t('templates.messages.libraryLoadError'));
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
      const tenantId = user?.tenantId || '';
      const result = await cloneTemplateFromLibrary(
        template.id,
        tenantId,
        `${template.name} (Cópia)`
      );

      if (result.success) {
        toast.success(t('templates.messages.cloneSuccess'));
      } else {
        throw new Error('Failed to clone template');
      }
    } catch (error) {
      console.error('Error cloning template:', error);
      toast.error(t('templates.messages.cloneError'));
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      banking: t('templates.categories.banking'),
      hr: t('templates.categories.hr'),
      it: t('templates.categories.it'),
      delivery: t('templates.categories.delivery'),
      finance: t('templates.categories.finance'),
      covid: t('templates.categories.covid'),
      Financeiro: t('templates.categories.finance'),
      TI: t('templates.categories.it'),
      RH: t('templates.categories.hr'),
      Logística: t('templates.categories.logistics'),
      Social: t('templates.categories.social'),
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
      basic: t('templates.difficulty.basic'),
      intermediate: t('templates.difficulty.intermediate'),
      advanced: t('templates.difficulty.advanced'),
    };
    return labels[diff] || diff;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('templates.library.title')}</h2>
        <p className="text-muted-foreground">
          {t('templates.library.desc')}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('templates.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t('templates.filters.category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('templates.categories.all')}</SelectItem>
                <SelectItem value="banking">{t('templates.categories.banking')}</SelectItem>
                <SelectItem value="Financeiro">{t('templates.categories.finance')}</SelectItem>
                <SelectItem value="hr">{t('templates.categories.hr')}</SelectItem>
                <SelectItem value="TI">{t('templates.categories.it')}</SelectItem>
                <SelectItem value="delivery">{t('templates.categories.delivery')}</SelectItem>
                <SelectItem value="Logística">{t('templates.categories.logistics')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder={t('templates.filters.difficulty')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('templates.difficulty.all')}</SelectItem>
                <SelectItem value="basic">{t('templates.difficulty.basic')}</SelectItem>
                <SelectItem value="intermediate">{t('templates.difficulty.intermediate')}</SelectItem>
                <SelectItem value="advanced">{t('templates.difficulty.advanced')}</SelectItem>
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
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {template.description || template.subject}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary">
                    {getCategoryLabel(template.category)}
                  </Badge>
                  {template.difficulty && (
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {getDifficultyLabel(template.difficulty)}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {t('templates.library.usedTimes', { count: template.uses || 0 })}
                    </span>
                    {template.avgClickRate !== undefined && template.avgClickRate !== null && (
                      <span className="font-medium text-primary">
                        {t('templates.library.clickRate', { rate: template.avgClickRate })}
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
                  {t('templates.view.tabs.preview')}
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => cloneTemplate(template)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {t('common.clone')}
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
            <h3 className="text-lg font-semibold mb-2">{t('templates.library.emptyTitle')}</h3>
            <p className="text-muted-foreground">
              {templates.length === 0
                ? t('templates.library.emptyDesc1')
                : t('templates.library.emptyDesc2')}
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
              {selectedTemplate?.description || selectedTemplate?.subject}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{t('templates.library.subject')}</h4>
                <p className="text-sm bg-muted p-3 rounded">{selectedTemplate.subject}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">{t('templates.library.body')}</h4>
                <div
                  className="text-sm bg-white dark:bg-gray-900 p-4 rounded border"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.bodyHtml }}
                />
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {getCategoryLabel(selectedTemplate.category)}
                  </Badge>
                  {selectedTemplate.difficulty && (
                    <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                      {getDifficultyLabel(selectedTemplate.difficulty)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              {t('common.close')}
            </Button>
            <Button onClick={() => {
              if (selectedTemplate) {
                cloneTemplate(selectedTemplate);
                setPreviewOpen(false);
              }
            }}>
              <Copy className="h-4 w-4 mr-2" />
              {t('templates.library.clone')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Sparkles, Wand2, Brain, TrendingUp, AlertTriangle, CheckCircle2, Loader2, Settings2, Key, Cpu } from 'lucide-react';
import { toast } from 'sonner';
import { generateAITemplate, analyzeAITemplate, getAIProviders, configureAIProviders, testAIProvider, createTemplate, createLandingPage } from '../lib/apiLocal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useTranslation } from 'react-i18next';

interface TemplateAnalysis {
  urgencyScore: number;
  trustScore: number;
  effectiveness: number;
  overallScore?: number;
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  difficultyLevel?: string;
  detectionIndicators?: string[];
  provider?: string;
}

interface GeneratedTemplate {
  subject: string;
  body: string;
  landing_page_html?: string;
  category: string;
  difficulty: string;
  language?: string;
  tips?: string[];
  generatedAt: string;
  provider?: string;
  model?: string;
}

interface ProviderInfo {
  name: string;
  models: string[];
  configured: boolean;
  default_model: string;
}

export function AIContentGenerator() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'generate' | 'analyze' | 'settings'>('generate');

  // Provider state
  const [providers, setProviders] = useState<Record<string, ProviderInfo>>({});
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [selectedModel, setSelectedModel] = useState('');

  // Generate mode
  const [category, setCategory] = useState('banking');
  const [difficulty, setDifficulty] = useState('basic');
  const [language, setLanguage] = useState('pt-br');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState<GeneratedTemplate | null>(null);

  // Analyze mode
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [analysis, setAnalysis] = useState<TemplateAnalysis | null>(null);

  // Settings mode
  const [apiKeys, setApiKeys] = useState({
    openai_key: '',
    gemini_key: '',
    minimax_key: '',
    openrouter_key: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resultTab, setResultTab] = useState<'email' | 'landing'>('email');
  const [testingProvider, setTestingProvider] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoadingProviders(true);
    try {
      const data = await getAIProviders();
      setProviders(data.providers || {});

      // Auto-select first configured provider
      const configuredProvider = Object.entries(data.providers || {}).find(
        ([_, info]) => (info as ProviderInfo).configured
      );
      if (configuredProvider) {
        setSelectedProvider(configuredProvider[0]);
        setSelectedModel((configuredProvider[1] as ProviderInfo).default_model);
      }
    } catch (error) {
      console.error('Error fetching AI providers:', error);
    } finally {
      setLoadingProviders(false);
    }
  };

  const saveApiKeys = async () => {
    setLoading(true);
    try {
      // Only send non-empty keys
      const keysToSave: Record<string, string> = {};
      if (apiKeys.openai_key) keysToSave.openai_key = apiKeys.openai_key;
      if (apiKeys.gemini_key) keysToSave.gemini_key = apiKeys.gemini_key;
      if (apiKeys.minimax_key) keysToSave.minimax_key = apiKeys.minimax_key;
      if (apiKeys.openrouter_key) keysToSave.openrouter_key = apiKeys.openrouter_key;

      const result = await configureAIProviders(keysToSave);
      if (result.success) {
        toast.success(t('ai.messages.keysSaved'));
        setProviders(result.providers || {});
        setApiKeys({ openai_key: '', gemini_key: '', minimax_key: '', openrouter_key: '' });
      }
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast.error(t('ai.messages.keysSaveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!category || !difficulty) {
      toast.error(t('ai.messages.selectParams'));
      return;
    }

    setLoading(true);
    try {
      const result = await generateAITemplate({
        category,
        difficulty,
        language,
        customInstructions,
        provider: selectedProvider !== 'auto' ? selectedProvider : undefined,
        model: selectedModel || undefined,
      });

      if (result.success) {
        setGeneratedTemplate(result.template);
        const providerLabel = result.fallback ? t('ai.messages.fallbackLocal') : (result.template?.provider || 'IA');
        toast.success(t('ai.messages.generatedVia', { provider: providerLabel }));
      } else {
        throw new Error('Failed to generate template');
      }
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error(t('ai.messages.generateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!subject || !bodyHtml) {
      toast.error(t('ai.messages.fillFields'));
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeAITemplate({
        subject,
        bodyHtml,
        provider: selectedProvider !== 'auto' ? selectedProvider : undefined,
        model: selectedModel || undefined,
      });

      if (result.success) {
        setAnalysis(result.analysis);
        toast.success(t('ai.messages.analysisComplete'));
      }
    } catch (error) {
      console.error('Error analyzing template:', error);
      toast.error(t('ai.messages.analyzeError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!generatedTemplate) return;
    setSaving(true);
    try {
      // 1. Create the email template
      const templateData = {
        name: `AI: ${generatedTemplate.subject.substring(0, 60)}`,
        subject: generatedTemplate.subject,
        body_html: generatedTemplate.body,
        body_text: '',
        category: generatedTemplate.category || 'it',
        difficulty: generatedTemplate.difficulty || 'basic',
        template_type: 'email',
        is_global: false, // Let the backend use the current tenant
        landing_page_html: generatedTemplate.landing_page_html || '',
      };
      const savedTemplate = await createTemplate(templateData);
      const templateId = savedTemplate?.id;

      // 2. If landing page was generated, create it linked to the template
      if (templateId && generatedTemplate.landing_page_html) {
        try {
          await createLandingPage({
            template: templateId,
            html_content: generatedTemplate.landing_page_html,
            capture_enabled: true,
            capture_fields: ['email', 'password'],
          });
        } catch (lpError) {
          console.warn('Landing page creation failed (template was saved):', lpError);
        }
      }

      toast.success(t('ai.messages.templateSaved', 'Template salvo com sucesso!'));
      setGeneratedTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(t('ai.messages.templateSaveError', 'Erro ao salvar template'));
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return t('ai.scores.excellent');
    if (score >= 50) return t('ai.scores.good');
    return t('ai.scores.needsImprovement');
  };

  const configuredCount = Object.values(providers).filter(p => p.configured).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          {t('ai.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('ai.desc')}
          {configuredCount > 0 && (
            <span className="ml-2 text-green-600">• {t('ai.providersConfigured', { count: configuredCount })}</span>
          )}
        </p>
      </div>

      {/* Mode Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button
              variant={mode === 'generate' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('generate')}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {t('ai.tabs.generate')}
            </Button>
            <Button
              variant={mode === 'analyze' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('analyze')}
            >
              <Brain className="h-4 w-4 mr-2" />
              {t('ai.tabs.analyze')}
            </Button>
            <Button
              variant={mode === 'settings' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('settings')}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              {t('ai.tabs.settings')}
              {configuredCount > 0 && (
                <Badge variant="secondary" className="ml-2">{configuredCount}</Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Provider Selector (shown in generate/analyze modes) */}
      {(mode === 'generate' || mode === 'analyze') && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  {t('ai.providers.label')}
                </Label>
                <Select value={selectedProvider} onValueChange={(v) => {
                  setSelectedProvider(v);
                  if (providers[v]) {
                    setSelectedModel(providers[v].default_model);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('ai.providers.auto')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">{t('ai.providers.auto')}</SelectItem>
                    {Object.entries(providers).map(([key, info]) => (
                      <SelectItem key={key} value={key} disabled={!info.configured}>
                        {info.name} {info.configured ? t('ai.providers.configured') : t('ai.providers.notConfigured')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('ai.providers.modelLabel')}</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('ai.providers.modelPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProvider && selectedProvider !== 'auto' && providers[selectedProvider] ? (
                      providers[selectedProvider].models.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="default">{t('ai.providers.selectFirst')}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Mode */}
      {mode === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {t('ai.providers.settingsTitle')}
            </CardTitle>
            <CardDescription>
              {t('ai.providers.settingsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider Status */}
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(providers).map(([key, info]) => (
                <div key={key} className={`p-4 rounded-lg border ${
                  info.configured
                    ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20'
                    : 'border-muted bg-muted/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{info.name}</span>
                    <Badge variant={info.configured ? 'default' : 'secondary'}>
                      {info.configured ? t('ai.providers.statusConfigured') : t('ai.providers.statusPending')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('ai.providers.modelsAvailable', { count: info.models.length })}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-6 space-y-4">
              <h4 className="font-semibold">{t('ai.providers.addKeys')}</h4>

              <div className="space-y-2">
                <Label>{t('ai.providers.openAiKey') || 'OpenAI API Key'}</Label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={apiKeys.openai_key}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, openai_key: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('ai.providers.geminiKey') || 'Google Gemini API Key'}</Label>
                <Input
                  type="password"
                  placeholder="AIza..."
                  value={apiKeys.gemini_key}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, gemini_key: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('ai.providers.minimaxKey') || 'MiniMax API Key'}</Label>
                <Input
                  type="password"
                  placeholder="eyJ..."
                  value={apiKeys.minimax_key}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, minimax_key: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('ai.providers.openRouterKey') || 'OpenRouter API Key'}</Label>
                <Input
                  type="password"
                  placeholder="sk-or-..."
                  value={apiKeys.openrouter_key}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, openrouter_key: e.target.value }))}
                />
              </div>

              <Button onClick={saveApiKeys} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('ai.providers.saving')}
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    {t('ai.providers.saveKeys')}
                  </>
                )}
              </Button>

              {/* Test Provider Section */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-sm mb-3">🧪 Test Provider Connection</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(providers).filter(([_, info]) => (info as ProviderInfo).configured).map(([key, info]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      disabled={testingProvider === key}
                      onClick={async () => {
                        setTestingProvider(key);
                        setTestResult(null);
                        try {
                          const result = await testAIProvider({ provider: key });
                          setTestResult(result);
                          if (result.success) {
                            toast.success(`✅ ${(info as ProviderInfo).name} respondeu!`);
                          } else {
                            toast.error(`❌ ${(info as ProviderInfo).name}: ${result.error}`);
                          }
                        } catch (err: any) {
                          setTestResult({ success: false, error: err.message });
                          toast.error(`❌ Erro: ${err.message}`);
                        } finally {
                          setTestingProvider('');
                        }
                      }}
                    >
                      {testingProvider === key ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Cpu className="mr-1 h-3 w-3" />
                      )}
                      Test {(info as ProviderInfo).name}
                    </Button>
                  ))}
                </div>
                {testResult && (
                  <div className={`mt-3 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap max-h-48 overflow-auto ${testResult.success ? 'bg-green-50 border border-green-200 text-green-900' : 'bg-red-50 border border-red-200 text-red-900'}`}>
                    <div className="font-semibold mb-1">{testResult.success ? '✅ SUCCESS' : '❌ ERROR'} — {testResult.provider} ({testResult.model})</div>
                    {testResult.success ? (
                      <div><strong>Response:</strong> {testResult.response}</div>
                    ) : (
                      <div>
                        <strong>Error:</strong> {testResult.error}
                        {testResult.traceback && (
                          <details className="mt-1"><summary>Traceback</summary><pre className="text-[10px]">{testResult.traceback}</pre></details>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Mode */}
      {mode === 'generate' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('ai.generate.title')}</CardTitle>
              <CardDescription>
                {t('ai.generate.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('ai.generate.categoryLabel')}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banking">{t('ai.generate.categories.banking')}</SelectItem>
                    <SelectItem value="hr">{t('ai.generate.categories.hr')}</SelectItem>
                    <SelectItem value="it">{t('ai.generate.categories.it')}</SelectItem>
                    <SelectItem value="delivery">{t('ai.generate.categories.delivery')}</SelectItem>
                    <SelectItem value="finance">{t('ai.generate.categories.finance')}</SelectItem>
                    <SelectItem value="social">{t('ai.generate.categories.social')}</SelectItem>
                    <SelectItem value="cloud">{t('ai.generate.categories.cloud')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('ai.generate.difficultyLabel')}</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">{t('templates.difficulty.basic')}</SelectItem>
                    <SelectItem value="intermediate">{t('templates.difficulty.intermediate')}</SelectItem>
                    <SelectItem value="advanced">{t('templates.difficulty.advanced')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('ai.generate.languageLabel')}</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-br">{t('ai.generate.languages.pt')}</SelectItem>
                    <SelectItem value="en">{t('ai.generate.languages.en')}</SelectItem>
                    <SelectItem value="es">{t('ai.generate.languages.es')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('ai.generate.customInstructions')}</Label>
                <Textarea
                  placeholder={t('ai.generate.customPlaceholder')}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('ai.generate.btnGenerating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('ai.generate.btnGenerate')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('ai.generate.resultTitle')}</CardTitle>
              <CardDescription>
                {t('ai.generate.resultDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedTemplate ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('ai.generate.subject')}</Label>
                    <p className="font-semibold mt-1">{generatedTemplate.subject}</p>
                  </div>

                  <Tabs value={resultTab} onValueChange={(v) => setResultTab(v as 'email' | 'landing')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="email">📧 {t('ai.generate.emailPreview', 'E-mail')}</TabsTrigger>
                      <TabsTrigger value="landing" disabled={!generatedTemplate.landing_page_html}>
                        🌐 {t('ai.generate.landingPreview', 'Landing Page')}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="email">
                      <div
                        className="mt-1 p-4 bg-muted rounded-lg text-sm max-h-[400px] overflow-auto"
                        dangerouslySetInnerHTML={{ __html: generatedTemplate.body }}
                      />
                    </TabsContent>
                    <TabsContent value="landing">
                      {generatedTemplate.landing_page_html ? (
                        <iframe
                          srcDoc={generatedTemplate.landing_page_html}
                          sandbox="allow-forms"
                          className="w-full h-[400px] rounded-lg border"
                          title="Landing Page Preview"
                        />
                      ) : (
                        <p className="text-muted-foreground text-sm text-center py-8">
                          {t('ai.generate.noLandingPage', 'Nenhuma landing page gerada')}
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>

                  {generatedTemplate.tips && generatedTemplate.tips.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">{t('ai.generate.tips')}</Label>
                      <ul className="mt-1 space-y-1">
                        {generatedTemplate.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-yellow-600 mt-0.5">💡</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Badge>{generatedTemplate.category}</Badge>
                    <Badge variant="secondary">{generatedTemplate.difficulty}</Badge>
                    {generatedTemplate.provider && (
                      <Badge variant="outline">{t('ai.generate.viaProvider', { provider: generatedTemplate.provider })}</Badge>
                    )}
                    {generatedTemplate.landing_page_html && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">🌐 Landing Page</Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSaveAsTemplate}
                    disabled={saving}
                  >
                    {saving ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('ai.generate.saving', 'Salvando...')}</>
                    ) : (
                      <><CheckCircle2 className="mr-2 h-4 w-4" />{t('ai.generate.saveAsTemplate')}</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('ai.generate.emptyState')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analyze Mode */}
      {mode === 'analyze' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('ai.analyze.title')}</CardTitle>
              <CardDescription>
                {t('ai.analyze.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('ai.analyze.subjectLabel')}</Label>
                <Input
                  placeholder={t('ai.analyze.subjectPlaceholder')}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('ai.analyze.bodyLabel')}</Label>
                <Textarea
                  placeholder={t('ai.analyze.bodyPlaceholder')}
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  rows={12}
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('ai.analyze.btnAnalyzing')}
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    {t('ai.analyze.btnAnalyze')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('ai.analyze.resultTitle')}</CardTitle>
              <CardDescription>
                {t('ai.analyze.resultDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div className="space-y-6">
                  {/* Provider info */}
                  {analysis.provider && (
                    <Badge variant="outline" className="mb-2">{t('ai.analyze.viaProvider', { provider: analysis.provider })}</Badge>
                  )}

                  {/* Scores */}
                  <div className="grid gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{t('ai.analyze.urgency')}</span>
                        <span className={`text-2xl font-bold ${getScoreColor(analysis.urgencyScore)}`}>
                          {analysis.urgencyScore}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getScoreColor(analysis.urgencyScore).replace('text-', 'bg-')}`}
                          style={{ width: `${analysis.urgencyScore}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getScoreLabel(analysis.urgencyScore)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{t('ai.analyze.trust')}</span>
                        <span className={`text-2xl font-bold ${getScoreColor(analysis.trustScore)}`}>
                          {analysis.trustScore}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getScoreColor(analysis.trustScore).replace('text-', 'bg-')}`}
                          style={{ width: `${analysis.trustScore}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getScoreLabel(analysis.trustScore)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{t('ai.analyze.effectiveness')}</span>
                        <span className={`text-2xl font-bold ${getScoreColor(analysis.effectiveness)}`}>
                          {analysis.effectiveness}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getScoreColor(analysis.effectiveness).replace('text-', 'bg-')}`}
                          style={{ width: `${analysis.effectiveness}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getScoreLabel(analysis.effectiveness)}
                      </p>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {t('ai.analyze.strengths')}
                    </h4>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      {t('ai.analyze.weaknesses')}
                    </h4>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-yellow-600 mt-0.5">⚠</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      {t('ai.analyze.suggestions')}
                    </h4>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">→</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Detection Indicators */}
                  {analysis.detectionIndicators && analysis.detectionIndicators.length > 0 && (
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3">
                        <Brain className="h-4 w-4 text-purple-600" />
                        {t('ai.analyze.detection')}
                      </h4>
                      <ul className="space-y-2">
                        {analysis.detectionIndicators.map((indicator, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-purple-600 mt-0.5">🔍</span>
                            <span>{indicator}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('ai.analyze.emptyState')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

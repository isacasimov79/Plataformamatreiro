import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Sparkles, Wand2, Brain, TrendingUp, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { useTranslation } from 'react-i18next';

interface TemplateAnalysis {
  urgencyScore: number;
  trustScore: number;
  effectiveness: number;
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

interface GeneratedTemplate {
  subject: string;
  body: string;
  category: string;
  difficulty: string;
  language: string;
  generatedAt: string;
}

export function AIContentGenerator() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'generate' | 'analyze'>('generate');
  
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
  
  const [loading, setLoading] = useState(false);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-99a65fc7`;

  const generateTemplate = async () => {
    if (!category || !difficulty) {
      toast.error('Selecione categoria e dificuldade');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/generate-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          category,
          difficulty,
          language,
          customInstructions,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setGeneratedTemplate(data.template);
        toast.success('Template gerado com sucesso!');
      } else {
        throw new Error('Failed to generate template');
      }
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Erro ao gerar template');
    } finally {
      setLoading(false);
    }
  };

  const analyzeTemplate = async () => {
    if (!subject || !bodyHtml) {
      toast.error('Preencha o assunto e o corpo do e-mail');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/analyze-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ subject, bodyHtml }),
      });

      const data = await res.json();
      setAnalysis(data.analysis);
      toast.success('Análise concluída!');
    } catch (error) {
      console.error('Error analyzing template:', error);
      toast.error('Erro ao analisar template');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return 'Excelente';
    if (score >= 50) return 'Bom';
    return 'Precisa Melhorar';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          IA - Gerador de Conteúdo
        </h2>
        <p className="text-muted-foreground">
          Use inteligência artificial para criar e analisar templates de phishing
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
              Gerar Template
            </Button>
            <Button
              variant={mode === 'analyze' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('analyze')}
            >
              <Brain className="h-4 w-4 mr-2" />
              Analisar Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate Mode */}
      {mode === 'generate' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Configure os parâmetros para gerar um template personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banking">Bancário</SelectItem>
                    <SelectItem value="hr">Recursos Humanos</SelectItem>
                    <SelectItem value="it">TI / Segurança</SelectItem>
                    <SelectItem value="delivery">Entrega</SelectItem>
                    <SelectItem value="finance">Finanças</SelectItem>
                    <SelectItem value="covid">COVID-19</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-br">Português (BR)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Instruções Personalizadas (opcional)</Label>
                <Textarea
                  placeholder="Ex: Incluir referência a Black Friday, usar tom mais urgente..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={generateTemplate}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Template com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Gerado</CardTitle>
              <CardDescription>
                Resultado da geração com inteligência artificial
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedTemplate ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Assunto</Label>
                    <p className="font-semibold mt-1">{generatedTemplate.subject}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Corpo</Label>
                    <div 
                      className="mt-1 p-4 bg-muted rounded-lg text-sm"
                      dangerouslySetInnerHTML={{ __html: generatedTemplate.body }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Badge>{generatedTemplate.category}</Badge>
                    <Badge variant="secondary">{generatedTemplate.difficulty}</Badge>
                    <Badge variant="outline">{generatedTemplate.language}</Badge>
                  </div>

                  <Button variant="outline" className="w-full">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Salvar como Template
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configure e clique em "Gerar" para criar um template</p>
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
              <CardTitle>Seu Template</CardTitle>
              <CardDescription>
                Cole o template que você deseja analisar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Assunto do E-mail</Label>
                <Input
                  placeholder="Ex: Ação Necessária: Confirme sua Conta"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Corpo do E-mail</Label>
                <Textarea
                  placeholder="Cole o HTML ou texto do e-mail aqui..."
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  rows={12}
                />
              </div>

              <Button
                onClick={analyzeTemplate}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Analisar com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análise</CardTitle>
              <CardDescription>
                Insights e recomendações da IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div className="space-y-6">
                  {/* Scores */}
                  <div className="grid gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Urgência</span>
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
                        <span className="text-sm font-medium">Confiança</span>
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
                        <span className="text-sm font-medium">Efetividade</span>
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
                      Pontos Fortes
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
                      Pontos Fracos
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
                      Sugestões de Melhoria
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
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Insira um template e clique em "Analisar"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

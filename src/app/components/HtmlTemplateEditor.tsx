import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import {
  Code,
  Eye,
  Upload,
  Image as ImageIcon,
  Palette,
  FileCode,
  AlertCircle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from './ui/card';

interface HtmlTemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    html: string;
    css: string;
    javascript: string;
    images: Array<{ id: string; url: string; name: string }>;
  }) => void;
  title: string;
  description: string;
  initialHtml?: string;
  initialCss?: string;
  initialJavascript?: string;
  templateType: 'certificate' | 'email' | 'landing';
}

export function HtmlTemplateEditor({
  isOpen,
  onClose,
  onSave,
  title,
  description,
  initialHtml = '',
  initialCss = '',
  initialJavascript = '',
  templateType,
}: HtmlTemplateEditorProps) {
  const [html, setHtml] = useState(initialHtml || getDefaultHtml(templateType));
  const [css, setCss] = useState(initialCss || getDefaultCss(templateType));
  const [javascript, setJavascript] = useState(initialJavascript || '');
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ id: string; url: string; name: string }>
  >([]);
  const [previewMode, setPreviewMode] = useState<'code' | 'preview'>('code');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: e.target?.result as string,
          name: file.name,
        };
        setUploadedImages((prev) => [...prev, imageData]);
        toast.success('Imagem carregada!', {
          description: `${file.name} está disponível para uso`,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const copyImagePath = (imageUrl: string, imageName: string) => {
    const imgTag = `<img src="${imageUrl}" alt="${imageName}" />`;
    navigator.clipboard.writeText(imgTag);
    toast.success('Tag copiada!', {
      description: 'Cole no HTML para inserir a imagem',
    });
  };

  const handleSave = () => {
    onSave({
      html,
      css,
      javascript,
      images: uploadedImages,
    });
    toast.success('Template salvo!', {
      description: 'Template HTML foi salvo com sucesso',
    });
    onClose();
  };

  const getPreviewHtml = () => {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${javascript}</script>
</body>
</html>
    `;
  };

  const getAvailableVariables = () => {
    switch (templateType) {
      case 'certificate':
        return [
          { var: '{{STUDENT_NAME}}', desc: 'Nome do aluno' },
          { var: '{{TRAINING_TITLE}}', desc: 'Título do treinamento' },
          { var: '{{COMPLETION_DATE}}', desc: 'Data de conclusão' },
          { var: '{{CERTIFICATE_CODE}}', desc: 'Código do certificado' },
          { var: '{{SCORE}}', desc: 'Nota final' },
          { var: '{{CLIENT_LOGO}}', desc: 'Logo do cliente' },
          { var: '{{UNDERPROTECTION_LOGO}}', desc: 'Logo Under Protection' },
        ];
      case 'email':
        return [
          { var: '{{TARGET_NAME}}', desc: 'Nome do alvo' },
          { var: '{{TARGET_EMAIL}}', desc: 'Email do alvo' },
          { var: '{{COMPANY_NAME}}', desc: 'Nome da empresa' },
          { var: '{{PHISHING_LINK}}', desc: 'Link de phishing' },
          { var: '{{CLIENT_LOGO}}', desc: 'Logo do cliente' },
        ];
      case 'landing':
        return [
          { var: '{{TARGET_NAME}}', desc: 'Nome do alvo' },
          { var: '{{COMPANY_NAME}}', desc: 'Nome da empresa' },
          { var: '{{FORM_ACTION}}', desc: 'URL do formulário' },
          { var: '{{CLIENT_LOGO}}', desc: 'Logo do cliente' },
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-[#834a8b]" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="html">
                <FileCode className="w-4 h-4 mr-2" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="css">
                <Palette className="w-4 h-4 mr-2" />
                CSS
              </TabsTrigger>
              <TabsTrigger value="javascript">
                <Code className="w-4 h-4 mr-2" />
                JavaScript
              </TabsTrigger>
              <TabsTrigger value="images">
                <ImageIcon className="w-4 h-4 mr-2" />
                Imagens
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            {/* HTML Tab */}
            <TabsContent value="html" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="html-editor">Código HTML</Label>
                <Textarea
                  id="html-editor"
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="<div>Seu HTML aqui...</div>"
                />
              </div>

              {/* Variables Help */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-sm">Variáveis Disponíveis</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {getAvailableVariables().map((v) => (
                      <div
                        key={v.var}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          navigator.clipboard.writeText(v.var);
                          toast.success('Variável copiada!');
                        }}
                      >
                        <code className="text-purple-600 font-semibold">{v.var}</code>
                        <span className="text-gray-600">- {v.desc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CSS Tab */}
            <TabsContent value="css" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="css-editor">Estilos CSS</Label>
                <Textarea
                  id="css-editor"
                  value={css}
                  onChange={(e) => setCss(e.target.value)}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="body { font-family: Arial; }"
                />
              </div>
            </TabsContent>

            {/* JavaScript Tab */}
            <TabsContent value="javascript" className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <p className="font-semibold mb-1">Atenção ao usar JavaScript</p>
                  <p>
                    O JavaScript será executado na landing page. Use com cuidado e valide seu
                    código para evitar problemas de segurança.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="js-editor">Código JavaScript</Label>
                <Textarea
                  id="js-editor"
                  value={javascript}
                  onChange={(e) => setJavascript(e.target.value)}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="// Seu código JavaScript aqui..."
                />
              </div>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#834a8b] hover:bg-[#6d3d75]"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload de Imagens
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {uploadedImages.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhuma imagem carregada</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedImages.map((image) => (
                      <div
                        key={image.id}
                        className="border rounded-lg p-3 space-y-2 hover:border-purple-400 transition-colors"
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-32 object-cover rounded"
                        />
                        <p className="text-xs font-medium truncate" title={image.name}>
                          {image.name}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => copyImagePath(image.url, image.name)}
                        >
                          Copiar Tag &lt;img&gt;
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-2 border-b">
                  <Badge>Preview do Template</Badge>
                </div>
                <iframe
                  srcDoc={getPreviewHtml()}
                  className="w-full h-[500px] bg-white"
                  title="Template Preview"
                  sandbox="allow-scripts"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-[#834a8b] hover:bg-[#6d3d75]">
            Salvar Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultHtml(templateType: 'certificate' | 'email' | 'landing'): string {
  switch (templateType) {
    case 'certificate':
      return `<div class="certificate">
  <div class="header">
    <img src="{{UNDERPROTECTION_LOGO}}" alt="Under Protection" class="logo-under" />
    <img src="{{CLIENT_LOGO}}" alt="Cliente" class="logo-client" />
  </div>
  <h1>Certificado de Conclusão</h1>
  <p class="intro">Certificamos que</p>
  <h2 class="student-name">{{STUDENT_NAME}}</h2>
  <p class="course">Concluiu com êxito o treinamento</p>
  <h3 class="course-title">{{TRAINING_TITLE}}</h3>
  <div class="details">
    <p>Data de Conclusão: {{COMPLETION_DATE}}</p>
    <p>Nota Final: {{SCORE}}%</p>
    <p class="certificate-code">Código: {{CERTIFICATE_CODE}}</p>
  </div>
</div>`;

    case 'email':
      return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="text-align: center; padding: 20px;">
    <img src="{{CLIENT_LOGO}}" alt="Logo" style="max-width: 200px;" />
  </div>
  <h2>Olá {{TARGET_NAME}},</h2>
  <p>Detectamos uma atividade incomum em sua conta.</p>
  <p>Por favor, clique no link abaixo para verificar:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{PHISHING_LINK}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
      Verificar Conta
    </a>
  </p>
  <p style="color: #666; font-size: 12px;">
    Este é um teste de phishing simulado pela plataforma Matreiro.
  </p>
</div>`;

    case 'landing':
      return `<div class="container">
  <div class="header">
    <img src="{{CLIENT_LOGO}}" alt="Logo" class="logo" />
  </div>
  <h1>Verificação de Segurança</h1>
  <p>Olá {{TARGET_NAME}}, precisamos verificar sua identidade.</p>
  <form action="{{FORM_ACTION}}" method="POST" class="login-form">
    <input type="text" name="username" placeholder="Usuário" required />
    <input type="password" name="password" placeholder="Senha" required />
    <button type="submit">Verificar</button>
  </form>
</div>`;

    default:
      return '';
  }
}

function getDefaultCss(templateType: 'certificate' | 'email' | 'landing'): string {
  switch (templateType) {
    case 'certificate':
      return `body {
  font-family: 'Georgia', serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.certificate {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px;
  background: white;
  border: 10px solid #242545;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.logo-under, .logo-client {
  max-width: 150px;
  height: auto;
}

h1 {
  text-align: center;
  color: #242545;
  font-size: 36px;
  margin: 20px 0;
}

.student-name {
  text-align: center;
  color: #834a8b;
  font-size: 32px;
  margin: 20px 0;
  text-transform: uppercase;
}

.course-title {
  text-align: center;
  color: #242545;
  font-size: 24px;
  font-weight: normal;
  font-style: italic;
}

.details {
  margin-top: 40px;
  text-align: center;
  color: #4a4a4a;
}

.certificate-code {
  font-family: monospace;
  font-size: 14px;
  color: #666;
}`;

    case 'landing':
      return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  max-width: 400px;
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  max-width: 200px;
}

h1 {
  color: #242545;
  margin-bottom: 10px;
}

.login-form input {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.login-form button {
  width: 100%;
  padding: 12px;
  background: #834a8b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.login-form button:hover {
  background: #6d3d75;
}`;

    default:
      return '';
  }
}

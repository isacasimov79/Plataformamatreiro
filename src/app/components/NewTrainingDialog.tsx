import { toast } from 'sonner';
import { getTenants } from '../lib/supabaseApi';
import { useAuth } from '../contexts/AuthContext';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

export function NewTrainingDialog() {
  const { user, impersonatedTenant } = useAuth();
  const [open, setOpen] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar tenants
  useEffect(() => {
    if (open && !impersonatedTenant) {
      loadTenants();
    }
  }, [open, impersonatedTenant]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const tenantsData = await getTenants();
      setTenants(tenantsData);
    } catch (error) {
      console.error('Error loading tenants:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'phishing',
    difficulty: 'beginner',
    duration: 15,
    tenantId: impersonatedTenant?.id || '',
    hasQuiz: true,
    passingScore: 70,
    aiValidation: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!impersonatedTenant && !formData.tenantId) {
      toast.error('Selecione um cliente');
      return;
    }

    toast.success(`Treinamento "${formData.name}" criado com sucesso!`, {
      description: `Categoria: ${formData.category} • Duração: ${formData.duration} min`,
    });

    setFormData({
      name: '',
      description: '',
      category: 'phishing',
      difficulty: 'beginner',
      duration: 15,
      tenantId: impersonatedTenant?.id || '',
      hasQuiz: true,
      passingScore: 70,
      aiValidation: true,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#834a8b] hover:bg-[#9a5ba1] text-white w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Treinamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Treinamento</DialogTitle>
          <DialogDescription>
            Crie um novo módulo de treinamento em segurança da informação
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome do Treinamento *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Identificação de Phishing Avançado"
                className="mt-1"
              />
            </div>

            {/* Cliente (apenas para master view) */}
            {!impersonatedTenant && (
              <div className="md:col-span-2">
                <Label htmlFor="tenant">Cliente *</Label>
                <Select
                  value={formData.tenantId}
                  onValueChange={(value) => setFormData({ ...formData, tenantId: value })}
                >
                  <SelectTrigger id="tenant" className="mt-1">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Categoria */}
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phishing">Phishing</SelectItem>
                  <SelectItem value="password">Senhas Seguras</SelectItem>
                  <SelectItem value="social_engineering">Engenharia Social</SelectItem>
                  <SelectItem value="malware">Malware e Ransomware</SelectItem>
                  <SelectItem value="data_protection">Proteção de Dados</SelectItem>
                  <SelectItem value="compliance">Compliance e LGPD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dificuldade */}
            <div>
              <Label htmlFor="difficulty">Nível de Dificuldade *</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger id="difficulty" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duração */}
            <div>
              <Label htmlFor="duration">Duração (minutos) *</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                max="240"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>

            {/* Nota de Aprovação */}
            <div>
              <Label htmlFor="passingScore">Nota Mínima (%) *</Label>
              <Input
                id="passingScore"
                type="number"
                min="0"
                max="100"
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>

            {/* Switches */}
            <div className="md:col-span-2 space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="hasQuiz">Incluir Quiz de Avaliação</Label>
                  <p className="text-sm text-gray-500">Adicionar perguntas ao final do treinamento</p>
                </div>
                <Switch
                  id="hasQuiz"
                  checked={formData.hasQuiz}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasQuiz: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="aiValidation">Validação por IA (Anti-ChatGPT)</Label>
                  <p className="text-sm text-gray-500">Detectar respostas geradas por IA</p>
                </div>
                <Switch
                  id="aiValidation"
                  checked={formData.aiValidation}
                  onCheckedChange={(checked) => setFormData({ ...formData, aiValidation: checked })}
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição do Conteúdo *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva os tópicos e objetivos do treinamento..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#834a8b] hover:bg-[#9a5ba1]">
              Criar Treinamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
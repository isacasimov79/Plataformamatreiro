import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createTraining } from '../lib/supabaseApi';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Video, FileText } from 'lucide-react';

interface NewTrainingDialogProps {
  onTrainingCreated?: () => void;
}

export function NewTrainingDialog({ onTrainingCreated }: NewTrainingDialogProps) {
  const { impersonatedTenant } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video' as 'video' | 'slides',
    duration: 15,
    category: 'Básico',
    mediaUrl: '',
    tenantId: impersonatedTenant?.id || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Por favor, preencha o título do treinamento');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await createTraining({
        ...formData,
        enrolledCount: 0,
        completedCount: 0,
        averageScore: 0,
      });

      toast.success('Treinamento criado!', {
        description: 'O treinamento foi criado com sucesso.',
      });

      setOpen(false);
      setFormData({
        title: '',
        description: '',
        type: 'video',
        duration: 15,
        category: 'Básico',
        mediaUrl: '',
        tenantId: impersonatedTenant?.id || null,
      });

      if (onTrainingCreated) {
        onTrainingCreated();
      }
    } catch (error) {
      console.error('Error creating training:', error);
      toast.error('Erro ao criar treinamento', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
          <Plus className="w-4 h-4 mr-2" />
          Novo Treinamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo Treinamento</DialogTitle>
            <DialogDescription>
              Adicione um novo treinamento de segurança da informação
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Título */}
            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ex: Introdução à Segurança da Informação"
                required
              />
            </div>

            {/* Descrição */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descreva o conteúdo do treinamento..."
                rows={3}
              />
            </div>

            {/* Tipo e Duração */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'video' | 'slides') =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Vídeo
                      </div>
                    </SelectItem>
                    <SelectItem value="slides">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Slides
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: parseInt(e.target.value) || 15 })
                  }
                />
              </div>
            </div>

            {/* Categoria */}
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Básico">Básico</SelectItem>
                  <SelectItem value="Intermediário">Intermediário</SelectItem>
                  <SelectItem value="Avançado">Avançado</SelectItem>
                  <SelectItem value="Phishing">Phishing</SelectItem>
                  <SelectItem value="Engenharia Social">Engenharia Social</SelectItem>
                  <SelectItem value="LGPD">LGPD</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* URL do Conteúdo */}
            <div className="grid gap-2">
              <Label htmlFor="mediaUrl">URL do Conteúdo (opcional)</Label>
              <Input
                id="mediaUrl"
                type="url"
                value={formData.mediaUrl}
                onChange={(e) =>
                  setFormData({ ...formData, mediaUrl: e.target.value })
                }
                placeholder="https://exemplo.com/video.mp4"
              />
              <p className="text-xs text-gray-500">
                Link para o vídeo ou apresentação do treinamento
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#834a8b] hover:bg-[#6d3d75]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando...' : 'Criar Treinamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

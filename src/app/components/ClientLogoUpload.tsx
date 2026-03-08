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
import { Upload, Image as ImageIcon, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ClientLogoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (logoUrl: string) => void;
  currentLogo?: string;
  clientName: string;
}

export function ClientLogoUpload({
  isOpen,
  onClose,
  onSave,
  currentLogo,
  clientName,
}: ClientLogoUploadProps) {
  const [logoPreview, setLogoPreview] = useState<string>(currentLogo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido', {
        description: 'Por favor, selecione uma imagem (PNG, JPG, SVG)',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande', {
        description: 'O tamanho máximo é 2MB',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
      toast.success('Logo carregada!', {
        description: 'Visualize o preview e clique em Salvar',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (!logoPreview) {
      toast.error('Nenhuma logo selecionada', {
        description: 'Por favor, faça upload de uma imagem',
      });
      return;
    }

    onSave(logoPreview);
    toast.success('Logo salva!', {
      description: `Logo do cliente ${clientName} foi atualizada`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#834a8b]" />
            Upload de Logo do Cliente
          </DialogTitle>
          <DialogDescription>
            Adicione a logo de <strong>{clientName}</strong> para aparecer em relatórios e
            certificados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upload Area */}
          <div className="space-y-4">
            <Label>Logo do Cliente</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {logoPreview ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={logoPreview}
                      alt="Preview da Logo"
                      className="max-w-full max-h-64 object-contain"
                    />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Alterar Logo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveLogo}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto" />
                  <div>
                    <p className="text-gray-600 mb-2">Arraste uma imagem ou clique para fazer upload</p>
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#834a8b] hover:bg-[#6d3d75]"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Arquivo
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG ou SVG (máx. 2MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">Onde a logo será exibida:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Certificados de treinamento</li>
                  <li>Relatórios de campanhas</li>
                  <li>Templates de e-mail de phishing</li>
                  <li>Landing pages personalizadas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-gray-700">Recomendações:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Use imagens em alta resolução (mínimo 300x300px)</li>
              <li>Prefira logos em formato PNG com fundo transparente</li>
              <li>Evite logos muito complexas que ficam ilegíveis quando reduzidas</li>
              <li>Proporção recomendada: quadrada ou horizontal (16:9)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!logoPreview}
            className="bg-[#834a8b] hover:bg-[#6d3d75]"
          >
            Salvar Logo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

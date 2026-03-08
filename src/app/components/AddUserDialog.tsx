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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, UserPlus, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    toast.success('Usuário adicionado com sucesso!', {
      description: `${formData.name} foi adicionado à lista`,
    });

    setFormData({ name: '', email: '', department: '', position: '' });
    onOpenChange(false);
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Selecione um arquivo');
      return;
    }

    // Simular upload
    toast.success('Arquivo processado com sucesso!', {
      description: `15 usuários importados de ${file.name}`,
    });

    setFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Usuários</DialogTitle>
          <DialogDescription>
            Adicione usuários manualmente ou importe em lote via CSV/Excel
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">
              <UserPlus className="w-4 h-4 mr-2" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="import">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Importar CSV/Excel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="João Silva"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="joao.silva@empresa.com.br"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="TI / Financeiro / RH"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="position">Cargo</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Analista / Gerente"
                    className="mt-1"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#834a8b] hover:bg-[#9a5ba1]">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Usuário
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#834a8b] transition-colors">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Arraste um arquivo ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-500">
                    Formatos aceitos: CSV, XLSX, XLS (máx. 10MB)
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" variant="outline" className="mt-2" asChild>
                      <span>Selecionar Arquivo</span>
                    </Button>
                  </label>
                </div>
                {file && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700 font-medium">
                      ✓ Arquivo selecionado: {file.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Formato do CSV/Excel</h4>
                <p className="text-xs text-blue-700 mb-2">
                  O arquivo deve conter as seguintes colunas (na ordem):
                </p>
                <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 block">
                  Nome, Email, Departamento, Cargo
                </code>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-blue-600 px-0 h-auto mt-2"
                >
                  Baixar modelo de planilha
                </Button>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#834a8b] hover:bg-[#9a5ba1]"
                  disabled={!file}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Usuários
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

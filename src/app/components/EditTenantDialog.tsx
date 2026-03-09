import { toast } from 'sonner';
import { getTenants, getTemplates } from '../lib/supabaseApi';
import { Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type Tenant = {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  status: string;
  parentId: string | null;
};

interface EditTenantDialogProps {
  tenant: Tenant;
}

export function EditTenantDialog({ tenant }: EditTenantDialogProps) {
  const [open, setOpen] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: tenant.name,
    document: tenant.document,
    email: tenant.email,
    phone: tenant.phone,
    status: tenant.status,
    parentId: tenant.parentId || '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: tenant.name,
        document: tenant.document,
        email: tenant.email,
        phone: tenant.phone,
        status: tenant.status,
        parentId: tenant.parentId || '',
      });
      loadTenants();
    }
  }, [open, tenant]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.success('Cliente atualizado!', {
      description: `${formData.name} foi atualizado com sucesso`,
    });
    
    setOpen(false);
  };

  // Filtrar tenants para select (excluir o próprio tenant e seus filhos)
  const availableParents = tenants.filter(t => 
    t.id !== tenant.id && t.parentId !== tenant.id
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          title="Editar cliente"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize as informações do cliente {tenant.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome da Empresa</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Acme Corp"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-document">CNPJ</Label>
              <Input
                id="edit-document"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-email">E-mail de Contato</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@empresa.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 98888-8888"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-parent">Cliente Pai (Opcional)</Label>
              <Select value={formData.parentId || 'none'} onValueChange={(value) => setFormData({ ...formData, parentId: value === 'none' ? '' : value })}>
                <SelectTrigger id="edit-parent">
                  <SelectValue placeholder="Nenhum (cliente raiz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (cliente raiz)</SelectItem>
                  {availableParents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Define este cliente como sub-cliente de outro
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
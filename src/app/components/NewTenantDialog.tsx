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
import { Plus } from 'lucide-react';
import { Switch } from './ui/switch';

export function NewTenantDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    adminName: '',
    adminEmail: '',
    phone: '',
    plan: 'professional',
    maxUsers: 100,
    notes: '',
    active: true,
    m365Integration: false,
    googleWorkspace: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.domain || !formData.adminEmail) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    toast.success(`Cliente "${formData.name}" criado com sucesso!`, {
      description: `Plano: ${formData.plan} • ${formData.maxUsers} usuários`,
    });

    setFormData({
      name: '',
      domain: '',
      adminName: '',
      adminEmail: '',
      phone: '',
      plan: 'professional',
      maxUsers: 100,
      notes: '',
      active: true,
      m365Integration: false,
      googleWorkspace: false,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#834a8b] hover:bg-[#9a5ba1] text-white w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Cliente (Tenant)</DialogTitle>
          <DialogDescription>
            Cadastre um novo cliente na plataforma Matreiro
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome da Empresa */}
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Acme Corporation"
                className="mt-1"
              />
            </div>

            {/* Domínio */}
            <div>
              <Label htmlFor="domain">Domínio *</Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="exemplo.com.br"
                className="mt-1"
              />
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 98765-4321"
                className="mt-1"
              />
            </div>

            {/* Admin Name */}
            <div>
              <Label htmlFor="adminName">Nome do Administrador *</Label>
              <Input
                id="adminName"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                placeholder="João Silva"
                className="mt-1"
              />
            </div>

            {/* Admin Email */}
            <div>
              <Label htmlFor="adminEmail">E-mail do Administrador *</Label>
              <Input
                id="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                placeholder="admin@exemplo.com.br"
                className="mt-1"
              />
            </div>

            {/* Plano */}
            <div>
              <Label htmlFor="plan">Plano de Assinatura *</Label>
              <Select
                value={formData.plan}
                onValueChange={(value) => setFormData({ ...formData, plan: value })}
              >
                <SelectTrigger id="plan" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter (até 50 usuários)</SelectItem>
                  <SelectItem value="professional">Professional (até 200 usuários)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (ilimitado)</SelectItem>
                  <SelectItem value="trial">Trial (30 dias)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Users */}
            <div>
              <Label htmlFor="maxUsers">Limite de Usuários *</Label>
              <Input
                id="maxUsers"
                type="number"
                min="1"
                max="10000"
                value={formData.maxUsers}
                onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>

            {/* Integrações */}
            <div className="md:col-span-2 border-t pt-4 space-y-4">
              <h3 className="font-medium text-gray-900">Integrações Corporativas</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="m365">Microsoft 365</Label>
                  <p className="text-sm text-gray-500">Sincronização com Azure AD / Entra ID</p>
                </div>
                <Switch
                  id="m365"
                  checked={formData.m365Integration}
                  onCheckedChange={(checked) => setFormData({ ...formData, m365Integration: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="google">Google Workspace</Label>
                  <p className="text-sm text-gray-500">Sincronização com Google Admin</p>
                </div>
                <Switch
                  id="google"
                  checked={formData.googleWorkspace}
                  onCheckedChange={(checked) => setFormData({ ...formData, googleWorkspace: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="active">Cliente Ativo</Label>
                  <p className="text-sm text-gray-500">Permitir acesso à plataforma</p>
                </div>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>
            </div>

            {/* Notas */}
            <div className="md:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informações adicionais sobre o cliente..."
                rows={3}
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
              Criar Cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

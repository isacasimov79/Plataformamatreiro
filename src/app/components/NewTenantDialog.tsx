import { useState } from 'react';
import { createTenant } from '../lib/apiLocal';
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
import { useTranslation } from 'react-i18next';

export function NewTenantDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    adminName: '',
    adminEmail: '',
    phone: '',
    plan: 'professional',
    maxUsers: 100,
    notes: '',
    status: 'active' as 'active' | 'suspended' | 'inactive',
    m365Integration: false,
    googleWorkspace: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.document || !formData.adminEmail) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      await createTenant({
        name: formData.name,
        document: formData.document,
        status: formData.status,
        parentId: null,
      });

      toast.success(`Cliente "${formData.name}" criado com sucesso!`, {
        description: `CNPJ: ${formData.document}`,
      });

      setFormData({
        name: '',
        document: '',
        adminName: '',
        adminEmail: '',
        phone: '',
        plan: 'professional',
        maxUsers: 100,
        notes: '',
        status: 'active',
        m365Integration: false,
        googleWorkspace: false,
      });

      setOpen(false);
      
      // Recarregar a página para mostrar o novo tenant
      window.location.reload();
    } catch (error) {
      console.error('Error creating tenant:', error);
      toast.error('Erro ao criar cliente', {
        description: 'Não foi possível criar o cliente. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#834a8b] hover:bg-[#9a5ba1] text-white w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('tenants.newTenant')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('tenants.newTenant')}</DialogTitle>
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

            {/* Documento */}
            <div>
              <Label htmlFor="document">CNPJ *</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                placeholder="00.000.000/0000-00"
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
                  checked={formData.status === 'active'}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    status: checked ? 'active' : 'inactive' 
                  })}
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
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-[#834a8b] hover:bg-[#9a5ba1]"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
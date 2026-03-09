import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import {
  Plus,
  Search,
  Zap,
  MoreHorizontal,
  Trash2,
  Edit,
  Play,
  Pause,
  Clock,
  Users,
  Mail,
  Building,
  Check,
  X,
  AlertTriangle,
  Activity,
  Filter,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAutomations, getTenants, getTargetGroups, getTemplates } from '../lib/supabaseApi';

export function Automations() {
  const { user, impersonatedTenant } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');
  const [selectedConditionType, setSelectedConditionType] = useState<string>('');
  
  // Estados para dados do banco
  const [automations, setAutomations] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [targetGroups, setTargetGroups] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do banco
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [automationsData, tenantsData, groupsData, templatesData] = await Promise.all([
        getAutomations(),
        getTenants(),
        getTargetGroups(),
        getTemplates(),
      ]);
      setAutomations(automationsData);
      setTenants(tenantsData);
      setTargetGroups(groupsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading automations data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const isMasterView = !impersonatedTenant;

  // Filtrar automações baseado em impersonation
  const relevantAutomations = isMasterView
    ? automations
    : automations.filter((a) => a.tenantId === impersonatedTenant?.id);

  // Filtrar automações com busca
  const filteredAutomations = relevantAutomations.filter(
    (automation) =>
      automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateAutomation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Automação criada!', {
      description: 'A automação foi criada e ativada com sucesso',
    });
    setIsCreateDialogOpen(false);
  };

  const handleToggleStatus = (automationId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    toast.success(
      newStatus === 'active' ? 'Automação ativada!' : 'Automação pausada!',
      {
        description:
          newStatus === 'active'
            ? 'A automação está ativa e processando eventos'
            : 'A automação foi pausada e não processará eventos',
      }
    );
  };

  const handleDelete = (automationId: string) => {
    toast.success('Automação removida!', {
      description: 'A automação foi removida com sucesso',
    });
  };

  const stats = {
    total: relevantAutomations.length,
    active: relevantAutomations.filter((a) => a.status === 'active').length,
    paused: relevantAutomations.filter((a) => a.status === 'paused').length,
    totalExecutions: relevantAutomations.reduce((sum, a) => sum + a.executionCount, 0),
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">
              Automações de Phishing
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              {isMasterView
                ? 'Configure automações de campanhas por grupos e condições'
                : `Cliente: ${impersonatedTenant?.name}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="bg-[#834a8b] hover:bg-[#6d3d75]"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Automação
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total de Automações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Pausadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.paused}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Executadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalExecutions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar automações por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Automations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Automações</CardTitle>
          <CardDescription>
            {filteredAutomations.length} automações configuradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead>Execuções</TableHead>
                {isMasterView && <TableHead>Cliente</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAutomations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMasterView ? 8 : 7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Zap className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">Nenhuma automação encontrada</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeira Automação
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAutomations.map((automation) => (
                  <TableRow key={automation.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{automation.name}</span>
                        <span className="text-sm text-gray-500">{automation.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {automation.trigger === 'new_user_ad' && 'Novo Usuário AD'}
                            {automation.trigger === 'new_user_google' && 'Novo Usuário Google'}
                            {automation.trigger === 'user_added_group' && 'Usuário Add. Grupo'}
                          </span>
                          {automation.triggerDelay && (
                            <span className="text-xs text-gray-500">
                              Delay: {automation.triggerDelay} dias
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-purple-500" />
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {automation.condition.type === 'in_group' && 'Está no grupo'}
                            {automation.condition.type === 'not_in_group' && 'NÃO está no grupo'}
                            {automation.condition.type === 'in_department' && 'No departamento'}
                            {automation.condition.type === 'always' && 'Sempre'}
                          </span>
                          {automation.condition.groupIds && automation.condition.groupIds.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {automation.condition.groupIds.length} grupo(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">
                          {templates.find((t) => t.id === automation.campaignTemplateId)?.name ||
                            'Template não encontrado'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{automation.executionCount}</span>
                      </div>
                    </TableCell>
                    {isMasterView && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {tenants.find((t) => t.id === automation.tenantId)?.name || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      {automation.status === 'active' && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Ativa
                        </Badge>
                      )}
                      {automation.status === 'paused' && (
                        <Badge
                          variant="outline"
                          className="bg-orange-50 text-orange-700 border-orange-200"
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          Pausada
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(automation.id, automation.status)}
                          >
                            {automation.status === 'active' ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Pausar
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Activity className="w-4 h-4 mr-2" />
                            Ver Histórico
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(automation.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog: Criar Automação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateAutomation}>
            <DialogHeader>
              <DialogTitle>Nova Automação de Phishing</DialogTitle>
              <DialogDescription>
                Configure uma automação para enviar campanhas baseadas em eventos e condições
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Automação</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Boas-vindas para novos funcionários"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o objetivo desta automação..."
                      className="mt-2"
                      rows={2}
                    />
                  </div>
                  {isMasterView && (
                    <div>
                      <Label htmlFor="tenant">Cliente</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
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
                </CardContent>
              </Card>

              {/* Trigger (Gatilho) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Trigger (Gatilho)
                  </CardTitle>
                  <CardDescription>Quando esta automação deve ser disparada?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="trigger">Evento Gatilho</Label>
                    <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecione o evento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new_user_ad">
                          Novo usuário cadastrado no Active Directory / Microsoft 365
                        </SelectItem>
                        <SelectItem value="new_user_google">
                          Novo usuário cadastrado no Google Workspace
                        </SelectItem>
                        <SelectItem value="user_added_group">
                          Usuário adicionado a um grupo
                        </SelectItem>
                        <SelectItem value="user_removed_group">
                          Usuário removido de um grupo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="delay">
                      Delay (Atraso após o evento)
                      <span className="text-gray-500 font-normal ml-2">(em dias)</span>
                    </Label>
                    <Input
                      id="delay"
                      type="number"
                      min="0"
                      placeholder="0"
                      defaultValue="7"
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Quantos dias aguardar após o evento para executar a automação
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Condições */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Filter className="w-4 h-4 text-purple-500" />
                    Condições
                  </CardTitle>
                  <CardDescription>
                    Defina condições para filtrar quem receberá a campanha
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="conditionType">Tipo de Condição</Label>
                    <Select
                      value={selectedConditionType}
                      onValueChange={setSelectedConditionType}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecione o tipo de condição" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">
                          Sempre executar (sem condições)
                        </SelectItem>
                        <SelectItem value="in_group">
                          Se o usuário ESTÁ em um dos grupos
                        </SelectItem>
                        <SelectItem value="not_in_group">
                          Se o usuário NÃO ESTÁ em nenhum dos grupos
                        </SelectItem>
                        <SelectItem value="in_department">
                          Se o usuário pertence a um departamento
                        </SelectItem>
                        <SelectItem value="custom">
                          Condição customizada (AND/OR)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedConditionType === 'in_group' && (
                    <div>
                      <Label>Grupos (usuário DEVE estar em pelo menos um)</Label>
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                        {targetGroups.slice(0, 8).map((group) => (
                          <label
                            key={group.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input type="checkbox" className="rounded" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{group.name}</div>
                              <div className="text-xs text-gray-500">
                                {group.memberCount} membros
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedConditionType === 'not_in_group' && (
                    <div>
                      <Label>Grupos (usuário NÃO deve estar em nenhum destes)</Label>
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                        {targetGroups.slice(0, 8).map((group) => (
                          <label
                            key={group.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input type="checkbox" className="rounded" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{group.name}</div>
                              <div className="text-xs text-gray-500">
                                {group.memberCount} membros
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-yellow-800">
                            <strong>Campanha de Boas-vindas:</strong> Útil para usuários novos que
                            ainda não foram adicionados a nenhum grupo de treinamento.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedConditionType === 'in_department' && (
                    <div>
                      <Label htmlFor="department">Departamento</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ti">Tecnologia (TI)</SelectItem>
                          <SelectItem value="rh">Recursos Humanos (RH)</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                          <SelectItem value="comercial">Comercial</SelectItem>
                          <SelectItem value="diretoria">Diretoria</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ação (Campanha) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Send className="w-4 h-4 text-orange-500" />
                    Ação
                  </CardTitle>
                  <CardDescription>O que fazer quando a condição for atendida?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template">Template da Campanha</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecione o template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} - {template.subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      A campanha será enviada automaticamente para o usuário quando todas as
                      condições forem atendidas.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Exemplo Visual */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    Exemplo de Fluxo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                        1
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm font-medium">
                          {selectedTrigger === 'new_user_ad' && 'Novo usuário no AD/Microsoft 365'}
                          {selectedTrigger === 'new_user_google' && 'Novo usuário no Google Workspace'}
                          {!selectedTrigger && 'Selecione um trigger...'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full text-sm font-bold">
                        2
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm font-medium">
                          {selectedConditionType === 'in_group' && 'Verifica se está em grupo(s)'}
                          {selectedConditionType === 'not_in_group' && 'Verifica se NÃO está em grupo(s)'}
                          {selectedConditionType === 'in_department' && 'Verifica departamento'}
                          {selectedConditionType === 'always' && 'Sem verificação (sempre executa)'}
                          {!selectedConditionType && 'Selecione uma condição...'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-bold">
                        3
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm font-medium">Envia campanha de phishing</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#834a8b] hover:bg-[#6d3d75]">
                <Zap className="w-4 h-4 mr-2" />
                Criar Automação
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
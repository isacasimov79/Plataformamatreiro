import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Users, 
  Mail, 
  Building2, 
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { azureGetUsers, azureGetGroups } from '../lib/supabaseApi';
import { toast } from 'sonner';
import { azureSyncUsers, azureSyncGroups } from '../lib/supabaseApi';

interface AzureImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'users' | 'groups';
  credentials: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
  };
  targetTenantId?: string;
  allowedDomains?: string[];
  onImportComplete?: () => void;
}

export function AzureImportDialog({
  open,
  onOpenChange,
  type,
  credentials,
  targetTenantId,
  allowedDomains,
  onImportComplete,
}: AzureImportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const loadData = async () => {
    setLoading(true);
    try {
      const { tenantId, clientId, clientSecret } = credentials;
      
      let result;
      if (type === 'users') {
        result = await azureGetUsers(tenantId, clientId, clientSecret, 100);
        setData(result.users || []);
      } else {
        result = await azureGetGroups(tenantId, clientId, clientSecret, 100);
        setData(result.groups || []);
      }
      
      toast.success(`${type === 'users' ? 'Usuários' : 'Grupos'} carregados!`, {
        description: `${result.count} itens encontrados`,
      });
    } catch (error: any) {
      toast.error('Erro ao buscar dados do Azure', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.map(item => item.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const { tenantId, clientId, clientSecret } = credentials;
      
      if (!targetTenantId) {
        toast.error('ID do Tenant não fornecido');
        setImporting(false);
        return;
      }
      
      let result;
      if (type === 'users') {
        // Sincronizar TODOS os usuários ativos do Azure AD (com filtro de domínio)
        result = await azureSyncUsers(tenantId, clientId, clientSecret, targetTenantId, allowedDomains);
        
        if (result.success) {
          const description = result.filteredByDomain > 0
            ? `${result.synced} usuários importados (${result.filteredByDomain} filtrados por domínio)`
            : `${result.synced} usuários importados para o banco de dados`;
          
          toast.success('Usuários sincronizados com sucesso!', {
            description,
          });
        } else {
          throw new Error(result.details || result.error || 'Falha ao sincronizar usuários');
        }
      } else {
        // Sincronizar TODOS os grupos do Azure AD
        result = await azureSyncGroups(tenantId, clientId, clientSecret, targetTenantId, allowedDomains);
        
        if (result.success) {
          toast.success('Grupos sincronizados com sucesso!', {
            description: `${result.synced} grupos importados para o banco de dados`,
          });
        } else {
          throw new Error(result.details || result.error || 'Falha ao sincronizar grupos');
        }
      }
      
      onOpenChange(false);
      
      // Chamar callback para atualizar a lista
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error: any) {
      console.error('Error importing Azure data:', error);
      toast.error('Erro ao importar dados do Azure', {
        description: error.message || 'Erro desconhecido',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0078D4]" />
            Importar {type === 'users' ? 'Usuários' : 'Grupos'} do Azure AD
          </DialogTitle>
          <DialogDescription>
            Selecione os {type === 'users' ? 'usuários' : 'grupos'} que deseja importar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {data.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Nenhum dado carregado ainda
              </p>
              <Button onClick={loadData}>
                <Users className="w-4 h-4 mr-2" />
                Buscar {type === 'users' ? 'Usuários' : 'Grupos'}
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#834a8b]" />
              <span className="ml-3 text-gray-600">Carregando...</span>
            </div>
          )}

          {data.length > 0 && !loading && (
            <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === data.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-[#834a8b] rounded focus:ring-[#834a8b]"
                  />
                  <span className="text-sm font-medium">
                    Selecionar todos ({data.length})
                  </span>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  {selectedItems.size} selecionados
                </Badge>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {type === 'users' ? (
                  data.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleSelectItem(user.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.has(user.id)}
                        onChange={() => toggleSelectItem(user.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-[#834a8b] rounded focus:ring-[#834a8b]"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.displayName}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </span>
                          {user.jobTitle && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {user.jobTitle}
                            </span>
                          )}
                        </div>
                        {user.department && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {user.department}
                          </Badge>
                        )}
                      </div>
                      {user.accountEnabled ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  ))
                ) : (
                  data.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleSelectItem(group.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.has(group.id)}
                        onChange={() => toggleSelectItem(group.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-[#834a8b] rounded focus:ring-[#834a8b]"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{group.displayName}</p>
                        {group.description && (
                          <p className="text-xs text-gray-500 mt-1">{group.description}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {group.mailEnabled && (
                            <Badge variant="outline" className="text-xs">
                              Mail Enabled
                            </Badge>
                          )}
                          {group.securityEnabled && (
                            <Badge variant="outline" className="text-xs">
                              Security
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={importing}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={importing}
                  className="bg-[#834a8b] hover:bg-[#6d3d75]"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    `Sincronizar Todos ${type === 'users' ? 'os Usuários Ativos' : 'os Grupos'}`
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
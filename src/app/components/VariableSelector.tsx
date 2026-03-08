import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Variable, 
  User, 
  Building2, 
  Lock, 
  Phone, 
  CreditCard, 
  Calendar,
  MapPin,
  Briefcase,
  Search
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

export interface VariableDefinition {
  key: string;
  label: string;
  category: 'user' | 'company' | 'security' | 'custom' | 'system';
  description: string;
  example: string;
  icon?: React.ReactNode;
}

export const defaultVariables: VariableDefinition[] = [
  // Dados do Usuário
  { key: 'nome', label: 'Nome Completo', category: 'user', description: 'Nome completo do alvo', example: 'João da Silva', icon: <User className="w-3 h-3" /> },
  { key: 'primeiro_nome', label: 'Primeiro Nome', category: 'user', description: 'Primeiro nome do alvo', example: 'João', icon: <User className="w-3 h-3" /> },
  { key: 'sobrenome', label: 'Sobrenome', category: 'user', description: 'Sobrenome do alvo', example: 'Silva', icon: <User className="w-3 h-3" /> },
  { key: 'email', label: 'E-mail', category: 'user', description: 'Endereço de e-mail', example: 'joao.silva@empresa.com.br', icon: <User className="w-3 h-3" /> },
  { key: 'celular', label: 'Celular', category: 'user', description: 'Número de celular', example: '(11) 98765-4321', icon: <Phone className="w-3 h-3" /> },
  { key: 'telefone', label: 'Telefone', category: 'user', description: 'Telefone fixo', example: '(11) 3456-7890', icon: <Phone className="w-3 h-3" /> },
  { key: 'cpf', label: 'CPF', category: 'user', description: 'CPF do alvo', example: '123.456.789-00', icon: <CreditCard className="w-3 h-3" /> },
  { key: 'rg', label: 'RG', category: 'user', description: 'RG do alvo', example: '12.345.678-9', icon: <CreditCard className="w-3 h-3" /> },
  { key: 'data_nascimento', label: 'Data de Nascimento', category: 'user', description: 'Data de nascimento', example: '01/01/1990', icon: <Calendar className="w-3 h-3" /> },
  { key: 'cargo', label: 'Cargo', category: 'user', description: 'Cargo do colaborador', example: 'Analista de TI', icon: <Briefcase className="w-3 h-3" /> },
  { key: 'departamento', label: 'Departamento', category: 'user', description: 'Departamento na empresa', example: 'Tecnologia da Informação', icon: <Building2 className="w-3 h-3" /> },
  
  // Dados da Empresa
  { key: 'empresa', label: 'Nome da Empresa', category: 'company', description: 'Nome da empresa', example: 'Acme Corporation', icon: <Building2 className="w-3 h-3" /> },
  { key: 'empresa_cnpj', label: 'CNPJ', category: 'company', description: 'CNPJ da empresa', example: '12.345.678/0001-90', icon: <Building2 className="w-3 h-3" /> },
  { key: 'empresa_endereco', label: 'Endereço', category: 'company', description: 'Endereço da empresa', example: 'Av. Paulista, 1000', icon: <MapPin className="w-3 h-3" /> },
  { key: 'empresa_cidade', label: 'Cidade', category: 'company', description: 'Cidade da empresa', example: 'São Paulo', icon: <MapPin className="w-3 h-3" /> },
  { key: 'empresa_estado', label: 'Estado', category: 'company', description: 'Estado da empresa', example: 'SP', icon: <MapPin className="w-3 h-3" /> },
  { key: 'empresa_cep', label: 'CEP', category: 'company', description: 'CEP da empresa', example: '01310-100', icon: <MapPin className="w-3 h-3" /> },
  
  // Credenciais e Segurança
  { key: 'senha_atual', label: 'Senha Atual (captura)', category: 'security', description: 'Campo para captura de senha', example: '********', icon: <Lock className="w-3 h-3" /> },
  { key: 'senha_nova', label: 'Nova Senha (captura)', category: 'security', description: 'Campo para nova senha', example: '********', icon: <Lock className="w-3 h-3" /> },
  { key: 'token_2fa', label: 'Token 2FA (captura)', category: 'security', description: 'Token de autenticação 2FA', example: '123456', icon: <Lock className="w-3 h-3" /> },
  { key: 'codigo_verificacao', label: 'Código Verificação', category: 'security', description: 'Código de verificação', example: 'ABC123', icon: <Lock className="w-3 h-3" /> },
  
  // Sistema
  { key: 'link_phishing', label: 'Link Phishing', category: 'system', description: 'Link de rastreamento da campanha', example: 'https://tracking.url/xyz', icon: <Variable className="w-3 h-3" /> },
  { key: 'data_atual', label: 'Data Atual', category: 'system', description: 'Data atual formatada', example: '08/03/2026', icon: <Calendar className="w-3 h-3" /> },
  { key: 'hora_atual', label: 'Hora Atual', category: 'system', description: 'Hora atual formatada', example: '14:30', icon: <Calendar className="w-3 h-3" /> },
];

interface VariableSelectorProps {
  onInsert: (variable: string) => void;
  customVariables?: VariableDefinition[];
}

export function VariableSelector({ onInsert, customVariables = [] }: VariableSelectorProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  
  const allVariables = [...defaultVariables, ...customVariables];
  
  const filteredVariables = allVariables.filter(v => 
    v.label.toLowerCase().includes(search.toLowerCase()) ||
    v.key.toLowerCase().includes(search.toLowerCase()) ||
    v.description.toLowerCase().includes(search.toLowerCase())
  );
  
  const variablesByCategory = {
    user: filteredVariables.filter(v => v.category === 'user'),
    company: filteredVariables.filter(v => v.category === 'company'),
    security: filteredVariables.filter(v => v.category === 'security'),
    system: filteredVariables.filter(v => v.category === 'system'),
    custom: filteredVariables.filter(v => v.category === 'custom'),
  };
  
  const handleInsert = (key: string) => {
    onInsert(`{{${key}}}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Variable className="w-4 h-4 mr-2" />
          Inserir Variável
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar variável..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Tabs defaultValue="user" className="w-full">
          <TabsList className="w-full grid grid-cols-5 rounded-none border-b">
            <TabsTrigger value="user" className="text-xs">
              <User className="w-3 h-3 mr-1" />
              Usuário
            </TabsTrigger>
            <TabsTrigger value="company" className="text-xs">
              <Building2 className="w-3 h-3 mr-1" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs">
              <Variable className="w-3 h-3 mr-1" />
              Sistema
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs">
              Custom
            </TabsTrigger>
          </TabsList>
          
          {Object.entries(variablesByCategory).map(([category, variables]) => (
            <TabsContent key={category} value={category} className="p-0 m-0">
              <ScrollArea className="h-[300px]">
                <div className="p-2 space-y-1">
                  {variables.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-500">
                      Nenhuma variável encontrada
                    </div>
                  ) : (
                    variables.map((variable) => (
                      <button
                        key={variable.key}
                        type="button"
                        onClick={() => handleInsert(variable.key)}
                        className="w-full text-left p-2 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {variable.icon}
                              <span className="font-medium text-sm">{variable.label}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{variable.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {`{{${variable.key}}}`}
                              </Badge>
                              <span className="text-xs text-gray-400">Ex: {variable.example}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

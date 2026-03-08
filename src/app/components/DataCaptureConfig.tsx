import React, { useState } from 'react';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  CreditCard, 
  Briefcase, 
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';

export interface CaptureField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date';
  required: boolean;
  placeholder?: string;
  validation?: string;
  icon?: React.ReactNode;
  category: 'common' | 'security' | 'custom';
}

export const defaultCaptureFields: CaptureField[] = [
  { key: 'nome', label: 'Nome Completo', type: 'text', required: true, placeholder: 'Digite seu nome completo', icon: <User className="w-4 h-4" />, category: 'common' },
  { key: 'email', label: 'E-mail', type: 'email', required: true, placeholder: 'seuemail@empresa.com', icon: <Mail className="w-4 h-4" />, category: 'common' },
  { key: 'senha', label: 'Senha', type: 'password', required: false, placeholder: '••••••••', icon: <Lock className="w-4 h-4" />, category: 'security' },
  { key: 'senha_confirmacao', label: 'Confirmar Senha', type: 'password', required: false, placeholder: '••••••••', icon: <Lock className="w-4 h-4" />, category: 'security' },
  { key: 'senha_atual', label: 'Senha Atual', type: 'password', required: false, placeholder: '••••••••', icon: <Lock className="w-4 h-4" />, category: 'security' },
  { key: 'celular', label: 'Celular', type: 'tel', required: false, placeholder: '(11) 98765-4321', icon: <Phone className="w-4 h-4" />, category: 'common' },
  { key: 'cpf', label: 'CPF', type: 'text', required: false, placeholder: '123.456.789-00', icon: <CreditCard className="w-4 h-4" />, category: 'common' },
  { key: 'rg', label: 'RG', type: 'text', required: false, placeholder: '12.345.678-9', icon: <CreditCard className="w-4 h-4" />, category: 'common' },
  { key: 'cargo', label: 'Cargo', type: 'text', required: false, placeholder: 'Seu cargo', icon: <Briefcase className="w-4 h-4" />, category: 'common' },
  { key: 'departamento', label: 'Departamento', type: 'text', required: false, placeholder: 'Seu departamento', icon: <Briefcase className="w-4 h-4" />, category: 'common' },
  { key: 'data_nascimento', label: 'Data de Nascimento', type: 'date', required: false, placeholder: '01/01/1990', icon: <User className="w-4 h-4" />, category: 'common' },
  { key: 'token_2fa', label: 'Token 2FA', type: 'text', required: false, placeholder: '000000', icon: <Lock className="w-4 h-4" />, category: 'security' },
];

interface DataCaptureConfigProps {
  selectedFields: string[];
  onChange: (fields: string[]) => void;
  customFields?: CaptureField[];
  onAddCustomField?: (field: CaptureField) => void;
}

export function DataCaptureConfig({ 
  selectedFields, 
  onChange,
  customFields = [],
  onAddCustomField
}: DataCaptureConfigProps) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customField, setCustomField] = useState<Partial<CaptureField>>({
    label: '',
    type: 'text',
    required: false,
    category: 'custom'
  });

  const allFields = [...defaultCaptureFields, ...customFields];
  
  const toggleField = (key: string) => {
    if (selectedFields.includes(key)) {
      onChange(selectedFields.filter(k => k !== key));
    } else {
      onChange([...selectedFields, key]);
    }
  };

  const handleAddCustomField = () => {
    if (!customField.label) return;
    
    const newField: CaptureField = {
      key: customField.label.toLowerCase().replace(/\s+/g, '_'),
      label: customField.label,
      type: customField.type || 'text',
      required: customField.required || false,
      placeholder: customField.placeholder,
      category: 'custom'
    };

    if (onAddCustomField) {
      onAddCustomField(newField);
      onChange([...selectedFields, newField.key]);
    }

    setCustomField({ label: '', type: 'text', required: false, category: 'custom' });
    setShowCustomForm(false);
  };

  const commonFields = allFields.filter(f => f.category === 'common');
  const securityFields = allFields.filter(f => f.category === 'security');
  const customFieldsList = allFields.filter(f => f.category === 'custom');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Campos de Captura</Label>
          <p className="text-xs text-gray-500 mt-1">
            Selecione quais dados deseja coletar na landing page
          </p>
        </div>
        <Badge variant="outline" className="bg-[#834a8b] text-white">
          {selectedFields.length} campo(s) selecionado(s)
        </Badge>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Todos os dados capturados são armazenados de forma segura e criptografada para análise posterior. 
          Use apenas para fins de treinamento e conscientização.
        </AlertDescription>
      </Alert>

      {/* Campos Comuns */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Informações Básicas</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 border rounded-lg bg-gray-50">
          {commonFields.map((field) => (
            <div
              key={field.key}
              className="flex items-center space-x-2 p-2 hover:bg-white rounded transition-colors"
            >
              <Checkbox
                id={field.key}
                checked={selectedFields.includes(field.key)}
                onCheckedChange={() => toggleField(field.key)}
              />
              <label
                htmlFor={field.key}
                className="flex items-center gap-2 text-sm cursor-pointer flex-1"
              >
                {field.icon}
                <span>{field.label}</span>
                {field.required && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    Recomendado
                  </Badge>
                )}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Campos de Segurança */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-red-700 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Credenciais e Segurança (Alto Risco)
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 border border-red-200 rounded-lg bg-red-50">
          {securityFields.map((field) => (
            <div
              key={field.key}
              className="flex items-center space-x-2 p-2 hover:bg-white rounded transition-colors"
            >
              <Checkbox
                id={field.key}
                checked={selectedFields.includes(field.key)}
                onCheckedChange={() => toggleField(field.key)}
              />
              <label
                htmlFor={field.key}
                className="flex items-center gap-2 text-sm cursor-pointer flex-1"
              >
                {field.icon}
                <span>{field.label}</span>
              </label>
            </div>
          ))}
        </div>
        <p className="text-xs text-red-600 mt-2">
          ⚠️ Campos de senha simulam ataques de credential harvesting. Use com cautela.
        </p>
      </div>

      {/* Campos Customizados */}
      {(customFieldsList.length > 0 || showCustomForm) && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Campos Personalizados</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowCustomForm(!showCustomForm)}
              >
                {showCustomForm ? (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Campo
                  </>
                )}
              </Button>
            </div>

            {showCustomForm && (
              <div className="border rounded-lg p-4 space-y-3 bg-white">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="custom-label">Nome do Campo</Label>
                    <Input
                      id="custom-label"
                      value={customField.label}
                      onChange={(e) => setCustomField({ ...customField, label: e.target.value })}
                      placeholder="Ex: Matrícula"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-type">Tipo</Label>
                    <select
                      id="custom-type"
                      value={customField.type}
                      onChange={(e) => setCustomField({ ...customField, type: e.target.value as any })}
                      className="w-full mt-1 h-10 px-3 rounded-md border border-gray-300 text-sm"
                    >
                      <option value="text">Texto</option>
                      <option value="email">E-mail</option>
                      <option value="password">Senha</option>
                      <option value="tel">Telefone</option>
                      <option value="number">Número</option>
                      <option value="date">Data</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="custom-placeholder">Placeholder (Opcional)</Label>
                  <Input
                    id="custom-placeholder"
                    value={customField.placeholder}
                    onChange={(e) => setCustomField({ ...customField, placeholder: e.target.value })}
                    placeholder="Texto de exemplo no campo"
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCustomField}
                  className="w-full bg-[#834a8b] hover:bg-[#9a5ba1]"
                >
                  Adicionar Campo Personalizado
                </Button>
              </div>
            )}

            {customFieldsList.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 border rounded-lg bg-purple-50">
                {customFieldsList.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-center space-x-2 p-2 hover:bg-white rounded transition-colors"
                  >
                    <Checkbox
                      id={field.key}
                      checked={selectedFields.includes(field.key)}
                      onCheckedChange={() => toggleField(field.key)}
                    />
                    <label
                      htmlFor={field.key}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {field.label}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {field.type}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Preview dos campos selecionados */}
      {selectedFields.length > 0 && (
        <div className="border-t pt-4">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Preview do Formulário de Captura
          </Label>
          <div className="border rounded-lg p-4 bg-white space-y-3 max-h-[300px] overflow-y-auto">
            {selectedFields.map((key) => {
              const field = allFields.find(f => f.key === key);
              if (!field) return null;
              
              return (
                <div key={key}>
                  <Label className="text-sm flex items-center gap-2">
                    {field.icon}
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder || field.label}
                    disabled
                    className="mt-1"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

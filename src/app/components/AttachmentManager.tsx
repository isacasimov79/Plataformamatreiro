import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Upload, 
  File, 
  FileText, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  X, 
  Download,
  AlertCircle 
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export interface AttachmentFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

interface AttachmentManagerProps {
  attachments: AttachmentFile[];
  onChange: (attachments: AttachmentFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // em MB
  acceptedTypes?: string[];
  context?: 'email' | 'landing_page';
}

export function AttachmentManager({ 
  attachments, 
  onChange, 
  maxFiles = 5,
  maxSize = 10, // 10MB
  acceptedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.jpg', '.png'],
  context = 'email'
}: AttachmentManagerProps) {
  const [error, setError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="w-5 h-5 text-blue-600" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);

    // Validações
    if (attachments.length + files.length > maxFiles) {
      setError(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    const oversizedFiles = files.filter(f => f.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Alguns arquivos excedem o tamanho máximo de ${maxSize}MB`);
      return;
    }

    // Criar objetos de anexo
    const newAttachments: AttachmentFile[] = await Promise.all(
      files.map(async (file) => {
        let preview: string | undefined;
        
        // Gerar preview para imagens
        if (file.type.startsWith('image/')) {
          preview = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }

        return {
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview,
        };
      })
    );

    onChange([...attachments, ...newAttachments]);
    
    // Limpar input
    e.target.value = '';
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">
          Anexos {context === 'landing_page' ? 'da Landing Page' : 'do E-mail'}
        </Label>
        <Badge variant="outline" className="text-xs">
          {attachments.length} / {maxFiles} arquivos
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Área de upload */}
      {attachments.length < maxFiles && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#834a8b] transition-colors">
          <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 mb-2">
            Arraste arquivos ou clique para selecionar
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Formatos aceitos: {acceptedTypes.join(', ')} | Máx: {maxSize}MB por arquivo
          </p>
          <input
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            id={`attachment-upload-${context}`}
          />
          <label htmlFor={`attachment-upload-${context}`}>
            <Button type="button" variant="outline" size="sm" asChild>
              <span>Escolher Arquivos</span>
            </Button>
          </label>
        </div>
      )}

      {/* Lista de anexos */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Arquivos Anexados</Label>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                {attachment.preview ? (
                  <img
                    src={attachment.preview}
                    alt={attachment.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded">
                    {getFileIcon(attachment.type)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {attachment.type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(attachment.id)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {context === 'landing_page' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-medium mb-1">Anexos na Landing Page</p>
              <p>
                Os arquivos anexados ficarão disponíveis para download na landing page. 
                Isso simula cenários onde o atacante oferece documentos "importantes" para download.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

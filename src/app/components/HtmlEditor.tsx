import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { VariableSelector, defaultVariables } from './VariableSelector';
import { Code, Eye, Smartphone, Monitor, Split } from 'lucide-react';
import DOMPurify from 'dompurify';

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'email' | 'landing_page';
  subjectLine?: string;
}

export function HtmlEditor({ value, onChange, type = 'email', subjectLine }: HtmlEditorProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'split'>('split');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertVariable = (variable: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newValue = value.substring(0, start) + variable + value.substring(end);
      onChange(newValue);
      
      // Restaurar foco e posição do cursor
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPosition = start + variable.length;
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    } else {
      onChange(value + variable);
    }
  };

  // Renderizar preview com variáveis substituídas por exemplos
  const getPreviewHtml = () => {
    let html = value;
    
    // Substituir variáveis por valores de exemplo
    defaultVariables.forEach((variable) => {
      const regex = new RegExp(`{{${variable.key}}}`, 'g');
      html = html.replace(regex, `<span class="variable-highlight" title="${variable.label}">${variable.example}</span>`);
    });

    // Adicionar CSS inline para destacar variáveis
    const styledHtml = `
      <style>
        .variable-highlight {
          background-color: #fef3c7;
          border-bottom: 2px dotted #f59e0b;
          padding: 0 2px;
          cursor: help;
        }
        body {
          margin: 0;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        a {
          color: #2563eb;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
      ${html}
    `;

    return DOMPurify.sanitize(styledHtml);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          {type === 'email' ? 'Conteúdo HTML do E-mail' : 'HTML da Landing Page'}
        </Label>
        <div className="flex items-center gap-2">
          <VariableSelector onInsert={handleInsertVariable} />
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                type="button"
                size="sm"
                variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                onClick={() => setPreviewMode('desktop')}
                className="h-7 px-2"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                onClick={() => setPreviewMode('mobile')}
                className="h-7 px-2"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="code">
            <Code className="w-4 h-4 mr-2" />
            Código
          </TabsTrigger>
          <TabsTrigger value="split">
            <Split className="w-4 h-4 mr-2" />
            Dividido
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="mt-3">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Cole o HTML do ${type === 'email' ? 'e-mail' : 'landing page'} aqui...`}
            className="min-h-[400px] font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="split" className="mt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-2">Código HTML</div>
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="HTML..."
                className="min-h-[400px] font-mono text-sm"
              />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-2">Preview</div>
              <div className={`border rounded-md min-h-[400px] overflow-auto bg-white ${
                previewMode === 'mobile' ? 'max-w-[375px] mx-auto' : ''
              }`}>
                {type === 'email' && subjectLine && (
                  <div className="bg-gray-50 p-3 border-b text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-500 text-xs">Assunto:</span>
                      <span className="font-medium">{subjectLine}</span>
                    </div>
                  </div>
                )}
                <div 
                  className="p-4"
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-3">
          <div className={`border rounded-md min-h-[400px] overflow-auto bg-white mx-auto ${
            previewMode === 'mobile' ? 'max-w-[375px]' : ''
          }`}>
            {type === 'email' && subjectLine && (
              <div className="bg-gray-50 p-4 border-b">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-20">De:</span>
                    <span className="font-medium">noreply@empresa.com.br</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-20">Para:</span>
                    <span className="font-medium">{'{{email}}'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-20">Assunto:</span>
                    <span className="font-medium">{subjectLine}</span>
                  </div>
                </div>
              </div>
            )}
            <div 
              className="p-6"
              dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Badge variant="outline" className="bg-white border-blue-300 text-blue-700 mt-0.5">
            Dica
          </Badge>
          <p className="text-xs text-blue-800">
            Use o botão "Inserir Variável" para adicionar campos dinâmicos ao template. 
            As variáveis destacadas em amarelo no preview mostram como serão substituídas.
          </p>
        </div>
      </div>
    </div>
  );
}

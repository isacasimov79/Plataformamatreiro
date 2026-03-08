import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Globe, Building2, Paperclip, Mail, Globe2, Lock, User } from 'lucide-react';
import DOMPurify from 'dompurify';
import { defaultVariables } from './VariableSelector';

interface Template {
  id: string;
  name: string;
  subject: string;
  category: string;
  tenantId: string | null;
  hasAttachment?: boolean;
  htmlContent?: string;
  landingPageHtml?: string;
  captureFields?: string[];
  attachmentCount?: number;
  landingAttachmentCount?: number;
}

interface ViewTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
}

export function ViewTemplateDialog({ open, onOpenChange, template }: ViewTemplateDialogProps) {
  if (!template) return null;

  const categoryLabels: Record<string, string> = {
    'credential-harvest': 'Coleta de Credenciais',
    'attachment': 'Anexo Malicioso',
    'link': 'Link Malicioso',
    'social-engineering': 'Engenharia Social',
    'spear-phishing': 'Spear Phishing',
    'ceo-fraud': 'CEO Fraud',
  };

  const getPreviewHtml = (html: string) => {
    let processedHtml = html;
    
    // Substituir variáveis por valores de exemplo
    defaultVariables.forEach((variable) => {
      const regex = new RegExp(`{{${variable.key}}}`, 'g');
      processedHtml = processedHtml.replace(regex, `<span class="variable-highlight" title="${variable.label}">${variable.example}</span>`);
    });

    // Adicionar CSS inline
    const styledHtml = `
      <style>
        .variable-highlight {
          background-color: #fef3c7;
          border-bottom: 2px dotted #f59e0b;
          padding: 0 2px;
          cursor: help;
        }
      </style>
      ${processedHtml}
    `;

    return DOMPurify.sanitize(styledHtml);
  };

  const hasLandingPage = template.landingPageHtml && template.landingPageHtml.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{template.name}</DialogTitle>
              <DialogDescription className="mt-2">
                Visualização completa do template de phishing
              </DialogDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {template.tenantId === null ? (
                <Badge variant="outline">
                  <Globe className="w-3 h-3 mr-1" />
                  Global
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Building2 className="w-3 h-3 mr-1" />
                  Cliente
                </Badge>
              )}
              {template.hasAttachment && (
                <Badge variant="outline">
                  <Paperclip className="w-3 h-3 mr-1" />
                  {template.attachmentCount || 1} anexo(s)
                </Badge>
              )}
              {hasLandingPage && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  <Globe2 className="w-3 h-3 mr-1" />
                  Landing Page
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informações */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Categoria</h3>
              <Badge variant="secondary">{categoryLabels[template.category] || template.category}</Badge>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Assunto do E-mail
              </h3>
              <p className="text-base font-medium bg-gray-50 p-3 rounded border border-gray-200">
                {template.subject}
              </p>
            </div>

            <Separator />

            {/* Tabs para E-mail e Landing Page */}
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">
                  <Mail className="w-4 h-4 mr-2" />
                  E-mail
                </TabsTrigger>
                <TabsTrigger value="landing" disabled={!hasLandingPage}>
                  <Globe2 className="w-4 h-4 mr-2" />
                  Landing Page
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4 mt-4">
                {/* Preview do E-mail */}
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-3">Preview do E-mail</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Cabeçalho simulado do e-mail */}
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 w-16">De:</span>
                          <span className="font-medium">noreply@empresa.com.br</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 w-16">Para:</span>
                          <span className="font-medium">{'{{email}}'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 w-16">Assunto:</span>
                          <span className="font-medium">{template.subject}</span>
                        </div>
                      </div>
                    </div>

                    {/* Corpo do e-mail */}
                    <div className="bg-white p-6">
                      {template.htmlContent ? (
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: getPreviewHtml(template.htmlContent) }}
                        />
                      ) : (
                        <div className="prose max-w-none">
                          <p className="text-gray-700 mb-4">
                            Prezado(a) {'{{nome}}'}
                          </p>
                          <p className="text-gray-700 mb-4">
                            {template.category === 'credential-harvest' && (
                              <>
                                Detectamos uma atividade suspeita em sua conta e, por medidas de segurança,
                                solicitamos que você redefina sua senha imediatamente.
                              </>
                            )}
                            {template.category === 'attachment' && (
                              <>
                                Segue em anexo o documento solicitado para sua análise. Por favor, revise
                                o conteúdo e nos retorne com seu parecer.
                              </>
                            )}
                            {template.category === 'link' && (
                              <>
                                Para confirmar suas informações de cadastro, clique no link abaixo e
                                preencha o formulário de atualização.
                              </>
                            )}
                            {template.category === 'social-engineering' && (
                              <>
                                Você foi selecionado para participar de nossa pesquisa de satisfação.
                                Clique aqui para responder e ganhar um prêmio exclusivo!
                              </>
                            )}
                            {template.category === 'spear-phishing' && (
                              <>
                                Conforme nossa conversa anterior, segue o documento confidencial que
                                discutimos. Acesse o link para visualizar.
                              </>
                            )}
                            {template.category === 'ceo-fraud' && (
                              <>
                                Preciso que você realize uma transferência urgente. Por favor, entre em
                                contato comigo assim que possível.
                              </>
                            )}
                          </p>
                          <p className="text-gray-700 mb-4">
                            <a
                              href="#"
                              className="text-blue-600 underline hover:text-blue-800"
                              onClick={(e) => e.preventDefault()}
                            >
                              {'{{link_phishing}}'}
                            </a>
                          </p>
                          <p className="text-gray-700 mb-4">
                            Atenciosamente,
                            <br />
                            Equipe de TI
                            <br />
                            {'{{empresa}}'}
                          </p>
                        </div>
                      )}

                      {template.hasAttachment && (
                        <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded flex items-center gap-3">
                          <Paperclip className="w-5 h-5 text-gray-500" />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">documento_importante.pdf</div>
                            <div className="text-gray-500 text-xs">245 KB</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="landing" className="space-y-4 mt-4">
                {hasLandingPage && (
                  <>
                    {/* Preview da Landing Page */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-3">Preview da Landing Page</h3>
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <div 
                          className="p-6"
                          dangerouslySetInnerHTML={{ __html: getPreviewHtml(template.landingPageHtml!) }}
                        />
                      </div>
                    </div>

                    {/* Campos de Captura */}
                    {template.captureFields && template.captureFields.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-red-900 mb-3 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Dados Capturados nesta Landing Page
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {template.captureFields.map((field) => {
                            const varDef = defaultVariables.find(v => v.key === field);
                            return (
                              <Badge key={field} variant="outline" className="bg-white text-xs justify-start">
                                {varDef?.icon || <User className="w-3 h-3 mr-1" />}
                                {varDef?.label || field}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Anexos da Landing */}
                    {template.landingAttachmentCount && template.landingAttachmentCount > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-amber-900 mb-2 flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          Anexos Disponíveis para Download
                        </h4>
                        <p className="text-xs text-amber-800">
                          {template.landingAttachmentCount} arquivo(s) disponível(is) na landing page
                        </p>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>

            {/* Variáveis disponíveis */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Variáveis Disponíveis</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {defaultVariables.slice(0, 12).map((variable) => (
                  <code key={variable.key} className="bg-white px-2 py-1 rounded border border-blue-200">
                    {`{{${variable.key}}}`}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
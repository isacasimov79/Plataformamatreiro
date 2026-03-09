import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { FileText, Upload, Mail, Globe2, Sparkles } from 'lucide-react';
import { HtmlEditor } from './HtmlEditor';
import { AttachmentManager, AttachmentFile } from './AttachmentManager';
import { DataCaptureConfig, CaptureField } from './DataCaptureConfig';
import { emailTemplateExamples, landingPageExamples } from './TemplateExamples';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { createTemplate } from '../lib/supabaseApi';

interface NewTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateCreated?: () => void;
}

export function NewTemplateDialog({ open, onOpenChange, onTemplateCreated }: NewTemplateDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    category: '',
    htmlContent: '',
    landingPageHtml: '',
    isGlobal: false,
    hasAttachment: false,
    hasLandingPage: false,
  });
  const [emailAttachments, setEmailAttachments] = useState<AttachmentFile[]>([]);
  const [landingPageAttachments, setLandingPageAttachments] = useState<AttachmentFile[]>([]);
  const [captureFields, setCaptureFields] = useState<string[]>(['nome', 'email']);
  const [customCaptureFields, setCustomCaptureFields] = useState<CaptureField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.subject || !formData.category || !formData.htmlContent) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.hasLandingPage && !formData.landingPageHtml) {
      toast.error('Configure o HTML da landing page');
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados para salvar no banco
      const templateData = {
        name: formData.name,
        subject: formData.subject,
        category: formData.category,
        htmlContent: formData.htmlContent,
        bodyHtml: formData.htmlContent, // Compatibilidade com backend
        landingPageHtml: formData.hasLandingPage ? formData.landingPageHtml : null,
        hasAttachment: formData.hasAttachment,
        attachmentCount: emailAttachments.length,
        landingAttachmentCount: landingPageAttachments.length,
        captureFields: [...captureFields, ...customCaptureFields.map(f => f.key)],
        tenantId: formData.isGlobal ? null : 'current-tenant', // Adaptar conforme contexto
      };

      await createTemplate(templateData);

      const details = [];
      if (emailAttachments.length > 0) details.push(`${emailAttachments.length} anexo(s) no e-mail`);
      if (formData.hasLandingPage) details.push(`Landing page com ${captureFields.length} campos`);
      if (landingPageAttachments.length > 0) details.push(`${landingPageAttachments.length} anexo(s) na landing`);

      toast.success('Template criado com sucesso!', {
        description: `"${formData.name}" foi adicionado à biblioteca${details.length > 0 ? ' • ' + details.join(' • ') : ''}`,
      });

      // Reset form
      setFormData({
        name: '',
        subject: '',
        category: '',
        htmlContent: '',
        landingPageHtml: '',
        isGlobal: false,
        hasAttachment: false,
        hasLandingPage: false,
      });
      setEmailAttachments([]);
      setLandingPageAttachments([]);
      setCaptureFields(['nome', 'email']);
      setCustomCaptureFields([]);
      
      // Notificar parent component
      if (onTemplateCreated) {
        onTemplateCreated();
      }
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast.error('Erro ao criar template', {
        description: error.message || 'Não foi possível salvar o template.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Template de Phishing</DialogTitle>
          <DialogDescription>
            Configure o template de e-mail e landing page para campanhas de simulação
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Template *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Phishing - Reset de Senha"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category" className="mt-1">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credential-harvest">Coleta de Credenciais</SelectItem>
                    <SelectItem value="attachment">Anexo Malicioso</SelectItem>
                    <SelectItem value="link">Link Malicioso</SelectItem>
                    <SelectItem value="social-engineering">Engenharia Social</SelectItem>
                    <SelectItem value="spear-phishing">Spear Phishing</SelectItem>
                    <SelectItem value="ceo-fraud">CEO Fraud</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Assunto do E-mail *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ex: Ação Urgente: Redefina sua senha imediatamente"
                className="mt-1"
              />
            </div>
          </div>

          {/* E-mail e Landing Page */}
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">
                <Mail className="w-4 h-4 mr-2" />
                Template de E-mail
              </TabsTrigger>
              <TabsTrigger value="landing" disabled={!formData.hasLandingPage}>
                <Globe2 className="w-4 h-4 mr-2" />
                Landing Page
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 mt-4">
              {/* Editor HTML do E-mail */}
              <HtmlEditor
                value={formData.htmlContent}
                onChange={(value) => setFormData({ ...formData, htmlContent: value })}
                type="email"
                subjectLine={formData.subject}
              />

              {/* Anexos do E-mail */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>E-mail com Anexo</Label>
                    <p className="text-xs text-gray-500">
                      Simule phishing via anexo malicioso
                    </p>
                  </div>
                  <Switch
                    checked={formData.hasAttachment}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasAttachment: checked })}
                  />
                </div>

                {formData.hasAttachment && (
                  <AttachmentManager
                    attachments={emailAttachments}
                    onChange={setEmailAttachments}
                    context="email"
                    maxFiles={3}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="landing" className="space-y-4 mt-4">
              {/* Editor HTML da Landing Page */}
              <HtmlEditor
                value={formData.landingPageHtml}
                onChange={(value) => setFormData({ ...formData, landingPageHtml: value })}
                type="landing_page"
              />

              {/* Configuração de Campos de Captura */}
              <div className="border-t pt-4">
                <DataCaptureConfig
                  selectedFields={captureFields}
                  onChange={setCaptureFields}
                  customFields={customCaptureFields}
                  onAddCustomField={(field) => setCustomCaptureFields([...customCaptureFields, field])}
                />
              </div>

              {/* Anexos da Landing Page */}
              <div className="border-t pt-4">
                <AttachmentManager
                  attachments={landingPageAttachments}
                  onChange={setLandingPageAttachments}
                  context="landing_page"
                  maxFiles={5}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Opções */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="space-y-0.5">
                <Label>Incluir Landing Page</Label>
                <p className="text-xs text-purple-700">
                  Crie uma página de captura de dados vinculada ao e-mail
                </p>
              </div>
              <Switch
                checked={formData.hasLandingPage}
                onCheckedChange={(checked) => setFormData({ ...formData, hasLandingPage: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-0.5">
                <Label>Template Global</Label>
                <p className="text-xs text-blue-700">
                  Disponível para todos os clientes da plataforma
                </p>
              </div>
              <Switch
                checked={formData.isGlobal}
                onCheckedChange={(checked) => setFormData({ ...formData, isGlobal: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#834a8b] hover:bg-[#9a5ba1]" disabled={isSubmitting}>
              <FileText className="w-4 h-4 mr-2" />
              Criar Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
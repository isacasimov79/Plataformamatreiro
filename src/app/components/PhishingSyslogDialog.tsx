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
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Server, Activity, MousePointer, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

interface PhishingSyslogDialogProps {
  campaignId: string;
  campaignName: string;
}

export function PhishingSyslogDialog({
  campaignId,
  campaignName,
}: PhishingSyslogDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sendEmailOpen, setSendEmailOpen] = useState(true);
  const [sendLinkClick, setSendLinkClick] = useState(true);
  const [sendDataSubmit, setSendDataSubmit] = useState(true);
  const [sendAttachmentOpen, setSendAttachmentOpen] = useState(false);

  const handleSave = () => {
    const enabledEvents = [];
    if (sendEmailOpen) enabledEvents.push('Abertura de E-mail');
    if (sendLinkClick) enabledEvents.push('Clique em Link');
    if (sendDataSubmit) enabledEvents.push('Submissão de Dados');
    if (sendAttachmentOpen) enabledEvents.push('Abertura de Anexo');

    toast.success('Configuração de Syslog salva!', {
      description: `Eventos habilitados para "${campaignName}": ${enabledEvents.join(', ')}`,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-[#242545] text-[#242545] hover:bg-[#242545] hover:text-white"
        >
          <Server className="w-4 h-4 mr-2" />
          Syslog
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#834a8b]" />
            Configurar Envio de Eventos via Syslog
          </DialogTitle>
          <DialogDescription>
            Configure quais eventos de phishing desta campanha devem ser enviados ao servidor
            Syslog em tempo real
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Campaign Info */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#834a8b]" />
              <div>
                <p className="font-medium text-[#242545]">Campanha: {campaignName}</p>
                <p className="text-sm text-gray-600">ID: {campaignId}</p>
              </div>
            </div>
          </div>

          {/* Event Toggles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#242545]">Eventos de Phishing</h3>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Abertura de E-mail</p>
                  <p className="text-sm text-gray-500">
                    Quando o alvo abre o e-mail de phishing
                  </p>
                </div>
              </div>
              <Switch checked={sendEmailOpen} onCheckedChange={setSendEmailOpen} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MousePointer className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium">Clique em Link</p>
                  <p className="text-sm text-gray-500">
                    Quando o alvo clica no link malicioso
                  </p>
                </div>
              </div>
              <Switch checked={sendLinkClick} onCheckedChange={setSendLinkClick} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium">Submissão de Dados</p>
                  <p className="text-sm text-gray-500">
                    Quando o alvo submete credenciais ou dados sensíveis
                  </p>
                </div>
              </div>
              <Switch checked={sendDataSubmit} onCheckedChange={setSendDataSubmit} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Abertura de Anexo</p>
                  <p className="text-sm text-gray-500">
                    Quando o alvo abre um anexo malicioso (se aplicável)
                  </p>
                </div>
              </div>
              <Switch
                checked={sendAttachmentOpen}
                onCheckedChange={setSendAttachmentOpen}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <Server className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Servidor Syslog Configurado</p>
                <p className="text-blue-700">
                  Host: <span className="font-mono">syslog.empresa.com.br:514</span>
                </p>
                <p className="text-blue-700">
                  Protocolo: <span className="font-mono">UDP</span> | Facility:{' '}
                  <span className="font-mono">local0</span>
                </p>
              </div>
            </div>
          </div>

          {/* Event Format Example */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Formato da Mensagem Syslog
            </Label>
            <div className="p-3 bg-gray-900 rounded-lg">
              <code className="text-xs text-green-400 font-mono">
                {`<134>Mar 8 10:30:15 matreiro[phishing]: campaign_id="${campaignId}" event="EMAIL_OPEN" target="joao.silva@empresa.com.br" ip="189.32.78.99" user_agent="Mozilla/5.0..."`}
              </code>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-[#834a8b] hover:bg-[#6d3d75]">
            Salvar Configuração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

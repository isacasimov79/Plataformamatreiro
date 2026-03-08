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
import { Progress } from './ui/progress';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Mail,
  Eye,
  MousePointer,
  AlertTriangle,
  Calendar,
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  scheduledAt?: string;
  createdAt: string;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    submitted: number;
  };
  templateId: string;
  tenantId: string;
}

interface ViewCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
}

export function ViewCampaignDialog({ open, onOpenChange, campaign }: ViewCampaignDialogProps) {
  if (!campaign) return null;

  const openRate = campaign.stats.sent > 0 
    ? ((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(1)
    : '0';
  const clickRate = campaign.stats.sent > 0 
    ? ((campaign.stats.clicked / campaign.stats.sent) * 100).toFixed(1)
    : '0';
  const compromiseRate = campaign.stats.sent > 0 
    ? ((campaign.stats.submitted / campaign.stats.sent) * 100).toFixed(1)
    : '0';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-blue-600">Em Execução</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">Concluída</Badge>;
      case 'scheduled':
        return <Badge className="bg-orange-600">Agendada</Badge>;
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'paused':
        return <Badge className="bg-gray-600">Pausada</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'email':
        return <Badge variant="secondary">E-mail</Badge>;
      case 'sms':
        return <Badge variant="secondary">SMS</Badge>;
      case 'landing_page':
        return <Badge variant="secondary">Landing Page</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{campaign.name}</DialogTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge(campaign.status)}
                {getTypeBadge(campaign.type)}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Métricas Principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Enviados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaign.stats.sent}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Abertos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{campaign.stats.opened}</div>
                <p className="text-xs text-gray-500 mt-1">{openRate}% taxa de abertura</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <MousePointer className="w-4 h-4" />
                  Cliques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{campaign.stats.clicked}</div>
                <p className="text-xs text-gray-500 mt-1">{clickRate}% taxa de clique</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Comprometidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{campaign.stats.submitted}</div>
                <p className="text-xs text-gray-500 mt-1">{compromiseRate}% comprometimento</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Detalhes da Campanha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Informações da Campanha</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Data de Criação</div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(campaign.createdAt), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                </div>

                {campaign.scheduledAt && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Agendamento</div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(campaign.scheduledAt), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Template</div>
                    <div className="text-sm text-gray-600">Template ID: {campaign.templateId}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Alvos</div>
                    <div className="text-sm text-gray-600">{campaign.stats.sent} usuários</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Progresso da Campanha</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Taxa de Abertura</span>
                    <span className="text-sm font-medium">{openRate}%</span>
                  </div>
                  <Progress value={parseFloat(openRate)} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Taxa de Clique</span>
                    <span className="text-sm font-medium">{clickRate}%</span>
                  </div>
                  <Progress value={parseFloat(clickRate)} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Taxa de Comprometimento</span>
                    <span className="text-sm font-medium text-red-600">{compromiseRate}%</span>
                  </div>
                  <Progress value={parseFloat(compromiseRate)} className="h-2 bg-red-100" />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeline de Eventos */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Timeline de Eventos</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-green-900">Campanha Criada</div>
                  <div className="text-xs text-green-700">
                    {format(new Date(campaign.createdAt), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>
              </div>

              {campaign.status === 'running' && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-blue-900">Em Execução</div>
                    <div className="text-xs text-blue-700">
                      {campaign.stats.sent} e-mails enviados até o momento
                    </div>
                  </div>
                </div>
              )}

              {campaign.status === 'completed' && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Campanha Finalizada</div>
                    <div className="text-xs text-gray-700">
                      Todos os e-mails foram processados
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Análise de Risco */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Análise de Risco
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-red-700 font-medium mb-1">Nível de Risco</div>
                <Badge className={
                  parseFloat(compromiseRate) > 30 ? 'bg-red-600' :
                  parseFloat(compromiseRate) > 15 ? 'bg-orange-600' : 'bg-green-600'
                }>
                  {parseFloat(compromiseRate) > 30 ? 'Alto' :
                   parseFloat(compromiseRate) > 15 ? 'Médio' : 'Baixo'}
                </Badge>
              </div>
              <div>
                <div className="text-red-700 font-medium mb-1">Usuários em Risco</div>
                <div className="text-2xl font-bold text-red-900">{campaign.stats.submitted}</div>
              </div>
              <div>
                <div className="text-red-700 font-medium mb-1">Recomendação</div>
                <div className="text-xs text-red-700">
                  {parseFloat(compromiseRate) > 30 
                    ? 'Treinamento urgente necessário'
                    : parseFloat(compromiseRate) > 15 
                    ? 'Reforçar conscientização'
                    : 'Manter treinamentos regulares'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

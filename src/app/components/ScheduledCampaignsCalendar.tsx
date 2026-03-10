import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, Repeat, Play, Pause } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { useTranslation } from 'react-i18next';

interface ScheduledCampaign {
  id: string;
  tenantId: string;
  name: string;
  templateId: string;
  targetGroupIds: string[];
  recurrence: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate?: string;
  time: string;
  timezone: string;
  status: 'active' | 'paused';
  lastExecuted?: string;
  nextExecution: string;
  createdAt: string;
}

export function ScheduledCampaignsCalendar() {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<ScheduledCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-99a65fc7`;

  useEffect(() => {
    fetchScheduledCampaigns();
  }, []);

  const fetchScheduledCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/scheduled-campaigns`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching scheduled campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecurrenceLabel = (recurrence: string) => {
    const labels: Record<string, string> = {
      daily: 'Diariamente',
      weekly: 'Semanalmente',
      monthly: 'Mensalmente',
    };
    return labels[recurrence] || recurrence;
  };

  const getRecurrenceColor = (recurrence: string) => {
    const colors: Record<string, string> = {
      daily: 'bg-blue-100 text-blue-800',
      weekly: 'bg-green-100 text-green-800',
      monthly: 'bg-purple-100 text-purple-800',
    };
    return colors[recurrence] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Campanhas Agendadas
        </CardTitle>
        <CardDescription>
          Visualize e gerencie campanhas recorrentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma campanha agendada</p>
            <p className="text-sm mt-2">Crie agendamentos recorrentes para automatizar campanhas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-4 rounded-lg border bg-gradient-to-r from-muted/30 to-muted/10 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{campaign.name}</h4>
                      <Badge className={getRecurrenceColor(campaign.recurrence)}>
                        <Repeat className="h-3 w-3 mr-1" />
                        {getRecurrenceLabel(campaign.recurrence)}
                      </Badge>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status === 'active' ? (
                          <Play className="h-3 w-3 mr-1" />
                        ) : (
                          <Pause className="h-3 w-3 mr-1" />
                        )}
                        {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{campaign.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Início: {formatDate(campaign.startDate)}</span>
                      </div>
                      {campaign.endDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Fim: {formatDate(campaign.endDate)}</span>
                        </div>
                      )}
                      {campaign.lastExecuted && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Última: {formatDate(campaign.lastExecuted)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        <strong>Próxima execução:</strong>{' '}
                        {new Date(campaign.nextExecution).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                    <Button size="sm" variant="ghost">
                      {campaign.status === 'active' ? 'Pausar' : 'Ativar'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

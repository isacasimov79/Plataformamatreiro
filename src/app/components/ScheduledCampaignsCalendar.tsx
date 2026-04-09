import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, Repeat, Play, Pause } from 'lucide-react';
import { getCampaigns } from '../lib/apiLocal';
import { useTranslation } from 'react-i18next';

interface ScheduledCampaign {
  id: string | number;
  name: string;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export function ScheduledCampaignsCalendar() {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<ScheduledCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduledCampaigns();
  }, []);

  const fetchScheduledCampaigns = async () => {
    setLoading(true);
    try {
      const data: any = await getCampaigns();
      // Filter to show scheduled/active campaigns
      const allCampaigns = Array.isArray(data) ? data : (data?.results || []);
      const scheduled = allCampaigns.filter(
        (c: any) => c.status === 'scheduled' || c.status === 'active'
      );
      setCampaigns(scheduled);
    } catch (error) {
      console.error('Error fetching scheduled campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Agendada',
      active: 'Ativa',
      paused: 'Pausada',
      completed: 'Concluída',
      draft: 'Rascunho',
    };
    return labels[status] || status;
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
          Visualize e gerencie campanhas ativas e agendadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma campanha agendada ou ativa</p>
            <p className="text-sm mt-2">Crie campanhas com data de início para vê-las aqui</p>
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
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status === 'active' ? (
                          <Play className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {getStatusLabel(campaign.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      {campaign.start_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Início: {formatDate(campaign.start_date)}</span>
                        </div>
                      )}
                      {campaign.end_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Fim: {formatDate(campaign.end_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline">
                      Editar
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

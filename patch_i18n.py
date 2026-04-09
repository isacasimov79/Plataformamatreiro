import json

pt = {
    "title": "Analytics Avançado",
    "subtitle": "Métricas avançadas e análise de vulnerabilidade",
    "timeRange": "Selecione o período",
    "timeRanges": { "7d": "Últimos 7 dias", "30d": "Últimos 30 dias", "90d": "Últimos 90 dias", "1y": "Último ano" },
    "metrics": { "sent": "E-mails Enviados", "openRate": "Taxa de Abertura", "clickRate": "Taxa de Clique", "submitRate": "Taxa de Comprometimento" },
    "charts": { "timeSeriesTitle": "Evolução Temporal", "timeSeriesDesc": "Métricas de performance ao longo do período", "timeSeriesOpened": "Abertos", "timeSeriesClicked": "Clicados", "timeSeriesSubmitted": "Submetidos", "noData": "Sem dados temporais para o período selecionado", "runCampaigns": "Execute campanhas para gerar dados" },
    "departments": { "title": "Vulnerabilidade por Departamento", "subtitle": "Taxa de cliques em phishing por departamento", "clicked": "Clicaram", "total": "Total", "noData": "Sem dados de departamento. Importe alvos com departamentos via integração." },
    "distribution": { "title": "Distribuição de Eventos", "subtitle": "Proporção de cada tipo de evento", "sent": "Enviados", "opened": "Abertos", "clicked": "Clicados", "submitted": "Submetidos", "noData": "Sem dados de campanha para exibir" },
    "ranking": { "title": "Ranking de Departamentos", "subtitle": "Classificação por taxa de cliques (menor é melhor)", "position": "Posição", "department": "Departamento", "total": "Total", "clicked": "Clicaram", "rate": "Taxa", "status": "Status" },
    "status": { "excellent": "Excelente", "good": "Bom", "regular": "Regular", "critical": "Crítico" }
}

en = {
    "title": "Enhanced Analytics",
    "subtitle": "Advanced metrics and vulnerability analysis",
    "timeRange": "Select time range",
    "timeRanges": { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days", "1y": "Last year" },
    "metrics": { "sent": "Emails Sent", "openRate": "Open Rate", "clickRate": "Click Rate", "submitRate": "Compromise Rate" },
    "charts": { "timeSeriesTitle": "Evolution over Time", "timeSeriesDesc": "Performance metrics across selected period", "timeSeriesOpened": "Opened", "timeSeriesClicked": "Clicked", "timeSeriesSubmitted": "Submitted", "noData": "No temporal data for selected period", "runCampaigns": "Run campaigns to generate data" },
    "departments": { "title": "Vulnerability by Department", "subtitle": "Phishing click rate by department", "clicked": "Clicked", "total": "Total", "noData": "No department data. Import targets with departments via integration." },
    "distribution": { "title": "Event Distribution", "subtitle": "Proportion of each event type", "sent": "Sent", "opened": "Opened", "clicked": "Clicked", "submitted": "Submitted", "noData": "No campaign data to display" },
    "ranking": { "title": "Department Ranking", "subtitle": "Classification by click rate (lower is better)", "position": "Position", "department": "Department", "total": "Total", "clicked": "Clicked", "rate": "Rate", "status": "Status" },
    "status": { "excellent": "Excellent", "good": "Good", "regular": "Regular", "critical": "Critical" }
}

es = {
    "title": "Análisis Mejorado",
    "subtitle": "Métricas avanzadas y análisis de vulnerabilidad",
    "timeRange": "Seleccionar período",
    "timeRanges": { "7d": "Últimos 7 días", "30d": "Últimos 30 días", "90d": "Últimos 90 días", "1y": "Último año" },
    "metrics": { "sent": "Correos Enviados", "openRate": "Tasa de Apertura", "clickRate": "Tasa de Clics", "submitRate": "Tasa de Compromiso" },
    "charts": { "timeSeriesTitle": "Evolución en el Tiempo", "timeSeriesDesc": "Métricas de rendimiento a lo largo del período", "timeSeriesOpened": "Abiertos", "timeSeriesClicked": "Clickeados", "timeSeriesSubmitted": "Enviados", "noData": "Sin datos temporales para el período seleccionado", "runCampaigns": "Ejecute campañas para generar datos" },
    "departments": { "title": "Vulnerabilidad por Departamento", "subtitle": "Tasa de clics en phishing por departamento", "clicked": "Hicieron clic", "total": "Total", "noData": "Sin datos del departamento. Importe objetivos con departamentos a través de integración." },
    "distribution": { "title": "Distribución de Eventos", "subtitle": "Proporción de cada tipo de evento", "sent": "Enviados", "opened": "Abiertos", "clicked": "Clickeados", "submitted": "Enviados", "noData": "No hay datos de campaña para mostrar" },
    "ranking": { "title": "Clasificación de Departamentos", "subtitle": "Clasificación por tasa de clics (menor es mejor)", "position": "Posición", "department": "Departamento", "total": "Total", "clicked": "Hicieron clic", "rate": "Tasa", "status": "Estado" },
    "status": { "excellent": "Excelente", "good": "Bueno", "regular": "Regular", "critical": "Crítico" }
}

files = [
    ('./src/i18n/locales/pt-BR.json', pt),
    ('./src/i18n/locales/en.json', en),
    ('./src/i18n/locales/es.json', es)
]

for path, data in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = json.load(f)
    content['enhancedAnalytics'] = data
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(content, f, ensure_ascii=False, indent=2)
    print(f"Patched {path}")

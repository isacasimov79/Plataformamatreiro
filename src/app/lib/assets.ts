// Assets e logos da plataforma Matreiro
export const PLATFORM_ASSETS = {
  underProtectionLogo: 'https://images.unsplash.com/photo-1607332070811-cd409917e369?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGllbGQlMjBzZWN1cml0eSUyMGxvZ28lMjBtaW5pbWFsJTIwYmx1ZXxlbnwxfHx8fDE3NzI5OTkzMTF8MA&ixlib=rb-4.1.0&q=80&w=400&utm_source=figma&utm_medium=referral',
  matreiroLogo: '/logo-matreiro.png',
};

// Variáveis dinâmicas disponíveis para templates
export const TEMPLATE_VARIABLES = {
  certificate: [
    { name: '{{TRAINEE_NAME}}', description: 'Nome do treinado' },
    { name: '{{TRAINING_TITLE}}', description: 'Título do treinamento' },
    { name: '{{COMPLETION_DATE}}', description: 'Data de conclusão' },
    { name: '{{CERTIFICATE_CODE}}', description: 'Código do certificado' },
    { name: '{{SCORE}}', description: 'Nota obtida' },
    { name: '{{CLIENT_LOGO}}', description: 'Logo do cliente' },
    { name: '{{UNDERPROTECTION_LOGO}}', description: 'Logo da Under Protection' },
    { name: '{{MATREIRO_LOGO}}', description: 'Logo da Matreiro' },
    { name: '{{CURRENT_DATE}}', description: 'Data atual' },
  ],
  email: [
    { name: '{{TARGET_NAME}}', description: 'Nome do destinatário' },
    { name: '{{TARGET_EMAIL}}', description: 'E-mail do destinatário' },
    { name: '{{CAMPAIGN_NAME}}', description: 'Nome da campanha' },
    { name: '{{PHISHING_LINK}}', description: 'Link da página de phishing' },
    { name: '{{SENDER_NAME}}', description: 'Nome do remetente' },
    { name: '{{SENDER_EMAIL}}', description: 'E-mail do remetente' },
    { name: '{{TRACKING_PIXEL}}', description: 'Pixel de rastreamento' },
    { name: '{{CLIENT_LOGO}}', description: 'Logo do cliente' },
    { name: '{{CURRENT_DATE}}', description: 'Data atual' },
  ],
  landing: [
    { name: '{{TARGET_NAME}}', description: 'Nome do alvo' },
    { name: '{{CAMPAIGN_NAME}}', description: 'Nome da campanha' },
    { name: '{{REDIRECT_URL}}', description: 'URL de redirecionamento' },
    { name: '{{CLIENT_LOGO}}', description: 'Logo do cliente' },
    { name: '{{UNDERPROTECTION_LOGO}}', description: 'Logo da Under Protection' },
    { name: '{{CURRENT_DATE}}', description: 'Data atual' },
  ],
};

// Cores da marca Under Protection
export const BRAND_COLORS = {
  navy: '#242545',
  purple: '#834a8b',
  graphite: '#4a4a4a',
};

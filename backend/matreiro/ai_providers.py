"""
AI Template Generator - Multi-Provider Support
Supports: OpenAI, Gemini, MiniMax, OpenRouter
"""
import json
import logging
import os
import random
from datetime import datetime

import requests

logger = logging.getLogger(__name__)


# ====================================================
# LLM Provider Abstraction
# ====================================================

class LLMProvider:
    """Base class for LLM providers."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    def generate(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> str:
        raise NotImplementedError


class OpenAIProvider(LLMProvider):
    """OpenAI GPT provider."""
    
    BASE_URL = "https://api.openai.com/v1/chat/completions"
    
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        super().__init__(api_key)
        self.model = model
    
    def generate(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "Você é um especialista em segurança da informação e simulação de phishing."},
                {"role": "user", "content": prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        resp = requests.post(self.BASE_URL, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


class GeminiProvider(LLMProvider):
    """Google Gemini provider."""
    
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
    
    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        super().__init__(api_key)
        self.model = model
    
    def generate(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> str:
        url = f"{self.BASE_URL}/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": temperature,
            },
            "systemInstruction": {
                "parts": [{"text": "Você é um especialista em segurança da informação e simulação de phishing."}]
            }
        }
        resp = requests.post(url, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


class MiniMaxProvider(LLMProvider):
    """MiniMax provider — uses OpenAI-compatible chat/completions endpoint."""
    
    BASE_URL = "https://api.minimax.chat/v1/chat/completions"
    
    def __init__(self, api_key: str, model: str = "MiniMax-M1"):
        super().__init__(api_key)
        self.model = model
    
    def generate(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "Você é um especialista em segurança da informação e simulação de phishing."},
                {"role": "user", "content": prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        logger.info(f"[MiniMax] Calling {self.BASE_URL} with model={self.model}")
        resp = requests.post(self.BASE_URL, headers=headers, json=payload, timeout=60)
        logger.info(f"[MiniMax] Response status={resp.status_code}")
        if resp.status_code != 200:
            logger.error(f"[MiniMax] Error body: {resp.text[:2000]}")
        resp.raise_for_status()
        data = resp.json()
        logger.info(f"[MiniMax] Response keys: {list(data.keys())}")
        return data["choices"][0]["message"]["content"]


class OpenRouterProvider(LLMProvider):
    """OpenRouter provider (supports multiple models)."""
    
    BASE_URL = "https://openrouter.ai/api/v1/chat/completions"
    
    def __init__(self, api_key: str, model: str = "google/gemini-2.5-flash"):
        super().__init__(api_key)
        self.model = model
    
    def generate(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://matreiro.upn.com.br",
            "X-Title": "Matreiro Security Platform",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "Você é um especialista em segurança da informação e simulação de phishing."},
                {"role": "user", "content": prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        logger.info(f"[OpenRouter] Calling with model={self.model}")
        resp = requests.post(self.BASE_URL, headers=headers, json=payload, timeout=60)
        logger.info(f"[OpenRouter] Response status={resp.status_code}, content-type={resp.headers.get('content-type', 'N/A')}")
        if resp.status_code != 200:
            logger.error(f"[OpenRouter] Error body: {resp.text[:2000]}")
        resp.raise_for_status()
        data = resp.json()
        logger.info(f"[OpenRouter] Response keys: {list(data.keys())}")
        if 'error' in data:
            raise ValueError(f"OpenRouter API error: {data['error']}")
        return data["choices"][0]["message"]["content"]


# ====================================================
# Provider Factory
# ====================================================

def get_available_providers() -> dict:
    """Return configured providers with their status."""
    from core.models_system_settings import SystemSettings
    
    ai_settings = SystemSettings.get_value('ai_providers', {})
    
    providers = {
        'openai': {
            'name': 'OpenAI',
            'models': ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
            'configured': bool(ai_settings.get('openai_key') or os.environ.get('OPENAI_API_KEY')),
            'default_model': 'gpt-4o-mini',
        },
        'gemini': {
            'name': 'Google Gemini',
            'models': ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
            'configured': bool(ai_settings.get('gemini_key') or os.environ.get('GEMINI_API_KEY')),
            'default_model': 'gemini-2.0-flash',
        },
        'minimax': {
            'name': 'MiniMax',
            'models': [
                'MiniMax-M1',
                'MiniMax-M1-40k',
                'abab6.5s-chat',
                'abab6.5t-chat',
                'abab5.5-chat',
            ],
            'configured': bool(ai_settings.get('minimax_key') or os.environ.get('MINIMAX_API_KEY')),
            'default_model': 'MiniMax-M1',
        },
        'openrouter': {
            'name': 'OpenRouter',
            'models': [
                'google/gemini-2.5-flash',
                'google/gemini-2.0-flash-001',
                'anthropic/claude-3.5-sonnet',
                'anthropic/claude-3-haiku',
                'openai/gpt-4o-mini',
                'meta-llama/llama-3.1-70b-instruct',
                'deepseek/deepseek-chat-v3-0324',
                'qwen/qwen-2.5-72b-instruct',
            ],
            'configured': bool(ai_settings.get('openrouter_key') or os.environ.get('OPENROUTER_API_KEY')),
            'default_model': 'google/gemini-2.5-flash',
        },
    }
    return providers


def get_provider(provider_name: str, model: str = None) -> LLMProvider:
    """Get a configured LLM provider instance."""
    from core.models_system_settings import SystemSettings
    
    ai_settings = SystemSettings.get_value('ai_providers', {})
    
    if provider_name == 'openai':
        key = ai_settings.get('openai_key') or os.environ.get('OPENAI_API_KEY', '')
        if not key:
            raise ValueError("OpenAI API key not configured")
        return OpenAIProvider(key, model or 'gpt-4o-mini')
    
    elif provider_name == 'gemini':
        key = ai_settings.get('gemini_key') or os.environ.get('GEMINI_API_KEY', '')
        if not key:
            raise ValueError("Gemini API key not configured")
        return GeminiProvider(key, model or 'gemini-2.0-flash')
    
    elif provider_name == 'minimax':
        key = ai_settings.get('minimax_key') or os.environ.get('MINIMAX_API_KEY', '')
        if not key:
            raise ValueError("MiniMax API key not configured")
        return MiniMaxProvider(key, model or 'MiniMax-M1')
    
    elif provider_name == 'openrouter':
        key = ai_settings.get('openrouter_key') or os.environ.get('OPENROUTER_API_KEY', '')
        if not key:
            raise ValueError("OpenRouter API key not configured")
        return OpenRouterProvider(key, model or 'google/gemini-2.5-flash')
    
    else:
        raise ValueError(f"Unknown provider: {provider_name}")


def get_first_available_provider() -> tuple:
    """Get the first available configured provider. Returns (provider_name, provider_instance)."""
    from core.models_system_settings import SystemSettings
    
    ai_settings = SystemSettings.get_value('ai_providers', {})
    
    provider_priority = ['openai', 'gemini', 'openrouter', 'minimax']
    
    for name in provider_priority:
        try:
            provider = get_provider(name)
            return name, provider
        except ValueError:
            continue
    
    return None, None


# ====================================================
# Template Generation Prompts
# ====================================================

CATEGORY_PROMPTS = {
    'banking': 'phishing bancário (banco, cartão de crédito, verificação de conta)',
    'hr': 'recursos humanos (RH, benefícios, férias, folha de pagamento)',
    'it': 'TI e segurança (atualização de senha, patch de segurança, suporte técnico)',
    'delivery': 'entrega e logística (rastreamento, confirmação de pedido, nota fiscal)',
    'finance': 'financeiro (cobrança, nota fiscal, impostos, reembolso)',
    'social': 'redes sociais (LinkedIn, Instagram, Facebook, verificação de perfil)',
    'cloud': 'cloud e SaaS (Microsoft 365, Google, Dropbox, OneDrive)',
}

DIFFICULTY_DESCRIPTIONS = {
    'basic': 'Fácil de identificar como phishing. Use erros gramaticais, urgência excessiva, URL suspeita.',
    'intermediate': 'Moderadamente convincente. Boa gramática mas com sinais sutis de phishing.',
    'advanced': 'Extremamente convincente. Profissional, sem erros, difícil de distinguir de e-mail legítimo.',
}


def build_generate_prompt(category: str, difficulty: str, language: str, custom_instructions: str = '') -> str:
    """Build the prompt for template generation."""
    cat_desc = CATEGORY_PROMPTS.get(category, category)
    diff_desc = DIFFICULTY_DESCRIPTIONS.get(difficulty, difficulty)
    
    lang_map = {'pt-br': 'português do Brasil', 'en': 'inglês', 'es': 'espanhol'}
    lang_desc = lang_map.get(language, language)
    
    prompt = f"""Você é um especialista em cybersegurança e design de e-mails criando simulações de phishing autorizadas e profissionais para conscientização corporativa.

Gere uma campanha COMPLETA de teste de phishing com e-mail HTML profissional e landing page de captura. Tudo deve parecer uma comunicação real de empresa.

**Categoria**: {cat_desc}
**Dificuldade**: {difficulty} - {diff_desc}
**Idioma**: {lang_desc}

{f'**Instruções adicionais**: {custom_instructions}' if custom_instructions else ''}

Responda APENAS com um JSON válido (sem markdown, sem blocos de código) no seguinte formato:
{{
  "subject": "Assunto do e-mail profissional",
  "body": "<CORPO HTML COMPLETO DO E-MAIL - veja requisitos abaixo>",
  "landing_page_html": "<HTML COMPLETO DA LANDING PAGE - veja requisitos abaixo>",
  "category": "{category}",
  "difficulty": "{difficulty}",
  "tips": ["Dica 1", "Dica 2", "Dica 3"]
}}

=== REQUISITOS DO E-MAIL (campo "body") ===
Gere um documento HTML completo para e-mail com:
1. Tabela centralizada (max-width 600px) como layout principal (compatível com clientes de e-mail)
2. TODOS os estilos INLINE (style="...") - e-mails não suportam <style> externo
3. Header com logotipo (use um SVG inline ou texto estilizado representando a empresa da categoria)
4. Corpo com saudação personalizada usando {{{{TARGET_NAME}}}}
5. Texto persuasivo alinhado com a categoria e dificuldade
6. Botão de ação (CTA) centralizado com cores vibrantes, border-radius, padding. O href DEVE ser {{{{PHISHING_URL}}}}
7. Rodapé com assinatura corporativa, endereço fictício, links de unsubscribe
8. Cores profissionais e tipografia que simule a empresa real da categoria
9. Ícones usando caracteres Unicode quando aplicável (🔒 ✉ ⚠ etc.)

=== REQUISITOS DA LANDING PAGE (campo "landing_page_html") ===
Gere um documento HTML completo (<!DOCTYPE html>) para a página de captura com:
1. Tag <html>, <head> com <meta charset>, <meta viewport>, <title>
2. CSS INTERNO na tag <style> dentro do <head> - design moderno e profissional
3. Layout centralizado, card com box-shadow, border-radius
4. Logotipo ou nome da empresa (consistente com o e-mail)
5. Formulário <form method="POST"> com:
   - Campo e-mail (pre-preenchido com {{{{TARGET_EMAIL}}}})
   - Campo senha
   - Botão de submit estilizado
6. Textos de confiança ("Ambiente seguro", "Seus dados estão protegidos", ícone de cadeado)
7. Background gradiente ou cor corporativa
8. Fundo responsivo, min-height 100vh, display flex para centralizar
9. Rodapé discreto com copyright

=== VARIÁVEIS DISPONÍVEIS ===
- {{{{PHISHING_URL}}}} — URL do link de ação (botão no e-mail)
- {{{{TARGET_NAME}}}} — Nome do destinatário
- {{{{TARGET_EMAIL}}}} — E-mail do destinatário

=== DICAS ===
Forneça 3 dicas didáticas para o usuário final identificar que este conteúdo é phishing.
"""
    return prompt


def build_analyze_prompt(subject: str, body_html: str) -> str:
    """Build the prompt for template analysis."""
    return f"""Analise o seguinte template de e-mail de phishing simulado para treinamento de segurança.

**Assunto**: {subject}

**Corpo**:
{body_html}

Avalie de 0 a 100 e responda APENAS com um JSON válido (sem markdown, sem ```json```) no formato:
{{
  "urgencyScore": 75,
  "trustScore": 60,
  "effectiveness": 70,
  "overallScore": 68,
  "strengths": ["Ponto forte 1", "Ponto forte 2"],
  "weaknesses": ["Ponto fraco 1", "Ponto fraco 2"],
  "suggestions": ["Sugestão de melhoria 1", "Sugestão 2"],
  "difficultyLevel": "intermediate",
  "detectionIndicators": ["Indicador 1 que permite identificar como phishing", "Indicador 2"]
}}

- urgencyScore: quão urgente parece (criando pressão para clicar)
- trustScore: quão confiável/legítimo parece
- effectiveness: probabilidade de alguém cair no phishing
- Forneça análise detalhada e útil para melhorar o template
"""


# ====================================================
# Fallback Local Generation (when no provider is configured)
# ====================================================

FALLBACK_TEMPLATES = {
    'banking': [
        {
            'subject': 'Ação Necessária: Verifique sua Conta Bancária',
            'body': '<p>Prezado(a) {{TARGET_NAME}},</p><p>Identificamos uma atividade incomum em sua conta. Para sua proteção, precisamos que você verifique suas informações.</p><p><a href="{{PHISHING_URL}}">Verificar Conta Agora</a></p><p>Caso não reconheça esta solicitação, entre em contato conosco imediatamente.</p><p>Atenciosamente,<br>Equipe de Segurança</p>',
            'tips': ['URL do link não corresponde ao domínio do banco', 'Linguagem genérica sem informações específicas da conta', 'Urgência excessiva para forçar ação imediata'],
        },
        {
            'subject': 'Atualização de Segurança - Seu Cartão de Crédito',
            'body': '<p>Olá {{TARGET_NAME}},</p><p>Nosso sistema detectou uma tentativa de uso não autorizado do seu cartão. Bloqueamos preventivamente o acesso.</p><p>Para desbloquear, confirme seus dados: <a href="{{PHISHING_URL}}">Confirmar Identidade</a></p><p>Este link expira em 24 horas.</p><p>Att,<br>Central de Segurança</p>',
            'tips': ['Prazo de expiração do link cria urgência artificial', 'Pede confirmação de dados por link em vez de canal oficial', 'Remetente genérico sem dados do cartão'],
        },
    ],
    'hr': [
        {
            'subject': 'Atualização Cadastral Obrigatória - RH',
            'body': '<p>Caro(a) {{TARGET_NAME}},</p><p>Informamos que é necessário atualizar seus dados cadastrais até o final desta semana para manter seus benefícios ativos.</p><p><a href="{{PHISHING_URL}}">Atualizar Dados</a></p><p>Em caso de dúvidas, procure o RH.</p><p>Recursos Humanos</p>',
            'tips': ['Prazo curto cria senso de urgência', 'Ameaça de perda de benefícios', 'Link externo em vez de sistema interno do RH'],
        },
    ],
    'it': [
        {
            'subject': 'Urgente: Sua Senha Expira Hoje',
            'body': '<p>{{TARGET_NAME}},</p><p>Sua senha corporativa expirará em 4 horas. Para evitar bloqueio do acesso, redefina agora:</p><p><a href="{{PHISHING_URL}}">Redefinir Senha</a></p><p>Equipe de TI</p>',
            'tips': ['Prazo curtíssimo para ação', 'Link externo para redefinição de senha', 'TI real não envia links de redefinição assim'],
        },
    ],
    'delivery': [
        {
            'subject': 'Sua Encomenda Está Retida - Ação Necessária',
            'body': '<p>Prezado(a) {{TARGET_NAME}},</p><p>Sua encomenda está retida na unidade de distribuição. Para liberar a entrega, confirme seus dados:</p><p><a href="{{PHISHING_URL}}">Confirmar Entrega</a></p><p>Código de rastreio: BR{{random_code}}</p><p>Transportadora Express</p>',
            'tips': ['Código de rastreio genérico/falso', 'Pede dados pessoais para liberar entrega', 'Nome da transportadora genérico'],
        },
    ],
    'finance': [
        {
            'subject': 'Nota Fiscal Eletrônica - Documento Pendente',
            'body': '<p>{{TARGET_NAME}},</p><p>Você possui uma Nota Fiscal Eletrônica pendente de aceite. Acesse o portal para visualizar:</p><p><a href="{{PHISHING_URL}}">Visualizar NF-e</a></p><p>Valor: R$ 1.247,50<br>Vencimento: 3 dias</p><p>Sistema de Notas Fiscais</p>',
            'tips': ['Valor específico para dar credibilidade', 'Prazo de vencimento cria urgência', 'Link externo em vez do portal real da NF-e'],
        },
    ],
}


def generate_template_fallback(category: str, difficulty: str, language: str = 'pt-br') -> dict:
    """Generate a template using local fallback rules when no AI provider is available."""
    templates = FALLBACK_TEMPLATES.get(category, FALLBACK_TEMPLATES.get('banking'))
    template = random.choice(templates)
    
    # Generate a basic landing page for the category
    landing_page_html = f"""<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Verificação de Segurança</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Segoe UI',Tahoma,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}}
.card{{background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.15);padding:2.5rem;width:100%;max-width:420px}}
.logo{{text-align:center;margin-bottom:1.5rem;font-size:1.5rem;font-weight:700;color:#333}}
.logo span{{color:#667eea}}
h2{{text-align:center;margin-bottom:.5rem;color:#333;font-size:1.2rem}}
.subtitle{{text-align:center;color:#888;font-size:.85rem;margin-bottom:1.5rem}}
.field{{margin-bottom:1rem}}
.field label{{display:block;font-size:.85rem;color:#555;margin-bottom:.3rem;font-weight:500}}
.field input{{width:100%;padding:.75rem 1rem;border:1.5px solid #ddd;border-radius:8px;font-size:.95rem;transition:border .2s}}
.field input:focus{{border-color:#667eea;outline:none}}
.btn{{width:100%;padding:.85rem;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;
border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;transition:opacity .2s}}
.btn:hover{{opacity:.9}}
.secure{{text-align:center;margin-top:1rem;font-size:.75rem;color:#999}}
.secure span{{color:#22c55e}}
.footer{{text-align:center;margin-top:1.5rem;font-size:.7rem;color:#bbb}}
</style></head><body>
<div class="card">
<div class="logo">🔒 <span>SecureVerify</span></div>
<h2>Verificação de Identidade</h2>
<p class="subtitle">Por favor, confirme suas credenciais para continuar</p>
<form method="POST">
<div class="field"><label>E-mail</label><input type="email" name="email" value="{{{{TARGET_EMAIL}}}}" required></div>
<div class="field"><label>Senha</label><input type="password" name="password" placeholder="Digite sua senha" required></div>
<button type="submit" class="btn">Verificar Identidade</button>
</form>
<p class="secure"><span>🔒</span> Ambiente seguro — Seus dados estão protegidos</p>
<p class="footer">© 2026 SecureVerify. Todos os direitos reservados.</p>
</div></body></html>"""
    
    return {
        'subject': template['subject'],
        'body': template['body'].replace('{{random_code}}', str(random.randint(100000, 999999))),
        'landing_page_html': landing_page_html,
        'category': category,
        'difficulty': difficulty,
        'language': language,
        'tips': template['tips'],
        'generatedAt': datetime.now().isoformat(),
        'provider': 'local_fallback',
    }


def analyze_template_fallback(subject: str, body_html: str) -> dict:
    """Analyze a template using local heuristics when no AI provider is available."""
    text = (subject + ' ' + body_html).lower()
    
    # Urgency scoring
    urgency_words = ['urgente', 'imediato', 'agora', 'expira', 'bloqueado', 'suspens',
                     'última chance', 'prazo', 'horas', 'minutos', 'imediatamente']
    urgency_score = min(100, sum(20 for w in urgency_words if w in text))
    
    # Trust scoring
    trust_words = ['prezado', 'atenciosamente', 'equipe', 'departamento', 'empresa',
                   'portal', 'sistema', 'cadastro', 'oficial']
    trust_score = min(100, sum(15 for w in trust_words if w in text))
    
    # Effectiveness
    effectiveness = int((urgency_score * 0.4 + trust_score * 0.6))
    
    strengths = []
    weaknesses = []
    suggestions = []
    
    if urgency_score > 50:
        strengths.append('Boa utilização de urgência para pressionar a vítima')
    else:
        weaknesses.append('Falta senso de urgência — vítime pode ignorar')
        suggestions.append('Adicione prazo ou consequência para criar urgência')
    
    if trust_score > 50:
        strengths.append('Linguagem profissional e convincente')
    else:
        weaknesses.append('Linguagem pouco profissional pode levantar suspeitas')
        suggestions.append('Use linguagem corporativa formal e inclua assinatura institucional')
    
    if '{{PHISHING_URL}}' in body_html or 'href=' in body_html.lower():
        strengths.append('Contém link de ação (CTA) claro')
    else:
        weaknesses.append('Sem link de ação — e-mail não leva a ação de clique')
        suggestions.append('Adicione um botão ou link de ação clara')
    
    if '{{TARGET_NAME}}' in body_html:
        strengths.append('Personalização com nome do destinatário')
    else:
        suggestions.append('Personalize com {{TARGET_NAME}} para aumentar efetividade')
    
    return {
        'urgencyScore': urgency_score,
        'trustScore': trust_score,
        'effectiveness': effectiveness,
        'overallScore': int((urgency_score + trust_score + effectiveness) / 3),
        'strengths': strengths or ['Template básico funcional'],
        'weaknesses': weaknesses or ['Nenhum ponto fraco significativo identificado'],
        'suggestions': suggestions or ['Template já está bem estruturado'],
        'difficultyLevel': 'basic' if effectiveness < 40 else 'intermediate' if effectiveness < 70 else 'advanced',
        'detectionIndicators': [
            'Verificar remetente real (não apenas nome exibido)',
            'Conferir URL do link antes de clicar',
            'Desconfiar de urgência excessiva',
        ],
        'provider': 'local_heuristics',
    }

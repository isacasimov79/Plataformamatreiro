# 🔄 Plataforma Matreiro - Guia de Atualização da Documentação

**Versão:** 1.0.0  
**Data:** 09/03/2026

---

## 🎯 Objetivo

Este documento estabelece o processo para manter toda a documentação da Plataforma Matreiro sempre atualizada e sincronizada com o código.

---

## 📋 Documentos a Manter

| Documento | Atualizar Quando | Responsável |
|-----------|------------------|-------------|
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Adicionar/modificar endpoints | Backend Dev |
| [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) | Alterar schema do banco | Backend Dev |
| [DJANGO_DOCUMENTATION.md](./DJANGO_DOCUMENTATION.md) | Modificar models/views/serializers | Backend Dev |
| [CHANGELOG.md](./CHANGELOG.md) | Qualquer alteração no projeto | Todos |
| [README.md](./README.md) | Mudanças na arquitetura/setup | Tech Lead |

---

## 🔄 Workflow de Atualização

### 1️⃣ Antes de Começar a Desenvolver

```bash
# Sempre trabalhe em uma branch separada
git checkout -b feature/nova-funcionalidade

# Verifique se a documentação está atualizada
git pull origin main
```

### 2️⃣ Durante o Desenvolvimento

À medida que você desenvolve, **já atualize a documentação**:

#### Adicionando Novo Endpoint

```python
# backend/campaigns/views.py
class CampaignViewSet(viewsets.ModelViewSet):
    # ... código existente ...
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive a campaign."""
        campaign = self.get_object()
        campaign.status = 'archived'
        campaign.save()
        return Response({'message': 'Campaign archived'})
```

**Documentar em API_DOCUMENTATION.md:**

```markdown
#### Arquivar Campanha

\`\`\`http
POST /campaigns/{id}/archive
Authorization: Bearer {token}
\`\`\`

**Resposta:**
\`\`\`json
{
  "success": true,
  "message": "Campaign archived",
  "data": { ... }
}
\`\`\`
```

#### Adicionando Novo Model

```python
# backend/notifications/models.py
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Documentar em DJANGO_DOCUMENTATION.md:**

```markdown
### Notification Model (notifications/models.py)

\`\`\`python
class Notification(models.Model):
    """User notification model."""
    # ... código ...
\`\`\`

**Campos:**
- `user`: Usuário que receberá a notificação
- `title`: Título da notificação
- `message`: Conteúdo da mensagem
- `is_read`: Status de leitura
```

**E também em DATABASE_MIGRATION.md:**

```sql
-- Tabela: notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3️⃣ Após Completar a Feature

#### Atualizar CHANGELOG.md

```markdown
## [Não Lançado] - Em Desenvolvimento

### ✨ Adicionado
- **Sistema de Notificações**
  - Model Notification com campos user, title, message
  - Endpoint GET /api/v1/notifications para listar
  - Endpoint POST /api/v1/notifications/{id}/mark-read
  - Badge no frontend com contador de não lidas
  - WebSocket para notificações em tempo real
```

### 4️⃣ Antes de Fazer Pull Request

**Checklist obrigatório:**

```bash
# 1. Verificar que toda documentação relevante foi atualizada
- [ ] API_DOCUMENTATION.md (se adicinou/modificou endpoints)
- [ ] DATABASE_MIGRATION.md (se alterou schema)
- [ ] DJANGO_DOCUMENTATION.md (se modificou backend)
- [ ] CHANGELOG.md (sempre!)

# 2. Revisar ortografia e formatação
# Use um spell checker ou extensão do VSCode

# 3. Testar links internos
# Verificar se todos os links [texto](./arquivo.md) funcionam

# 4. Commit da documentação junto com o código
git add docs/
git add backend/
git commit -m "feat(notifications): adiciona sistema de notificações

- Adiciona model Notification
- Implementa endpoints de listagem e marcação como lida
- Atualiza documentação da API e banco de dados
- Atualiza CHANGELOG.md"

# 5. Push
git push origin feature/nova-funcionalidade

# 6. Abrir Pull Request
```

---

## 🤖 Automação (Scripts Úteis)

### Script: Verificar Documentação Pendente

Crie um arquivo `.github/workflows/docs-check.yml`:

```yaml
name: Documentation Check

on:
  pull_request:
    branches: [main]

jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check if CHANGELOG was updated
        run: |
          if git diff --name-only origin/main | grep -q "docs/CHANGELOG.md"; then
            echo "✅ CHANGELOG.md was updated"
          else
            echo "❌ CHANGELOG.md was NOT updated!"
            exit 1
          fi
      
      - name: Check for broken links
        uses: gaurav-nelson/github-action-markdown-link-check@v1
        with:
          use-quiet-mode: 'yes'
          folder-path: 'docs/'
```

### Script: Gerar Índice Automático

Crie `scripts/generate-docs-index.py`:

```python
#!/usr/bin/env python3
"""
Gera índice automático da documentação.
"""

import os
import re
from pathlib import Path

def extract_headings(file_path):
    """Extrai headings do arquivo markdown."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    headings = []
    for line in content.split('\n'):
        if line.startswith('## '):
            heading = line.replace('## ', '').strip()
            headings.append(heading)
    
    return headings

def generate_index():
    """Gera índice de toda a documentação."""
    docs_dir = Path('docs')
    
    print("# 📚 Índice da Documentação\n")
    print("Gerado automaticamente em:", datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print("\n---\n")
    
    for doc in sorted(docs_dir.glob('*.md')):
        if doc.name == 'README.md':
            continue
        
        print(f"\n## [{doc.stem}](./{doc.name})\n")
        
        headings = extract_headings(doc)
        for heading in headings:
            anchor = heading.lower().replace(' ', '-')
            print(f"- [{heading}](./{doc.name}#{anchor})")

if __name__ == '__main__':
    from datetime import datetime
    generate_index()
```

Usar:

```bash
python scripts/generate-docs-index.py > docs/INDEX.md
```

### Script: Validar Exemplos de API

Crie `scripts/validate-api-examples.py`:

```python
#!/usr/bin/env python3
"""
Valida que os exemplos na documentação da API estão corretos.
"""

import re
import requests
from pathlib import Path

def extract_api_examples(doc_path):
    """Extrai exemplos de requisições HTTP da documentação."""
    with open(doc_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Regex para encontrar blocos ```http
    pattern = r'```http\n(.*?)\n```'
    examples = re.findall(pattern, content, re.DOTALL)
    
    return examples

def validate_endpoint(method, path):
    """Valida se endpoint existe (apenas verifica, não executa)."""
    # Aqui você pode adicionar lógica para verificar com OpenAPI spec
    print(f"Validando: {method} {path}")
    # ...

if __name__ == '__main__':
    doc_path = Path('docs/API_DOCUMENTATION.md')
    examples = extract_api_examples(doc_path)
    print(f"Encontrados {len(examples)} exemplos de API")
```

---

## 📝 Templates para Documentação

### Template: Novo Endpoint

```markdown
#### [Nome do Endpoint]

```http
[METHOD] /api/v1/[recurso]/[acao]
Authorization: Bearer {token}
Content-Type: application/json

{
  "campo": "valor"
}
```

**Parâmetros:**
- `campo` (string, obrigatório): Descrição do campo

**Query Parameters:**
- `filtro` (string, opcional): Descrição do filtro

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Erros Possíveis:**
- `400 Bad Request`: Quando dados inválidos
- `401 Unauthorized`: Quando não autenticado
- `403 Forbidden`: Quando sem permissão
- `404 Not Found`: Quando recurso não existe

**Exemplo de Uso:**
```bash
curl -X [METHOD] https://api.matreiro.com/api/v1/[recurso] \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"campo": "valor"}'
```
```

### Template: Novo Model

```markdown
### [NomeModel] Model

**Localização:** `backend/[app]/models.py`

```python
class [NomeModel](models.Model):
    """Descrição breve do model."""
    
    campo1 = models.CharField(max_length=100)
    campo2 = models.ForeignKey(User, on_delete=models.CASCADE)
    campo3 = models.DateTimeField(auto_now_add=True)
```

**Campos:**
| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| campo1 | string | Descrição | Sim |
| campo2 | FK(User) | Descrição | Sim |
| campo3 | datetime | Descrição | Não |

**Relacionamentos:**
- `campo2`: Relacionamento Many-to-One com User
- Acessar: `user.nomemodels.all()`

**Métodos:**
- `get_absolute_url()`: Retorna URL do objeto
- `__str__()`: Representação em string

**Exemplo de Uso:**
```python
from [app].models import [NomeModel]

# Criar
obj = [NomeModel].objects.create(
    campo1="valor",
    campo2=user_instance
)

# Buscar
objs = [NomeModel].objects.filter(campo1="valor")

# Atualizar
obj.campo1 = "novo_valor"
obj.save()

# Deletar
obj.delete()
```
```

### Template: Nova Migração de Banco

```markdown
### Migração [XXXX]: [Descrição]

**Data:** YYYY-MM-DD  
**Autor:** Nome do Desenvolvedor

**Objetivo:** Descrever o que a migração faz

**Mudanças:**
- [ ] Adiciona tabela `nova_tabela`
- [ ] Adiciona campo `novo_campo` em `tabela_existente`
- [ ] Remove campo obsoleto `campo_antigo`
- [ ] Adiciona índice em `campo_pesquisado`

**Script SQL:**
```sql
-- Adicionar tabela
CREATE TABLE nova_tabela (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campo1 VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar índice
CREATE INDEX idx_nova_tabela_campo1 ON nova_tabela(campo1);
```

**Rollback:**
```sql
DROP TABLE IF EXISTS nova_tabela CASCADE;
```

**Impacto:**
- ⚠️ Downtime necessário: Não
- ⚠️ Requer dados seed: Não
- ⚠️ Breaking change: Não

**Testes:**
```bash
# Aplicar migração
python manage.py migrate [app] [migration_number]

# Verificar
python manage.py showmigrations [app]

# Testar rollback (em ambiente de teste!)
python manage.py migrate [app] [previous_migration]
```
```

---

## 🎯 Boas Práticas

### ✅ DO (Faça)

1. **Atualize documentação junto com código**
   - Não deixe para depois!
   - Faça parte do mesmo commit

2. **Seja específico e claro**
   - Use exemplos práticos
   - Inclua casos de erro
   - Documente edge cases

3. **Use formatação consistente**
   - Siga os templates fornecidos
   - Mantenha o estilo dos documentos existentes

4. **Adicione diagramas quando útil**
   - Fluxogramas para lógica complexa
   - ERD para relacionamentos de banco
   - Arquitetura para novos módulos

5. **Inclua exemplos de código**
   - Exemplos que funcionam
   - Diferentes cenários de uso
   - Com e sem autenticação

6. **Mantenha CHANGELOG atualizado**
   - Toda mudança deve estar lá
   - Categorize corretamente
   - Inclua issue/PR number

### ❌ DON'T (Não Faça)

1. **Não deixe documentação desatualizada**
   - Pior que falta de doc é doc errada

2. **Não copie e cole sem adaptar**
   - Cada endpoint/model é único
   - Revise o conteúdo

3. **Não use abreviações obscuras**
   - Escreva por extenso
   - Explique siglas na primeira menção

4. **Não omita erros possíveis**
   - Documente todos os códigos de status
   - Explique quando cada erro ocorre

5. **Não crie novos arquivos sem necessidade**
   - Use os documentos existentes
   - Crie seções dentro deles

6. **Não comite alterações de doc separadamente**
   - Doc + código no mesmo PR
   - Facilita review e contexto

---

## 📊 Métricas de Qualidade da Documentação

### Como Medir

```python
# scripts/docs-quality-check.py

import os
from pathlib import Path

def count_outdated_sections(doc_path):
    """Conta seções com TODO ou FIXME."""
    with open(doc_path, 'r') as f:
        content = f.read()
    return content.count('TODO:') + content.count('FIXME:')

def check_last_update(doc_path):
    """Verifica data da última atualização."""
    with open(doc_path, 'r') as f:
        first_lines = [f.readline() for _ in range(10)]
    
    for line in first_lines:
        if 'Última Atualização:' in line:
            return line.split(':')[1].strip()
    return None

# Executar para todos os docs
docs_dir = Path('docs')
for doc in docs_dir.glob('*.md'):
    print(f"\n{doc.name}:")
    print(f"  TODOs: {count_outdated_sections(doc)}")
    print(f"  Última atualização: {check_last_update(doc)}")
```

### Metas

| Métrica | Meta | Status |
|---------|------|--------|
| Seções com TODO/FIXME | 0 | ✅ 0 |
| Docs atualizados na última semana | 100% | ✅ 100% |
| Links quebrados | 0 | ✅ 0 |
| Exemplos de código testados | 100% | ⚠️ 85% |

---

## 🔍 Review Checklist

Antes de aprovar um PR, verificar:

### Código
- [ ] Código está funcionando
- [ ] Testes foram adicionados
- [ ] Testes estão passando
- [ ] Não há warnings ou erros

### Documentação
- [ ] CHANGELOG.md foi atualizado
- [ ] API_DOCUMENTATION.md foi atualizado (se aplicável)
- [ ] DJANGO_DOCUMENTATION.md foi atualizado (se aplicável)
- [ ] DATABASE_MIGRATION.md foi atualizado (se aplicável)
- [ ] Exemplos de código estão corretos
- [ ] Não há erros de ortografia
- [ ] Links internos funcionam
- [ ] Formatação está consistente

### Específico para API
- [ ] Endpoints documentados com método HTTP
- [ ] Parâmetros obrigatórios marcados
- [ ] Respostas de sucesso documentadas
- [ ] Erros possíveis documentados
- [ ] Exemplo de uso incluído

### Específico para Models
- [ ] Campos documentados com tipos
- [ ] Relacionamentos explicados
- [ ] Exemplos de CRUD incluídos

### Específico para Banco de Dados
- [ ] Schema SQL incluído
- [ ] Migration script fornecido
- [ ] Rollback script fornecido
- [ ] Índices documentados
- [ ] Impacto avaliado

---

## 🎓 Treinamento de Novos Desenvolvedores

### Onboarding Checklist

Quando um novo dev entrar no time:

1. **Dia 1: Ler documentação**
   - [ ] README.md principal
   - [ ] docs/README.md
   - [ ] CHANGELOG.md (últimas 3 versões)

2. **Dia 2-3: Explorar código com documentação**
   - [ ] API_DOCUMENTATION.md enquanto testa endpoints
   - [ ] DJANGO_DOCUMENTATION.md enquanto explora backend
   - [ ] DATABASE_MIGRATION.md enquanto vê schema

3. **Dia 4-5: Fazer primeira contribuição**
   - [ ] Corrigir typo na documentação
   - [ ] Adicionar exemplo faltante
   - [ ] Melhorar explicação de algo confuso

4. **Semana 2+: Desenvolver com documentação**
   - [ ] Sempre atualizar docs junto com código
   - [ ] Revisar PRs de outros devs

---

## 📅 Manutenção Regular

### Semanal
- [ ] Verificar se há seções com TODO/FIXME
- [ ] Atualizar data em documentos modificados
- [ ] Verificar links quebrados

### Mensal
- [ ] Revisar CHANGELOG e criar release notes
- [ ] Atualizar roadmap
- [ ] Verificar se exemplos ainda funcionam
- [ ] Atualizar screenshots se UI mudou

### Trimestral
- [ ] Revisão completa de toda documentação
- [ ] Identificar seções que precisam expansão
- [ ] Reorganizar se necessário
- [ ] Atualizar diagramas de arquitetura

---

## 📞 Contato

Dúvidas sobre documentação?

- **Slack:** #docs ou #dev-general
- **Email:** tech-lead@underprotection.com.br
- **Wiki:** https://wiki.underprotection.com.br

---

## 🙏 Agradecimentos

Obrigado por manter nossa documentação sempre atualizada! 🎉

Documentação de qualidade é fundamental para:
- Onboarding rápido de novos devs
- Menos bugs e confusão
- Melhor colaboração entre equipes
- Facilitar manutenção futura
- Profissionalismo

**Lembre-se:** Código sem documentação é código perdido no tempo!

---

**Última Atualização:** 09/03/2026  
**Versão:** 1.0.0  
**Mantido por:** Tech Lead - Under Protection

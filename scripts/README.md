# 🛠️ Scripts da Plataforma Matreiro

Esta pasta contém scripts úteis para manutenção, verificação e automação da Plataforma Matreiro.

---

## 📋 Scripts Disponíveis

### 1. `check_docs.sh` - Verificação de Documentação

**Descrição:** Verifica se toda a documentação está atualizada e consistente.

**Uso:**
```bash
# Dar permissão de execução (primeira vez)
chmod +x scripts/check_docs.sh

# Executar
./scripts/check_docs.sh
```

**O que verifica:**
- ✅ Todos os arquivos de documentação existem
- ✅ CHANGELOG foi atualizado recentemente
- ✅ Links internos não estão quebrados
- ✅ Não há TODOs/FIXMEs pendentes
- ✅ Versões estão consistentes
- ✅ Formatação markdown está correta
- ✅ Documentação está sincronizada com código

**Exemplo de output:**
```
==============================================
  Plataforma Matreiro - Docs Verification
==============================================

[1/7] Verificando arquivos de documentação...
✓ docs/README.md
✓ docs/API_DOCUMENTATION.md
✓ docs/DATABASE_MIGRATION.md
...

==============================================
  Resumo
==============================================
✓ Documentação está em ótimo estado!
  Nenhum problema crítico encontrado.
```

---

### 2. `docs_coverage_report.py` - Relatório de Cobertura

**Descrição:** Gera relatório detalhado de cobertura da documentação.

**Uso:**
```bash
# Instalar dependências (se necessário)
pip install -r requirements.txt

# Executar
python scripts/docs_coverage_report.py
```

**O que analisa:**
- 📊 Cobertura de endpoints (código vs documentação)
- 📊 Cobertura de models (código vs documentação)
- 📊 Cobertura de tabelas do banco de dados
- 📅 Quando cada documento foi atualizado pela última vez
- 📝 Quantidade de TODOs e FIXMEs
- 🎯 Score geral de documentação

**Exemplo de output:**
```
==============================================
  Análise de Endpoints
==============================================

Endpoints no código: 45
Endpoints documentados: 38
✓ Cobertura de endpoints: 84.4%

==============================================
  Análise de Models
==============================================

Models no código: 15
Models documentados: 14
⚠ Models não documentados (1):
  - WebhookLog
⚠ Cobertura de models: 93.3%

...

==============================================
  Relatório Final
==============================================

Score Geral de Documentação: 88.9%

Estatísticas:
  - Endpoints documentados: 38/45
  - Models documentados: 14/15
  - TODOs pendentes: 0
  - FIXMEs pendentes: 0

Recomendações:
✓ Documentação em excelente estado! 🎉

✓ Relatório salvo em: docs/coverage_report.json
```

**Arquivo gerado:**
- `docs/coverage_report.json` - Relatório em formato JSON para integração com CI/CD

---

## 🔄 Integração com CI/CD

### GitHub Actions

Adicione ao `.github/workflows/documentation.yml`:

```yaml
name: Documentation Check

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  check-docs:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Make scripts executable
        run: chmod +x scripts/check_docs.sh
      
      - name: Run documentation check
        run: ./scripts/check_docs.sh
      
      - name: Generate coverage report
        run: python scripts/docs_coverage_report.py
      
      - name: Upload coverage report
        uses: actions/upload-artifact@v3
        with:
          name: docs-coverage-report
          path: docs/coverage_report.json
      
      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('docs/coverage_report.json', 'utf8'));
            
            const comment = `## 📚 Documentation Coverage Report
            
            - **Overall Score:** ${report.overall_score.toFixed(1)}%
            - **Endpoints:** ${report.endpoints.documented}/${report.endpoints.total} (${report.endpoints.coverage.toFixed(1)}%)
            - **Models:** ${report.models.documented}/${report.models.total} (${report.models.coverage.toFixed(1)}%)
            - **TODOs:** ${report.todos.todos}
            - **FIXMEs:** ${report.todos.fixmes}
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

## 📅 Automação com Cron

Para executar verificações periódicas:

### Linux/Mac

Adicione ao crontab (`crontab -e`):

```bash
# Verificar documentação toda segunda-feira às 9h
0 9 * * 1 cd /path/to/matreiro && ./scripts/check_docs.sh

# Gerar relatório de cobertura toda sexta-feira às 17h
0 17 * * 5 cd /path/to/matreiro && python scripts/docs_coverage_report.py
```

### Windows Task Scheduler

1. Abrir Task Scheduler
2. Criar nova tarefa
3. Trigger: Toda segunda-feira às 9h
4. Action: Executar `check_docs.sh`

---

## 🔧 Troubleshooting

### Script `check_docs.sh` não executa

```bash
# Verificar permissões
ls -l scripts/check_docs.sh

# Dar permissão de execução
chmod +x scripts/check_docs.sh

# Se ainda não funcionar, executar com bash explicitamente
bash scripts/check_docs.sh
```

### Script Python falha com importação

```bash
# Verificar Python instalado
python --version

# Instalar dependências
pip install -r requirements.txt

# Se não funcionar, usar python3
python3 scripts/docs_coverage_report.py
```

### Links quebrados não são detectados

O script `check_docs.sh` verifica apenas links relativos (./arquivo.md). Links externos não são verificados por padrão.

Para verificar links externos, use:

```bash
# Instalar markdown-link-check
npm install -g markdown-link-check

# Verificar links
markdown-link-check docs/*.md
```

---

## 🎯 Boas Práticas

### Quando executar os scripts

1. **Antes de fazer commit:**
   ```bash
   ./scripts/check_docs.sh
   ```

2. **Antes de abrir Pull Request:**
   ```bash
   ./scripts/check_docs.sh
   python scripts/docs_coverage_report.py
   ```

3. **Periodicamente (semanal):**
   ```bash
   python scripts/docs_coverage_report.py
   ```

### Interpretando os resultados

#### Score de Documentação

| Score | Status | Ação |
|-------|--------|------|
| 90-100% | 🎉 Excelente | Manter |
| 80-89% | ✅ Bom | Melhorar gradualmente |
| 60-79% | ⚠️ Regular | Priorizar melhorias |
| < 60% | ❌ Crítico | Ação urgente necessária |

#### Cobertura de Endpoints

Se cobertura < 80%, priorize documentar:
1. Endpoints públicos primeiro
2. Endpoints de autenticação
3. Endpoints CRUD principais
4. Endpoints customizados

#### Cobertura de Models

Se cobertura < 80%, documente models na ordem:
1. Models core (User, Tenant)
2. Models de domínio principal (Campaign, Template)
3. Models auxiliares (AuditLog, Notification)

---

## 📊 Métricas de Qualidade

### Metas de Documentação

| Métrica | Meta | Atual | Status |
|---------|------|-------|--------|
| Cobertura de Endpoints | 90% | - | - |
| Cobertura de Models | 95% | - | - |
| Links quebrados | 0 | - | - |
| TODOs | < 5 | - | - |
| FIXMEs | 0 | - | - |
| Docs atualizados (30 dias) | 100% | - | - |

Execute `python scripts/docs_coverage_report.py` para atualizar os valores.

---

## 🆕 Adicionar Novo Script

Se você criar um novo script útil:

1. **Adicione na pasta `/scripts`**
2. **Documente neste README:**
   ```markdown
   ### X. `nome_script.ext` - Título
   
   **Descrição:** O que faz
   
   **Uso:**
   ```bash
   comando
   ```
   
   **O que faz:**
   - Item 1
   - Item 2
   ```

3. **Adicione permissão de execução (se bash):**
   ```bash
   chmod +x scripts/nome_script.sh
   ```

4. **Commite com descrição clara:**
   ```bash
   git add scripts/nome_script.sh scripts/README.md
   git commit -m "feat(scripts): adiciona script para [funcionalidade]"
   ```

---

## 🤝 Contribuindo

Ideias para novos scripts úteis:

- [ ] Script para gerar changelog automaticamente do git log
- [ ] Script para validar exemplos de API (rodar requests reais)
- [ ] Script para gerar diagramas ERD do banco de dados
- [ ] Script para sincronizar versões entre package.json e docs
- [ ] Script para extrair métricas de código (linhas, complexidade)
- [ ] Script para gerar documentação de API a partir de OpenAPI spec

Se você implementar algum desses ou tiver outras ideias, faça um PR!

---

## 📞 Suporte

Problemas com os scripts?

- **Issues:** https://github.com/underprotection/matreiro-platform/issues
- **Slack:** #dev-tools
- **Email:** tech-lead@underprotection.com.br

---

**Última Atualização:** 09/03/2026  
**Mantido por:** Under Protection Dev Team

#!/bin/bash

# ============================================================
# Plataforma Matreiro - Script de Verificação de Documentação
# ============================================================
# 
# Este script verifica se toda a documentação está atualizada
# e consistente com o código.
#
# Uso: ./scripts/check_docs.sh
#

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "=============================================="
echo "  Plataforma Matreiro - Docs Verification"
echo "=============================================="
echo -e "${NC}"

# Contador de problemas
ISSUES=0

# ============================================================
# 1. Verificar se todos os arquivos de documentação existem
# ============================================================

echo -e "${BLUE}[1/7] Verificando arquivos de documentação...${NC}"

REQUIRED_DOCS=(
    "docs/README.md"
    "docs/API_DOCUMENTATION.md"
    "docs/DATABASE_MIGRATION.md"
    "docs/DJANGO_DOCUMENTATION.md"
    "docs/CHANGELOG.md"
    "docs/QUICK_REFERENCE.md"
    "docs/DOCUMENTATION_UPDATE_GUIDE.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    if [ ! -f "$doc" ]; then
        echo -e "${RED}✗ Arquivo faltando: $doc${NC}"
        ((ISSUES++))
    else
        echo -e "${GREEN}✓ $doc${NC}"
    fi
done

# ============================================================
# 2. Verificar se CHANGELOG foi atualizado recentemente
# ============================================================

echo -e "\n${BLUE}[2/7] Verificando atualização do CHANGELOG...${NC}"

CHANGELOG_LAST_MODIFIED=$(date -r docs/CHANGELOG.md "+%s" 2>/dev/null || stat -f %m docs/CHANGELOG.md 2>/dev/null)
CURRENT_TIME=$(date "+%s")
DAYS_SINCE_UPDATE=$(( (CURRENT_TIME - CHANGELOG_LAST_MODIFIED) / 86400 ))

if [ $DAYS_SINCE_UPDATE -gt 30 ]; then
    echo -e "${YELLOW}⚠ CHANGELOG não atualizado há $DAYS_SINCE_UPDATE dias${NC}"
    echo -e "${YELLOW}  Considere atualizar se houve mudanças no projeto${NC}"
else
    echo -e "${GREEN}✓ CHANGELOG atualizado há $DAYS_SINCE_UPDATE dias${NC}"
fi

# ============================================================
# 3. Verificar links quebrados nos arquivos markdown
# ============================================================

echo -e "\n${BLUE}[3/7] Verificando links internos...${NC}"

# Função para verificar links
check_links() {
    local file=$1
    local broken_links=0
    
    # Extrair links markdown [texto](./arquivo.md)
    while IFS= read -r line; do
        # Extrair path do link
        link=$(echo "$line" | grep -o '\](\.\/[^)]*' | sed 's/](//')
        
        if [ ! -z "$link" ]; then
            # Converter para path absoluto
            dir=$(dirname "$file")
            full_path="$dir/$link"
            
            # Remover âncoras (#section)
            full_path=$(echo "$full_path" | cut -d'#' -f1)
            
            if [ ! -f "$full_path" ]; then
                echo -e "${RED}  ✗ Link quebrado em $file: $link${NC}"
                ((broken_links++))
            fi
        fi
    done < <(grep -o '\[.*\](\.\/[^)]*)' "$file" 2>/dev/null || true)
    
    return $broken_links
}

for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        if check_links "$doc"; then
            echo -e "${GREEN}  ✓ Links OK em $(basename $doc)${NC}"
        else
            ((ISSUES+=$?))
        fi
    fi
done

# ============================================================
# 4. Verificar seções TODO/FIXME
# ============================================================

echo -e "\n${BLUE}[4/7] Verificando TODOs e FIXMEs...${NC}"

TODO_COUNT=0
FIXME_COUNT=0

for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        todos=$(grep -c "TODO:" "$doc" 2>/dev/null || echo 0)
        fixmes=$(grep -c "FIXME:" "$doc" 2>/dev/null || echo 0)
        
        if [ $todos -gt 0 ] || [ $fixmes -gt 0 ]; then
            echo -e "${YELLOW}  ⚠ $(basename $doc): ${todos} TODOs, ${fixmes} FIXMEs${NC}"
            TODO_COUNT=$((TODO_COUNT + todos))
            FIXME_COUNT=$((FIXME_COUNT + fixmes))
        fi
    fi
done

if [ $TODO_COUNT -eq 0 ] && [ $FIXME_COUNT -eq 0 ]; then
    echo -e "${GREEN}  ✓ Nenhum TODO/FIXME encontrado${NC}"
else
    echo -e "${YELLOW}  Total: ${TODO_COUNT} TODOs, ${FIXME_COUNT} FIXMEs${NC}"
fi

# ============================================================
# 5. Verificar se versões estão consistentes
# ============================================================

echo -e "\n${BLUE}[5/7] Verificando consistência de versões...${NC}"

# Extrair versão do package.json
PACKAGE_VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)

# Extrair versões dos docs
CHANGELOG_VERSION=$(grep -o '\[.*\]' docs/CHANGELOG.md | head -n 1 | tr -d '[]')

echo -e "  package.json: ${PACKAGE_VERSION}"
echo -e "  CHANGELOG.md: ${CHANGELOG_VERSION}"

if [ "$PACKAGE_VERSION" = "$CHANGELOG_VERSION" ]; then
    echo -e "${GREEN}  ✓ Versões consistentes${NC}"
else
    echo -e "${YELLOW}  ⚠ Versões diferentes - considere sincronizar${NC}"
fi

# ============================================================
# 6. Verificar formatação dos arquivos markdown
# ============================================================

echo -e "\n${BLUE}[6/7] Verificando formatação markdown...${NC}"

FORMAT_ISSUES=0

for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        # Verificar se tem título (# no início)
        if ! grep -q "^# " "$doc"; then
            echo -e "${RED}  ✗ Faltando título principal em $(basename $doc)${NC}"
            ((FORMAT_ISSUES++))
        fi
        
        # Verificar se tem data de atualização
        if ! grep -q "Última Atualização:" "$doc" && ! grep -q "Data de Atualização:" "$doc"; then
            echo -e "${YELLOW}  ⚠ Faltando data de atualização em $(basename $doc)${NC}"
        fi
    fi
done

if [ $FORMAT_ISSUES -eq 0 ]; then
    echo -e "${GREEN}  ✓ Formatação OK${NC}"
else
    ((ISSUES+=FORMAT_ISSUES))
fi

# ============================================================
# 7. Verificar se documentação está sincronizada com código
# ============================================================

echo -e "\n${BLUE}[7/7] Verificando sincronização com código...${NC}"

# Contar endpoints no backend
BACKEND_ENDPOINTS=$(find backend -name "views.py" -o -name "urls.py" | xargs grep -h "@action\|path\|url" 2>/dev/null | wc -l)

# Contar endpoints documentados
DOCUMENTED_ENDPOINTS=$(grep -c "^###\|^####" docs/API_DOCUMENTATION.md 2>/dev/null || echo 0)

echo -e "  Endpoints no código: ~${BACKEND_ENDPOINTS}"
echo -e "  Endpoints documentados: ${DOCUMENTED_ENDPOINTS}"

if [ $BACKEND_ENDPOINTS -gt $((DOCUMENTED_ENDPOINTS * 2)) ]; then
    echo -e "${YELLOW}  ⚠ Pode haver endpoints não documentados${NC}"
else
    echo -e "${GREEN}  ✓ Documentação parece estar em dia${NC}"
fi

# Contar models
MODELS_COUNT=$(find backend -name "models.py" | xargs grep -h "^class.*Model" 2>/dev/null | wc -l)
DOCUMENTED_MODELS=$(grep -c "^### .* Model" docs/DJANGO_DOCUMENTATION.md 2>/dev/null || echo 0)

echo -e "  Models no código: ${MODELS_COUNT}"
echo -e "  Models documentados: ${DOCUMENTED_MODELS}"

if [ $MODELS_COUNT -gt $((DOCUMENTED_MODELS + 5)) ]; then
    echo -e "${YELLOW}  ⚠ Pode haver models não documentados${NC}"
else
    echo -e "${GREEN}  ✓ Models parecem estar documentados${NC}"
fi

# ============================================================
# Resumo Final
# ============================================================

echo -e "\n${BLUE}=============================================="
echo "  Resumo"
echo "=============================================="
echo -e "${NC}"

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ Documentação está em ótimo estado!${NC}"
    echo -e "${GREEN}  Nenhum problema crítico encontrado.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Foram encontrados $ISSUES problemas.${NC}"
    echo -e "${YELLOW}  Revise os itens acima e atualize a documentação.${NC}"
    exit 1
fi

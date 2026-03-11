#!/bin/bash

echo "🧹 Limpando cache do Vite e build artifacts..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parar processos na porta 5173 (se houver)
echo -e "${YELLOW}1. Verificando processos na porta 5173...${NC}"
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo -e "${GREEN}   ✓ Processos encerrados${NC}" || echo -e "${GREEN}   ✓ Nenhum processo rodando${NC}"

# Remover cache do Vite
echo -e "${YELLOW}2. Removendo cache do Vite (.vite)...${NC}"
if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo -e "${GREEN}   ✓ Cache removido${NC}"
else
    echo -e "${GREEN}   ✓ Sem cache para remover${NC}"
fi

# Remover build artifacts
echo -e "${YELLOW}3. Removendo build artifacts (dist)...${NC}"
if [ -d "dist" ]; then
    rm -rf dist
    echo -e "${GREEN}   ✓ Build artifacts removidos${NC}"
else
    echo -e "${GREEN}   ✓ Sem build artifacts para remover${NC}"
fi

echo ""
echo -e "${GREEN}✅ Limpeza concluída!${NC}"
echo ""
echo -e "${YELLOW}🚀 Iniciando servidor de desenvolvimento...${NC}"
echo ""

# Rodar servidor
npm run dev

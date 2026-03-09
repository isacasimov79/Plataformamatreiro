#!/usr/bin/env python3
"""
Plataforma Matreiro - Relatório de Cobertura de Documentação

Este script analisa o código e a documentação para gerar um relatório
de cobertura, identificando o que está documentado e o que não está.

Uso: python scripts/docs_coverage_report.py
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple

# Cores para terminal
class Colors:
    BLUE = '\033[0;34m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    RED = '\033[0;31m'
    RESET = '\033[0m'

def print_header(text: str):
    """Imprime cabeçalho colorido."""
    print(f"\n{Colors.BLUE}{'=' * 60}")
    print(f"  {text}")
    print(f"{'=' * 60}{Colors.RESET}\n")

def print_success(text: str):
    """Imprime mensagem de sucesso."""
    print(f"{Colors.GREEN}✓ {text}{Colors.RESET}")

def print_warning(text: str):
    """Imprime mensagem de aviso."""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.RESET}")

def print_error(text: str):
    """Imprime mensagem de erro."""
    print(f"{Colors.RED}✗ {text}{Colors.RESET}")

# ============================================================
# Análise de Endpoints
# ============================================================

def extract_endpoints_from_code() -> List[Dict]:
    """Extrai todos os endpoints do código Django."""
    endpoints = []
    
    # Procurar por views.py e urls.py
    backend_dir = Path('backend')
    
    if not backend_dir.exists():
        print_warning("Diretório backend não encontrado")
        return endpoints
    
    for views_file in backend_dir.rglob('views.py'):
        with open(views_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Encontrar ViewSets
            viewset_pattern = r'class\s+(\w+ViewSet)\(.*\):'
            viewsets = re.findall(viewset_pattern, content)
            
            # Encontrar actions customizadas
            action_pattern = r'@action\(detail=(True|False).*?\)\s+def\s+(\w+)\('
            actions = re.findall(action_pattern, content, re.DOTALL)
            
            for viewset in viewsets:
                resource = viewset.replace('ViewSet', '').lower()
                endpoints.append({
                    'resource': resource,
                    'type': 'CRUD',
                    'file': str(views_file)
                })
            
            for detail, action_name in actions:
                endpoints.append({
                    'resource': 'custom',
                    'action': action_name,
                    'detail': detail == 'True',
                    'type': 'custom',
                    'file': str(views_file)
                })
    
    return endpoints

def extract_endpoints_from_docs() -> List[str]:
    """Extrai endpoints documentados."""
    api_doc = Path('docs/API_DOCUMENTATION.md')
    
    if not api_doc.exists():
        print_warning("API_DOCUMENTATION.md não encontrado")
        return []
    
    with open(api_doc, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Encontrar blocos ```http
    http_pattern = r'```http\n(GET|POST|PUT|DELETE|PATCH)\s+([^\n]+)'
    endpoints = re.findall(http_pattern, content)
    
    return [f"{method} {path}" for method, path in endpoints]

def analyze_endpoint_coverage() -> Tuple[int, int]:
    """Analisa cobertura de documentação de endpoints."""
    print_header("Análise de Endpoints")
    
    code_endpoints = extract_endpoints_from_code()
    doc_endpoints = extract_endpoints_from_docs()
    
    print(f"Endpoints no código: {len(code_endpoints)}")
    print(f"Endpoints documentados: {len(doc_endpoints)}")
    
    # Estimar cobertura (simplificado)
    # Na prática, ViewSets geram ~5 endpoints (list, create, retrieve, update, delete)
    estimated_code_endpoints = len([e for e in code_endpoints if e['type'] == 'CRUD']) * 5
    estimated_code_endpoints += len([e for e in code_endpoints if e['type'] == 'custom'])
    
    if estimated_code_endpoints > 0:
        coverage = (len(doc_endpoints) / estimated_code_endpoints) * 100
        
        if coverage >= 80:
            print_success(f"Cobertura de endpoints: {coverage:.1f}%")
        elif coverage >= 50:
            print_warning(f"Cobertura de endpoints: {coverage:.1f}%")
        else:
            print_error(f"Cobertura de endpoints: {coverage:.1f}%")
        
        return len(doc_endpoints), estimated_code_endpoints
    
    return 0, 0

# ============================================================
# Análise de Models
# ============================================================

def extract_models_from_code() -> List[Dict]:
    """Extrai todos os models do código Django."""
    models = []
    
    backend_dir = Path('backend')
    
    if not backend_dir.exists():
        return models
    
    for models_file in backend_dir.rglob('models.py'):
        with open(models_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Encontrar classes que herdam de Model
            model_pattern = r'class\s+(\w+)\(.*models\.Model.*\):'
            found_models = re.findall(model_pattern, content)
            
            for model_name in found_models:
                models.append({
                    'name': model_name,
                    'file': str(models_file)
                })
    
    return models

def extract_models_from_docs() -> List[str]:
    """Extrai models documentados."""
    django_doc = Path('docs/DJANGO_DOCUMENTATION.md')
    
    if not django_doc.exists():
        return []
    
    with open(django_doc, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Encontrar seções de models (### User Model, ### Campaign Model, etc.)
    model_pattern = r'###\s+(\w+)\s+Model'
    models = re.findall(model_pattern, content)
    
    return models

def analyze_model_coverage() -> Tuple[int, int]:
    """Analisa cobertura de documentação de models."""
    print_header("Análise de Models")
    
    code_models = extract_models_from_code()
    doc_models = extract_models_from_docs()
    
    print(f"Models no código: {len(code_models)}")
    print(f"Models documentados: {len(doc_models)}")
    
    # Verificar quais models não estão documentados
    code_model_names = set(m['name'] for m in code_models)
    doc_model_names = set(doc_models)
    
    undocumented = code_model_names - doc_model_names
    
    if undocumented:
        print_warning(f"Models não documentados ({len(undocumented)}):")
        for model in sorted(undocumented):
            print(f"  - {model}")
    
    if len(code_models) > 0:
        coverage = (len(doc_models) / len(code_models)) * 100
        
        if coverage >= 80:
            print_success(f"Cobertura de models: {coverage:.1f}%")
        elif coverage >= 50:
            print_warning(f"Cobertura de models: {coverage:.1f}%")
        else:
            print_error(f"Cobertura de models: {coverage:.1f}%")
        
        return len(doc_models), len(code_models)
    
    return 0, 0

# ============================================================
# Análise de Serializers
# ============================================================

def extract_serializers_from_code() -> List[str]:
    """Extrai serializers do código."""
    serializers = []
    
    backend_dir = Path('backend')
    
    if not backend_dir.exists():
        return serializers
    
    for serializers_file in backend_dir.rglob('serializers.py'):
        with open(serializers_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Encontrar classes que herdam de Serializer
            serializer_pattern = r'class\s+(\w+Serializer)\('
            found = re.findall(serializer_pattern, content)
            serializers.extend(found)
    
    return serializers

# ============================================================
# Análise de Tabelas do Banco
# ============================================================

def extract_tables_from_migration() -> List[str]:
    """Extrai tabelas do script de migração."""
    migration_doc = Path('docs/DATABASE_MIGRATION.md')
    
    if not migration_doc.exists():
        return []
    
    with open(migration_doc, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Encontrar CREATE TABLE statements
    table_pattern = r'CREATE TABLE\s+(\w+)\s*\('
    tables = re.findall(table_pattern, content)
    
    return tables

def analyze_database_coverage():
    """Analisa cobertura de documentação do banco de dados."""
    print_header("Análise do Banco de Dados")
    
    documented_tables = extract_tables_from_migration()
    code_models = extract_models_from_code()
    
    print(f"Tabelas documentadas: {len(documented_tables)}")
    print(f"Models no código: {len(code_models)}")
    
    if len(code_models) > 0:
        coverage = (len(documented_tables) / len(code_models)) * 100
        
        if coverage >= 80:
            print_success(f"Cobertura de tabelas: {coverage:.1f}%")
        elif coverage >= 50:
            print_warning(f"Cobertura de tabelas: {coverage:.1f}%")
        else:
            print_error(f"Cobertura de tabelas: {coverage:.1f}%")

# ============================================================
# Análise de Atualização dos Docs
# ============================================================

def check_docs_freshness():
    """Verifica quando os docs foram atualizados pela última vez."""
    print_header("Atualização dos Documentos")
    
    docs_dir = Path('docs')
    now = datetime.now()
    
    for doc in docs_dir.glob('*.md'):
        mtime = datetime.fromtimestamp(os.path.getmtime(doc))
        days_old = (now - mtime).days
        
        if days_old <= 7:
            print_success(f"{doc.name}: atualizado há {days_old} dias")
        elif days_old <= 30:
            print_warning(f"{doc.name}: atualizado há {days_old} dias")
        else:
            print_error(f"{doc.name}: atualizado há {days_old} dias")

# ============================================================
# Análise de TODOs
# ============================================================

def count_todos_in_docs() -> Dict[str, int]:
    """Conta TODOs e FIXMEs nos documentos."""
    print_header("TODOs e FIXMEs")
    
    docs_dir = Path('docs')
    total_todos = 0
    total_fixmes = 0
    
    for doc in docs_dir.glob('*.md'):
        with open(doc, 'r', encoding='utf-8') as f:
            content = f.read()
        
        todos = content.count('TODO:')
        fixmes = content.count('FIXME:')
        
        if todos > 0 or fixmes > 0:
            print_warning(f"{doc.name}: {todos} TODOs, {fixmes} FIXMEs")
            total_todos += todos
            total_fixmes += fixmes
    
    if total_todos == 0 and total_fixmes == 0:
        print_success("Nenhum TODO ou FIXME encontrado")
    else:
        print(f"\nTotal: {total_todos} TODOs, {total_fixmes} FIXMEs")
    
    return {'todos': total_todos, 'fixmes': total_fixmes}

# ============================================================
# Relatório Final
# ============================================================

def generate_summary_report(endpoint_data, model_data, todo_data):
    """Gera relatório resumido."""
    print_header("Relatório Final")
    
    # Calcular score geral
    scores = []
    
    if endpoint_data[1] > 0:
        endpoint_score = (endpoint_data[0] / endpoint_data[1]) * 100
        scores.append(endpoint_score)
    
    if model_data[1] > 0:
        model_score = (model_data[0] / model_data[1]) * 100
        scores.append(model_score)
    
    overall_score = sum(scores) / len(scores) if scores else 0
    
    print(f"Score Geral de Documentação: {overall_score:.1f}%")
    print()
    
    # Estatísticas
    print("Estatísticas:")
    print(f"  - Endpoints documentados: {endpoint_data[0]}/{endpoint_data[1]}")
    print(f"  - Models documentados: {model_data[0]}/{model_data[1]}")
    print(f"  - TODOs pendentes: {todo_data['todos']}")
    print(f"  - FIXMEs pendentes: {todo_data['fixmes']}")
    print()
    
    # Recomendações
    print("Recomendações:")
    
    if overall_score >= 80:
        print_success("Documentação em excelente estado! 🎉")
    elif overall_score >= 60:
        print_warning("Documentação boa, mas pode melhorar")
        print("  - Documente endpoints e models faltantes")
        print("  - Resolva TODOs e FIXMEs pendentes")
    else:
        print_error("Documentação precisa de atenção urgente!")
        print("  - Priorize documentação de endpoints e models")
        print("  - Atualize documentos desatualizados")
        print("  - Resolva todos os TODOs e FIXMEs")
    
    # Salvar relatório em JSON
    report = {
        'timestamp': datetime.now().isoformat(),
        'overall_score': overall_score,
        'endpoints': {
            'documented': endpoint_data[0],
            'total': endpoint_data[1],
            'coverage': endpoint_score if endpoint_data[1] > 0 else 0
        },
        'models': {
            'documented': model_data[0],
            'total': model_data[1],
            'coverage': model_score if model_data[1] > 0 else 0
        },
        'todos': todo_data
    }
    
    report_file = Path('docs/coverage_report.json')
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print()
    print_success(f"Relatório salvo em: {report_file}")

# ============================================================
# Main
# ============================================================

def main():
    """Função principal."""
    print(f"{Colors.BLUE}")
    print("=" * 60)
    print("  Plataforma Matreiro - Relatório de Cobertura de Documentação")
    print("=" * 60)
    print(f"{Colors.RESET}")
    print(f"Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Executar análises
    endpoint_data = analyze_endpoint_coverage()
    model_data = analyze_model_coverage()
    analyze_database_coverage()
    check_docs_freshness()
    todo_data = count_todos_in_docs()
    
    # Gerar relatório final
    generate_summary_report(endpoint_data, model_data, todo_data)

if __name__ == '__main__':
    main()

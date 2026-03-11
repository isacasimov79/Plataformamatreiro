# 🎨 Sistema de Design - Plataforma Matreiro

## Design Moderno com Fundo Claro

Todas as páginas da plataforma Matreiro agora seguem um design moderno e consistente com fundo claro, gradientes coloridos e elementos visuais profissionais.

---

## 📋 Classes CSS Globais Criadas

Todas as classes estão definidas em `/src/styles/theme.css` na camada `@layer components`.

### 🏗️ Estrutura de Página

```tsx
// Container principal - Sempre use como wrapper externo
<div className="page-container">
  <div className="page-wrapper">
    {/* Conteúdo da página aqui */}
  </div>
</div>
```

**Classes:**
- `.page-container` - Background com gradiente claro (from-gray-50 via-white to-purple-50/30)
- `.page-wrapper` - Padding responsivo e max-width de 1600px

---

### 🎯 Header de Página com Gradiente

```tsx
<div className="page-header">
  <div className="page-header-gradient">
    <h1 className="page-title">Título da Página</h1>
    <p className="page-subtitle">Descrição da página</p>
  </div>
</div>
```

**Classes:**
- `.page-header` - Margin bottom (mb-8)
- `.page-header-gradient` - Gradiente da marca (from-[#242545] to-[#834a8b]) com padding e sombra
- `.page-title` - Título grande e bold em branco
- `.page-subtitle` - Subtítulo em roxo claro

---

### 📊 Cards de Estatísticas com Gradientes

```tsx
<Card className="stat-card stat-card-purple">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-medium text-gray-600">
      Nome da Métrica
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="stat-value-gradient">123</div>
  </CardContent>
</Card>
```

**Classes de Cards:**
- `.stat-card` - Estilo base (sem borda, sombra, hover)
- `.stat-card-purple` - Gradiente roxo (white to purple-50/50)
- `.stat-card-blue` - Gradiente azul (white to blue-50/50)
- `.stat-card-green` - Gradiente verde (white to green-50/50)
- `.stat-card-orange` - Gradiente laranja (white to orange-50/50)
- `.stat-card-red` - Gradiente vermelho (white to red-50/50)
- `.stat-card-yellow` - Gradiente amarelo (white to yellow-50/50)

**Classes de Valores:**
- `.stat-value-gradient` - Valor com gradiente da marca
- `.stat-value-purple` - Valor roxo (#834a8b)
- `.stat-value-blue` - Valor azul
- `.stat-value-green` - Valor verde
- `.stat-value-orange` - Valor laranja
- `.stat-value-red` - Valor vermelho
- `.stat-value-yellow` - Valor amarelo

**Classes de Ícones:**
- `.stat-icon-purple` - Fundo roxo claro para ícone
- `.stat-icon-blue` - Fundo azul claro para ícone
- `.stat-icon-green` - Fundo verde claro para ícone
- `.stat-icon-orange` - Fundo laranja claro para ícone
- `.stat-icon-red` - Fundo vermelho claro para ícone
- `.stat-icon-yellow` - Fundo amarelo claro para ícone

---

### 🎴 Cards de Conteúdo

```tsx
<Card className="content-card">
  {/* Conteúdo */}
</Card>
```

**Classe:**
- `.content-card` - Card branco com borda, sombra e hover

---

### 💻 Blocos de Código

```tsx
<div className="code-block code-block-success">
  <code>seu código aqui</code>
</div>
```

**Classes:**
- `.code-block` - Estilo base (fundo escuro, mono, padding)
- `.code-block-success` - Texto verde
- `.code-block-warning` - Texto amarelo
- `.code-block-error` - Texto vermelho
- `.code-block-info` - Texto azul

---

### 📝 Seções de Formulário

```tsx
<div className="form-section">
  {/* Campos do formulário */}
</div>
```

**Classe:**
- `.form-section` - Card branco com padding e borda

---

### 📊 Tabelas

```tsx
<div className="table-container">
  <Table>{/* ... */}</Table>
</div>
```

**Classe:**
- `.table-container` - Container branco com sombra e borda

---

### 🚫 Estados Vazios

```tsx
<div className="empty-state">
  <p>Nenhum dado disponível</p>
</div>
```

**Classe:**
- `.empty-state` - Estado vazio centralizado com fundo cinza claro

---

### 🎨 Botões com Gradiente

```tsx
<Button className="btn-gradient">
  Ação Principal
</Button>
```

**Classe:**
- `.btn-gradient` - Botão com gradiente da marca

---

### 🏷️ Badges Coloridos

```tsx
<Badge variant="outline" className="badge-success">Ativo</Badge>
<Badge variant="outline" className="badge-warning">Pendente</Badge>
<Badge variant="outline" className="badge-error">Erro</Badge>
<Badge variant="outline" className="badge-info">Info</Badge>
<Badge variant="outline" className="badge-purple">Premium</Badge>
```

**Classes:**
- `.badge-success` - Verde claro
- `.badge-warning` - Laranja claro
- `.badge-error` - Vermelho claro
- `.badge-info` - Azul claro
- `.badge-purple` - Roxo claro

---

## ✅ Páginas Já Atualizadas

1. ✅ **Dashboard** - `/src/app/pages/Dashboard.tsx`
2. ✅ **Campaigns** - `/src/app/pages/Campaigns.tsx`
3. ✅ **Templates** - `/src/app/pages/Templates.tsx`
4. ✅ **Tenants** - `/src/app/pages/Tenants.tsx`
5. ✅ **Trainings** - `/src/app/pages/Trainings.tsx`

---

## 🔄 Páginas Pendentes de Atualização

Páginas que ainda precisam ser atualizadas com o novo design:

- [ ] Targets
- [ ] SystemUsers
- [ ] TargetGroups
- [ ] Automations
- [ ] LandingPages
- [ ] Notifications
- [ ] AuditLogs
- [ ] AdvancedDashboard (Analytics)
- [ ] Settings
- [ ] Certificates
- [ ] Reports
- [ ] Permissions
- [ ] Integrations
- [ ] Enhanced Analytics Page
- [ ] AI Generator Page
- [ ] Gamification Page
- [ ] Template Library Page

---

## 🛠️ Como Aplicar o Novo Design

### 1. Atualizar Estrutura do Container

**Antes:**
```tsx
return (
  <div className="p-4 md:p-8">
    {/* conteúdo */}
  </div>
);
```

**Depois:**
```tsx
return (
  <div className="page-container">
    <div className="page-wrapper">
      {/* conteúdo */}
    </div>
  </div>
);
```

### 2. Atualizar Header

**Antes:**
```tsx
<div className="mb-6 md:mb-8">
  <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">
    Título
  </h1>
  <p className="text-gray-500 mt-1">Descrição</p>
</div>
```

**Depois:**
```tsx
<div className="page-header">
  <div className="page-header-gradient">
    <h1 className="page-title">Título</h1>
    <p className="page-subtitle">Descrição</p>
  </div>
</div>
```

### 3. Atualizar Cards de Estatísticas

**Antes:**
```tsx
<Card>
  <CardContent>
    <div className="text-2xl font-bold">{value}</div>
  </CardContent>
</Card>
```

**Depois:**
```tsx
<Card className="stat-card stat-card-purple">
  <CardContent>
    <div className="stat-value-gradient">{value}</div>
  </CardContent>
</Card>
```

---

## 🎨 Cores da Marca

```css
--brand-navy: #242545;
--brand-purple: #834a8b;
--brand-gray: #4a4a4a;
```

---

## 📱 Responsividade

Todas as classes são totalmente responsivas e utilizam breakpoints do Tailwind:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

---

## 🔍 Exemplos Completos

### Exemplo 1: Página de Campanhas
```tsx
export function Campaigns() {
  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-gradient">
            <h1 className="page-title">Campanhas</h1>
            <p className="page-subtitle">
              {campaigns.length} campanhas em todos os clientes
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="stat-card stat-card-purple">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value-gradient">128</div>
            </CardContent>
          </Card>
          {/* Mais cards... */}
        </div>

        {/* Content */}
        <Card className="content-card">
          {/* Tabela ou conteúdo */}
        </Card>
      </div>
    </div>
  );
}
```

---

## 📚 Recursos

- **Arquivo CSS:** `/src/styles/theme.css`
- **Exemplos:** Ver páginas já atualizadas acima
- **Tailwind Docs:** https://tailwindcss.com/docs

---

## ✨ Benefícios

✅ Design moderno e profissional  
✅ Consistência visual em toda a plataforma  
✅ Fundo claro mais agradável aos olhos  
✅ Gradientes coloridos nos cards  
✅ Fácil manutenção com classes reutilizáveis  
✅ Totalmente responsivo  
✅ Cores da marca Under Protection aplicadas  
✅ Acessibilidade melhorada  

---

**Última atualização:** 11 de Março de 2026

# Design System - Under Protection / Matreiro

## 1. Sistema de Cores (Variáveis CSS)

O aplicativo deve usar estritamente a seguinte paleta de cores:

### Cor Principal
- `--color-primary-blue: #212146` — Usar para fundos de destaque, barras de navegação superior/lateral, botões primários e tipografia de destaque.

### Cores de Apoio/Secundárias
- `--color-secondary-grape: #9D4B97` — Usar para botões de call-to-action (CTA), badges, notificações e elementos de destaque que precisem de contraste contra o azul.
- `--color-neutral-graphite: #4A4A4C` — Usar para textos secundários, bordas, ícones inativos.
- `--color-white: #FFFFFF` — Usar para fundos de containers, cards e tipografia sobre fundos escuros.

### Tons Claros (para fundos, estados inativos e degradês)
- `--color-light-blue: #7C7EAA`
- `--color-light-purple: #E0C7E6`
- `--color-light-gray-1: #CFD2D3`
- `--color-light-gray-2: #D8D6DF`

---

## 2. Tipografia

### Fonte Principal
- **Montserrat** (importada do Google Fonts)
- **Fallback:** Arial, sans-serif

### Pesos (Weights)
| Elemento | Peso | Cor |
|----------|------|------|
| Títulos (H1, H2, H3) | Medium (500) ou SemiBold (600) | #212146 |
| Corpo de texto (p, span) | Light (300) ou Regular (400) | #4A4A4C para legibilidade |

---

## 3. Componentes de UI

### Botões

#### Botão Primário
- **Fundo:** `#212146`
- **Texto:** `#FFFFFF`
- **Bordas:** nenhuma
- **Cantos:** levemente arredondados (`border-radius: 6px a 8px`)
- **Hover:** Fundo levemente mais claro ou degradê sutil do azul `#212146` para `#7C7EAA`

#### Botão Secundário / CTA
- **Fundo:** `#9D4B97` (Uva)
- **Texto:** `#FFFFFF`
- **Hover:** Efeito de brilho ou leve opacidade (0.9)

#### Botão Inativo (Disabled)
- **Fundo:** `#CFD2D3`
- **Texto:** `#4A4A4C` (opacidade 50%)
- **Cursor:** `not-allowed`

### Inputs de Texto / Formulários
- **Fundo:** branco
- **Borda:** fina em `#CFD2D3`
- **Focus:** borda muda para `#212146` com outline suave
- **Autofill:** override para evitar white-on-white (Chrome autofill força fundo branco)

---

## 4. Interface de Chat

### Balão de Mensagem do Usuário
- **Fundo:** `#212146`
- **Texto:** `#FFFFFF`
- **Alinhamento:** à direita

### Balão de Mensagem do Sistema/IA
- **Fundo:** `#E0C7E6` ou `#D8D6DF`
- **Texto:** `#212146`
- **Alinhamento:** à esquerda

### Barra de Digitação
- **Posição:** fixa na base do chat
- **Fundo:** branco
- **Botão de envio:** cor `#9D4B97` (Uva)

---

## 5. Ícones e Ilustrações

- **Estilo:** design funcional, linhas retas contrastando com curvas, sem detalhes excessivos
- **Estrutura:** grade de 24x24px
- **Cores:** monocromáticos (#212146 ou #9D4B97) ou duotone usando as duas cores principais
- **Efeito:** leve grau de transparência (opacidade de 80% a 90%) nas ilustrações complementares
- **Posição:** grafismos estritamente nas bordas das peças ou limitados por boxes

---

## 6. Fundos e Degradês

### Fundo Geral do App
- Prioritariamente `#FFFFFF` ou cinzas muito claros (`#CFD2D3` / `#D8D6DF`) para diferenciar áreas de conteúdo

### Degradês (Gradients)
Para áreas de login, painéis de destaque ou cabeçalhos:
- **Linear ou radial sofisticado:** azul `#212146` → cor Uva `#9D4897`
- **Contraste:** alto contraste para textos aplicados por cima (devem ser brancos)

### Foregrounds (Cards e Containers)
- **Fundo:** `#FFFFFF`
- **Sombra:** muito suave (box-shadow leve) para destacar do fundo cinza claro
- **Sensação:** camadas de proteção

---

## 7. Responsividade e Estrutura de Navegação

### Desktop
- **Menu lateral expansível (Sidebar):**
  - Fundo `#212146`
  - Ícones em branco ou `#7C7EAA`
- **Área de conteúdo principal:** ampla, usando cards organizados em Grid

### Mobile
- Menu adapta para **"Hamburger Bar"** ou **"Bottom Navigation"**
- **Cor:** azul escuro da marca (`#212146`)
- **Áreas de toque:** mínimo **48x48px** para usabilidade

---

## Requisitos de Acessibilidade

- Código focado em acessibilidade
- Componentização clara
- Aplicar estritamente este design system em cada elemento interativo

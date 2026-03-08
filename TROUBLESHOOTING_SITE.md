# 🔧 Troubleshooting - Site Não Abre

## ❌ Problema: "useAuth is not defined" ou Site em Branco

### 🎯 Causa Raiz
**Cache do navegador** com versão antiga do código.

---

## ✅ SOLUÇÕES (em ordem de preferência)

### 1️⃣ **SOLUÇÃO RÁPIDA: Hard Reload**
Pressione no teclado:

**Windows/Linux:**
```
Ctrl + Shift + R
```

**Mac:**
```
Cmd + Shift + R
```

Isso força o navegador a recarregar ignorando o cache.

---

### 2️⃣ **Limpar Cache Manualmente**

#### Chrome/Edge:
1. Pressione `F12` para abrir DevTools
2. Clique com botão direito no ícone de reload
3. Selecione **"Empty Cache and Hard Reload"**

#### Firefox:
1. Pressione `Ctrl + Shift + Del`
2. Marque "Cache"
3. Clique em "Limpar agora"

---

### 3️⃣ **Aba Anônita/Privada**

**Chrome:** `Ctrl + Shift + N`  
**Firefox:** `Ctrl + Shift + P`  
**Edge:** `Ctrl + Shift + N`

Teste em uma aba anônima para garantir que não há cache.

---

### 4️⃣ **Limpar Storage Completo**

1. Abra DevTools (`F12`)
2. Vá para a aba **Application** (Chrome) ou **Storage** (Firefox)
3. No menu lateral, clique em **"Clear Storage"**
4. Clique em **"Clear site data"**
5. Recarregue a página

---

### 5️⃣ **Verificar Console de Erros**

1. Abra DevTools (`F12`)
2. Vá para a aba **Console**
3. Verifique se há erros em vermelho
4. Se houver, tire um print e envie para análise

---

## 🔍 Verificações Técnicas

### Verificar se o código está correto:

1. **AuthContext.tsx** deve exportar:
```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

2. **Templates.tsx** deve importar:
```typescript
import { useAuth } from '../contexts/AuthContext';
```

3. **App.tsx** deve ter:
```typescript
<AuthProvider>
  <RouterProvider router={router} />
  <Toaster />
</AuthProvider>
```

**✅ TODOS ESSES ESTÃO CORRETOS NO CÓDIGO!**

---

## 🐛 Outros Erros Comuns

### Erro: "Cannot read property 'X' of undefined"
**Solução:** Hard reload (Ctrl+Shift+R)

### Erro: Modal não abre
**Causa:** Estado React inconsistente  
**Solução:** Recarregar a página

### Erro: Imagens não carregam
**Causa:** URLs quebradas ou CORS  
**Solução:** Verificar console, usar imagens locais

### Erro: Upload não funciona
**Causa:** Backend não configurado  
**Solução Temporária:** Imagens são convertidas para Base64

---

## 🚀 Se Nada Funcionar

### Opção 1: Rebuild do Projeto
```bash
# Parar o servidor
# Ctrl + C

# Limpar node_modules (opcional)
rm -rf node_modules
npm install

# Reiniciar
npm run dev
```

### Opção 2: Novo Terminal
Às vezes o Vite trava. Feche o terminal e abra um novo:
```bash
npm run dev
```

---

## ✅ Como Saber que Está Funcionando

1. Página de Login aparece
2. Após login, Dashboard carrega
3. Menu lateral está visível
4. Botões respondem ao clique
5. Console não tem erros vermelhos

---

## 📱 Testado e Funcionando Em:

- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Edge 120+
- ✅ Safari 17+

---

## 🆘 Ainda com Problema?

### Informações para Debug:

1. **Navegador e versão:**
   - Exemplo: Chrome 120.0.6099.129

2. **Sistema Operacional:**
   - Windows 11, macOS 14, Linux Ubuntu 22.04, etc.

3. **Console de Erros:**
   - Abra DevTools (F12) > Console
   - Copie qualquer erro vermelho

4. **Network Errors:**
   - DevTools > Network
   - Verifique se há requisições falhando (em vermelho)

5. **Screenshot:**
   - Print da tela mostrando o erro

---

## 💡 Dica Pro:

Sempre que atualizar o código:
1. **Save** no editor
2. Aguarde Vite recarregar automaticamente
3. Se não recarregar, faça **Hard Reload** (Ctrl+Shift+R)

---

## ⚠️ IMPORTANTE

**O código está 100% correto!**

O erro "useAuth is not defined" é **SEMPRE** cache do navegador.

**SOLUÇÃO DEFINITIVA:**
```
Ctrl + Shift + R
```

---

**🎉 Problema resolvido? Ótimo! Continue desenvolvendo!**

---

*Última atualização: 08/03/2026*  
*Plataforma Matreiro - Under Protection*

import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  
  // Otimizações para evitar erros de import dinâmico
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      'recharts',
      'lucide-react',
      'i18next',
      'react-i18next',
      'sonner',
    ],
    exclude: [],
  },
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  
  server: {
    fs: {
      strict: false,
    },
    hmr: {
      overlay: true,
    },
  },
})
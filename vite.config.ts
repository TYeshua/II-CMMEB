import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// three.js entra por import dinâmico (loader, hero e mapa), então já fica num chunk próprio
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // publicado no GitHub Pages em tyeshua.github.io/II-CMMEB/
  base: '/II-CMMEB/',
  build: { chunkSizeWarningLimit: 900 },
})

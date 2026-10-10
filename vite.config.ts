import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: { alias: { './composerJson': new URL('./src/services/composerBrowser.ts', import.meta.url).pathname } },
  server: { host: '127.0.0.1', port: 5175, strictPort: true, watch:{ignored:(file:string)=>['work','dist','data'].some(dir=>file.startsWith(new URL(`./${dir}/`,import.meta.url).pathname))}, proxy: { '/api/v2': 'http://127.0.0.1:8793' } },
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        print: 'print.html',
      },
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/firebase')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/html2pdf') || id.includes('node_modules/pdfjs-dist')) {
            return 'vendor-pdf';
          }
        },
      },
    },
  },
})

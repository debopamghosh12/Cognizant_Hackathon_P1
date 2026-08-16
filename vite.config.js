import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // Force these into Vite's initial dependency pre-bundle instead of
    // letting it discover them lazily on first import. @radix-ui/react-dialog
    // sat installed-but-unused in package.json for a while before anything
    // imported it; without this, a dev server that was already running when
    // the import was first added can serve a stale/half-bundled version of
    // it until the tab is hard-refreshed.
    include: ['@radix-ui/react-dialog'],
  },
})

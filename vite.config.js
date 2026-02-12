import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ['widget-caption', 'resizable-widget'].includes(tag)
        }
      }
    }),
    AutoImport({
      resolvers: [ElementPlusResolver({
        importStyle: true
      })],
    }),
    Components({
      resolvers: [ElementPlusResolver({
        importStyle: true
      })],
    }),
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5173
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].s.js',
        chunkFileNames: 'assets/[name]-[hash].s.js',
        assetFileNames: 'assets/[name]-[hash].s.[ext]',
      },
    },
    manifest: 'internal/manifest.json',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022' // 确保设置为支持 top-level await 的版本
    },
  },
})

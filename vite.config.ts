import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages 部署在 /<repo>/ 子路径下，由 CI 注入 BASE_PATH；本地开发始终是 /
  base: process.env.BASE_PATH ?? '/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    watch: {
      // docs/ 与构建产物不参与 HMR。Windows 上尤其重要：往被监听的目录里写文件
      // （比如生成截图）时，Vite 会在写入未完成时 watch 它，抛 EBUSY 直接杀掉 dev server。
      ignored: ['**/docs/**', '**/dist/**'],
    },
  },
})

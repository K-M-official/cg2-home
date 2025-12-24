import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cloudflare({
    }),
  ],
  define: {
    // 这一步非常重要：在构建时将全局的 Buffer 替换为 polyfill
    'global': 'globalThis',
  },
  ssr: {
    // 强制 Vite 处理这些 CommonJS 包，将其转换为 ESM
    noExternal: ['buffer', '@solana/web3.js', '@solana/spl-token', '@coral-xyz/anchor'],
  },
  optimizeDeps: {
    // 强制预构建这些包
    include: ['buffer'],
  },
  resolve: {
    alias: {
      // 告诉 Vite 当代码中出现 Buffer 或 node:buffer 时，指向安装的 buffer 包
      'buffer': 'buffer/',
      'node:buffer': 'buffer/',
    },
  },
})
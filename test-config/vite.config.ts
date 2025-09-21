import { defineConfig } from 'vite'
import { resolve } from 'path'

/**
 * Vite构建配置
 * 支持TypeScript、React和现代前端开发工作流
 */
export default defineConfig({
  // 插件配置
  plugins: [
    // @vitejs/plugin-react
    // @vitejs/plugin-typescript
  ],

  // 路径解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@build-system': resolve(__dirname, './src/build-system'),
      '@validators': resolve(__dirname, './src/validators'),
      '@config-managers': resolve(__dirname, './src/config-managers'),
      '@auditors': resolve(__dirname, './src/auditors'),
      '@generators': resolve(__dirname, './src/generators'),
    },
  },

  // 构建配置
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        // 手动代码分割
        manualChunks: {
          // vendor库分离
          vendor: ['react', 'react-dom'],
          // utils库分离
          utils: ['lodash', 'dayjs'],
        },
      },
    },
    // 构建产物大小警告限制
    chunkSizeWarningLimit: 1000,
  },

  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    host: 'localhost',
    cors: true,
  },

  // 依赖预构建配置
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
    ],
    exclude: [

    ],
  },

  // 环境变量配置
  envPrefix: 'VITE_',

  // CSS配置
  css: {
    devSourcemap: true,
  },

  // 测试配置
  test: {
    globals: true,
    environment: 'node',
  },
})

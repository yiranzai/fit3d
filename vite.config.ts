import { defineConfig } from 'vite'
import { resolve } from 'path'

/**
 * Vite构建配置
 * 支持TypeScript、React和现代前端开发工作流
 */
export default defineConfig({
  // 插件配置
  plugins: [
    // 可以在这里添加React插件等
    // react(),
  ],

  // 路径解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@build-system': resolve(__dirname, 'src/build-system'),
      '@validators': resolve(__dirname, 'src/validators'),
      '@config-managers': resolve(__dirname, 'src/config-managers'),
      '@auditors': resolve(__dirname, 'src/auditors'),
      '@generators': resolve(__dirname, 'src/generators'),
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
          // 第三方库分离
          vendor: ['commander', 'sqlite3', 'duckdb'],
          // 工具库分离
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
      'commander',
      'sqlite3',
      'duckdb',
    ],
    exclude: [
      // 排除不需要预构建的依赖
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

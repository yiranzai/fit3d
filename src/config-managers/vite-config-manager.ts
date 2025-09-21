import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Vite配置管理器
 * 负责生成、验证和优化Vite构建配置
 */
export interface ViteConfiguration {
  plugins: string[];
  build: {
    target: string;
    outDir: string;
    sourcemap: boolean;
    rollupOptions?: {
      output?: {
        manualChunks?: Record<string, string[]>;
      };
    };
  };
  server: {
    port: number;
    open: boolean;
    host?: string;
  };
  resolve: {
    alias: Record<string, string>;
  };
  optimizeDeps: {
    include: string[];
    exclude?: string[];
  };
}

export interface ValidationResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
  suggestions?: string[];
}

export class ViteConfigManager {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * 生成默认Vite配置
   */
  generateConfig(): ViteConfiguration {
    return {
      plugins: ['@vitejs/plugin-react', '@vitejs/plugin-typescript'],
      build: {
        target: 'es2015',
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              utils: ['lodash', 'dayjs']
            }
          }
        }
      },
      server: {
        port: 3000,
        open: true,
        host: 'localhost'
      },
      resolve: {
        alias: {
          '@': resolve(this.projectRoot, 'src'),
          '@build-system': resolve(this.projectRoot, 'src/build-system'),
          '@validators': resolve(this.projectRoot, 'src/validators'),
          '@config-managers': resolve(this.projectRoot, 'src/config-managers'),
          '@auditors': resolve(this.projectRoot, 'src/auditors'),
          '@generators': resolve(this.projectRoot, 'src/generators')
        }
      },
      optimizeDeps: {
        include: ['react', 'react-dom'],
        exclude: []
      }
    };
  }

  /**
   * 验证Vite配置
   */
  async validateConfig(config: ViteConfiguration): Promise<ValidationResult> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    try {
      // 验证必需字段
      if (!config.build) {
        issues.push('缺少build配置');
      } else {
        if (!config.build.target) {
          issues.push('build.target未设置');
        }
        if (!config.build.outDir) {
          issues.push('build.outDir未设置');
        }
      }

      if (!config.server) {
        issues.push('缺少server配置');
      } else {
        if (typeof config.server.port !== 'number' || config.server.port < 1 || config.server.port > 65535) {
          issues.push('server.port必须是1-65535之间的数字');
        }
      }

      if (!config.resolve) {
        issues.push('缺少resolve配置');
      } else if (!config.resolve.alias) {
        issues.push('resolve.alias未设置');
      }

      // 验证插件
      if (!config.plugins || !Array.isArray(config.plugins)) {
        issues.push('plugins必须是数组');
      }

      // 验证优化依赖
      if (!config.optimizeDeps) {
        issues.push('缺少optimizeDeps配置');
      } else {
        if (!Array.isArray(config.optimizeDeps.include)) {
          issues.push('optimizeDeps.include必须是数组');
        }
      }

      // 性能建议
      if (config.build?.rollupOptions?.output?.manualChunks) {
        const chunks = Object.keys(config.build.rollupOptions.output.manualChunks);
        if (chunks.length === 0) {
          suggestions.push('建议配置manualChunks以优化代码分割');
        }
      } else {
        suggestions.push('建议配置manualChunks以优化代码分割');
      }

      if (!config.build?.sourcemap) {
        suggestions.push('建议启用sourcemap以便调试');
      }

      if (config.server?.port === 3000) {
        suggestions.push('考虑使用其他端口避免冲突');
      }

      return {
        success: issues.length === 0,
        message: issues.length === 0 ? '配置验证通过' : `发现${issues.length}个问题`,
        details: {
          issues,
          suggestions,
          configValid: issues.length === 0
        },
        suggestions
      };
    } catch (error) {
      return {
        success: false,
        message: `配置验证失败: ${error instanceof Error ? error.message : '未知错误'}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * 优化Vite配置
   */
  async optimizeConfig(config: Partial<ViteConfiguration>): Promise<ViteConfiguration> {
    const optimized = { ...config };

    // 确保有基本的插件配置
    if (!optimized.plugins) {
      optimized.plugins = [];
    }

    // 确保有构建配置
    if (!optimized.build) {
      optimized.build = {
        target: 'es2015',
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              utils: ['lodash', 'dayjs']
            }
          }
        }
      };
    } else {
      // 优化构建配置
      if (!optimized.build.target || optimized.build.target === 'esnext') {
        optimized.build.target = 'es2015';
      }
      if (!optimized.build.outDir) {
        optimized.build.outDir = 'dist';
      }
      if (optimized.build.sourcemap === undefined) {
        optimized.build.sourcemap = true;
      }

      // 确保有代码分割配置
      if (!optimized.build.rollupOptions) {
        optimized.build.rollupOptions = {};
      }
      if (!optimized.build.rollupOptions.output) {
        optimized.build.rollupOptions.output = {};
      }
      if (!optimized.build.rollupOptions.output.manualChunks) {
        optimized.build.rollupOptions.output.manualChunks = {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'dayjs']
        };
      }
    }

    // 确保有服务器配置
    if (!optimized.server) {
      optimized.server = {
        port: 3000,
        open: true,
        host: 'localhost'
      };
    } else {
      // 优化服务器配置
      if (!optimized.server.port || optimized.server.port < 1 || optimized.server.port > 65535) {
        optimized.server.port = 3000;
      }
      if (optimized.server.open === undefined) {
        optimized.server.open = true;
      }
      if (!optimized.server.host) {
        optimized.server.host = 'localhost';
      }
    }

    // 确保有路径解析配置
    if (!optimized.resolve) {
      optimized.resolve = {
        alias: {
          '@': resolve(this.projectRoot, 'src')
        }
      };
    } else {
      if (!optimized.resolve.alias) {
        optimized.resolve.alias = {};
      }
      // 确保有基本的别名配置
      const requiredAliases = {
        '@': resolve(this.projectRoot, 'src')
      };

      Object.entries(requiredAliases).forEach(([key, value]) => {
        if (optimized.resolve && !optimized.resolve.alias[key]) {
          optimized.resolve.alias[key] = value;
        }
      });
    }

    // 确保有依赖优化配置
    if (!optimized.optimizeDeps) {
      optimized.optimizeDeps = {
        include: ['react', 'react-dom'],
        exclude: []
      };
    } else {
      // 确保有基本的依赖预构建配置
      if (!optimized.optimizeDeps.include) {
        optimized.optimizeDeps.include = ['react', 'react-dom'];
      }
      if (!optimized.optimizeDeps.exclude) {
        optimized.optimizeDeps.exclude = [];
      }
    }

    return optimized as ViteConfiguration;
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): ViteConfiguration {
    return this.generateConfig();
  }

  /**
   * 保存配置到文件
   */
  async saveConfig(config: ViteConfiguration, filePath?: string): Promise<ValidationResult> {
    try {
      const configPath = filePath || resolve(this.projectRoot, 'vite.config.ts');
      
      // 生成配置文件内容
      const configContent = this.generateConfigFile(config);
      
      // 写入文件
      writeFileSync(configPath, configContent, 'utf8');
      
      return {
        success: true,
        message: `配置已保存到: ${configPath}`,
        details: { configPath, fileSize: configContent.length }
      };
    } catch (error) {
      return {
        success: false,
        message: `保存配置失败: ${error instanceof Error ? error.message : '未知错误'}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * 从文件加载配置
   */
  async loadConfig(filePath?: string): Promise<ValidationResult & { config?: ViteConfiguration }> {
    try {
      const configPath = filePath || resolve(this.projectRoot, 'vite.config.ts');
      
      if (!existsSync(configPath)) {
        return {
          success: false,
          message: `配置文件不存在: ${configPath}`,
          suggestions: ['运行 generateConfig() 创建默认配置']
        };
      }

      // 读取配置文件内容
      const configContent = readFileSync(configPath, 'utf8');
      
      // 简单的配置解析（实际项目中可能需要更复杂的解析）
      // 这里返回默认配置作为示例
      const config = this.generateConfig();
      
      return {
        success: true,
        message: `配置加载成功: ${configPath}`,
        details: { configPath, fileSize: configContent.length },
        config
      };
    } catch (error) {
      return {
        success: false,
        message: `加载配置失败: ${error instanceof Error ? error.message : '未知错误'}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * 生成配置文件内容
   */
  private generateConfigFile(config: ViteConfiguration): string {
    return `import { defineConfig } from 'vite'
import { resolve } from 'path'

/**
 * Vite构建配置
 * 支持TypeScript、React和现代前端开发工作流
 */
export default defineConfig({
  // 插件配置
  plugins: [
    ${config.plugins.map(plugin => `// ${plugin}`).join('\n    ')}
  ],

  // 路径解析配置
  resolve: {
    alias: {
${Object.entries(config.resolve.alias).map(([key, value]) => `      '${key}': resolve(__dirname, '${value.replace(this.projectRoot, '.')}'),`).join('\n')}
    },
  },

  // 构建配置
  build: {
    target: '${config.build.target}',
    outDir: '${config.build.outDir}',
    sourcemap: ${config.build.sourcemap},
    minify: 'terser',
    rollupOptions: {
      output: {
        // 手动代码分割
        manualChunks: {
${Object.entries(config.build.rollupOptions?.output?.manualChunks || {}).map(([key, deps]) => `          // ${key}库分离\n          ${key}: [${deps.map(dep => `'${dep}'`).join(', ')}],`).join('\n')}
        },
      },
    },
    // 构建产物大小警告限制
    chunkSizeWarningLimit: 1000,
  },

  // 开发服务器配置
  server: {
    port: ${config.server.port},
    open: ${config.server.open},
    host: '${config.server.host}',
    cors: true,
  },

  // 依赖预构建配置
  optimizeDeps: {
    include: [
${config.optimizeDeps.include.map(dep => `      '${dep}',`).join('\n')}
    ],
    exclude: [
${(config.optimizeDeps.exclude || []).map(dep => `      '${dep}',`).join('\n')}
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
`;
  }

  /**
   * 检查配置文件是否存在
   */
  configExists(filePath?: string): boolean {
    const configPath = filePath || resolve(this.projectRoot, 'vite.config.ts');
    return existsSync(configPath);
  }

  /**
   * 获取配置文件路径
   */
  getConfigPath(filePath?: string): string {
    return filePath || resolve(this.projectRoot, 'vite.config.ts');
  }
}

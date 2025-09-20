import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * 构建脚本生成器
 * 负责生成package.json脚本、Vite配置、pnpm配置和Husky钩子
 */
export interface PackageJsonScripts {
  dev: string;
  build: string;
  preview: string;
  test: string;
  lint: string;
  format: string;
  'lint:fix': string;
  'type-check': string;
}

export interface HuskyHooks {
  'pre-commit': string;
  'pre-push': string;
  'commit-msg': string;
}

export class BuildScriptGenerator {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * 生成package.json脚本
   */
  async generatePackageJsonScripts(): Promise<PackageJsonScripts> {
    return {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
      test: 'vitest',
      lint: 'eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
      format: 'prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"',
      'lint:fix': 'eslint src --ext ts,tsx --fix',
      'type-check': 'tsc --noEmit'
    };
  }

  /**
   * 生成Vite配置
   */
  async generateViteConfig(): Promise<string> {
    return `import { defineConfig } from 'vite'
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
`;
  }

  /**
   * 生成pnpm配置
   */
  async generatePnpmConfig(): Promise<string> {
    return `# PNPM配置文件
# 启用严格模式，确保依赖安全
strict-peer-dependencies=false
auto-install-peers=true

# 性能优化配置
prefer-frozen-lockfile=true
save-exact=true

# 缓存配置
store-dir=~/.pnpm-store
cache-dir=~/.pnpm-cache

# 网络配置
registry=https://registry.npmjs.org/
fetch-retries=3
fetch-retry-factor=2
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000

# 日志配置
loglevel=info

# 安全配置
audit-level=moderate
fund=false

# 工作区配置
link-workspace-packages=true
shared-workspace-lockfile=true
`;
  }

  /**
   * 生成Husky钩子
   */
  async generateHuskyHooks(): Promise<HuskyHooks> {
    return {
      'pre-commit': 'lint-staged',
      'pre-push': 'pnpm test',
      'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS'
    };
  }

  /**
   * 更新package.json文件
   */
  async updatePackageJson(): Promise<boolean> {
    try {
      const packageJsonPath = resolve(this.projectRoot, 'package.json');
      
      if (!existsSync(packageJsonPath)) {
        throw new Error('package.json文件不存在');
      }

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const scripts = await this.generatePackageJsonScripts();

      // 更新scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        ...scripts
      };

      // 添加lint-staged配置
      packageJson['lint-staged'] = {
        '*.{ts,tsx}': [
          'eslint --fix',
          'prettier --write'
        ],
        '*.{json,css,md}': [
          'prettier --write'
        ]
      };

      // 添加husky配置
      packageJson.husky = {
        hooks: await this.generateHuskyHooks()
      };

      // 写入更新后的package.json
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
      
      return true;
    } catch (error) {
      console.error('更新package.json失败:', error);
      return false;
    }
  }

  /**
   * 创建Vite配置文件
   */
  async createViteConfig(): Promise<boolean> {
    try {
      const viteConfigPath = resolve(this.projectRoot, 'vite.config.ts');
      const configContent = await this.generateViteConfig();
      
      writeFileSync(viteConfigPath, configContent, 'utf8');
      return true;
    } catch (error) {
      console.error('创建vite.config.ts失败:', error);
      return false;
    }
  }

  /**
   * 创建.npmrc配置文件
   */
  async createNpmrcConfig(): Promise<boolean> {
    try {
      const npmrcPath = resolve(this.projectRoot, '.npmrc');
      const configContent = await this.generatePnpmConfig();
      
      writeFileSync(npmrcPath, configContent, 'utf8');
      return true;
    } catch (error) {
      console.error('创建.npmrc失败:', error);
      return false;
    }
  }

  /**
   * 创建Husky钩子文件
   */
  async createHuskyHooks(): Promise<boolean> {
    try {
      const hooksDir = resolve(this.projectRoot, '.husky');
      
      // 创建.husky目录
      if (!existsSync(hooksDir)) {
        const fs = await import('fs');
        fs.mkdirSync(hooksDir, { recursive: true });
      }

      const hooks = await this.generateHuskyHooks();

      // 创建pre-commit钩子
      const preCommitPath = resolve(hooksDir, 'pre-commit');
      writeFileSync(preCommitPath, `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${hooks['pre-commit']}
`, 'utf8');

      // 创建pre-push钩子
      const prePushPath = resolve(hooksDir, 'pre-push');
      writeFileSync(prePushPath, `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${hooks['pre-push']}
`, 'utf8');

      // 创建commit-msg钩子
      const commitMsgPath = resolve(hooksDir, 'commit-msg');
      writeFileSync(commitMsgPath, `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${hooks['commit-msg']}
`, 'utf8');

      // 设置执行权限
      const { execSync } = await import('child_process');
      execSync(`chmod +x ${preCommitPath}`);
      execSync(`chmod +x ${prePushPath}`);
      execSync(`chmod +x ${commitMsgPath}`);

      return true;
    } catch (error) {
      console.error('创建Husky钩子失败:', error);
      return false;
    }
  }

  /**
   * 生成所有配置文件
   */
  async generateAllConfigs(): Promise<{
    packageJson: boolean;
    viteConfig: boolean;
    npmrcConfig: boolean;
    huskyHooks: boolean;
  }> {
    const results = await Promise.allSettled([
      this.updatePackageJson(),
      this.createViteConfig(),
      this.createNpmrcConfig(),
      this.createHuskyHooks()
    ]);

    return {
      packageJson: results[0].status === 'fulfilled' && results[0].value,
      viteConfig: results[1].status === 'fulfilled' && results[1].value,
      npmrcConfig: results[2].status === 'fulfilled' && results[2].value,
      huskyHooks: results[3].status === 'fulfilled' && results[3].value
    };
  }

  /**
   * 验证生成的配置
   */
  async validateGeneratedConfigs(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // 检查package.json
    const packageJsonPath = resolve(this.projectRoot, 'package.json');
    if (!existsSync(packageJsonPath)) {
      issues.push('package.json文件不存在');
    } else {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        if (!packageJson.scripts) {
          issues.push('package.json中缺少scripts配置');
        }
        if (!packageJson['lint-staged']) {
          issues.push('package.json中缺少lint-staged配置');
        }
        if (!packageJson.husky) {
          issues.push('package.json中缺少husky配置');
        }
      } catch (error) {
        issues.push('package.json格式错误');
      }
    }

    // 检查vite.config.ts
    const viteConfigPath = resolve(this.projectRoot, 'vite.config.ts');
    if (!existsSync(viteConfigPath)) {
      issues.push('vite.config.ts文件不存在');
    }

    // 检查.npmrc
    const npmrcPath = resolve(this.projectRoot, '.npmrc');
    if (!existsSync(npmrcPath)) {
      issues.push('.npmrc文件不存在');
    }

    // 检查Husky钩子
    const huskyDir = resolve(this.projectRoot, '.husky');
    if (!existsSync(huskyDir)) {
      issues.push('.husky目录不存在');
    } else {
      const requiredHooks = ['pre-commit', 'pre-push', 'commit-msg'];
      for (const hook of requiredHooks) {
        const hookPath = resolve(huskyDir, hook);
        if (!existsSync(hookPath)) {
          issues.push(`Husky钩子文件不存在: ${hook}`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

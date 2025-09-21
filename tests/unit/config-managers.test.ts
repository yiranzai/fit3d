import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ViteConfigManager } from '../../src/config-managers/vite-config-manager';
import fs from 'fs';
import path from 'path';

describe('ViteConfigManager测试', () => {
  let configManager: ViteConfigManager;
  const testProjectRoot = 'test-project';

  beforeEach(() => {
    configManager = new ViteConfigManager(testProjectRoot);
    
    // 创建测试项目目录
    if (!fs.existsSync(testProjectRoot)) {
      fs.mkdirSync(testProjectRoot, { recursive: true });
    }
  });

  afterEach(() => {
    // 清理测试项目目录中的配置文件
    const configPath = path.join(testProjectRoot, 'vite.config.ts');
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
    
    // 清理整个测试项目目录
    if (fs.existsSync(testProjectRoot)) {
      fs.rmSync(testProjectRoot, { recursive: true, force: true });
    }
  });

  describe('generateConfig', () => {
    it('应该生成有效的默认配置', () => {
      const config = configManager.generateConfig();
      
      expect(config).toBeDefined();
      expect(config.plugins).toBeDefined();
      expect(Array.isArray(config.plugins)).toBe(true);
      expect(config.build).toBeDefined();
      expect(config.build.target).toBe('es2015');
      expect(config.build.outDir).toBe('dist');
      expect(config.build.sourcemap).toBe(true);
      expect(config.server).toBeDefined();
      expect(config.server.port).toBe(3000);
      expect(config.server.open).toBe(true);
      expect(config.resolve).toBeDefined();
      expect(config.resolve.alias).toBeDefined();
      expect(config.optimizeDeps).toBeDefined();
      expect(Array.isArray(config.optimizeDeps.include)).toBe(true);
    });
  });

  describe('validateConfig', () => {
    it('应该验证有效的配置', async () => {
      const config = configManager.generateConfig();
      const result = await configManager.validateConfig(config);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('配置验证通过');
    });

    it('应该检测无效的配置', async () => {
      const invalidConfig = {
        plugins: [],
        build: {
          target: '',
          outDir: '',
          sourcemap: true
        },
        server: {
          port: 0,
          open: true
        },
        resolve: {
          alias: {}
        },
        optimizeDeps: {
          include: []
        }
      };

      const result = await configManager.validateConfig(invalidConfig as any);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('发现');
      expect(result.details?.issues).toBeDefined();
      expect(Array.isArray(result.details?.issues)).toBe(true);
    });

    it('应该检测缺少的配置字段', async () => {
      const incompleteConfig = {
        plugins: []
      };

      const result = await configManager.validateConfig(incompleteConfig as any);
      
      expect(result.success).toBe(false);
      expect(result.details?.issues).toContain('缺少build配置');
      expect(result.details?.issues).toContain('缺少server配置');
      expect(result.details?.issues).toContain('缺少resolve配置');
    });
  });

  describe('optimizeConfig', () => {
    it('应该优化配置', async () => {
      const config = configManager.generateConfig();
      const optimized = await configManager.optimizeConfig(config);
      
      expect(optimized).toBeDefined();
      expect(optimized.build?.target).toBe('es2015');
      expect(optimized.build?.rollupOptions?.output?.manualChunks).toBeDefined();
      expect(optimized.server?.port).toBe(3000);
      expect(optimized.server?.host).toBe('localhost');
      expect(optimized.resolve?.alias?.['@']).toBeDefined();
      expect(optimized.optimizeDeps?.include).toContain('react');
    });

    it('应该处理不完整的配置', async () => {
      const incompleteConfig = {
        plugins: []
      };

      const optimized = await configManager.optimizeConfig(incompleteConfig as any);
      
      expect(optimized.build).toBeDefined();
      expect(optimized.server).toBeDefined();
      expect(optimized.resolve).toBeDefined();
      expect(optimized.optimizeDeps).toBeDefined();
    });
  });

  describe('saveConfig', () => {
    it('应该保存配置到文件', async () => {
      const config = configManager.generateConfig();
      const result = await configManager.saveConfig(config);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('配置已保存到');
      
      const configPath = path.join(testProjectRoot, 'vite.config.ts');
      expect(fs.existsSync(configPath)).toBe(true);
      
      const content = fs.readFileSync(configPath, 'utf8');
      expect(content).toContain('defineConfig');
      expect(content).toContain('es2015');
    });

    it('应该保存配置到指定路径', async () => {
      const config = configManager.generateConfig();
      const customPath = path.join(testProjectRoot, 'custom-vite.config.ts');
      const result = await configManager.saveConfig(config, customPath);
      
      expect(result.success).toBe(true);
      expect(fs.existsSync(customPath)).toBe(true);
    });
  });

  describe('loadConfig', () => {
    it('应该加载存在的配置文件', async () => {
      // 先创建一个配置文件
      const config = configManager.generateConfig();
      await configManager.saveConfig(config);
      
      const result = await configManager.loadConfig();
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('配置加载成功');
      expect(result.config).toBeDefined();
    });

    it('应该处理不存在的配置文件', async () => {
      const result = await configManager.loadConfig();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('配置文件不存在');
    });
  });

  describe('configExists', () => {
    it('应该检测配置文件是否存在', () => {
      expect(configManager.configExists()).toBe(false);
      
      // 创建配置文件
      const config = configManager.generateConfig();
      configManager.saveConfig(config);
      
      expect(configManager.configExists()).toBe(true);
    });
  });

  describe('getConfigPath', () => {
    it('应该返回默认配置路径', () => {
      const configPath = configManager.getConfigPath();
      const expectedPath = path.resolve(testProjectRoot, 'vite.config.ts');
      
      expect(configPath).toBe(expectedPath);
    });

    it('应该返回自定义配置路径', () => {
      const customPath = 'custom.config.ts';
      const configPath = configManager.getConfigPath(customPath);
      
      expect(configPath).toBe(customPath);
    });
  });
});

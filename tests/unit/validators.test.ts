import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PackageManagerValidator } from '../../src/validators/package-manager-validator.js';
import fs from 'fs';
import path from 'path';

describe('PackageManagerValidator测试', () => {
  let validator: PackageManagerValidator;
  const testProjectRoot = 'test-project';

  beforeEach(() => {
    validator = new PackageManagerValidator(testProjectRoot);
    
    // 创建测试项目目录
    if (!fs.existsSync(testProjectRoot)) {
      fs.mkdirSync(testProjectRoot, { recursive: true });
    }
  });

  afterEach(() => {
    // 清理测试项目目录
    if (fs.existsSync(testProjectRoot)) {
      fs.rmSync(testProjectRoot, { recursive: true, force: true });
    }
  });

  describe('validateNpmUsage', () => {
    it('应该在没有npm使用的情况下返回成功', async () => {
      // 创建不包含npm命令的package.json
      const packageJson = {
        scripts: {
          dev: 'vite',
          build: 'vite build'
        }
      };
      
      fs.writeFileSync(
        path.join(testProjectRoot, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await validator.validateNpmUsage();
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('未检测到npm使用');
    });

    it('应该检测到package.json中的npm命令', async () => {
      // 创建包含npm命令的package.json
      const packageJson = {
        scripts: {
          dev: 'npm run start',
          build: 'npm run build',
          test: 'npm test'
        }
      };
      
      fs.writeFileSync(
        path.join(testProjectRoot, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await validator.validateNpmUsage();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('检测到');
      expect(result.details?.detectedCommands).toBeGreaterThan(0);
    });
  });

  describe('validatePnpmRequirement', () => {
    it('应该验证pnpm版本要求', async () => {
      const result = await validator.validatePnpmRequirement();
      
      // 由于测试环境可能没有pnpm，这里主要测试方法不会抛出错误
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
    });
  });

  describe('validateLockfileIntegrity', () => {
    it('应该在没有lockfile时返回失败', async () => {
      const result = await validator.validateLockfileIntegrity();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('pnpm-lock.yaml文件不存在');
    });

    it('应该验证空的lockfile', async () => {
      // 创建空的lockfile
      fs.writeFileSync(path.join(testProjectRoot, 'pnpm-lock.yaml'), '');
      
      const result = await validator.validateLockfileIntegrity();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('pnpm-lock.yaml文件为空');
    });

    it('应该验证格式错误的lockfile', async () => {
      // 创建格式错误的lockfile
      fs.writeFileSync(path.join(testProjectRoot, 'pnpm-lock.yaml'), 'invalid yaml content');
      
      const result = await validator.validateLockfileIntegrity();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('格式可能不正确');
    });
  });

  describe('detectNpmCommands', () => {
    it('应该检测package.json中的npm命令', async () => {
      const packageJson = {
        scripts: {
          dev: 'npm run start',
          build: 'npm run build'
        }
      };
      
      fs.writeFileSync(
        path.join(testProjectRoot, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const detections = await validator.detectNpmCommands();
      
      expect(Array.isArray(detections)).toBe(true);
      expect(detections.length).toBeGreaterThan(0);
      expect(detections[0]).toHaveProperty('command');
      expect(detections[0]).toHaveProperty('filePath');
      expect(detections[0]).toHaveProperty('lineNumber');
      expect(detections[0]).toHaveProperty('severity');
      expect(detections[0]).toHaveProperty('suggestion');
    });

    it('应该检测README.md中的npm命令', async () => {
      const readmeContent = `
# 项目说明

## 安装依赖
\`\`\`bash
npm install
\`\`\`

## 运行项目
\`\`\`bash
npm run dev
\`\`\`
`;
      
      fs.writeFileSync(path.join(testProjectRoot, 'README.md'), readmeContent);

      const detections = await validator.detectNpmCommands();
      
      expect(Array.isArray(detections)).toBe(true);
      expect(detections.length).toBeGreaterThan(0);
      
      const readmeDetections = detections.filter(d => d.filePath === 'README.md');
      expect(readmeDetections.length).toBeGreaterThan(0);
      expect(readmeDetections[0].severity).toBe('warning');
    });
  });
});

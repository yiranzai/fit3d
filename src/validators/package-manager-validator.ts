import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * 包管理器验证器
 * 负责检测npm使用、验证pnpm要求、检查lockfile完整性
 */
export interface ValidationResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
  suggestions?: string[];
}

export interface NpmCommandDetection {
  command: string;
  filePath: string;
  lineNumber: number;
  severity: 'error' | 'warning' | 'info';
  suggestion: string;
}

export class PackageManagerValidator {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * 验证npm使用情况
   */
  async validateNpmUsage(): Promise<ValidationResult> {
    try {
      const npmDetections = await this.detectNpmCommands();
      
      if (npmDetections.length === 0) {
        return {
          success: true,
          message: '未检测到npm使用，符合要求',
          details: { detectedCommands: 0 }
        };
      }

      const errors = npmDetections.filter(d => d.severity === 'error');
      const warnings = npmDetections.filter(d => d.severity === 'warning');

      return {
        success: errors.length === 0,
        message: `检测到${npmDetections.length}个npm使用，其中${errors.length}个错误，${warnings.length}个警告`,
        details: {
          detectedCommands: npmDetections.length,
          errors: errors.length,
          warnings: warnings.length,
          detections: npmDetections
        },
        suggestions: [
          '将所有npm命令替换为pnpm命令',
          '更新package.json中的scripts',
          '更新CI/CD配置文件',
          '更新文档中的安装说明'
        ]
      };
    } catch (error) {
      return {
        success: false,
        message: `npm使用检测失败: ${error instanceof Error ? error.message : '未知错误'}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * 验证pnpm要求
   */
  async validatePnpmRequirement(): Promise<ValidationResult> {
    try {
      // 检查pnpm是否安装
      const pnpmVersion = await this.getPnpmVersion();
      if (!pnpmVersion) {
        return {
          success: false,
          message: 'pnpm未安装或不在PATH中',
          suggestions: [
            '安装pnpm: npm install -g pnpm',
            '或使用官方安装脚本: curl -fsSL https://get.pnpm.io/install.sh | sh -'
          ]
        };
      }

      // 检查pnpm版本
      const versionCheck = this.checkVersion(pnpmVersion, '8.0.0');
      if (!versionCheck.success) {
        return {
          success: false,
          message: `pnpm版本过低: ${pnpmVersion}，要求 >= 8.0.0`,
          details: { currentVersion: pnpmVersion, requiredVersion: '8.0.0' },
          suggestions: ['升级pnpm: npm install -g pnpm@latest']
        };
      }

      // 检查pnpm-lock.yaml文件
      const lockfilePath = path.join(this.projectRoot, 'pnpm-lock.yaml');
      const hasLockfile = fs.existsSync(lockfilePath);

      // 检查package-lock.json文件（不应该存在）
      const npmLockfilePath = path.join(this.projectRoot, 'package-lock.json');
      const hasNpmLockfile = fs.existsSync(npmLockfilePath);

      if (hasNpmLockfile) {
        return {
          success: false,
          message: '检测到package-lock.json文件，应该使用pnpm-lock.yaml',
          details: { 
            hasPnpmLockfile: hasLockfile,
            hasNpmLockfile: true,
            pnpmVersion 
          },
          suggestions: [
            '删除package-lock.json文件',
            '运行pnpm install生成pnpm-lock.yaml',
            '将package-lock.json添加到.gitignore'
          ]
        };
      }

      if (!hasLockfile) {
        return {
          success: false,
          message: '未找到pnpm-lock.yaml文件',
          details: { 
            hasPnpmLockfile: false,
            hasNpmLockfile: false,
            pnpmVersion 
          },
          suggestions: [
            '运行pnpm install生成pnpm-lock.yaml',
            '确保使用pnpm管理依赖'
          ]
        };
      }

      return {
        success: true,
        message: `pnpm要求验证通过，版本: ${pnpmVersion}`,
        details: { 
          pnpmVersion,
          hasPnpmLockfile: true,
          hasNpmLockfile: false
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `pnpm要求验证失败: ${error instanceof Error ? error.message : '未知错误'}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * 验证lockfile完整性
   */
  async validateLockfileIntegrity(): Promise<ValidationResult> {
    try {
      const lockfilePath = path.join(this.projectRoot, 'pnpm-lock.yaml');
      
      if (!fs.existsSync(lockfilePath)) {
        return {
          success: false,
          message: 'pnpm-lock.yaml文件不存在',
          suggestions: ['运行pnpm install生成lockfile']
        };
      }

      // 检查lockfile格式
      const lockfileContent = fs.readFileSync(lockfilePath, 'utf8');
      
      if (!lockfileContent.trim()) {
        return {
          success: false,
          message: 'pnpm-lock.yaml文件为空',
          suggestions: ['删除空的lockfile并重新运行pnpm install']
        };
      }

      // 尝试解析lockfile
      try {
        // 简单的YAML格式检查
        if (!lockfileContent.includes('lockfileVersion')) {
          return {
            success: false,
            message: 'pnpm-lock.yaml格式可能不正确',
            suggestions: ['重新生成lockfile: rm pnpm-lock.yaml && pnpm install']
          };
        }
      } catch (parseError) {
        return {
          success: false,
          message: 'pnpm-lock.yaml解析失败',
          details: { parseError: parseError instanceof Error ? parseError.message : String(parseError) },
          suggestions: ['重新生成lockfile: rm pnpm-lock.yaml && pnpm install']
        };
      }

      // 检查lockfile与package.json的一致性
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          // 运行pnpm install --frozen-lockfile来检查一致性
          execSync('pnpm install --frozen-lockfile', { 
            cwd: this.projectRoot,
            stdio: 'pipe'
          });
        } catch (error) {
          return {
            success: false,
            message: 'lockfile与package.json不一致',
            details: { 
              error: error instanceof Error ? error.message : String(error)
            },
            suggestions: [
              '运行pnpm install更新lockfile',
              '检查package.json中的依赖版本'
            ]
          };
        }
      }

      return {
        success: true,
        message: 'lockfile完整性验证通过',
        details: { 
          lockfilePath,
          lockfileSize: fs.statSync(lockfilePath).size
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `lockfile完整性验证失败: ${error instanceof Error ? error.message : '未知错误'}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * 检测npm命令使用
   */
  async detectNpmCommands(): Promise<NpmCommandDetection[]> {
    const detections: NpmCommandDetection[] = [];

    try {
      // 搜索可能包含npm命令的文件
      const patterns = [
        '**/*.json',
        '**/*.js',
        '**/*.ts',
        '**/*.md',
        '**/*.yml',
        '**/*.yaml',
        '**/.github/**/*',
        '**/Dockerfile*',
        '**/docker-compose*'
      ];

      for (const pattern of patterns) {
        const files = await glob(pattern, {
          cwd: this.projectRoot,
          ignore: [
            'node_modules/**',
            'dist/**',
            'build/**',
            '.git/**',
            'coverage/**'
          ]
        });

        for (const file of files) {
          const filePath = path.join(this.projectRoot, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');

          lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const trimmedLine = line.trim();

            // 检测npm命令
            const npmCommands = [
              'npm install',
              'npm i ',
              'npm run ',
              'npm start',
              'npm test',
              'npm build',
              'npm ci',
              'npm audit',
              'npm update',
              'npm uninstall',
              'npm publish'
            ];

            for (const command of npmCommands) {
              if (trimmedLine.includes(command)) {
                const severity = this.getSeverity(file, command, trimmedLine);
                detections.push({
                  command,
                  filePath: file,
                  lineNumber,
                  severity,
                  suggestion: this.getSuggestion(command, file)
                });
              }
            }
          });
        }
      }

      return detections;
    } catch (error) {
      console.error('检测npm命令时出错:', error);
      return [];
    }
  }

  /**
   * 获取pnpm版本
   */
  private async getPnpmVersion(): Promise<string | null> {
    try {
      const output = execSync('pnpm --version', { encoding: 'utf8' });
      return output.trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * 检查版本号
   */
  private checkVersion(current: string, required: string): { success: boolean; message: string } {
    const currentParts = current.split('.').map(Number);
    const requiredParts = required.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const requiredPart = requiredParts[i] || 0;

      if (currentPart > requiredPart) {
        return { success: true, message: '版本满足要求' };
      }
      if (currentPart < requiredPart) {
        return { success: false, message: '版本过低' };
      }
    }

    return { success: true, message: '版本满足要求' };
  }

  /**
   * 获取严重程度
   */
  private getSeverity(file: string, _command: string, line: string): 'error' | 'warning' | 'info' {
    // 在package.json中的scripts是错误
    if (file === 'package.json') {
      return 'error';
    }

    // 在CI/CD配置中是错误
    if (file.includes('.github') || file.includes('Dockerfile') || file.includes('docker-compose')) {
      return 'error';
    }

    // 在文档中是警告
    if (file.endsWith('.md')) {
      return 'warning';
    }

    // 其他情况是信息
    return 'info';
  }

  /**
   * 获取建议
   */
  private getSuggestion(command: string, file: string): string {
    const commandMap: Record<string, string> = {
      'npm install': 'pnpm install',
      'npm i ': 'pnpm add ',
      'npm run ': 'pnpm run ',
      'npm start': 'pnpm start',
      'npm test': 'pnpm test',
      'npm build': 'pnpm build',
      'npm ci': 'pnpm install --frozen-lockfile',
      'npm audit': 'pnpm audit',
      'npm update': 'pnpm update',
      'npm uninstall': 'pnpm remove',
      'npm publish': 'pnpm publish'
    };

    const suggestion = commandMap[command] || `将npm替换为pnpm`;
    
    if (file === 'package.json') {
      return `在package.json的scripts中: ${suggestion}`;
    }
    
    if (file.includes('.github')) {
      return `在GitHub Actions中: ${suggestion}`;
    }
    
    if (file.includes('Dockerfile')) {
      return `在Dockerfile中: ${suggestion}`;
    }
    
    return suggestion;
  }
}

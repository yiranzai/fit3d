import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * 依赖审计器
 * 负责审计依赖管理工具使用、检查依赖安全、分析依赖使用情况
 */
export interface DependencyInfo {
  id?: number;
  packageName: string;
  version: string;
  packageManager: 'pnpm' | 'yarn' | 'npm';
  installDate: Date;
  source: 'package.json' | 'pnpm-lock.yaml' | 'manual';
  dependencyType: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';
  isDevDependency: boolean;
  license?: string;
  repositoryUrl?: string;
  homepageUrl?: string;
}

export interface SecurityReport {
  vulnerabilities: Vulnerability[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
}

export interface Vulnerability {
  packageName: string;
  version: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export interface UsageAnalysis {
  totalDependencies: number;
  devDependencies: number;
  peerDependencies: number;
  unusedDependencies: string[];
  outdatedDependencies: OutdatedDependency[];
  duplicateDependencies: DuplicateDependency[];
}

export interface OutdatedDependency {
  packageName: string;
  currentVersion: string;
  latestVersion: string;
  type: 'major' | 'minor' | 'patch';
}

export interface DuplicateDependency {
  packageName: string;
  versions: string[];
  locations: string[];
}

export interface DependencyReport {
  summary: UsageAnalysis;
  recommendations: string[];
  actionItems: ActionItem[];
}

export interface ActionItem {
  type: 'update' | 'remove' | 'add' | 'security';
  packageName: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export class DependencyAuditor {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * 审计依赖信息
   */
  async auditDependencies(): Promise<DependencyInfo[]> {
    try {
      const dependencies: DependencyInfo[] = [];
      const packageJsonPath = path.join(this.projectRoot, 'package.json');

      if (!fs.existsSync(packageJsonPath)) {
        throw new Error('package.json文件不存在');
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const now = new Date();

      // 处理dependencies
      if (packageJson.dependencies) {
        for (const [packageName, version] of Object.entries(packageJson.dependencies)) {
          dependencies.push({
            packageName,
            version: version as string,
            packageManager: 'pnpm',
            installDate: now,
            source: 'package.json',
            dependencyType: 'dependencies',
            isDevDependency: false
          });
        }
      }

      // 处理devDependencies
      if (packageJson.devDependencies) {
        for (const [packageName, version] of Object.entries(packageJson.devDependencies)) {
          dependencies.push({
            packageName,
            version: version as string,
            packageManager: 'pnpm',
            installDate: now,
            source: 'package.json',
            dependencyType: 'devDependencies',
            isDevDependency: true
          });
        }
      }

      // 处理peerDependencies
      if (packageJson.peerDependencies) {
        for (const [packageName, version] of Object.entries(packageJson.peerDependencies)) {
          dependencies.push({
            packageName,
            version: version as string,
            packageManager: 'pnpm',
            installDate: now,
            source: 'package.json',
            dependencyType: 'peerDependencies',
            isDevDependency: false
          });
        }
      }

      // 处理optionalDependencies
      if (packageJson.optionalDependencies) {
        for (const [packageName, version] of Object.entries(packageJson.optionalDependencies)) {
          dependencies.push({
            packageName,
            version: version as string,
            packageManager: 'pnpm',
            installDate: now,
            source: 'package.json',
            dependencyType: 'optionalDependencies',
            isDevDependency: false
          });
        }
      }

      return dependencies;
    } catch (error) {
      throw new Error(`依赖审计失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检查依赖安全
   */
  async checkDependencySecurity(): Promise<SecurityReport> {
    try {
      // 运行pnpm audit
      const auditOutput = execSync('pnpm audit --json', { 
        cwd: this.projectRoot,
        encoding: 'utf8'
      });

      const auditResult = JSON.parse(auditOutput);
      const vulnerabilities: Vulnerability[] = [];

      // 解析审计结果
      if (auditResult.vulnerabilities) {
        for (const [packageName, vulnInfo] of Object.entries(auditResult.vulnerabilities)) {
          const vuln = vulnInfo as any;
          vulnerabilities.push({
            packageName,
            version: vuln.range || 'unknown',
            severity: vuln.severity || 'medium',
            description: vuln.title || '安全漏洞',
            recommendation: vuln.recommendation || '更新到最新版本'
          });
        }
      }

      // 统计漏洞数量
      const summary = {
        total: vulnerabilities.length,
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
        low: vulnerabilities.filter(v => v.severity === 'low').length
      };

      // 生成建议
      const recommendations: string[] = [];
      if (summary.high > 0) {
        recommendations.push('立即修复高危安全漏洞');
      }
      if (summary.medium > 0) {
        recommendations.push('尽快修复中等安全漏洞');
      }
      if (summary.low > 0) {
        recommendations.push('考虑修复低危安全漏洞');
      }
      if (summary.total === 0) {
        recommendations.push('依赖安全检查通过，无安全漏洞');
      }

      return {
        vulnerabilities,
        summary,
        recommendations
      };
    } catch (error) {
      // 如果audit命令失败，返回空报告
      return {
        vulnerabilities: [],
        summary: { total: 0, high: 0, medium: 0, low: 0 },
        recommendations: ['无法执行安全审计，请检查pnpm配置']
      };
    }
  }

  /**
   * 分析依赖使用情况
   */
  async analyzeDependencyUsage(): Promise<UsageAnalysis> {
    try {
      const dependencies = await this.auditDependencies();
      const unusedDependencies: string[] = [];
      const outdatedDependencies: OutdatedDependency[] = [];
      const duplicateDependencies: DuplicateDependency[] = [];

      // 检查未使用的依赖
      for (const dep of dependencies) {
        if (!await this.isDependencyUsed(dep.packageName)) {
          unusedDependencies.push(dep.packageName);
        }
      }

      // 检查过时的依赖
      try {
        const outdatedOutput = execSync('pnpm outdated --json', { 
          cwd: this.projectRoot,
          encoding: 'utf8'
        });
        
        const outdatedResult = JSON.parse(outdatedOutput);
        for (const [packageName, info] of Object.entries(outdatedResult)) {
          const pkgInfo = info as any;
          outdatedDependencies.push({
            packageName,
            currentVersion: pkgInfo.current || 'unknown',
            latestVersion: pkgInfo.latest || 'unknown',
            type: this.getVersionType(pkgInfo.current, pkgInfo.latest)
          });
        }
      } catch (error) {
        // 忽略outdated命令的错误
      }

      // 检查重复依赖
      const packageVersions = new Map<string, string[]>();
      for (const dep of dependencies) {
        if (!packageVersions.has(dep.packageName)) {
          packageVersions.set(dep.packageName, []);
        }
        packageVersions.get(dep.packageName)!.push(dep.version);
      }

      for (const [packageName, versions] of packageVersions) {
        const uniqueVersions = [...new Set(versions)];
        if (uniqueVersions.length > 1) {
          duplicateDependencies.push({
            packageName,
            versions: uniqueVersions,
            locations: ['package.json'] // 简化处理
          });
        }
      }

      return {
        totalDependencies: dependencies.length,
        devDependencies: dependencies.filter(d => d.isDevDependency).length,
        peerDependencies: dependencies.filter(d => d.dependencyType === 'peerDependencies').length,
        unusedDependencies,
        outdatedDependencies,
        duplicateDependencies
      };
    } catch (error) {
      throw new Error(`依赖使用分析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 生成依赖报告
   */
  async generateDependencyReport(): Promise<DependencyReport> {
    try {
      const [usageAnalysis, securityReport] = await Promise.all([
        this.analyzeDependencyUsage(),
        this.checkDependencySecurity()
      ]);

      const recommendations: string[] = [];
      const actionItems: ActionItem[] = [];

      // 基于分析结果生成建议
      if (usageAnalysis.unusedDependencies.length > 0) {
        recommendations.push(`发现${usageAnalysis.unusedDependencies.length}个未使用的依赖`);
        usageAnalysis.unusedDependencies.forEach(pkg => {
          actionItems.push({
            type: 'remove',
            packageName: pkg,
            description: `移除未使用的依赖: ${pkg}`,
            priority: 'medium'
          });
        });
      }

      if (usageAnalysis.outdatedDependencies.length > 0) {
        recommendations.push(`发现${usageAnalysis.outdatedDependencies.length}个过时的依赖`);
        usageAnalysis.outdatedDependencies.forEach(dep => {
          actionItems.push({
            type: 'update',
            packageName: dep.packageName,
            description: `更新依赖: ${dep.packageName} (${dep.currentVersion} -> ${dep.latestVersion})`,
            priority: dep.type === 'major' ? 'high' : 'medium'
          });
        });
      }

      if (usageAnalysis.duplicateDependencies.length > 0) {
        recommendations.push(`发现${usageAnalysis.duplicateDependencies.length}个重复依赖`);
        usageAnalysis.duplicateDependencies.forEach(dep => {
          actionItems.push({
            type: 'update',
            packageName: dep.packageName,
            description: `解决重复依赖: ${dep.packageName} (版本: ${dep.versions.join(', ')})`,
            priority: 'medium'
          });
        });
      }

      if (securityReport.summary.total > 0) {
        recommendations.push(`发现${securityReport.summary.total}个安全漏洞`);
        securityReport.vulnerabilities.forEach(vuln => {
          actionItems.push({
            type: 'security',
            packageName: vuln.packageName,
            description: `修复安全漏洞: ${vuln.packageName} (${vuln.severity})`,
            priority: vuln.severity === 'high' ? 'high' : 'medium'
          });
        });
      }

      if (recommendations.length === 0) {
        recommendations.push('依赖状态良好，无需特殊处理');
      }

      return {
        summary: usageAnalysis,
        recommendations,
        actionItems
      };
    } catch (error) {
      throw new Error(`生成依赖报告失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检查依赖是否被使用
   */
  private async isDependencyUsed(packageName: string): Promise<boolean> {
    try {
      // 搜索源代码中的import/require语句
      const patterns = [
        '**/*.js',
        '**/*.ts',
        '**/*.jsx',
        '**/*.tsx',
        '**/*.vue',
        '**/*.svelte'
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
          
          // 检查import语句
          if (content.includes(`import`) && content.includes(packageName)) {
            return true;
          }
          
          // 检查require语句
          if (content.includes(`require`) && content.includes(packageName)) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      // 如果检查失败，假设依赖被使用
      return true;
    }
  }

  /**
   * 获取版本类型
   */
  private getVersionType(current: string, latest: string): 'major' | 'minor' | 'patch' {
    try {
      const currentParts = current.split('.').map(Number);
      const latestParts = latest.split('.').map(Number);

      if (currentParts[0] !== latestParts[0]) {
        return 'major';
      }
      if (currentParts[1] !== latestParts[1]) {
        return 'minor';
      }
      return 'patch';
    } catch (error) {
      return 'patch';
    }
  }
}

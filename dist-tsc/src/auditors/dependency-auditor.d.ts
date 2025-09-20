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
export declare class DependencyAuditor {
    private projectRoot;
    constructor(projectRoot?: string);
    /**
     * 审计依赖信息
     */
    auditDependencies(): Promise<DependencyInfo[]>;
    /**
     * 检查依赖安全
     */
    checkDependencySecurity(): Promise<SecurityReport>;
    /**
     * 分析依赖使用情况
     */
    analyzeDependencyUsage(): Promise<UsageAnalysis>;
    /**
     * 生成依赖报告
     */
    generateDependencyReport(): Promise<DependencyReport>;
    /**
     * 检查依赖是否被使用
     */
    private isDependencyUsed;
    /**
     * 获取版本类型
     */
    private getVersionType;
}
//# sourceMappingURL=dependency-auditor.d.ts.map
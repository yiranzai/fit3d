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
export declare class PackageManagerValidator {
    private projectRoot;
    constructor(projectRoot?: string);
    /**
     * 验证npm使用情况
     */
    validateNpmUsage(): Promise<ValidationResult>;
    /**
     * 验证pnpm要求
     */
    validatePnpmRequirement(): Promise<ValidationResult>;
    /**
     * 验证lockfile完整性
     */
    validateLockfileIntegrity(): Promise<ValidationResult>;
    /**
     * 检测npm命令使用
     */
    detectNpmCommands(): Promise<NpmCommandDetection[]>;
    /**
     * 获取pnpm版本
     */
    private getPnpmVersion;
    /**
     * 检查版本号
     */
    private checkVersion;
    /**
     * 获取严重程度
     */
    private getSeverity;
    /**
     * 获取建议
     */
    private getSuggestion;
}
//# sourceMappingURL=package-manager-validator.d.ts.map
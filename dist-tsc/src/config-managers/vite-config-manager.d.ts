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
export declare class ViteConfigManager {
    private projectRoot;
    constructor(projectRoot?: string);
    /**
     * 生成默认Vite配置
     */
    generateConfig(): ViteConfiguration;
    /**
     * 验证Vite配置
     */
    validateConfig(config: ViteConfiguration): Promise<ValidationResult>;
    /**
     * 优化Vite配置
     */
    optimizeConfig(config: ViteConfiguration): Promise<ViteConfiguration>;
    /**
     * 获取默认配置
     */
    getDefaultConfig(): ViteConfiguration;
    /**
     * 保存配置到文件
     */
    saveConfig(config: ViteConfiguration, filePath?: string): Promise<ValidationResult>;
    /**
     * 从文件加载配置
     */
    loadConfig(filePath?: string): Promise<ValidationResult & {
        config?: ViteConfiguration;
    }>;
    /**
     * 生成配置文件内容
     */
    private generateConfigFile;
    /**
     * 检查配置文件是否存在
     */
    configExists(filePath?: string): boolean;
    /**
     * 获取配置文件路径
     */
    getConfigPath(filePath?: string): string;
}
//# sourceMappingURL=vite-config-manager.d.ts.map
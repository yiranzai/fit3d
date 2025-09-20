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
export declare class BuildScriptGenerator {
    private projectRoot;
    constructor(projectRoot?: string);
    /**
     * 生成package.json脚本
     */
    generatePackageJsonScripts(): Promise<PackageJsonScripts>;
    /**
     * 生成Vite配置
     */
    generateViteConfig(): Promise<string>;
    /**
     * 生成pnpm配置
     */
    generatePnpmConfig(): Promise<string>;
    /**
     * 生成Husky钩子
     */
    generateHuskyHooks(): Promise<HuskyHooks>;
    /**
     * 更新package.json文件
     */
    updatePackageJson(): Promise<boolean>;
    /**
     * 创建Vite配置文件
     */
    createViteConfig(): Promise<boolean>;
    /**
     * 创建.npmrc配置文件
     */
    createNpmrcConfig(): Promise<boolean>;
    /**
     * 创建Husky钩子文件
     */
    createHuskyHooks(): Promise<boolean>;
    /**
     * 生成所有配置文件
     */
    generateAllConfigs(): Promise<{
        packageJson: boolean;
        viteConfig: boolean;
        npmrcConfig: boolean;
        huskyHooks: boolean;
    }>;
    /**
     * 验证生成的配置
     */
    validateGeneratedConfigs(): Promise<{
        valid: boolean;
        issues: string[];
    }>;
}
//# sourceMappingURL=build-script-generator.d.ts.map
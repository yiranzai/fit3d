/**
 * DuckDB分析数据库管理器
 * 负责构建系统性能分析和数据统计
 */
export declare class DuckDBDatabase {
    private db;
    private connection;
    private dbPath;
    constructor(dbPath?: string);
    run: (sql: string, params?: any[]) => Promise<any>;
    get: (sql: string, params?: any[]) => Promise<any>;
    all: (sql: string, params?: any[]) => Promise<any[]>;
    exec: (sql: string) => Promise<void>;
    /**
     * 初始化分析数据库架构
     */
    initSchema(): Promise<void>;
    /**
     * 获取构建性能分析数据
     */
    getBuildPerformanceAnalytics(startDate?: string, endDate?: string, buildType?: string): Promise<any[]>;
    /**
     * 获取依赖使用分析数据
     */
    getDependencyUsageAnalytics(packageManager?: string, dependencyType?: string): Promise<any[]>;
    /**
     * 获取性能趋势分析数据
     */
    getPerformanceTrendAnalytics(metricName?: string, environment?: string, days?: number): Promise<any[]>;
    /**
     * 获取构建效率分析数据
     */
    getBuildEfficiencyAnalytics(): Promise<any[]>;
    /**
     * 获取依赖安全分析数据
     */
    getDependencySecurityAnalytics(): Promise<any[]>;
    /**
     * 执行自定义分析查询
     */
    executeAnalyticsQuery(query: string, params?: any[]): Promise<any[]>;
    /**
     * 关闭数据库连接
     */
    close(): Promise<void>;
    /**
     * 获取数据库信息
     */
    getDatabaseInfo(): Promise<{
        path: string;
        views: string[];
    }>;
}
//# sourceMappingURL=duckdb-database.d.ts.map
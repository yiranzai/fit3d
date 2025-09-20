/**
 * DuckDB数据库实现 - 用于分析查询
 * DuckDB Database Implementation - For Analytical Queries
 */
export declare class DuckDBDatabase {
    private db;
    constructor(dbPath: string);
    /**
     * 初始化分析数据库
     * Initialize analytical database
     */
    initialize(): Promise<void>;
    /**
     * 创建分析表
     * Create analytical tables
     */
    private createAnalyticalTables;
    /**
     * 创建分析视图
     * Create analytical views
     */
    private createViews;
    /**
     * 同步SQLite数据到DuckDB
     * Sync SQLite data to DuckDB
     */
    syncFromSQLite(sqliteDb: any): Promise<void>;
    /**
     * 获取地图性能分析
     * Get map performance analytics
     */
    getMapPerformanceAnalytics(): Promise<any[]>;
    /**
     * 获取用户行为分析
     * Get user behavior analytics
     */
    getUserBehaviorAnalytics(days?: number): Promise<any[]>;
    /**
     * 获取缓存效率分析
     * Get cache efficiency analytics
     */
    getCacheEfficiencyAnalytics(): Promise<any[]>;
    /**
     * 获取提供商性能对比
     * Get provider performance comparison
     */
    getProviderPerformanceComparison(): Promise<any[]>;
    /**
     * 获取样式使用统计
     * Get style usage statistics
     */
    getStyleUsageStatistics(): Promise<any[]>;
    /**
     * 获取时间序列分析
     * Get time series analysis
     */
    getTimeSeriesAnalysis(days?: number): Promise<any[]>;
    /**
     * 获取热门瓦片分析
     * Get popular tiles analysis
     */
    getPopularTilesAnalysis(limit?: number): Promise<any[]>;
    /**
     * 获取缓存优化建议
     * Get cache optimization recommendations
     */
    getCacheOptimizationRecommendations(): Promise<any[]>;
    /**
     * 执行SQL查询
     * Execute SQL query
     */
    private run;
    /**
     * 执行查询并返回所有结果
     * Execute query and return all results
     */
    private all;
    /**
     * 执行查询并返回单个结果
     * Execute query and return single result
     */
    /**
     * 关闭数据库连接
     * Close database connection
     */
    close(): Promise<void>;
}
//# sourceMappingURL=duckdb-database.d.ts.map
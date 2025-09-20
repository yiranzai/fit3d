/**
 * SQLite数据库实现
 * SQLite Database Implementation
 */
import Database from 'better-sqlite3';
import { MapProvider, MapStyle, TileCache } from '../../types/index.js';
export declare class SQLiteDatabase {
    private db;
    constructor(dbPath: string);
    run(sql: string, params?: any[]): Database.RunResult;
    get(sql: string, params?: any[]): any;
    all(sql: string, params?: any[]): any[];
    /**
     * 初始化数据库模式
     * Initialize database schema
     */
    initialize(): Promise<void>;
    /**
     * 创建数据库表
     * Create database tables
     */
    private createTables;
    /**
     * 创建数据库索引
     * Create database indexes
     */
    private createIndexes;
    /**
     * 插入初始数据
     * Insert initial data
     */
    private insertInitialData;
    /**
     * 获取所有活跃的地图提供商
     * Get all active map providers
     */
    getActiveProviders(): Promise<MapProvider[]>;
    /**
     * 获取提供商的地图样式
     * Get provider's map styles
     */
    getProviderStyles(providerId: string): Promise<MapStyle[]>;
    /**
     * 获取瓦片缓存
     * Get cached tile
     */
    getCachedTile(providerId: string, styleId: string, z: number, x: number, y: number): Promise<TileCache | null>;
    /**
     * 缓存瓦片
     * Cache tile
     */
    cacheTile(tile: TileCache): Promise<void>;
    /**
     * 更新瓦片访问统计
     * Update tile access statistics
     */
    updateTileAccess(tileId: string): Promise<void>;
    /**
     * 清理过期缓存
     * Cleanup expired cache
     */
    cleanupExpiredCache(maxAge: number): Promise<void>;
    /**
     * 获取缓存统计
     * Get cache statistics
     */
    getCacheStats(): Promise<any>;
    /**
     * 关闭数据库连接
     * Close database connection
     */
    close(): Promise<void>;
    private mapRowToProvider;
    private mapRowToStyle;
    private mapRowToTileCache;
}
//# sourceMappingURL=sqlite-database.d.ts.map
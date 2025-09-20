import Database from 'better-sqlite3';
/**
 * SQLite数据库管理器
 * 负责构建系统相关数据的存储和管理
 */
export declare class SQLiteDatabase {
    private db;
    private dbPath;
    constructor(dbPath?: string);
    run(sql: string, params?: any[]): Database.RunResult;
    get(sql: string, params?: any[]): any;
    all(sql: string, params?: any[]): any[];
    exec(sql: string): void;
    /**
     * 初始化数据库架构
     */
    initSchema(): Promise<void>;
    /**
     * 插入初始数据
     */
    private insertInitialData;
    /**
     * 关闭数据库连接
     */
    close(): Promise<void>;
    /**
     * 获取数据库信息
     */
    getDatabaseInfo(): Promise<{
        path: string;
        size: number;
        tables: string[];
    }>;
}
//# sourceMappingURL=sqlite-database.d.ts.map
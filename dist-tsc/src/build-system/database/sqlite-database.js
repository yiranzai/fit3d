import Database from 'better-sqlite3';
// import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
/**
 * SQLite数据库管理器
 * 负责构建系统相关数据的存储和管理
 */
export class SQLiteDatabase {
    db;
    dbPath;
    constructor(dbPath = 'build-system.db') {
        this.dbPath = path.resolve(dbPath);
        this.db = new Database(this.dbPath);
    }
    // 数据库方法
    run(sql, params) {
        return this.db.prepare(sql).run(...(params || []));
    }
    get(sql, params) {
        return this.db.prepare(sql).get(...(params || []));
    }
    all(sql, params) {
        return this.db.prepare(sql).all(...(params || []));
    }
    exec(sql) {
        this.db.exec(sql);
    }
    /**
     * 初始化数据库架构
     */
    async initSchema() {
        try {
            // 创建构建配置表
            await this.run(`
        CREATE TABLE IF NOT EXISTS build_configurations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          package_manager TEXT NOT NULL DEFAULT 'pnpm',
          build_tool TEXT NOT NULL DEFAULT 'vite',
          node_version TEXT NOT NULL,
          pnpm_version TEXT NOT NULL,
          vite_version TEXT NOT NULL,
          project_root TEXT NOT NULL,
          config_file_path TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1,
          
          CONSTRAINT chk_package_manager CHECK (package_manager IN ('pnpm', 'yarn', 'npm')),
          CONSTRAINT chk_build_tool CHECK (build_tool IN ('vite', 'webpack', 'rollup', 'esbuild'))
        )
      `);
            // 创建索引
            await this.run(`
        CREATE INDEX IF NOT EXISTS idx_build_config_active 
        ON build_configurations(is_active)
      `);
            await this.run(`
        CREATE INDEX IF NOT EXISTS idx_build_config_updated 
        ON build_configurations(updated_at)
      `);
            // 创建依赖管理记录表
            await this.run(`
        CREATE TABLE IF NOT EXISTS dependency_audit (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          package_name TEXT NOT NULL,
          version TEXT NOT NULL,
          package_manager TEXT NOT NULL DEFAULT 'pnpm',
          install_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          source TEXT NOT NULL,
          dependency_type TEXT NOT NULL,
          is_dev_dependency BOOLEAN DEFAULT 0,
          license TEXT,
          repository_url TEXT,
          homepage_url TEXT,
          
          CONSTRAINT chk_dependency_type CHECK (dependency_type IN ('dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'))
        )
      `);
            // 创建依赖表索引
            await this.run(`
        CREATE INDEX IF NOT EXISTS idx_dependency_package 
        ON dependency_audit(package_name)
      `);
            await this.run(`
        CREATE INDEX IF NOT EXISTS idx_dependency_manager 
        ON dependency_audit(package_manager)
      `);
            await this.run(`
        CREATE INDEX IF NOT EXISTS idx_dependency_install_date 
        ON dependency_audit(install_date)
      `);
            // 创建构建历史记录表
            await this.run(`
        CREATE TABLE IF NOT EXISTS build_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          build_type TEXT NOT NULL,
          start_time DATETIME NOT NULL,
          end_time DATETIME,
          duration_ms INTEGER,
          success BOOLEAN DEFAULT 0,
          error_message TEXT,
          build_output_path TEXT,
          bundle_size_bytes INTEGER,
          chunk_count INTEGER,
          config_used TEXT,
          environment_variables TEXT,
          
          CONSTRAINT chk_build_type CHECK (build_type IN ('development', 'production', 'test', 'preview'))
        )
      `);
            // 创建构建历史索引
            await this.run(`
        CREATE INDEX IF NOT EXISTS idx_build_history_start_time 
        ON build_history(start_time)
      `);
            await this.run(`
        CREATE INDEX IF NOT EXISTS idx_build_history_success 
        ON build_history(success)
      `);
            await this.run(`
        CREATE INDEX IF NOT EXISTS idx_build_history_duration 
        ON build_history(duration_ms)
      `);
            // 创建性能指标表
            await this.run(`
        CREATE TABLE IF NOT EXISTS performance_metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          metric_name TEXT NOT NULL,
          metric_value REAL NOT NULL,
          metric_unit TEXT NOT NULL,
          measurement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          build_id INTEGER,
          environment TEXT NOT NULL,
          
          FOREIGN KEY (build_id) REFERENCES build_history(id) ON DELETE CASCADE
        )
      `);
            // 创建性能指标索引
            await this.run(`
        CREATE INDEX IF NOT EXISTS idx_performance_metric_name 
        ON performance_metrics(metric_name)
      `);
            await this.run(`
        CREATE INDEX IF NOT EXISTS idx_performance_measurement_date 
        ON performance_metrics(measurement_date)
      `);
            await this.run(`
        CREATE INDEX IF NOT EXISTS idx_performance_environment 
        ON performance_metrics(environment)
      `);
            // 创建包管理器验证表
            await this.run(`
        CREATE TABLE IF NOT EXISTS package_manager_validation (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          validation_type TEXT NOT NULL,
          validation_result BOOLEAN NOT NULL,
          validation_message TEXT,
          validation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          file_path TEXT,
          line_number INTEGER,
          command_used TEXT
        )
      `);
            // 创建验证表索引
            await this.run(`
        CREATE INDEX IF NOT EXISTS idx_validation_type 
        ON package_manager_validation(validation_type)
      `);
            await this.run(`
        CREATE INDEX IF NOT EXISTS idx_validation_result 
        ON package_manager_validation(validation_result)
      `);
            await this.run(`
        CREATE INDEX IF NOT EXISTS idx_validation_date 
        ON package_manager_validation(validation_date)
      `);
            // 插入初始数据
            await this.insertInitialData();
            console.log('✅ 数据库架构初始化完成');
        }
        catch (error) {
            console.error('❌ 数据库架构初始化失败:', error);
            throw error;
        }
    }
    /**
     * 插入初始数据
     */
    async insertInitialData() {
        try {
            // 插入默认构建配置
            await this.run(`
        INSERT OR IGNORE INTO build_configurations (
          package_manager, 
          build_tool, 
          node_version, 
          pnpm_version, 
          vite_version, 
          project_root, 
          is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
                'pnpm',
                'vite',
                process.version.substring(1), // 去掉v前缀
                '10.10.0',
                '7.1.6',
                process.cwd(),
                1
            ]);
            // 插入性能基准数据
            const performanceBaselines = [
                ['build_time_ms', 30000, 'milliseconds', 'development'],
                ['build_time_ms', 120000, 'milliseconds', 'production'],
                ['bundle_size_bytes', 2100000, 'bytes', 'production'],
                ['chunk_count', 15, 'count', 'production'],
                ['dev_server_startup_ms', 3000, 'milliseconds', 'development'],
                ['hot_reload_ms', 50, 'milliseconds', 'development']
            ];
            for (const [metricName, metricValue, metricUnit, environment] of performanceBaselines) {
                await this.run(`
          INSERT OR IGNORE INTO performance_metrics (metric_name, metric_value, metric_unit, environment) 
          VALUES (?, ?, ?, ?)
        `, [metricName, metricValue, metricUnit, environment]);
            }
            console.log('✅ 初始数据插入完成');
        }
        catch (error) {
            console.error('❌ 初始数据插入失败:', error);
            throw error;
        }
    }
    /**
     * 关闭数据库连接
     */
    async close() {
        this.db.close();
    }
    /**
     * 获取数据库信息
     */
    async getDatabaseInfo() {
        const tables = await this.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
        const stats = fs.statSync(this.dbPath);
        return {
            path: this.dbPath,
            size: stats.size,
            tables: tables.map((row) => row.name)
        };
    }
}
//# sourceMappingURL=sqlite-database.js.map
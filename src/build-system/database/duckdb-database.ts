import duckdb from 'duckdb';
import { promisify } from 'util';
import path from 'path';

/**
 * DuckDB分析数据库管理器
 * 负责构建系统性能分析和数据统计
 */
export class DuckDBDatabase {
  private db: duckdb.Database;
  private connection: duckdb.Connection;
  private dbPath: string;

  constructor(dbPath: string = 'build-system-analytics.duckdb') {
    this.dbPath = path.resolve(dbPath);
    this.db = new duckdb.Database(this.dbPath);
    this.connection = this.db.connect();
    
    // 将回调风格的API转换为Promise
    this.run = promisify(this.connection.run.bind(this.connection));
    this.get = promisify(this.connection.get.bind(this.connection));
    this.all = promisify(this.connection.all.bind(this.connection));
    this.exec = promisify(this.connection.exec.bind(this.connection));
  }

  // Promise化的数据库方法
  public run: (sql: string, params?: any[]) => Promise<any>;
  public get: (sql: string, params?: any[]) => Promise<any>;
  public all: (sql: string, params?: any[]) => Promise<any[]>;
  public exec: (sql: string) => Promise<void>;

  /**
   * 初始化分析数据库架构
   */
  async initSchema(): Promise<void> {
    try {
      // 创建构建性能分析视图
      await this.run(`
        CREATE OR REPLACE VIEW build_performance_analytics AS
        SELECT 
          DATE(start_time) as build_date,
          build_type,
          AVG(duration_ms) as avg_duration_ms,
          MIN(duration_ms) as min_duration_ms,
          MAX(duration_ms) as max_duration_ms,
          COUNT(*) as build_count,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_count,
          AVG(bundle_size_bytes) as avg_bundle_size,
          AVG(chunk_count) as avg_chunk_count
        FROM build_history
        GROUP BY DATE(start_time), build_type
        ORDER BY build_date DESC, build_type
      `);

      // 创建依赖使用分析视图
      await this.run(`
        CREATE OR REPLACE VIEW dependency_usage_analytics AS
        SELECT 
          package_name,
          COUNT(*) as usage_count,
          MAX(install_date) as last_used,
          dependency_type,
          package_manager,
          COUNT(DISTINCT version) as version_count
        FROM dependency_audit
        GROUP BY package_name, dependency_type, package_manager
        ORDER BY usage_count DESC, last_used DESC
      `);

      // 创建性能趋势分析视图
      await this.run(`
        CREATE OR REPLACE VIEW performance_trend_analytics AS
        SELECT 
          metric_name,
          DATE(measurement_date) as measurement_date,
          environment,
          AVG(metric_value) as avg_value,
          MIN(metric_value) as min_value,
          MAX(metric_value) as max_value,
          COUNT(*) as measurement_count
        FROM performance_metrics
        GROUP BY metric_name, DATE(measurement_date), environment
        ORDER BY measurement_date DESC, metric_name, environment
      `);

      // 创建构建效率分析视图
      await this.run(`
        CREATE OR REPLACE VIEW build_efficiency_analytics AS
        SELECT 
          build_type,
          environment,
          AVG(duration_ms) as avg_build_time,
          AVG(bundle_size_bytes) as avg_bundle_size,
          AVG(chunk_count) as avg_chunk_count,
          COUNT(*) as total_builds,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_builds,
          ROUND(SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate
        FROM build_history
        GROUP BY build_type, environment
        ORDER BY build_type, environment
      `);

      // 创建依赖安全分析视图
      await this.run(`
        CREATE OR REPLACE VIEW dependency_security_analytics AS
        SELECT 
          package_name,
          COUNT(*) as total_installs,
          COUNT(DISTINCT version) as version_count,
          MAX(install_date) as last_install,
          dependency_type,
          package_manager,
          COUNT(CASE WHEN license IS NULL THEN 1 END) as missing_license_count
        FROM dependency_audit
        GROUP BY package_name, dependency_type, package_manager
        ORDER BY total_installs DESC
      `);

      console.log('✅ DuckDB分析数据库架构初始化完成');
    } catch (error) {
      console.error('❌ DuckDB分析数据库架构初始化失败:', error);
      throw error;
    }
  }

  /**
   * 获取构建性能分析数据
   */
  async getBuildPerformanceAnalytics(
    startDate?: string,
    endDate?: string,
    buildType?: string
  ): Promise<any[]> {
    let query = 'SELECT * FROM build_performance_analytics WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      query += ' AND build_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND build_date <= ?';
      params.push(endDate);
    }

    if (buildType) {
      query += ' AND build_type = ?';
      params.push(buildType);
    }

    query += ' ORDER BY build_date DESC';

    return await this.all(query, params);
  }

  /**
   * 获取依赖使用分析数据
   */
  async getDependencyUsageAnalytics(
    packageManager?: string,
    dependencyType?: string
  ): Promise<any[]> {
    let query = 'SELECT * FROM dependency_usage_analytics WHERE 1=1';
    const params: any[] = [];

    if (packageManager) {
      query += ' AND package_manager = ?';
      params.push(packageManager);
    }

    if (dependencyType) {
      query += ' AND dependency_type = ?';
      params.push(dependencyType);
    }

    query += ' ORDER BY usage_count DESC';

    return await this.all(query, params);
  }

  /**
   * 获取性能趋势分析数据
   */
  async getPerformanceTrendAnalytics(
    metricName?: string,
    environment?: string,
    days?: number
  ): Promise<any[]> {
    let query = 'SELECT * FROM performance_trend_analytics WHERE 1=1';
    const params: any[] = [];

    if (metricName) {
      query += ' AND metric_name = ?';
      params.push(metricName);
    }

    if (environment) {
      query += ' AND environment = ?';
      params.push(environment);
    }

    if (days) {
      query += ' AND measurement_date >= DATE_SUB(CURRENT_DATE, INTERVAL ? DAY)';
      params.push(days);
    }

    query += ' ORDER BY measurement_date DESC';

    return await this.all(query, params);
  }

  /**
   * 获取构建效率分析数据
   */
  async getBuildEfficiencyAnalytics(): Promise<any[]> {
    return await this.all('SELECT * FROM build_efficiency_analytics');
  }

  /**
   * 获取依赖安全分析数据
   */
  async getDependencySecurityAnalytics(): Promise<any[]> {
    return await this.all('SELECT * FROM dependency_security_analytics');
  }

  /**
   * 执行自定义分析查询
   */
  async executeAnalyticsQuery(query: string, params?: any[]): Promise<any[]> {
    return await this.all(query, params);
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.db.close((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  /**
   * 获取数据库信息
   */
  async getDatabaseInfo(): Promise<{
    path: string;
    views: string[];
  }> {
    const views = await this.all(`
      SELECT view_name FROM information_schema.views 
      WHERE table_schema = 'main'
    `);

    return {
      path: this.dbPath,
      views: views.map((row: any) => row.view_name)
    };
  }
}

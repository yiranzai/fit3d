import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SQLiteDatabase } from '../../src/build-system/database/sqlite-database.js';
import { DuckDBDatabase } from '../../src/build-system/database/duckdb-database.js';
import fs from 'fs';
import path from 'path';

describe('数据库架构测试', () => {
  let sqliteDb: SQLiteDatabase;
  let duckDb: DuckDBDatabase;
  const testDbPath = 'test-build-system.db';
  const testDuckDbPath = 'test-build-system-analytics.duckdb';

  beforeAll(async () => {
    // 初始化SQLite数据库
    sqliteDb = new SQLiteDatabase(testDbPath);
    await sqliteDb.initSchema();

    // 初始化DuckDB数据库
    duckDb = new DuckDBDatabase(testDuckDbPath);
    await duckDb.initSchema();
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sqliteDb.close();
    await duckDb.close();

    // 清理测试文件
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    if (fs.existsSync(testDuckDbPath)) {
      fs.unlinkSync(testDuckDbPath);
    }
  });

  describe('SQLite数据库测试', () => {
    it('应该成功初始化数据库架构', async () => {
      const info = await sqliteDb.getDatabaseInfo();
      expect(info.path).toBe(path.resolve(testDbPath));
      expect(info.tables).toContain('build_configurations');
      expect(info.tables).toContain('dependency_audit');
      expect(info.tables).toContain('build_history');
      expect(info.tables).toContain('performance_metrics');
      expect(info.tables).toContain('package_manager_validation');
    });

    it('应该成功插入和查询构建配置', async () => {
      // 查询默认构建配置
      const config = await sqliteDb.get(`
        SELECT * FROM build_configurations 
        WHERE package_manager = 'pnpm' AND build_tool = 'vite'
      `);

      expect(config).toBeDefined();
      expect(config.package_manager).toBe('pnpm');
      expect(config.build_tool).toBe('vite');
      expect(config.is_active).toBe(1);
    });

    it('应该成功插入和查询性能指标', async () => {
      // 查询性能基准数据
      const metrics = await sqliteDb.all(`
        SELECT * FROM performance_metrics 
        WHERE metric_name = 'build_time_ms'
      `);

      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0].metric_name).toBe('build_time_ms');
      expect(metrics[0].metric_value).toBeDefined();
    });

    it('应该成功插入构建历史记录', async () => {
      const startTime = new Date().toISOString();
      
      // 插入构建历史记录
      const result = await sqliteDb.run(`
        INSERT INTO build_history (
          build_type, start_time, success, duration_ms
        ) VALUES (?, ?, ?, ?)
      `, ['test', startTime, true, 1000]);

      expect(result.lastID).toBeDefined();

      // 查询构建历史记录
      const history = await sqliteDb.get(`
        SELECT * FROM build_history WHERE id = ?
      `, [result.lastID]);

      expect(history.build_type).toBe('test');
      expect(history.success).toBe(1);
      expect(history.duration_ms).toBe(1000);
    });

    it('应该成功插入依赖审计记录', async () => {
      // 插入依赖审计记录
      const result = await sqliteDb.run(`
        INSERT INTO dependency_audit (
          package_name, version, package_manager, source, dependency_type
        ) VALUES (?, ?, ?, ?, ?)
      `, ['test-package', '1.0.0', 'pnpm', 'package.json', 'dependencies']);

      expect(result.lastID).toBeDefined();

      // 查询依赖审计记录
      const audit = await sqliteDb.get(`
        SELECT * FROM dependency_audit WHERE id = ?
      `, [result.lastID]);

      expect(audit.package_name).toBe('test-package');
      expect(audit.version).toBe('1.0.0');
      expect(audit.package_manager).toBe('pnpm');
    });
  });

  describe('DuckDB数据库测试', () => {
    it('应该成功初始化分析数据库架构', async () => {
      const info = await duckDb.getDatabaseInfo();
      expect(info.path).toBe(path.resolve(testDuckDbPath));
      expect(info.views).toContain('build_performance_analytics');
      expect(info.views).toContain('dependency_usage_analytics');
      expect(info.views).toContain('performance_trend_analytics');
    });

    it('应该成功查询构建性能分析视图', async () => {
      // 由于是空数据库，查询应该返回空结果
      const analytics = await duckDb.getBuildPerformanceAnalytics();
      expect(Array.isArray(analytics)).toBe(true);
    });

    it('应该成功查询依赖使用分析视图', async () => {
      const analytics = await duckDb.getDependencyUsageAnalytics();
      expect(Array.isArray(analytics)).toBe(true);
    });

    it('应该成功查询性能趋势分析视图', async () => {
      const analytics = await duckDb.getPerformanceTrendAnalytics();
      expect(Array.isArray(analytics)).toBe(true);
    });

    it('应该成功执行自定义分析查询', async () => {
      const result = await duckDb.executeAnalyticsQuery(`
        SELECT 'test' as test_column, 123 as test_number
      `);
      
      expect(result).toHaveLength(1);
      expect(result[0].test_column).toBe('test');
      expect(result[0].test_number).toBe(123);
    });
  });

  describe('数据库集成测试', () => {
    it('应该能够从SQLite同步数据到DuckDB进行分析', async () => {
      // 在SQLite中插入一些测试数据
      await sqliteDb.run(`
        INSERT INTO build_history (
          build_type, start_time, end_time, duration_ms, success, bundle_size_bytes, chunk_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        'production',
        '2024-01-01 10:00:00',
        '2024-01-01 10:02:00',
        120000,
        true,
        2100000,
        15
      ]);

      // 在DuckDB中创建临时表来模拟数据同步
      await duckDb.run(`
        CREATE TEMPORARY TABLE temp_build_history AS
        SELECT * FROM (VALUES 
          ('production', '2024-01-01 10:00:00'::TIMESTAMP, '2024-01-01 10:02:00'::TIMESTAMP, 120000, true, 2100000, 15)
        ) AS t(build_type, start_time, end_time, duration_ms, success, bundle_size_bytes, chunk_count)
      `);

      // 测试分析查询
      const result = await duckDb.executeAnalyticsQuery(`
        SELECT 
          build_type,
          AVG(duration_ms) as avg_duration,
          AVG(bundle_size_bytes) as avg_bundle_size
        FROM temp_build_history
        GROUP BY build_type
      `);

      expect(result).toHaveLength(1);
      expect(result[0].build_type).toBe('production');
      expect(result[0].avg_duration).toBe(120000);
      expect(result[0].avg_bundle_size).toBe(2100000);
    });
  });
});
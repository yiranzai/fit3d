/**
 * DuckDB数据库实现 - 用于分析查询
 * DuckDB Database Implementation - For Analytical Queries
 */

import { Database } from 'duckdb';
import path from 'path';
import { MapProvider, MapStyle, TileCache, MapUsageStats } from '@/types';

export class DuckDBDatabase {
  private db: Database;
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.db = new Database(dbPath);
  }

  /**
   * 初始化分析数据库
   * Initialize analytical database
   */
  async initialize(): Promise<void> {
    await this.createAnalyticalTables();
    await this.createViews();
  }

  /**
   * 创建分析表
   * Create analytical tables
   */
  private async createAnalyticalTables(): Promise<void> {
    // 创建地图提供商分析表
    await this.run(`
      CREATE TABLE IF NOT EXISTS map_providers_analytics (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        name_zh VARCHAR NOT NULL,
        is_open_source BOOLEAN,
        is_active BOOLEAN,
        sort_order INTEGER,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
      )
    `);

    // 创建地图样式分析表
    await this.run(`
      CREATE TABLE IF NOT EXISTS map_styles_analytics (
        id VARCHAR PRIMARY KEY,
        provider_id VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        name_zh VARCHAR NOT NULL,
        type VARCHAR NOT NULL,
        is_default BOOLEAN,
        is_active BOOLEAN,
        sort_order INTEGER,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
      )
    `);

    // 创建瓦片缓存分析表
    await this.run(`
      CREATE TABLE IF NOT EXISTS tile_cache_analytics (
        id VARCHAR PRIMARY KEY,
        provider_id VARCHAR NOT NULL,
        style_id VARCHAR NOT NULL,
        z INTEGER NOT NULL,
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        file_size INTEGER NOT NULL,
        created_at TIMESTAMP,
        accessed_at TIMESTAMP,
        access_count INTEGER DEFAULT 1
      )
    `);

    // 创建地图使用统计分析表
    await this.run(`
      CREATE TABLE IF NOT EXISTS map_usage_analytics (
        id VARCHAR PRIMARY KEY,
        provider_id VARCHAR NOT NULL,
        style_id VARCHAR NOT NULL,
        usage_count INTEGER DEFAULT 0,
        last_used TIMESTAMP,
        total_tiles_loaded INTEGER DEFAULT 0,
        total_data_transferred INTEGER DEFAULT 0,
        average_load_time DOUBLE,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
      )
    `);
  }

  /**
   * 创建分析视图
   * Create analytical views
   */
  private async createViews(): Promise<void> {
    // 地图性能分析视图
    await this.run(`
      CREATE OR REPLACE VIEW map_performance_analytics AS
      SELECT 
        p.name as provider_name,
        p.name_zh as provider_name_zh,
        s.name as style_name,
        s.name_zh as style_name_zh,
        COUNT(tc.id) as total_tiles,
        SUM(tc.file_size) as total_size_bytes,
        AVG(tc.file_size) as avg_tile_size,
        AVG(tc.access_count) as avg_access_count,
        MAX(tc.accessed_at) as last_accessed,
        MIN(tc.created_at) as first_created,
        COUNT(DISTINCT DATE(tc.created_at)) as active_days,
        COUNT(tc.id) / COUNT(DISTINCT DATE(tc.created_at)) as avg_tiles_per_day
      FROM tile_cache_analytics tc
      JOIN map_providers_analytics p ON tc.provider_id = p.id
      JOIN map_styles_analytics s ON tc.style_id = s.id
      GROUP BY p.id, s.id, p.name, p.name_zh, s.name, s.name_zh
    `);

    // 用户行为分析视图
    await this.run(`
      CREATE OR REPLACE VIEW user_behavior_analytics AS
      SELECT 
        DATE(created_at) as usage_date,
        provider_id,
        style_id,
        COUNT(*) as daily_tile_requests,
        SUM(file_size) as daily_data_transfer,
        AVG(access_count) as avg_tile_reuse,
        COUNT(DISTINCT CONCAT(z, '-', x, '-', y)) as unique_tiles_accessed
      FROM tile_cache_analytics
      WHERE created_at >= DATE('now', '-30 days')
      GROUP BY DATE(created_at), provider_id, style_id
      ORDER BY usage_date DESC, daily_tile_requests DESC
    `);

    // 缓存效率分析视图
    await this.run(`
      CREATE OR REPLACE VIEW cache_efficiency_analytics AS
      SELECT 
        provider_id,
        style_id,
        COUNT(CASE WHEN access_count > 1 THEN 1 END) * 100.0 / COUNT(*) as cache_hit_rate,
        AVG(access_count) as avg_access_count,
        MAX(access_count) as max_access_count,
        COUNT(*) as total_cached_tiles,
        SUM(file_size) as total_cache_size,
        COUNT(CASE WHEN accessed_at >= DATE('now', '-7 days') THEN 1 END) as recent_access_count
      FROM tile_cache_analytics
      GROUP BY provider_id, style_id
    `);
  }

  /**
   * 同步SQLite数据到DuckDB
   * Sync SQLite data to DuckDB
   */
  async syncFromSQLite(sqliteDb: any): Promise<void> {
    // 同步地图提供商数据
    const providers = await sqliteDb.all('SELECT * FROM map_providers');
    await this.run('DELETE FROM map_providers_analytics');
    for (const provider of providers) {
      await this.run(`
        INSERT INTO map_providers_analytics (
          id, name, name_zh, is_open_source, is_active, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        provider.id, provider.name, provider.name_zh, provider.is_open_source,
        provider.is_active, provider.sort_order, provider.created_at, provider.updated_at
      ]);
    }

    // 同步地图样式数据
    const styles = await sqliteDb.all('SELECT * FROM map_styles');
    await this.run('DELETE FROM map_styles_analytics');
    for (const style of styles) {
      await this.run(`
        INSERT INTO map_styles_analytics (
          id, provider_id, name, name_zh, type, is_default, is_active, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        style.id, style.provider_id, style.name, style.name_zh, style.type,
        style.is_default, style.is_active, style.sort_order, style.created_at, style.updated_at
      ]);
    }

    // 同步瓦片缓存数据
    const tiles = await sqliteDb.all('SELECT * FROM tile_cache');
    await this.run('DELETE FROM tile_cache_analytics');
    for (const tile of tiles) {
      await this.run(`
        INSERT INTO tile_cache_analytics (
          id, provider_id, style_id, z, x, y, file_size, created_at, accessed_at, access_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        tile.id, tile.provider_id, tile.style_id, tile.z, tile.x, tile.y,
        tile.file_size, tile.created_at, tile.accessed_at, tile.access_count
      ]);
    }

    // 同步使用统计数据
    const usageStats = await sqliteDb.all('SELECT * FROM map_usage_stats');
    await this.run('DELETE FROM map_usage_analytics');
    for (const stat of usageStats) {
      await this.run(`
        INSERT INTO map_usage_analytics (
          id, provider_id, style_id, usage_count, last_used, total_tiles_loaded,
          total_data_transferred, average_load_time, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        stat.id, stat.provider_id, stat.style_id, stat.usage_count, stat.last_used,
        stat.total_tiles_loaded, stat.total_data_transferred, stat.average_load_time,
        stat.created_at, stat.updated_at
      ]);
    }
  }

  /**
   * 获取地图性能分析
   * Get map performance analytics
   */
  async getMapPerformanceAnalytics(): Promise<any[]> {
    return await this.all('SELECT * FROM map_performance_analytics ORDER BY total_tiles DESC');
  }

  /**
   * 获取用户行为分析
   * Get user behavior analytics
   */
  async getUserBehaviorAnalytics(days: number = 30): Promise<any[]> {
    return await this.all(`
      SELECT * FROM user_behavior_analytics 
      WHERE usage_date >= DATE('now', '-${days} days')
      ORDER BY usage_date DESC
    `);
  }

  /**
   * 获取缓存效率分析
   * Get cache efficiency analytics
   */
  async getCacheEfficiencyAnalytics(): Promise<any[]> {
    return await this.all('SELECT * FROM cache_efficiency_analytics ORDER BY cache_hit_rate DESC');
  }

  /**
   * 获取提供商性能对比
   * Get provider performance comparison
   */
  async getProviderPerformanceComparison(): Promise<any[]> {
    return await this.all(`
      SELECT 
        provider_id,
        provider_name,
        provider_name_zh,
        COUNT(DISTINCT style_id) as total_styles,
        SUM(total_tiles) as total_tiles,
        SUM(total_size_bytes) as total_size_bytes,
        AVG(avg_tile_size) as avg_tile_size,
        AVG(avg_access_count) as avg_access_count,
        MAX(last_accessed) as last_accessed
      FROM map_performance_analytics
      GROUP BY provider_id, provider_name, provider_name_zh
      ORDER BY total_tiles DESC
    `);
  }

  /**
   * 获取样式使用统计
   * Get style usage statistics
   */
  async getStyleUsageStatistics(): Promise<any[]> {
    return await this.all(`
      SELECT 
        style_id,
        style_name,
        style_name_zh,
        provider_name,
        provider_name_zh,
        total_tiles,
        total_size_bytes,
        avg_access_count,
        last_accessed
      FROM map_performance_analytics
      ORDER BY total_tiles DESC
    `);
  }

  /**
   * 获取时间序列分析
   * Get time series analysis
   */
  async getTimeSeriesAnalysis(days: number = 30): Promise<any[]> {
    return await this.all(`
      SELECT 
        usage_date,
        SUM(daily_tile_requests) as total_requests,
        SUM(daily_data_transfer) as total_transfer,
        AVG(avg_tile_reuse) as avg_reuse,
        COUNT(DISTINCT provider_id) as active_providers,
        COUNT(DISTINCT style_id) as active_styles
      FROM user_behavior_analytics
      WHERE usage_date >= DATE('now', '-${days} days')
      GROUP BY usage_date
      ORDER BY usage_date DESC
    `);
  }

  /**
   * 获取热门瓦片分析
   * Get popular tiles analysis
   */
  async getPopularTilesAnalysis(limit: number = 100): Promise<any[]> {
    return await this.all(`
      SELECT 
        provider_id,
        style_id,
        z,
        x,
        y,
        access_count,
        file_size,
        created_at,
        accessed_at
      FROM tile_cache_analytics
      ORDER BY access_count DESC
      LIMIT ${limit}
    `);
  }

  /**
   * 获取缓存优化建议
   * Get cache optimization recommendations
   */
  async getCacheOptimizationRecommendations(): Promise<any[]> {
    return await this.all(`
      SELECT 
        provider_id,
        style_id,
        cache_hit_rate,
        avg_access_count,
        total_cached_tiles,
        total_cache_size,
        recent_access_count,
        CASE 
          WHEN cache_hit_rate < 50 THEN 'Low hit rate - consider preloading'
          WHEN avg_access_count < 2 THEN 'Low reuse - consider cleanup'
          WHEN total_cache_size > 1000000000 THEN 'Large cache - consider compression'
          ELSE 'Good performance'
        END as recommendation
      FROM cache_efficiency_analytics
      ORDER BY cache_hit_rate ASC
    `);
  }

  /**
   * 执行SQL查询
   * Execute SQL query
   */
  private async run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 执行查询并返回所有结果
   * Execute query and return all results
   */
  private async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * 执行查询并返回单个结果
   * Execute query and return single result
   */
  private async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * 关闭数据库连接
   * Close database connection
   */
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

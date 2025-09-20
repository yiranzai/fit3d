/**
 * SQLite数据库实现
 * SQLite Database Implementation
 */

import Database from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { MapProvider, MapStyle, UserMapPreferences, TileCache, OfflineMapCache, MapUsageStats } from '@/types';

export class SQLiteDatabase {
  private db: Database.Database;
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.db = new Database.Database(dbPath);
    
    // 将回调函数转换为Promise
    this.run = promisify(this.db.run.bind(this.db));
    this.get = promisify(this.db.get.bind(this.db));
    this.all = promisify(this.db.all.bind(this.db));
  }

  // Promise化的数据库方法
  private run: (sql: string, params?: any[]) => Promise<Database.RunResult>;
  private get: (sql: string, params?: any[]) => Promise<any>;
  private all: (sql: string, params?: any[]) => Promise<any[]>;

  /**
   * 初始化数据库模式
   * Initialize database schema
   */
  async initialize(): Promise<void> {
    await this.createTables();
    await this.createIndexes();
    await this.insertInitialData();
  }

  /**
   * 创建数据库表
   * Create database tables
   */
  private async createTables(): Promise<void> {
    // 创建地图提供商表
    await this.run(`
      CREATE TABLE IF NOT EXISTS map_providers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_zh TEXT NOT NULL,
        description TEXT,
        description_zh TEXT,
        is_open_source BOOLEAN DEFAULT 1,
        terms_of_use TEXT,
        data_source TEXT,
        api_config JSON NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建地图样式表
    await this.run(`
      CREATE TABLE IF NOT EXISTS map_styles (
        id TEXT PRIMARY KEY,
        provider_id TEXT NOT NULL REFERENCES map_providers(id),
        name TEXT NOT NULL,
        name_zh TEXT NOT NULL,
        description TEXT,
        description_zh TEXT,
        type TEXT NOT NULL,
        suitable_activities JSON,
        style_config JSON NOT NULL,
        preview_image TEXT,
        is_default BOOLEAN DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建用户地图偏好表
    await this.run(`
      CREATE TABLE IF NOT EXISTS user_map_preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        default_provider_id TEXT REFERENCES map_providers(id),
        default_style_id TEXT REFERENCES map_styles(id),
        activity_preferences JSON,
        custom_styles JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建瓦片缓存表
    await this.run(`
      CREATE TABLE IF NOT EXISTS tile_cache (
        id TEXT PRIMARY KEY,
        provider_id TEXT NOT NULL,
        style_id TEXT NOT NULL,
        z INTEGER NOT NULL,
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        data BLOB NOT NULL,
        content_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        access_count INTEGER DEFAULT 1
      )
    `);

    // 创建离线地图缓存表
    await this.run(`
      CREATE TABLE IF NOT EXISTS offline_map_cache (
        id TEXT PRIMARY KEY,
        region_name TEXT NOT NULL,
        style_id TEXT NOT NULL REFERENCES map_styles(id),
        bounds JSON NOT NULL,
        zoom_levels JSON NOT NULL,
        cache_path TEXT NOT NULL,
        file_size INTEGER,
        download_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        access_count INTEGER DEFAULT 0
      )
    `);

    // 创建地图使用统计表
    await this.run(`
      CREATE TABLE IF NOT EXISTS map_usage_stats (
        id TEXT PRIMARY KEY,
        provider_id TEXT NOT NULL REFERENCES map_providers(id),
        style_id TEXT NOT NULL REFERENCES map_styles(id),
        usage_count INTEGER DEFAULT 0,
        last_used DATETIME,
        total_tiles_loaded INTEGER DEFAULT 0,
        total_data_transferred INTEGER DEFAULT 0,
        average_load_time REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建数据库版本表
    await this.run(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  /**
   * 创建数据库索引
   * Create database indexes
   */
  private async createIndexes(): Promise<void> {
    // 地图提供商索引
    await this.run('CREATE INDEX IF NOT EXISTS idx_map_providers_active ON map_providers(is_active)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_map_providers_sort ON map_providers(sort_order)');

    // 地图样式索引
    await this.run('CREATE INDEX IF NOT EXISTS idx_map_styles_provider ON map_styles(provider_id)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_map_styles_type ON map_styles(type)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_map_styles_active ON map_styles(is_active)');

    // 瓦片缓存索引
    await this.run('CREATE INDEX IF NOT EXISTS idx_tile_cache_provider_style ON tile_cache(provider_id, style_id)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_tile_cache_coords ON tile_cache(z, x, y)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_tile_cache_accessed ON tile_cache(accessed_at)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_tile_cache_access_count ON tile_cache(access_count)');

    // 复合索引
    await this.run('CREATE INDEX IF NOT EXISTS idx_tile_cache_provider_style_coords ON tile_cache(provider_id, style_id, z, x, y)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_tile_cache_accessed_count ON tile_cache(accessed_at, access_count)');

    // 离线地图缓存索引
    await this.run('CREATE INDEX IF NOT EXISTS idx_offline_cache_style ON offline_map_cache(style_id)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_offline_cache_region ON offline_map_cache(region_name)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_offline_cache_accessed ON offline_map_cache(last_accessed)');

    // 使用统计索引
    await this.run('CREATE INDEX IF NOT EXISTS idx_usage_stats_provider ON map_usage_stats(provider_id)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_usage_stats_style ON map_usage_stats(style_id)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_usage_stats_count ON map_usage_stats(usage_count)');
  }

  /**
   * 插入初始数据
   * Insert initial data
   */
  private async insertInitialData(): Promise<void> {
    // 检查是否已有数据
    const existingProviders = await this.get('SELECT COUNT(*) as count FROM map_providers');
    if (existingProviders.count > 0) {
      return; // 已有数据，跳过插入
    }

    // 插入地图提供商数据
    const providers = [
      {
        id: 'osm',
        name: 'OpenStreetMap',
        name_zh: '开放街图',
        description: 'Community-driven open source mapping project',
        description_zh: '社区驱动的开源地图项目',
        is_open_source: 1,
        data_source: 'OpenStreetMap contributors',
        api_config: JSON.stringify({
          baseUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 19,
          minZoom: 0,
          tileSize: 256,
          cacheStrategy: 'hybrid'
        }),
        sort_order: 1
      },
      {
        id: 'cartodb',
        name: 'CartoDB',
        name_zh: 'CartoDB地图',
        description: 'Open source mapping platform with various styles',
        description_zh: '具有多种样式的开源地图平台',
        is_open_source: 1,
        data_source: 'CartoDB',
        api_config: JSON.stringify({
          baseUrl: 'https://{s}.basemaps.cartocdn.com/{style}/{z}/{x}/{y}.png',
          subdomains: ['a', 'b', 'c', 'd'],
          maxZoom: 20,
          minZoom: 0,
          tileSize: 256,
          cacheStrategy: 'hybrid'
        }),
        sort_order: 2
      },
      {
        id: 'stamen',
        name: 'Stamen Design',
        name_zh: 'Stamen设计',
        description: 'Creative open source map tiles',
        description_zh: '创意开源地图瓦片',
        is_open_source: 1,
        data_source: 'Stamen Design',
        api_config: JSON.stringify({
          baseUrl: 'https://stamen-tiles-{s}.a.ssl.fastly.net/{style}/{z}/{x}/{y}.png',
          subdomains: ['a', 'b', 'c', 'd'],
          maxZoom: 18,
          minZoom: 0,
          tileSize: 256,
          cacheStrategy: 'hybrid'
        }),
        sort_order: 3
      },
      {
        id: 'esri',
        name: 'Esri Open Data',
        name_zh: 'Esri开放数据',
        description: 'Open source map tiles from Esri',
        description_zh: '来自Esri的开源地图瓦片',
        is_open_source: 1,
        data_source: 'Esri',
        api_config: JSON.stringify({
          baseUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/{service}/MapServer/tile/{z}/{y}/{x}',
          subdomains: [],
          maxZoom: 19,
          minZoom: 0,
          tileSize: 256,
          cacheStrategy: 'hybrid'
        }),
        sort_order: 4
      },
      {
        id: 'opentopomap',
        name: 'OpenTopoMap',
        name_zh: '开放地形图',
        description: 'Open source topographic maps',
        description_zh: '开源地形图',
        is_open_source: 1,
        data_source: 'OpenTopoMap',
        api_config: JSON.stringify({
          baseUrl: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 17,
          minZoom: 0,
          tileSize: 256,
          cacheStrategy: 'hybrid'
        }),
        sort_order: 5
      },
      {
        id: 'amap',
        name: 'Amap',
        name_zh: '高德地图',
        description: 'Chinese map provider with detailed local data',
        description_zh: '中国地图提供商，提供详细的本地数据',
        is_open_source: 0,
        data_source: 'Amap',
        api_config: JSON.stringify({
          baseUrl: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
          subdomains: ['1', '2', '3', '4'],
          maxZoom: 18,
          minZoom: 0,
          tileSize: 256,
          cacheStrategy: 'hybrid'
        }),
        sort_order: 6
      },
      {
        id: 'baidu',
        name: 'Baidu Maps',
        name_zh: '百度地图',
        description: 'Chinese map provider with comprehensive coverage',
        description_zh: '中国地图提供商，提供全面覆盖',
        is_open_source: 0,
        data_source: 'Baidu',
        api_config: JSON.stringify({
          baseUrl: 'https://maponline{s}.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20200101',
          subdomains: ['0', '1', '2', '3'],
          maxZoom: 19,
          minZoom: 0,
          tileSize: 256,
          cacheStrategy: 'hybrid'
        }),
        sort_order: 7
      }
    ];

    for (const provider of providers) {
      await this.run(`
        INSERT INTO map_providers (
          id, name, name_zh, description, description_zh, is_open_source,
          data_source, api_config, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        provider.id, provider.name, provider.name_zh, provider.description,
        provider.description_zh, provider.is_open_source, provider.data_source,
        provider.api_config, provider.sort_order
      ]);
    }

    // 插入地图样式数据
    const styles = [
      // OpenStreetMap 样式
      {
        id: 'osm-standard',
        provider_id: 'osm',
        name: 'Standard',
        name_zh: '标准样式',
        description: 'Standard OpenStreetMap style',
        description_zh: '标准开放街图样式',
        type: 'street',
        suitable_activities: JSON.stringify(['cycling', 'running']),
        style_config: JSON.stringify({
          tileServer: {
            urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            subdomains: ['a', 'b', 'c'],
            maxZoom: 19,
            minZoom: 0,
            tileSize: 256,
            cacheStrategy: 'hybrid'
          },
          labelLanguage: 'auto',
          colorScheme: {
            primary: '#2563eb',
            secondary: '#64748b',
            background: '#ffffff'
          }
        }),
        is_default: 1,
        sort_order: 1
      },
      // CartoDB 样式
      {
        id: 'cartodb-light',
        provider_id: 'cartodb',
        name: 'Light',
        name_zh: '浅色样式',
        description: 'Light colored map style',
        description_zh: '浅色地图样式',
        type: 'street',
        suitable_activities: JSON.stringify(['cycling', 'running', 'hiking']),
        style_config: JSON.stringify({
          tileServer: {
            urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            subdomains: ['a', 'b', 'c', 'd'],
            maxZoom: 20,
            minZoom: 0,
            tileSize: 256,
            cacheStrategy: 'hybrid'
          },
          labelLanguage: 'auto',
          colorScheme: {
            primary: '#2563eb',
            secondary: '#64748b',
            background: '#f8fafc'
          }
        }),
        is_default: 0,
        sort_order: 2
      },
      {
        id: 'cartodb-dark',
        provider_id: 'cartodb',
        name: 'Dark',
        name_zh: '深色样式',
        description: 'Dark colored map style',
        description_zh: '深色地图样式',
        type: 'street',
        suitable_activities: JSON.stringify(['cycling', 'running']),
        style_config: JSON.stringify({
          tileServer: {
            urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            subdomains: ['a', 'b', 'c', 'd'],
            maxZoom: 20,
            minZoom: 0,
            tileSize: 256,
            cacheStrategy: 'hybrid'
          },
          labelLanguage: 'auto',
          colorScheme: {
            primary: '#3b82f6',
            secondary: '#94a3b8',
            background: '#1e293b'
          }
        }),
        is_default: 0,
        sort_order: 3
      },
      // Stamen 样式
      {
        id: 'stamen-terrain',
        provider_id: 'stamen',
        name: 'Terrain',
        name_zh: '地形样式',
        description: 'Terrain map with elevation contours',
        description_zh: '带等高线的地形图',
        type: 'terrain',
        suitable_activities: JSON.stringify(['hiking', 'mountain_biking']),
        style_config: JSON.stringify({
          tileServer: {
            urlTemplate: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',
            subdomains: ['a', 'b', 'c', 'd'],
            maxZoom: 18,
            minZoom: 0,
            tileSize: 256,
            cacheStrategy: 'hybrid'
          },
          labelLanguage: 'auto',
          colorScheme: {
            primary: '#059669',
            secondary: '#6b7280',
            background: '#f0fdf4'
          }
        }),
        is_default: 0,
        sort_order: 4
      },
      // OpenTopoMap 样式
      {
        id: 'opentopomap',
        provider_id: 'opentopomap',
        name: 'OpenTopoMap',
        name_zh: '开放地形图',
        description: 'Open source topographic map',
        description_zh: '开源地形图',
        type: 'topographic',
        suitable_activities: JSON.stringify(['hiking', 'mountain_biking', 'climbing']),
        style_config: JSON.stringify({
          tileServer: {
            urlTemplate: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            subdomains: ['a', 'b', 'c'],
            maxZoom: 17,
            minZoom: 0,
            tileSize: 256,
            cacheStrategy: 'hybrid'
          },
          labelLanguage: 'auto',
          colorScheme: {
            primary: '#059669',
            secondary: '#6b7280',
            background: '#f0fdf4'
          }
        }),
        is_default: 0,
        sort_order: 5
      }
    ];

    for (const style of styles) {
      await this.run(`
        INSERT INTO map_styles (
          id, provider_id, name, name_zh, description, description_zh,
          type, suitable_activities, style_config, is_default, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        style.id, style.provider_id, style.name, style.name_zh,
        style.description, style.description_zh, style.type,
        style.suitable_activities, style.style_config, style.is_default,
        style.sort_order
      ]);
    }

    // 插入默认用户偏好
    await this.run(`
      INSERT INTO user_map_preferences (
        id, default_provider_id, default_style_id, activity_preferences
      ) VALUES (?, ?, ?, ?)
    `, [
      'default',
      'osm',
      'osm-standard',
      JSON.stringify({
        hiking: { provider: 'opentopomap', style: 'opentopomap' },
        cycling: { provider: 'osm', style: 'osm-standard' },
        running: { provider: 'cartodb', style: 'cartodb-light' }
      })
    ]);

    // 插入数据库版本
    await this.run('INSERT INTO schema_version (version) VALUES (1)');
  }

  /**
   * 获取所有活跃的地图提供商
   * Get all active map providers
   */
  async getActiveProviders(): Promise<MapProvider[]> {
    const rows = await this.all(
      'SELECT * FROM map_providers WHERE is_active = 1 ORDER BY sort_order'
    );
    return rows.map(this.mapRowToProvider);
  }

  /**
   * 获取提供商的地图样式
   * Get provider's map styles
   */
  async getProviderStyles(providerId: string): Promise<MapStyle[]> {
    const rows = await this.all(
      'SELECT * FROM map_styles WHERE provider_id = ? AND is_active = 1 ORDER BY sort_order',
      [providerId]
    );
    return rows.map(this.mapRowToStyle);
  }

  /**
   * 获取瓦片缓存
   * Get cached tile
   */
  async getCachedTile(providerId: string, styleId: string, z: number, x: number, y: number): Promise<TileCache | null> {
    const row = await this.get(
      'SELECT * FROM tile_cache WHERE provider_id = ? AND style_id = ? AND z = ? AND x = ? AND y = ?',
      [providerId, styleId, z, x, y]
    );
    return row ? this.mapRowToTileCache(row) : null;
  }

  /**
   * 缓存瓦片
   * Cache tile
   */
  async cacheTile(tile: TileCache): Promise<void> {
    await this.run(`
      INSERT OR REPLACE INTO tile_cache (
        id, provider_id, style_id, z, x, y, data, content_type, file_size
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tile.id, tile.providerId, tile.styleId, tile.z, tile.x, tile.y,
      tile.data, tile.contentType, tile.fileSize
    ]);
  }

  /**
   * 更新瓦片访问统计
   * Update tile access statistics
   */
  async updateTileAccess(tileId: string): Promise<void> {
    await this.run(
      'UPDATE tile_cache SET accessed_at = CURRENT_TIMESTAMP, access_count = access_count + 1 WHERE id = ?',
      [tileId]
    );
  }

  /**
   * 清理过期缓存
   * Cleanup expired cache
   */
  async cleanupExpiredCache(maxAge: number): Promise<void> {
    const expiredTime = new Date(Date.now() - maxAge);
    await this.run(
      'DELETE FROM tile_cache WHERE accessed_at < ?',
      [expiredTime.toISOString()]
    );
  }

  /**
   * 获取缓存统计
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    const stats = await this.get(`
      SELECT 
        COUNT(*) as total_tiles,
        SUM(file_size) as total_size,
        AVG(access_count) as avg_access_count,
        COUNT(CASE WHEN accessed_at >= datetime('now', '-7 days') THEN 1 END) as recent_access_count
      FROM tile_cache
    `);
    return stats;
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

  // 私有辅助方法：将数据库行映射为对象
  private mapRowToProvider(row: any): MapProvider {
    return {
      id: row.id,
      name: row.name,
      nameZh: row.name_zh,
      description: row.description,
      descriptionZh: row.description_zh,
      isOpenSource: Boolean(row.is_open_source),
      termsOfUse: row.terms_of_use,
      dataSource: row.data_source,
      apiConfig: JSON.parse(row.api_config),
      isActive: Boolean(row.is_active),
      sortOrder: row.sort_order,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapRowToStyle(row: any): MapStyle {
    return {
      id: row.id,
      providerId: row.provider_id,
      name: row.name,
      nameZh: row.name_zh,
      description: row.description,
      descriptionZh: row.description_zh,
      type: row.type as any,
      suitableActivities: JSON.parse(row.suitable_activities || '[]'),
      styleConfig: JSON.parse(row.style_config),
      previewImage: row.preview_image,
      isDefault: Boolean(row.is_default),
      isActive: Boolean(row.is_active),
      sortOrder: row.sort_order,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapRowToTileCache(row: any): TileCache {
    return {
      id: row.id,
      providerId: row.provider_id,
      styleId: row.style_id,
      z: row.z,
      x: row.x,
      y: row.y,
      data: row.data,
      contentType: row.content_type,
      fileSize: row.file_size,
      createdAt: new Date(row.created_at),
      accessedAt: new Date(row.accessed_at),
      accessCount: row.access_count
    };
  }
}

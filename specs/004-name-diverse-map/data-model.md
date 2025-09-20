# Data Model Specification

## 数据库架构

### 主数据库: SQLite
**用途:** 地图配置、用户偏好、实时操作的主要存储
**位置:** 本地文件系统 (`~/.fit3d/maps.db`)

### 分析数据库: DuckDB
**用途:** 复杂分析查询、性能统计、数据挖掘
**位置:** 本地文件系统 (`~/.fit3d/maps-analytics.db`)

## 核心数据模型

### 地图提供商配置
```sql
-- SQLite 模式
CREATE TABLE map_providers (
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
);

-- 初始数据
INSERT INTO map_providers (id, name, name_zh, description, description_zh, is_open_source, data_source, api_config) VALUES
('osm', 'OpenStreetMap', '开放街图', 'Community-driven open source mapping project', '社区驱动的开源地图项目', 1, 'OpenStreetMap contributors', '{"baseUrl": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", "subdomains": ["a", "b", "c"], "maxZoom": 19, "tileSize": 256}'),
('cartodb', 'CartoDB', 'CartoDB地图', 'Open source mapping platform with various styles', '具有多种样式的开源地图平台', 1, 'CartoDB', '{"baseUrl": "https://{s}.basemaps.cartocdn.com/{style}/{z}/{x}/{y}.png", "subdomains": ["a", "b", "c", "d"], "maxZoom": 20, "tileSize": 256}'),
('stamen', 'Stamen Design', 'Stamen设计', 'Creative open source map tiles', '创意开源地图瓦片', 1, 'Stamen Design', '{"baseUrl": "https://stamen-tiles-{s}.a.ssl.fastly.net/{style}/{z}/{x}/{y}.png", "subdomains": ["a", "b", "c", "d"], "maxZoom": 18, "tileSize": 256}'),
('esri', 'Esri Open Data', 'Esri开放数据', 'Open source map tiles from Esri', '来自Esri的开源地图瓦片', 1, 'Esri', '{"baseUrl": "https://server.arcgisonline.com/ArcGIS/rest/services/{service}/MapServer/tile/{z}/{y}/{x}", "maxZoom": 19, "tileSize": 256}'),
('opentopomap', 'OpenTopoMap', '开放地形图', 'Open source topographic maps', '开源地形图', 1, 'OpenTopoMap', '{"baseUrl": "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", "subdomains": ["a", "b", "c"], "maxZoom": 17, "tileSize": 256}'),
('amap', 'Amap', '高德地图', 'Chinese map provider with detailed local data', '中国地图提供商，提供详细的本地数据', 0, 'Amap', '{"baseUrl": "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", "subdomains": ["1", "2", "3", "4"], "maxZoom": 18, "tileSize": 256}'),
('baidu', 'Baidu Maps', '百度地图', 'Chinese map provider with comprehensive coverage', '中国地图提供商，提供全面覆盖', 0, 'Baidu', '{"baseUrl": "https://maponline{s}.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20200101", "subdomains": ["0", "1", "2", "3"], "maxZoom": 19, "tileSize": 256}');
```

### 地图样式配置
```sql
CREATE TABLE map_styles (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES map_providers(id),
  name TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  description TEXT,
  description_zh TEXT,
  type TEXT NOT NULL,
  suitable_activities JSON, -- 适用活动类型数组
  style_config JSON NOT NULL,
  preview_image TEXT,
  is_default BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认地图样式
INSERT INTO map_styles (id, provider_id, name, name_zh, description, description_zh, type, suitable_activities, style_config, is_default) VALUES
-- OpenStreetMap 样式
('osm-standard', 'osm', 'Standard', '标准样式', 'Standard OpenStreetMap style', '标准开放街图样式', 'street', '["cycling", "running"]', '{"tileServer": {"urlTemplate": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", "subdomains": ["a", "b", "c"], "maxZoom": 19, "tileSize": 256, "cacheStrategy": "hybrid"}}', 1),

-- CartoDB 样式
('cartodb-light', 'cartodb', 'Light', '浅色样式', 'Light colored map style', '浅色地图样式', 'street', '["cycling", "running", "hiking"]', '{"tileServer": {"urlTemplate": "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", "subdomains": ["a", "b", "c", "d"], "maxZoom": 20, "tileSize": 256, "cacheStrategy": "hybrid"}}', 0),
('cartodb-dark', 'cartodb', 'Dark', '深色样式', 'Dark colored map style', '深色地图样式', 'street', '["cycling", "running"]', '{"tileServer": {"urlTemplate": "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", "subdomains": ["a", "b", "c", "d"], "maxZoom": 20, "tileSize": 256, "cacheStrategy": "hybrid"}}', 0),
('cartodb-voyager', 'cartodb', 'Voyager', '航海样式', 'Voyager map style', '航海地图样式', 'street', '["cycling", "running", "hiking"]', '{"tileServer": {"urlTemplate": "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png", "subdomains": ["a", "b", "c", "d"], "maxZoom": 20, "tileSize": 256, "cacheStrategy": "hybrid"}}', 0),

-- Stamen 样式
('stamen-terrain', 'stamen', 'Terrain', '地形样式', 'Terrain map with elevation contours', '带等高线的地形图', 'terrain', '["hiking", "mountain_biking"]', '{"tileServer": {"urlTemplate": "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png", "subdomains": ["a", "b", "c", "d"], "maxZoom": 18, "tileSize": 256, "cacheStrategy": "hybrid"}}', 0),
('stamen-toner', 'stamen', 'Toner', '墨色样式', 'High contrast black and white style', '高对比度黑白样式', 'street', '["cycling", "running"]', '{"tileServer": {"urlTemplate": "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png", "subdomains": ["a", "b", "c", "d"], "maxZoom": 18, "tileSize": 256, "cacheStrategy": "hybrid"}}', 0),
('stamen-watercolor', 'stamen', 'Watercolor', '水彩样式', 'Artistic watercolor style', '艺术水彩样式', 'custom', '["hiking", "leisure"]', '{"tileServer": {"urlTemplate": "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg", "subdomains": ["a", "b", "c", "d"], "maxZoom": 16, "tileSize": 256, "cacheStrategy": "hybrid"}}', 0),

-- Esri 样式
('esri-world-imagery', 'esri', 'Satellite', '卫星图像', 'High resolution satellite imagery', '高分辨率卫星图像', 'satellite', '["hiking", "mountain_biking", "cycling"]', '{"tileServer": {"urlTemplate": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", "maxZoom": 19, "tileSize": 256, "cacheStrategy": "hybrid"}}', 0),
('esri-world-topo', 'esri', 'Topographic', '地形图', 'Topographic map with terrain features', '带地形特征的地形图', 'topographic', '["hiking", "mountain_biking"]', '{"tileServer": {"urlTemplate": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", "maxZoom": 19, "tileSize": 256, "cacheStrategy": "hybrid"}}', 0),

-- OpenTopoMap 样式
('opentopomap', 'opentopomap', 'OpenTopoMap', '开放地形图', 'Open source topographic map', '开源地形图', 'topographic', '["hiking", "mountain_biking", "climbing"]', '{"tileServer": {"urlTemplate": "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", "subdomains": ["a", "b", "c"], "maxZoom": 17, "tileSize": 256, "cacheStrategy": "hybrid"}}', 0),

-- 高德地图样式
('amap-street', 'amap', 'Street', '街道图', 'Amap street map style', '高德街道地图样式', 'street', '["cycling", "running", "hiking"]', '{"tileServer": {"urlTemplate": "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", "subdomains": ["1", "2", "3", "4"], "maxZoom": 18, "tileSize": 256, "cacheStrategy": "hybrid"}}', 0),
('amap-satellite', 'amap', 'Satellite', '卫星图', 'Amap satellite imagery', '高德卫星图像', 'satellite', '["hiking", "mountain_biking"]', '{"tileServer": {"urlTemplate": "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}", "subdomains": ["1", "2", "3", "4"], "maxZoom": 18, "tileSize": 256, "cacheStrategy": "hybrid"}}', 0),

-- 百度地图样式
('baidu-street', 'baidu', 'Street', '街道图', 'Baidu street map style', '百度街道地图样式', 'street', '["cycling", "running"]', '{"tileServer": {"urlTemplate": "https://maponline{s}.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20200101", "subdomains": ["0", "1", "2", "3"], "maxZoom": 19, "tileSize": 256, "cacheStrategy": "hybrid"}}', 0),
('baidu-satellite', 'baidu', 'Satellite', '卫星图', 'Baidu satellite imagery', '百度卫星图像', 'satellite', '["hiking", "mountain_biking"]', '{"tileServer": {"urlTemplate": "https://shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46", "subdomains": ["0", "1", "2", "3"], "maxZoom": 19, "tileSize": 256, "cacheStrategy": "hybrid"}}', 0);
```

### 用户地图偏好设置
```sql
CREATE TABLE user_map_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  default_provider_id TEXT REFERENCES map_providers(id),
  default_style_id TEXT REFERENCES map_styles(id),
  activity_preferences JSON, -- 不同活动类型的地图偏好
  custom_styles JSON, -- 用户自定义样式
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 默认用户偏好
INSERT INTO user_map_preferences (id, default_provider_id, default_style_id, activity_preferences) VALUES
('default', 'osm', 'osm-standard', '{"hiking": {"provider": "opentopomap", "style": "opentopomap"}, "cycling": {"provider": "osm", "style": "osm-standard"}, "running": {"provider": "cartodb", "style": "cartodb-light"}}');
```

### 瓦片缓存系统
```sql
CREATE TABLE tile_cache (
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
);

-- 瓦片缓存索引
CREATE INDEX idx_tile_cache_provider_style ON tile_cache(provider_id, style_id);
CREATE INDEX idx_tile_cache_coords ON tile_cache(z, x, y);
CREATE INDEX idx_tile_cache_accessed ON tile_cache(accessed_at);
CREATE INDEX idx_tile_cache_access_count ON tile_cache(access_count);
```

### 离线地图缓存
```sql
CREATE TABLE offline_map_cache (
  id TEXT PRIMARY KEY,
  region_name TEXT NOT NULL,
  style_id TEXT NOT NULL REFERENCES map_styles(id),
  bounds JSON NOT NULL, -- 地理边界
  zoom_levels JSON NOT NULL, -- 缩放级别数组
  cache_path TEXT NOT NULL,
  file_size INTEGER,
  download_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
  access_count INTEGER DEFAULT 0
);

-- 离线地图索引
CREATE INDEX idx_offline_cache_style ON offline_map_cache(style_id);
CREATE INDEX idx_offline_cache_region ON offline_map_cache(region_name);
CREATE INDEX idx_offline_cache_accessed ON offline_map_cache(last_accessed);
```

### 地图使用统计
```sql
CREATE TABLE map_usage_stats (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES map_providers(id),
  style_id TEXT NOT NULL REFERENCES map_styles(id),
  usage_count INTEGER DEFAULT 0,
  last_used DATETIME,
  total_tiles_loaded INTEGER DEFAULT 0,
  total_data_transferred INTEGER DEFAULT 0, -- bytes
  average_load_time REAL, -- milliseconds
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 使用统计索引
CREATE INDEX idx_usage_stats_provider ON map_usage_stats(provider_id);
CREATE INDEX idx_usage_stats_style ON map_usage_stats(style_id);
CREATE INDEX idx_usage_stats_count ON map_usage_stats(usage_count);
```

## DuckDB 分析模式

### 地图性能分析
```sql
-- DuckDB 模式用于地图性能分析
CREATE TABLE map_performance_analytics AS
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
  -- 性能指标
  COUNT(DISTINCT DATE(tc.created_at)) as active_days,
  COUNT(tc.id) / COUNT(DISTINCT DATE(tc.created_at)) as avg_tiles_per_day
FROM tile_cache tc
JOIN map_providers p ON tc.provider_id = p.id
JOIN map_styles s ON tc.style_id = s.id
GROUP BY p.id, s.id, p.name, p.name_zh, s.name, s.name_zh;
```

### 用户行为分析
```sql
-- 用户地图使用行为分析
CREATE TABLE user_behavior_analytics AS
SELECT 
  DATE(created_at) as usage_date,
  provider_id,
  style_id,
  COUNT(*) as daily_tile_requests,
  SUM(file_size) as daily_data_transfer,
  AVG(access_count) as avg_tile_reuse,
  COUNT(DISTINCT CONCAT(z, '-', x, '-', y)) as unique_tiles_accessed
FROM tile_cache
WHERE created_at >= DATE('now', '-30 days')
GROUP BY DATE(created_at), provider_id, style_id
ORDER BY usage_date DESC, daily_tile_requests DESC;
```

### 缓存效率分析
```sql
-- 缓存效率分析
CREATE TABLE cache_efficiency_analytics AS
SELECT 
  provider_id,
  style_id,
  -- 缓存命中率
  COUNT(CASE WHEN access_count > 1 THEN 1 END) * 100.0 / COUNT(*) as cache_hit_rate,
  -- 平均访问次数
  AVG(access_count) as avg_access_count,
  -- 最受欢迎的瓦片
  MAX(access_count) as max_access_count,
  -- 缓存大小分布
  COUNT(*) as total_cached_tiles,
  SUM(file_size) as total_cache_size,
  -- 时间分布
  COUNT(CASE WHEN accessed_at >= DATE('now', '-7 days') THEN 1 END) as recent_access_count
FROM tile_cache
GROUP BY provider_id, style_id;
```

## TypeScript 接口定义

### 核心数据类型
```typescript
// 地图提供商接口
interface MapProvider {
  id: string;
  name: string;
  nameZh: string;
  description?: string;
  descriptionZh?: string;
  isOpenSource: boolean;
  termsOfUse?: string;
  dataSource: string;
  apiConfig: MapApiConfig;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// 地图样式接口
interface MapStyle {
  id: string;
  providerId: string;
  name: string;
  nameZh: string;
  description?: string;
  descriptionZh?: string;
  type: 'terrain' | 'satellite' | 'street' | 'topographic' | 'hybrid' | 'custom';
  suitableActivities: string[];
  styleConfig: MapStyleConfig;
  previewImage?: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// 地图样式配置
interface MapStyleConfig {
  tileServer: TileServerConfig;
  labelLanguage: 'zh-CN' | 'en-US' | 'auto';
  colorScheme: ColorScheme;
  customLayers?: CustomLayer[];
}

// 瓦片服务器配置
interface TileServerConfig {
  urlTemplate: string;
  subdomains: string[];
  maxZoom: number;
  minZoom: number;
  tileSize: number;
  cacheStrategy: 'memory' | 'disk' | 'hybrid';
  headers?: Record<string, string>;
}

// 颜色方案
interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  accent?: string;
  text?: string;
}

// 自定义图层
interface CustomLayer {
  id: string;
  type: 'line' | 'fill' | 'symbol' | 'raster' | 'circle';
  source: string;
  paint: Record<string, any>;
  layout: Record<string, any>;
  visibility: 'visible' | 'none';
}

// 瓦片缓存数据
interface TileCache {
  id: string;
  providerId: string;
  styleId: string;
  z: number;
  x: number;
  y: number;
  data: Buffer;
  contentType: string;
  fileSize: number;
  createdAt: Date;
  accessedAt: Date;
  accessCount: number;
}

// 用户地图偏好
interface UserMapPreferences {
  id: string;
  userId?: string;
  defaultProviderId: string;
  defaultStyleId: string;
  activityPreferences: Record<string, ActivityMapPreference>;
  customStyles: CustomMapStyle[];
  createdAt: Date;
  updatedAt: Date;
}

// 活动地图偏好
interface ActivityMapPreference {
  provider: string;
  style: string;
  customConfig?: MapStyleConfig;
}

// 自定义地图样式
interface CustomMapStyle {
  id: string;
  name: string;
  nameZh: string;
  baseStyleId: string;
  modifications: StyleModification[];
  createdAt: Date;
}

// 样式修改
interface StyleModification {
  type: 'color' | 'layer' | 'filter' | 'layout';
  target: string;
  value: any;
  description?: string;
}

// 离线地图缓存
interface OfflineMapCache {
  id: string;
  regionName: string;
  styleId: string;
  bounds: BoundingBox;
  zoomLevels: number[];
  cachePath: string;
  fileSize?: number;
  downloadDate: Date;
  lastAccessed: Date;
  accessCount: number;
}

// 地理边界框
interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// 地图使用统计
interface MapUsageStats {
  id: string;
  providerId: string;
  styleId: string;
  usageCount: number;
  lastUsed?: Date;
  totalTilesLoaded: number;
  totalDataTransferred: number;
  averageLoadTime?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 地图管理器接口
```typescript
// 地图管理器接口
interface MapManager {
  // 获取所有可用的地图提供商
  getAvailableProviders(): Promise<MapProvider[]>;
  
  // 获取提供商的地图样式
  getProviderStyles(providerId: string): Promise<MapStyle[]>;
  
  // 切换地图提供商
  switchProvider(providerId: string): Promise<void>;
  
  // 切换地图样式
  switchStyle(styleId: string): Promise<void>;
  
  // 创建自定义样式
  createCustomStyle(config: MapStyleConfig): Promise<MapStyle>;
  
  // 预加载地图瓦片
  preloadTiles(bounds: BoundingBox, zoomLevels: number[]): Promise<void>;
  
  // 获取离线地图
  downloadOfflineMap(region: GeoRegion, styleId: string): Promise<string>;
  
  // 获取瓦片
  getTile(providerId: string, styleId: string, z: number, x: number, y: number): Promise<TileCache | null>;
  
  // 缓存瓦片
  cacheTile(tile: TileCache): Promise<void>;
  
  // 清理缓存
  cleanupCache(maxAge?: number): Promise<void>;
}

// 瓦片缓存管理器接口
interface TileCacheManager {
  // 获取瓦片
  getTile(key: string): Promise<TileCache | null>;
  
  // 存储瓦片
  setTile(key: string, tile: TileCache): Promise<void>;
  
  // 检查瓦片是否存在
  hasTile(key: string): Promise<boolean>;
  
  // 删除瓦片
  removeTile(key: string): Promise<void>;
  
  // 清理过期瓦片
  cleanupExpired(maxAge: number): Promise<void>;
  
  // 获取缓存统计
  getCacheStats(): Promise<CacheStats>;
}

// 缓存统计
interface CacheStats {
  totalTiles: number;
  totalSize: number;
  memoryTiles: number;
  diskTiles: number;
  hitRate: number;
  averageAccessCount: number;
}
```

## 数据同步策略

### SQLite 到 DuckDB 同步
```typescript
// 数据同步接口
interface DataSyncService {
  // 同步地图提供商数据
  syncMapProviders(): Promise<void>;
  
  // 同步地图样式数据
  syncMapStyles(): Promise<void>;
  
  // 同步瓦片缓存数据
  syncTileCache(): Promise<void>;
  
  // 同步用户偏好数据
  syncUserPreferences(): Promise<void>;
  
  // 全量同步
  fullSync(): Promise<void>;
  
  // 增量同步
  incrementalSync(lastSyncTime: Date): Promise<void>;
}

// 同步实现
class DataSyncServiceImpl implements DataSyncService {
  private sqliteDb: Database;
  private duckDb: Database;
  
  constructor(sqlitePath: string, duckDbPath: string) {
    this.sqliteDb = new Database(sqlitePath);
    this.duckDb = new Database(duckDbPath);
  }
  
  async syncMapProviders(): Promise<void> {
    const providers = await this.sqliteDb.all('SELECT * FROM map_providers');
    
    // 清空DuckDB表
    await this.duckDb.exec('DELETE FROM map_providers');
    
    // 插入数据
    for (const provider of providers) {
      await this.duckDb.run(
        'INSERT INTO map_providers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        Object.values(provider)
      );
    }
  }
}
```

## 性能优化

### 索引策略
```sql
-- 主要索引
CREATE INDEX idx_map_providers_active ON map_providers(is_active);
CREATE INDEX idx_map_providers_sort ON map_providers(sort_order);
CREATE INDEX idx_map_styles_provider ON map_styles(provider_id);
CREATE INDEX idx_map_styles_type ON map_styles(type);
CREATE INDEX idx_map_styles_active ON map_styles(is_active);
CREATE INDEX idx_tile_cache_provider_style ON tile_cache(provider_id, style_id);
CREATE INDEX idx_tile_cache_coords ON tile_cache(z, x, y);
CREATE INDEX idx_tile_cache_accessed ON tile_cache(accessed_at);
CREATE INDEX idx_offline_cache_style ON offline_map_cache(style_id);
CREATE INDEX idx_usage_stats_provider ON map_usage_stats(provider_id);

-- 复合索引
CREATE INDEX idx_tile_cache_provider_style_coords ON tile_cache(provider_id, style_id, z, x, y);
CREATE INDEX idx_tile_cache_accessed_count ON tile_cache(accessed_at, access_count);
```

### 查询优化
```typescript
// 优化的查询方法
class OptimizedMapQueries {
  private db: Database;
  
  // 获取活跃的地图提供商
  async getActiveProviders(): Promise<MapProvider[]> {
    return await this.db.all(
      'SELECT * FROM map_providers WHERE is_active = 1 ORDER BY sort_order'
    );
  }
  
  // 获取提供商的地图样式
  async getProviderStyles(providerId: string): Promise<MapStyle[]> {
    return await this.db.all(
      'SELECT * FROM map_styles WHERE provider_id = ? AND is_active = 1 ORDER BY sort_order',
      [providerId]
    );
  }
  
  // 获取瓦片缓存
  async getCachedTile(providerId: string, styleId: string, z: number, x: number, y: number): Promise<TileCache | null> {
    return await this.db.get(
      'SELECT * FROM tile_cache WHERE provider_id = ? AND style_id = ? AND z = ? AND x = ? AND y = ?',
      [providerId, styleId, z, x, y]
    );
  }
  
  // 更新瓦片访问统计
  async updateTileAccess(tileId: string): Promise<void> {
    await this.db.run(
      'UPDATE tile_cache SET accessed_at = CURRENT_TIMESTAMP, access_count = access_count + 1 WHERE id = ?',
      [tileId]
    );
  }
}
```

### 缓存管理
```typescript
// 缓存管理策略
class CacheManagementStrategy {
  private db: Database;
  private maxCacheSize = 1024 * 1024 * 1024; // 1GB
  private maxTileAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  // 清理过期缓存
  async cleanupExpiredCache(): Promise<void> {
    const expiredTime = new Date(Date.now() - this.maxTileAge);
    
    await this.db.run(
      'DELETE FROM tile_cache WHERE accessed_at < ?',
      [expiredTime.toISOString()]
    );
  }
  
  // 清理最少使用的缓存
  async cleanupLeastUsedCache(): Promise<void> {
    const currentSize = await this.getCurrentCacheSize();
    
    if (currentSize > this.maxCacheSize) {
      const excessSize = currentSize - this.maxCacheSize;
      await this.removeLeastUsedTiles(excessSize);
    }
  }
  
  // 获取当前缓存大小
  private async getCurrentCacheSize(): Promise<number> {
    const result = await this.db.get('SELECT SUM(file_size) as total_size FROM tile_cache');
    return result?.total_size || 0;
  }
  
  // 移除最少使用的瓦片
  private async removeLeastUsedTiles(targetSize: number): Promise<void> {
    let removedSize = 0;
    
    const tiles = await this.db.all(
      'SELECT id, file_size FROM tile_cache ORDER BY access_count ASC, accessed_at ASC'
    );
    
    for (const tile of tiles) {
      if (removedSize >= targetSize) break;
      
      await this.db.run('DELETE FROM tile_cache WHERE id = ?', [tile.id]);
      removedSize += tile.file_size;
    }
  }
}
```

## 数据迁移

### 版本管理
```typescript
// 数据库版本管理
class DatabaseMigration {
  private db: Database;
  private currentVersion = 1;
  
  // 检查并执行迁移
  async migrate(): Promise<void> {
    const dbVersion = await this.getDatabaseVersion();
    
    if (dbVersion < this.currentVersion) {
      await this.executeMigrations(dbVersion, this.currentVersion);
    }
  }
  
  // 获取数据库版本
  private async getDatabaseVersion(): Promise<number> {
    try {
      const result = await this.db.get('SELECT version FROM schema_version');
      return result?.version || 0;
    } catch {
      return 0;
    }
  }
  
  // 执行迁移
  private async executeMigrations(fromVersion: number, toVersion: number): Promise<void> {
    for (let version = fromVersion + 1; version <= toVersion; version++) {
      await this.executeMigration(version);
    }
  }
  
  // 执行特定版本的迁移
  private async executeMigration(version: number): Promise<void> {
    switch (version) {
      case 1:
        await this.migrationV1();
        break;
      // 添加更多迁移版本
    }
  }
  
  // 版本1迁移
  private async migrationV1(): Promise<void> {
    // 创建schema_version表
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 插入版本记录
    await this.db.run('INSERT INTO schema_version (version) VALUES (1)');
  }
}
```

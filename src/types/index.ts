/**
 * Fit3D 多样化地图样式系统 - 核心类型定义
 * Fit3D Diverse Map Styles System - Core Type Definitions
 */

// 地图提供商接口
export interface MapProvider {
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

// 地图API配置
export interface MapApiConfig {
  baseUrl: string;
  subdomains: string[];
  maxZoom: number;
  minZoom: number;
  tileSize: number;
  cacheStrategy: 'memory' | 'disk' | 'hybrid';
  headers?: Record<string, string>;
}

// 地图样式接口
export interface MapStyle {
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
export interface MapStyleConfig {
  tileServer: TileServerConfig;
  labelLanguage: 'zh-CN' | 'en-US' | 'auto';
  colorScheme: ColorScheme;
  customLayers?: CustomLayer[];
}

// 瓦片服务器配置
export interface TileServerConfig {
  urlTemplate: string;
  subdomains: string[];
  maxZoom: number;
  minZoom: number;
  tileSize: number;
  cacheStrategy: 'memory' | 'disk' | 'hybrid';
  headers?: Record<string, string>;
}

// 颜色方案
export interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  accent?: string;
  text?: string;
}

// 自定义图层
export interface CustomLayer {
  id: string;
  type: 'line' | 'fill' | 'symbol' | 'raster' | 'circle';
  source: string;
  paint: Record<string, any>;
  layout: Record<string, any>;
  visibility: 'visible' | 'none';
}

// 瓦片缓存数据
export interface TileCache {
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
export interface UserMapPreferences {
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
export interface ActivityMapPreference {
  provider: string;
  style: string;
  customConfig?: MapStyleConfig;
}

// 自定义地图样式
export interface CustomMapStyle {
  id: string;
  name: string;
  nameZh: string;
  baseStyleId: string;
  modifications: StyleModification[];
  createdAt: Date;
}

// 样式修改
export interface StyleModification {
  type: 'color' | 'layer' | 'filter' | 'layout';
  target: string;
  value: any;
  description?: string;
}

// 离线地图缓存
export interface OfflineMapCache {
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
export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// 地图使用统计
export interface MapUsageStats {
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

// 缓存统计
export interface CacheStats {
  totalTiles: number;
  totalSize: number;
  memoryTiles: number;
  diskTiles: number;
  hitRate: number;
  averageAccessCount: number;
}

// 地图管理器接口
export interface MapManager {
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
export interface TileCacheManager {
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

// 地理区域
export interface GeoRegion {
  name: string;
  bounds: BoundingBox;
  zoomLevels: number[];
}

// 瓦片信息
export interface TileInfo {
  key: string;
  z: number;
  x: number;
  y: number;
  providerId: string;
  styleId: string;
}

// 瓦片数据
export interface TileData {
  data: Buffer;
  contentType: string;
  fileSize: number;
}

// 地图性能指标
export interface MapPerformanceMetrics {
  averageLoadTime: number;
  cacheHitRate: number;
  errorRate: number;
  throughput: number;
  memoryUsage: number;
  diskUsage: number;
}

// API响应基础接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    messageZh: string;
    details?: any;
  };
  timestamp: string;
}

// 分页响应接口
export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 错误代码枚举
export enum ErrorCode {
  PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND',
  STYLE_NOT_FOUND = 'STYLE_NOT_FOUND',
  TILE_NOT_FOUND = 'TILE_NOT_FOUND',
  INVALID_COORDINATES = 'INVALID_COORDINATES',
  CACHE_ERROR = 'CACHE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// 地图提供商状态
export enum ProviderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error'
}

// 缓存策略
export enum CacheStrategy {
  MEMORY = 'memory',
  DISK = 'disk',
  HYBRID = 'hybrid'
}

// 地图样式类型
export enum MapStyleType {
  TERRAIN = 'terrain',
  SATELLITE = 'satellite',
  STREET = 'street',
  TOPOGRAPHIC = 'topographic',
  HYBRID = 'hybrid',
  CUSTOM = 'custom'
}

// 活动类型
export enum ActivityType {
  HIKING = 'hiking',
  CYCLING = 'cycling',
  RUNNING = 'running',
  MOUNTAIN_BIKING = 'mountain_biking',
  CLIMBING = 'climbing',
  LEISURE = 'leisure'
}

// 语言代码
export enum LanguageCode {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US'
}

// 配置接口
export interface AppConfig {
  database: {
    sqlite: {
      path: string;
    };
    duckdb: {
      path: string;
    };
  };
  cache: {
    strategy: CacheStrategy;
    maxMemoryTiles: number;
    maxDiskSize: number;
    maxTileAge: number;
  };
  providers: {
    maxConcurrent: number;
    timeout: number;
    retries: number;
  };
  server: {
    port: number;
    host: string;
    cors: {
      origin: string[];
      credentials: boolean;
    };
  };
  logging: {
    level: string;
    file: string;
    maxSize: string;
    maxFiles: number;
  };
}

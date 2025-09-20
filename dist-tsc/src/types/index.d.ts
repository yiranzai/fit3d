/**
 * Fit3D 多样化地图样式系统 - 核心类型定义
 * Fit3D Diverse Map Styles System - Core Type Definitions
 */
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
export interface MapApiConfig {
    baseUrl: string;
    subdomains: string[];
    maxZoom: number;
    minZoom: number;
    tileSize: number;
    cacheStrategy: 'memory' | 'disk' | 'hybrid';
    headers?: Record<string, string>;
}
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
export interface MapStyleConfig {
    tileServer: TileServerConfig;
    labelLanguage: 'zh-CN' | 'en-US' | 'auto';
    colorScheme: ColorScheme;
    customLayers?: CustomLayer[];
}
export interface TileServerConfig {
    urlTemplate: string;
    subdomains: string[];
    maxZoom: number;
    minZoom: number;
    tileSize: number;
    cacheStrategy: 'memory' | 'disk' | 'hybrid';
    headers?: Record<string, string>;
}
export interface ColorScheme {
    primary: string;
    secondary: string;
    background: string;
    accent?: string;
    text?: string;
}
export interface CustomLayer {
    id: string;
    type: 'line' | 'fill' | 'symbol' | 'raster' | 'circle';
    source: string;
    paint: Record<string, any>;
    layout: Record<string, any>;
    visibility: 'visible' | 'none';
}
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
export interface ActivityMapPreference {
    provider: string;
    style: string;
    customConfig?: MapStyleConfig;
}
export interface CustomMapStyle {
    id: string;
    name: string;
    nameZh: string;
    baseStyleId: string;
    modifications: StyleModification[];
    createdAt: Date;
}
export interface StyleModification {
    type: 'color' | 'layer' | 'filter' | 'layout';
    target: string;
    value: any;
    description?: string;
}
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
export interface BoundingBox {
    north: number;
    south: number;
    east: number;
    west: number;
}
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
export interface CacheStats {
    totalTiles: number;
    totalSize: number;
    memoryTiles: number;
    diskTiles: number;
    hitRate: number;
    averageAccessCount: number;
}
export interface MapManager {
    getAvailableProviders(): Promise<MapProvider[]>;
    getProviderStyles(providerId: string): Promise<MapStyle[]>;
    switchProvider(providerId: string): Promise<void>;
    switchStyle(styleId: string): Promise<void>;
    createCustomStyle(config: MapStyleConfig): Promise<MapStyle>;
    preloadTiles(bounds: BoundingBox, zoomLevels: number[]): Promise<void>;
    downloadOfflineMap(region: GeoRegion, styleId: string): Promise<string>;
    getTile(providerId: string, styleId: string, z: number, x: number, y: number): Promise<TileCache | null>;
    cacheTile(tile: TileCache): Promise<void>;
    cleanupCache(maxAge?: number): Promise<void>;
}
export interface TileCacheManager {
    getTile(key: string): Promise<TileCache | null>;
    setTile(key: string, tile: TileCache): Promise<void>;
    hasTile(key: string): Promise<boolean>;
    removeTile(key: string): Promise<void>;
    cleanupExpired(maxAge: number): Promise<void>;
    getCacheStats(): Promise<CacheStats>;
}
export interface GeoRegion {
    name: string;
    bounds: BoundingBox;
    zoomLevels: number[];
}
export interface TileInfo {
    key: string;
    z: number;
    x: number;
    y: number;
    providerId: string;
    styleId: string;
}
export interface TileData {
    data: Buffer;
    contentType: string;
    fileSize: number;
}
export interface MapPerformanceMetrics {
    averageLoadTime: number;
    cacheHitRate: number;
    errorRate: number;
    throughput: number;
    memoryUsage: number;
    diskUsage: number;
}
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
export interface PaginatedResponse<T = any> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare enum ErrorCode {
    PROVIDER_NOT_FOUND = "PROVIDER_NOT_FOUND",
    STYLE_NOT_FOUND = "STYLE_NOT_FOUND",
    TILE_NOT_FOUND = "TILE_NOT_FOUND",
    INVALID_COORDINATES = "INVALID_COORDINATES",
    CACHE_ERROR = "CACHE_ERROR",
    DATABASE_ERROR = "DATABASE_ERROR",
    NETWORK_ERROR = "NETWORK_ERROR",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    RATE_LIMITED = "RATE_LIMITED",
    INTERNAL_ERROR = "INTERNAL_ERROR"
}
export declare enum ProviderStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    MAINTENANCE = "maintenance",
    ERROR = "error"
}
export declare enum CacheStrategy {
    MEMORY = "memory",
    DISK = "disk",
    HYBRID = "hybrid"
}
export declare enum MapStyleType {
    TERRAIN = "terrain",
    SATELLITE = "satellite",
    STREET = "street",
    TOPOGRAPHIC = "topographic",
    HYBRID = "hybrid",
    CUSTOM = "custom"
}
export declare enum ActivityType {
    HIKING = "hiking",
    CYCLING = "cycling",
    RUNNING = "running",
    MOUNTAIN_BIKING = "mountain_biking",
    CLIMBING = "climbing",
    LEISURE = "leisure"
}
export declare enum LanguageCode {
    ZH_CN = "zh-CN",
    EN_US = "en-US"
}
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
//# sourceMappingURL=index.d.ts.map
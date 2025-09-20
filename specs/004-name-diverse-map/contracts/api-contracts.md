# API Contracts Specification

## 概述
本文档定义了Fit3D多样化开源地图样式系统的API合约。所有API遵循RESTful原则，支持中英文本地化。

## 基础URL和版本控制
- **基础URL**: `http://localhost:3000/api/v1`
- **内容类型**: `application/json`
- **接受语言**: `en-US` 或 `zh-CN`

## 认证
目前应用程序在本地运行，无需认证。未来版本可能包含用户认证以支持云同步功能。

## 错误响应格式
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    messageZh: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}
```

## 地图提供商管理API

### 获取地图提供商列表
**GET** `/map-providers`

获取所有可用的地图提供商。

**响应:**
```typescript
interface GetMapProvidersResponse {
  providers: MapProvider[];
  total: number;
}

interface MapProvider {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  isOpenSource: boolean;
  termsOfUse?: string;
  dataSource: string;
  apiConfig: MapApiConfig;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface MapApiConfig {
  baseUrl: string;
  subdomains: string[];
  maxZoom: number;
  minZoom: number;
  tileSize: number;
  cacheStrategy: 'memory' | 'disk' | 'hybrid';
  headers?: Record<string, string>;
}
```

**错误代码:**
- `PROVIDERS_NOT_FOUND`: 未找到地图提供商
- `DATABASE_ERROR`: 数据库查询错误

### 获取地图提供商详情
**GET** `/map-providers/{id}`

获取特定地图提供商的详细信息。

**响应:**
```typescript
interface GetMapProviderResponse {
  provider: MapProvider;
  styles: MapStyle[];
  statistics: {
    totalStyles: number;
    totalUsage: number;
    averageRating: number;
    lastUsed?: string;
  };
}
```

### 更新地图提供商配置
**PUT** `/map-providers/{id}`

更新地图提供商配置。

**请求:**
```typescript
interface UpdateMapProviderRequest {
  name?: string;
  nameZh?: string;
  description?: string;
  descriptionZh?: string;
  isActive?: boolean;
  sortOrder?: number;
  apiConfig?: MapApiConfig;
}
```

**响应:**
```typescript
interface UpdateMapProviderResponse {
  provider: MapProvider;
  updated: string[];
}
```

## 地图样式管理API

### 获取地图样式列表
**GET** `/map-styles`

获取所有可用的地图样式。

**查询参数:**
- `providerId`: 按提供商过滤
- `type`: 按样式类型过滤 (terrain, satellite, street, topographic, hybrid, custom)
- `activity`: 按适用活动过滤
- `isActive`: 过滤活跃状态
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20, 最大: 100)

**响应:**
```typescript
interface GetMapStylesResponse {
  styles: MapStyle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    providerId?: string;
    type?: string;
    activity?: string;
    isActive?: boolean;
  };
}

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
  createdAt: string;
  updatedAt: string;
}

interface MapStyleConfig {
  tileServer: TileServerConfig;
  labelLanguage: 'zh-CN' | 'en-US' | 'auto';
  colorScheme: ColorScheme;
  customLayers?: CustomLayer[];
}

interface TileServerConfig {
  urlTemplate: string;
  subdomains: string[];
  maxZoom: number;
  minZoom: number;
  tileSize: number;
  cacheStrategy: 'memory' | 'disk' | 'hybrid';
  headers?: Record<string, string>;
}

interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  accent?: string;
  text?: string;
}

interface CustomLayer {
  id: string;
  type: 'line' | 'fill' | 'symbol' | 'raster' | 'circle';
  source: string;
  paint: Record<string, any>;
  layout: Record<string, any>;
  visibility: 'visible' | 'none';
}
```

### 获取地图样式详情
**GET** `/map-styles/{id}`

获取特定地图样式的详细信息。

**响应:**
```typescript
interface GetMapStyleResponse {
  style: MapStyle;
  provider: MapProvider;
  usage: {
    totalUsage: number;
    lastUsed?: string;
    averageRating: number;
    userCount: number;
  };
  preview: {
    imageUrl: string;
    thumbnailUrl: string;
    sampleCoordinates: {
      lat: number;
      lng: number;
      zoom: number;
    };
  };
}
```

### 创建自定义地图样式
**POST** `/map-styles`

创建用户自定义地图样式。

**请求:**
```typescript
interface CreateMapStyleRequest {
  name: string;
  nameZh: string;
  description?: string;
  descriptionZh?: string;
  baseStyleId: string;
  modifications: StyleModification[];
  suitableActivities: string[];
}

interface StyleModification {
  type: 'color' | 'layer' | 'filter' | 'layout';
  target: string;
  value: any;
  description?: string;
}
```

**响应:**
```typescript
interface CreateMapStyleResponse {
  style: MapStyle;
  previewUrl: string;
}
```

### 更新地图样式
**PUT** `/map-styles/{id}`

更新地图样式配置。

**请求:**
```typescript
interface UpdateMapStyleRequest {
  name?: string;
  nameZh?: string;
  description?: string;
  descriptionZh?: string;
  styleConfig?: MapStyleConfig;
  suitableActivities?: string[];
  isActive?: boolean;
}
```

**响应:**
```typescript
interface UpdateMapStyleResponse {
  style: MapStyle;
  updated: string[];
}
```

### 删除地图样式
**DELETE** `/map-styles/{id}`

删除自定义地图样式。

**响应:**
```typescript
interface DeleteMapStyleResponse {
  success: boolean;
  deletedId: string;
}
```

## 地图可视化API

### 生成地图预览
**POST** `/map-visualization/preview`

生成地图样式的预览图像。

**请求:**
```typescript
interface GenerateMapPreviewRequest {
  styleId: string;
  coordinates: {
    lat: number;
    lng: number;
    zoom: number;
  };
  size: {
    width: number;
    height: number;
  };
  format: 'png' | 'jpeg' | 'webp';
  quality?: number; // 1-100
}
```

**响应:**
```typescript
interface GenerateMapPreviewResponse {
  previewId: string;
  imageUrl: string;
  thumbnailUrl: string;
  generatedAt: string;
  expiresAt: string;
}
```

### 获取地图瓦片
**GET** `/map-tiles/{providerId}/{styleId}/{z}/{x}/{y}`

获取特定地图瓦片。

**路径参数:**
- `providerId`: 地图提供商ID
- `styleId`: 地图样式ID
- `z`: 缩放级别
- `x`: X坐标
- `y`: Y坐标

**查询参数:**
- `format`: 瓦片格式 (png, jpeg, webp)
- `quality`: 图像质量 (1-100)

**响应:**
- 成功: 返回瓦片图像数据
- 失败: 返回错误响应

**错误代码:**
- `TILE_NOT_FOUND`: 瓦片不存在
- `PROVIDER_ERROR`: 地图提供商错误
- `STYLE_NOT_FOUND`: 地图样式不存在
- `INVALID_COORDINATES`: 无效的坐标参数

### 批量获取地图瓦片
**POST** `/map-tiles/batch`

批量获取多个地图瓦片。

**请求:**
```typescript
interface BatchTileRequest {
  tiles: TileRequest[];
  providerId: string;
  styleId: string;
  format?: string;
  quality?: number;
}

interface TileRequest {
  z: number;
  x: number;
  y: number;
}
```

**响应:**
```typescript
interface BatchTileResponse {
  tiles: TileResponse[];
  totalRequested: number;
  totalFound: number;
  totalCached: number;
  totalDownloaded: number;
}

interface TileResponse {
  z: number;
  x: number;
  y: number;
  data?: string; // Base64编码的图像数据
  error?: string;
  source: 'cache' | 'download';
}
```

## 瓦片缓存管理API

### 获取缓存统计
**GET** `/cache/statistics`

获取瓦片缓存的统计信息。

**响应:**
```typescript
interface CacheStatisticsResponse {
  overview: {
    totalTiles: number;
    totalSize: number;
    memoryTiles: number;
    diskTiles: number;
    hitRate: number;
    averageAccessCount: number;
  };
  byProvider: {
    [providerId: string]: {
      tileCount: number;
      totalSize: number;
      hitRate: number;
      averageAccessCount: number;
    };
  };
  byStyle: {
    [styleId: string]: {
      tileCount: number;
      totalSize: number;
      hitRate: number;
      averageAccessCount: number;
    };
  };
  performance: {
    averageLoadTime: number;
    cacheEfficiency: number;
    memoryUsage: number;
    diskUsage: number;
  };
}
```

### 清理缓存
**POST** `/cache/cleanup`

清理瓦片缓存。

**请求:**
```typescript
interface CleanupCacheRequest {
  strategy: 'expired' | 'least-used' | 'size-based' | 'all';
  maxAge?: number; // 毫秒
  maxSize?: number; // 字节
  providerId?: string;
  styleId?: string;
}
```

**响应:**
```typescript
interface CleanupCacheResponse {
  strategy: string;
  tilesRemoved: number;
  sizeFreed: number;
  executionTime: number;
}
```

### 预加载瓦片
**POST** `/cache/preload`

预加载指定区域的瓦片。

**请求:**
```typescript
interface PreloadTilesRequest {
  providerId: string;
  styleId: string;
  bounds: BoundingBox;
  zoomLevels: number[];
  priority: 'low' | 'normal' | 'high';
}

interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}
```

**响应:**
```typescript
interface PreloadTilesResponse {
  preloadId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalTiles: number;
  loadedTiles: number;
  estimatedTime?: number; // 秒
  progress: number; // 0-100
}
```

### 获取预加载状态
**GET** `/cache/preload/{preloadId}/status`

获取预加载任务的状态。

**响应:**
```typescript
interface PreloadStatusResponse {
  preloadId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalTiles: number;
  loadedTiles: number;
  failedTiles: number;
  progress: number;
  estimatedTime?: number;
  startTime: string;
  endTime?: string;
  error?: string;
}
```

## 离线地图管理API

### 下载离线地图
**POST** `/offline-maps/download`

下载指定区域的离线地图。

**请求:**
```typescript
interface DownloadOfflineMapRequest {
  regionName: string;
  styleId: string;
  bounds: BoundingBox;
  zoomLevels: number[];
  quality: 'low' | 'medium' | 'high';
  includeMetadata: boolean;
}
```

**响应:**
```typescript
interface DownloadOfflineMapResponse {
  downloadId: string;
  status: 'queued' | 'downloading' | 'completed' | 'failed';
  estimatedSize: number;
  estimatedTime: number;
  progress: number;
}
```

### 获取离线地图列表
**GET** `/offline-maps`

获取已下载的离线地图列表。

**响应:**
```typescript
interface GetOfflineMapsResponse {
  maps: OfflineMap[];
  total: number;
}

interface OfflineMap {
  id: string;
  regionName: string;
  styleId: string;
  bounds: BoundingBox;
  zoomLevels: number[];
  fileSize: number;
  tileCount: number;
  downloadDate: string;
  lastAccessed: string;
  accessCount: number;
  isActive: boolean;
}
```

### 删除离线地图
**DELETE** `/offline-maps/{id}`

删除指定的离线地图。

**响应:**
```typescript
interface DeleteOfflineMapResponse {
  success: boolean;
  deletedId: string;
  freedSpace: number;
}
```

## 用户偏好设置API

### 获取用户地图偏好
**GET** `/user-preferences/map`

获取用户的地图偏好设置。

**响应:**
```typescript
interface GetUserMapPreferencesResponse {
  preferences: UserMapPreferences;
}

interface UserMapPreferences {
  id: string;
  userId?: string;
  defaultProviderId: string;
  defaultStyleId: string;
  activityPreferences: Record<string, ActivityMapPreference>;
  customStyles: CustomMapStyle[];
  createdAt: string;
  updatedAt: string;
}

interface ActivityMapPreference {
  provider: string;
  style: string;
  customConfig?: MapStyleConfig;
}

interface CustomMapStyle {
  id: string;
  name: string;
  nameZh: string;
  baseStyleId: string;
  modifications: StyleModification[];
  createdAt: string;
}
```

### 更新用户地图偏好
**PUT** `/user-preferences/map`

更新用户的地图偏好设置。

**请求:**
```typescript
interface UpdateUserMapPreferencesRequest {
  defaultProviderId?: string;
  defaultStyleId?: string;
  activityPreferences?: Record<string, ActivityMapPreference>;
  customStyles?: CustomMapStyle[];
}
```

**响应:**
```typescript
interface UpdateUserMapPreferencesResponse {
  preferences: UserMapPreferences;
  updated: string[];
}
```

## 地图使用统计API

### 获取地图使用统计
**GET** `/analytics/map-usage`

获取地图使用统计信息。

**查询参数:**
- `providerId`: 按提供商过滤
- `styleId`: 按样式过滤
- `startDate`: 开始日期 (ISO 8601)
- `endDate`: 结束日期 (ISO 8601)
- `groupBy`: 分组方式 (day, week, month)

**响应:**
```typescript
interface MapUsageAnalyticsResponse {
  summary: {
    totalUsage: number;
    totalTilesLoaded: number;
    totalDataTransferred: number;
    averageLoadTime: number;
    mostUsedProvider: string;
    mostUsedStyle: string;
  };
  byProvider: {
    [providerId: string]: {
      usage: number;
      tilesLoaded: number;
      dataTransferred: number;
      averageLoadTime: number;
    };
  };
  byStyle: {
    [styleId: string]: {
      usage: number;
      tilesLoaded: number;
      dataTransferred: number;
      averageLoadTime: number;
    };
  };
  timeSeries: {
    period: string;
    usage: number;
    tilesLoaded: number;
    dataTransferred: number;
  }[];
}
```

### 获取性能分析
**GET** `/analytics/performance`

获取地图性能分析数据。

**查询参数:**
- `providerId`: 按提供商过滤
- `styleId`: 按样式过滤
- `period`: 分析周期 (day, week, month)

**响应:**
```typescript
interface PerformanceAnalyticsResponse {
  overview: {
    averageLoadTime: number;
    cacheHitRate: number;
    errorRate: number;
    throughput: number;
  };
  trends: {
    date: string;
    loadTime: number;
    cacheHitRate: number;
    errorRate: number;
    throughput: number;
  }[];
  byProvider: {
    [providerId: string]: {
      averageLoadTime: number;
      cacheHitRate: number;
      errorRate: number;
      reliability: number;
    };
  };
  recommendations: {
    type: 'performance' | 'cache' | 'provider';
    message: string;
    messageZh: string;
    priority: 'low' | 'medium' | 'high';
  }[];
}
```

## WebSocket 事件

### 实时更新
**WebSocket URL**: `ws://localhost:3000/ws`

**事件:**
```typescript
// 地图瓦片加载进度更新
interface TileLoadProgressEvent {
  type: 'tile.load.progress';
  data: {
    providerId: string;
    styleId: string;
    loaded: number;
    total: number;
    progress: number;
  };
}

// 离线地图下载进度
interface OfflineMapDownloadEvent {
  type: 'offline.download.progress';
  data: {
    downloadId: string;
    regionName: string;
    progress: number;
    status: 'downloading' | 'completed' | 'failed';
    loadedTiles: number;
    totalTiles: number;
  };
}

// 缓存清理完成
interface CacheCleanupEvent {
  type: 'cache.cleanup.completed';
  data: {
    strategy: string;
    tilesRemoved: number;
    sizeFreed: number;
    executionTime: number;
  };
}

// 系统通知
interface MapNotificationEvent {
  type: 'notification';
  data: {
    level: 'info' | 'warning' | 'error';
    message: string;
    messageZh: string;
    timestamp: string;
    category: 'map' | 'cache' | 'offline' | 'performance';
  };
}
```

## 速率限制
- **瓦片请求**: 每分钟1000次请求
- **地图预览生成**: 每分钟10次请求
- **离线地图下载**: 每分钟1次请求
- **一般API**: 每分钟200次请求

## 响应代码
- **200**: 成功
- **201**: 已创建
- **400**: 请求错误
- **404**: 未找到
- **409**: 冲突
- **422**: 无法处理的实体
- **429**: 请求过多
- **500**: 内部服务器错误

## 本地化支持
所有API响应都包含中英文文本（如适用）。`Accept-Language` 头部确定主要语言，如果中文不可用则回退到英文。

## 示例用法

### 获取地图提供商列表
```bash
curl -X GET "http://localhost:3000/api/v1/map-providers" \
  -H "Accept-Language: zh-CN" \
  -H "Content-Type: application/json"
```

### 创建自定义地图样式
```bash
curl -X POST "http://localhost:3000/api/v1/map-styles" \
  -H "Accept-Language: zh-CN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom Style",
    "nameZh": "我的自定义样式",
    "baseStyleId": "osm-standard",
    "modifications": [
      {
        "type": "color",
        "target": "water",
        "value": "#0066cc",
        "description": "Change water color to blue"
      }
    ],
    "suitableActivities": ["hiking", "cycling"]
  }'
```

### 预加载瓦片
```bash
curl -X POST "http://localhost:3000/api/v1/cache/preload" \
  -H "Accept-Language: zh-CN" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "osm",
    "styleId": "osm-standard",
    "bounds": {
      "north": 39.9,
      "south": 39.8,
      "east": 116.5,
      "west": 116.4
    },
    "zoomLevels": [10, 11, 12, 13],
    "priority": "normal"
  }'
```

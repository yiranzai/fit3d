/**
 * 中国地图提供商集成
 * Chinese Map Providers Integration
 */

export interface ChineseMapProvider {
  id: string;
  name: string;
  nameEn: string;
  url: string;
  attribution: string;
  maxZoom: number;
  minZoom: number;
  subdomains?: string[];
  requiresApiKey: boolean;
  apiKeyPlaceholder?: string;
}

export const CHINESE_MAP_PROVIDERS: Record<string, ChineseMapProvider> = {
  amap: {
    id: 'amap',
    name: '高德地图',
    nameEn: 'Amap',
    url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    attribution: '© 高德地图',
    maxZoom: 18,
    minZoom: 3,
    subdomains: ['1', '2', '3', '4'],
    requiresApiKey: false
  },
  amap_satellite: {
    id: 'amap_satellite',
    name: '高德卫星图',
    nameEn: 'Amap Satellite',
    url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    attribution: '© 高德地图',
    maxZoom: 18,
    minZoom: 3,
    subdomains: ['1', '2', '3', '4'],
    requiresApiKey: false
  },
  baidu: {
    id: 'baidu',
    name: '百度地图',
    nameEn: 'Baidu Map',
    url: 'https://maponline{s}.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20200101',
    attribution: '© 百度地图',
    maxZoom: 18,
    minZoom: 3,
    subdomains: ['0', '1', '2', '3'],
    requiresApiKey: false
  },
  baidu_satellite: {
    id: 'baidu_satellite',
    name: '百度卫星图',
    nameEn: 'Baidu Satellite',
    url: 'https://maponline{s}.bdimg.com/starpic/?qt=satepc&u=x={x};y={y};z={z};v=009;type=sate&fm=46&udt=20200101',
    attribution: '© 百度地图',
    maxZoom: 18,
    minZoom: 3,
    subdomains: ['0', '1', '2', '3'],
    requiresApiKey: false
  },
  tianditu: {
    id: 'tianditu',
    name: '天地图',
    nameEn: 'Tianditu',
    url: 'https://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk={apiKey}',
    attribution: '© 天地图',
    maxZoom: 18,
    minZoom: 1,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    requiresApiKey: true,
    apiKeyPlaceholder: '请输入天地图API密钥'
  },
  tianditu_satellite: {
    id: 'tianditu_satellite',
    name: '天地图卫星图',
    nameEn: 'Tianditu Satellite',
    url: 'https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk={apiKey}',
    attribution: '© 天地图',
    maxZoom: 18,
    minZoom: 1,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    requiresApiKey: true,
    apiKeyPlaceholder: '请输入天地图API密钥'
  }
};

/**
 * 获取中国地图提供商列表
 */
export function getChineseMapProviders(): ChineseMapProvider[] {
  return Object.values(CHINESE_MAP_PROVIDERS);
}

/**
 * 根据ID获取中国地图提供商
 */
export function getChineseMapProvider(id: string): ChineseMapProvider | undefined {
  return CHINESE_MAP_PROVIDERS[id];
}

/**
 * 验证API密钥
 */
export function validateApiKey(providerId: string, apiKey: string): boolean {
  const provider = getChineseMapProvider(providerId);
  if (!provider || !provider.requiresApiKey) {
    return true;
  }
  
  // 简单的API密钥验证
  return Boolean(apiKey && apiKey.length > 10);
}

/**
 * 生成地图瓦片URL
 */
export function generateTileUrl(provider: ChineseMapProvider, x: number, y: number, z: number, apiKey?: string): string {
  let url = provider.url;
  
  // 替换坐标参数
  url = url.replace('{x}', x.toString());
  url = url.replace('{y}', y.toString());
  url = url.replace('{z}', z.toString());
  
  // 替换子域名
  if (provider.subdomains) {
    const subdomain = provider.subdomains[Math.abs(x + y) % provider.subdomains.length];
    url = url.replace('{s}', subdomain);
  }
  
  // 替换API密钥
  if (provider.requiresApiKey && apiKey) {
    url = url.replace('{apiKey}', apiKey);
  }
  
  return url;
}

/**
 * 中国地图提供商管理器
 */
export class ChineseMapProviderManager {
  private apiKeys: Map<string, string> = new Map();
  
  /**
   * 设置API密钥
   */
  setApiKey(providerId: string, apiKey: string): void {
    if (validateApiKey(providerId, apiKey)) {
      this.apiKeys.set(providerId, apiKey);
    } else {
      throw new Error(`无效的API密钥: ${providerId}`);
    }
  }
  
  /**
   * 获取API密钥
   */
  getApiKey(providerId: string): string | undefined {
    return this.apiKeys.get(providerId);
  }
  
  /**
   * 检查提供商是否可用
   */
  isProviderAvailable(providerId: string): boolean {
    const provider = getChineseMapProvider(providerId);
    if (!provider) {
      return false;
    }
    
    if (provider.requiresApiKey) {
      return this.apiKeys.has(providerId);
    }
    
    return true;
  }
  
  /**
   * 获取可用的提供商列表
   */
  getAvailableProviders(): ChineseMapProvider[] {
    return getChineseMapProviders().filter(provider => this.isProviderAvailable(provider.id));
  }
}

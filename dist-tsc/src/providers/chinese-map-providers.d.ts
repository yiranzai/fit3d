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
export declare const CHINESE_MAP_PROVIDERS: Record<string, ChineseMapProvider>;
/**
 * 获取中国地图提供商列表
 */
export declare function getChineseMapProviders(): ChineseMapProvider[];
/**
 * 根据ID获取中国地图提供商
 */
export declare function getChineseMapProvider(id: string): ChineseMapProvider | undefined;
/**
 * 验证API密钥
 */
export declare function validateApiKey(providerId: string, apiKey: string): boolean;
/**
 * 生成地图瓦片URL
 */
export declare function generateTileUrl(provider: ChineseMapProvider, x: number, y: number, z: number, apiKey?: string): string;
/**
 * 中国地图提供商管理器
 */
export declare class ChineseMapProviderManager {
    private apiKeys;
    /**
     * 设置API密钥
     */
    setApiKey(providerId: string, apiKey: string): void;
    /**
     * 获取API密钥
     */
    getApiKey(providerId: string): string | undefined;
    /**
     * 检查提供商是否可用
     */
    isProviderAvailable(providerId: string): boolean;
    /**
     * 获取可用的提供商列表
     */
    getAvailableProviders(): ChineseMapProvider[];
}
//# sourceMappingURL=chinese-map-providers.d.ts.map
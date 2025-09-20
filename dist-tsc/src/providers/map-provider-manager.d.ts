/**
 * 地图提供商管理器
 * Map Provider Manager
 */
import { MapProvider, MapStyle, ProviderStatus } from '../types/index.js';
import { SQLiteDatabase } from '../core/database/sqlite-database.js';
import { EventEmitter } from 'events';
export interface ProviderHealthCheck {
    providerId: string;
    status: ProviderStatus;
    responseTime: number;
    lastChecked: Date;
    errorMessage?: string;
}
export interface ProviderPerformanceStats {
    providerId: string;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastUsed: Date;
    uptime: number;
}
export declare class MapProviderManager extends EventEmitter {
    private db;
    private providers;
    private healthChecks;
    private performanceStats;
    private currentProvider;
    private healthCheckInterval;
    constructor(db: SQLiteDatabase);
    /**
     * 初始化地图提供商管理器
     * Initialize map provider manager
     */
    initialize(): Promise<void>;
    /**
     * 加载所有地图提供商
     * Load all map providers
     */
    private loadProviders;
    /**
     * 获取所有可用的地图提供商
     * Get all available map providers
     */
    getAvailableProviders(): Promise<MapProvider[]>;
    /**
     * 获取特定地图提供商
     * Get specific map provider
     */
    getProvider(providerId: string): Promise<MapProvider | null>;
    /**
     * 获取提供商的地图样式
     * Get provider's map styles
     */
    getProviderStyles(providerId: string): Promise<MapStyle[]>;
    /**
     * 切换地图提供商
     * Switch map provider
     */
    switchProvider(providerId: string): Promise<void>;
    /**
     * 获取当前地图提供商
     * Get current map provider
     */
    getCurrentProvider(): MapProvider | null;
    /**
     * 添加新的地图提供商
     * Add new map provider
     */
    addProvider(provider: Omit<MapProvider, 'createdAt' | 'updatedAt'>): Promise<MapProvider>;
    /**
     * 更新地图提供商配置
     * Update map provider configuration
     */
    updateProvider(providerId: string, updates: Partial<MapProvider>): Promise<MapProvider>;
    /**
     * 删除地图提供商
     * Delete map provider
     */
    deleteProvider(providerId: string): Promise<void>;
    /**
     * 启用/禁用地图提供商
     * Enable/disable map provider
     */
    setProviderStatus(providerId: string, isActive: boolean): Promise<void>;
    /**
     * 获取提供商健康状态
     * Get provider health status
     */
    getProviderHealth(providerId: string): ProviderHealthCheck | null;
    /**
     * 获取所有提供商健康状态
     * Get all providers health status
     */
    getAllProvidersHealth(): ProviderHealthCheck[];
    /**
     * 获取提供商性能统计
     * Get provider performance statistics
     */
    getProviderPerformance(providerId: string): ProviderPerformanceStats | null;
    /**
     * 获取所有提供商性能统计
     * Get all providers performance statistics
     */
    getAllProvidersPerformance(): ProviderPerformanceStats[];
    /**
     * 测试提供商连接
     * Test provider connection
     */
    testProviderConnection(providerId: string): Promise<boolean>;
    /**
     * 开始健康监控
     * Start health monitoring
     */
    private startHealthMonitoring;
    /**
     * 执行健康检查
     * Perform health checks
     */
    private performHealthChecks;
    /**
     * 更新使用统计
     * Update usage statistics
     */
    private updateUsageStats;
    /**
     * 记录请求统计
     * Record request statistics
     */
    recordRequest(providerId: string, success: boolean, responseTime: number): void;
    /**
     * 构建瓦片URL
     * Build tile URL
     */
    private buildTileUrl;
    /**
     * 验证提供商配置
     * Validate provider configuration
     */
    private validateProviderConfig;
    /**
     * 停止健康监控
     * Stop health monitoring
     */
    stopHealthMonitoring(): void;
    /**
     * 清理资源
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=map-provider-manager.d.ts.map
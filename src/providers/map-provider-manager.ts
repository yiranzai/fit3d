/**
 * 地图提供商管理器
 * Map Provider Manager
 */

import { MapProvider, MapStyle, ProviderStatus, ErrorCode } from '../types/index.js';
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
  uptime: number; // 百分比
}

export class MapProviderManager extends EventEmitter {
  private db: SQLiteDatabase;
  private providers: Map<string, MapProvider> = new Map();
  private healthChecks: Map<string, ProviderHealthCheck> = new Map();
  private performanceStats: Map<string, ProviderPerformanceStats> = new Map();
  private currentProvider: string | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(db: SQLiteDatabase) {
    super();
    this.db = db;
  }

  /**
   * 初始化地图提供商管理器
   * Initialize map provider manager
   */
  async initialize(): Promise<void> {
    await this.loadProviders();
    await this.startHealthMonitoring();
    this.emit('initialized');
  }

  /**
   * 加载所有地图提供商
   * Load all map providers
   */
  private async loadProviders(): Promise<void> {
    try {
      const providers = await this.db.getActiveProviders();
      
      for (const provider of providers) {
        this.providers.set(provider.id, provider);
        
        // 初始化性能统计
        this.performanceStats.set(provider.id, {
          providerId: provider.id,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          lastUsed: new Date(),
          uptime: 100
        });

        // 初始化健康检查
        this.healthChecks.set(provider.id, {
          providerId: provider.id,
          status: ProviderStatus.ACTIVE,
          responseTime: 0,
          lastChecked: new Date()
        });
      }

      // 设置默认提供商
      if (providers.length > 0 && !this.currentProvider) {
        this.currentProvider = providers[0]?.id || '';
      }

      this.emit('providersLoaded', providers);
    } catch (error) {
      this.emit('error', { code: ErrorCode.DATABASE_ERROR, message: 'Failed to load providers', error });
      throw error;
    }
  }

  /**
   * 获取所有可用的地图提供商
   * Get all available map providers
   */
  async getAvailableProviders(): Promise<MapProvider[]> {
    return Array.from(this.providers.values()).filter(provider => provider.isActive);
  }

  /**
   * 获取特定地图提供商
   * Get specific map provider
   */
  async getProvider(providerId: string): Promise<MapProvider | null> {
    const provider = this.providers.get(providerId);
    if (!provider || !provider.isActive) {
      return null;
    }
    return provider;
  }

  /**
   * 获取提供商的地图样式
   * Get provider's map styles
   */
  async getProviderStyles(providerId: string): Promise<MapStyle[]> {
    const provider = await this.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found or inactive`);
    }

    try {
      return await this.db.getProviderStyles(providerId);
    } catch (error) {
      this.emit('error', { code: ErrorCode.DATABASE_ERROR, message: 'Failed to get provider styles', error });
      throw error;
    }
  }

  /**
   * 切换地图提供商
   * Switch map provider
   */
  async switchProvider(providerId: string): Promise<void> {
    const provider = await this.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found or inactive`);
    }

    const previousProvider = this.currentProvider;
    this.currentProvider = providerId;

    // 更新使用统计
    await this.updateUsageStats(providerId);

    this.emit('providerSwitched', { 
      from: previousProvider, 
      to: providerId, 
      provider 
    });
  }

  /**
   * 获取当前地图提供商
   * Get current map provider
   */
  getCurrentProvider(): MapProvider | null {
    if (!this.currentProvider) {
      return null;
    }
    return this.providers.get(this.currentProvider) || null;
  }

  /**
   * 添加新的地图提供商
   * Add new map provider
   */
  async addProvider(provider: Omit<MapProvider, 'createdAt' | 'updatedAt'>): Promise<MapProvider> {
    try {
      // 验证提供商配置
      this.validateProviderConfig(provider);

      const newProvider: MapProvider = {
        ...provider,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 保存到数据库
      await this.db.run(`
        INSERT INTO map_providers (
          id, name, name_zh, description, description_zh, is_open_source,
          terms_of_use, data_source, api_config, is_active, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        newProvider.id, newProvider.name, newProvider.nameZh, newProvider.description,
        newProvider.descriptionZh, newProvider.isOpenSource, newProvider.termsOfUse,
        newProvider.dataSource, JSON.stringify(newProvider.apiConfig), newProvider.isActive,
        newProvider.sortOrder
      ]);

      // 添加到内存缓存
      this.providers.set(newProvider.id, newProvider);

      // 初始化统计
      this.performanceStats.set(newProvider.id, {
        providerId: newProvider.id,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        lastUsed: new Date(),
        uptime: 100
      });

      this.healthChecks.set(newProvider.id, {
        providerId: newProvider.id,
        status: ProviderStatus.ACTIVE,
        responseTime: 0,
        lastChecked: new Date()
      });

      this.emit('providerAdded', newProvider);
      return newProvider;
    } catch (error) {
      this.emit('error', { code: ErrorCode.DATABASE_ERROR, message: 'Failed to add provider', error });
      throw error;
    }
  }

  /**
   * 更新地图提供商配置
   * Update map provider configuration
   */
  async updateProvider(providerId: string, updates: Partial<MapProvider>): Promise<MapProvider> {
    const existingProvider = this.providers.get(providerId);
    if (!existingProvider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    try {
      const updatedProvider: MapProvider = {
        ...existingProvider,
        ...updates,
        updatedAt: new Date()
      };

      // 更新数据库
      await this.db.run(`
        UPDATE map_providers SET
          name = ?, name_zh = ?, description = ?, description_zh = ?,
          is_open_source = ?, terms_of_use = ?, data_source = ?,
          api_config = ?, is_active = ?, sort_order = ?, updated_at = ?
        WHERE id = ?
      `, [
        updatedProvider.name, updatedProvider.nameZh, updatedProvider.description,
        updatedProvider.descriptionZh, updatedProvider.isOpenSource, updatedProvider.termsOfUse,
        updatedProvider.dataSource, JSON.stringify(updatedProvider.apiConfig),
        updatedProvider.isActive, updatedProvider.sortOrder, updatedProvider.updatedAt.toISOString(),
        providerId
      ]);

      // 更新内存缓存
      this.providers.set(providerId, updatedProvider);

      this.emit('providerUpdated', updatedProvider);
      return updatedProvider;
    } catch (error) {
      this.emit('error', { code: ErrorCode.DATABASE_ERROR, message: 'Failed to update provider', error });
      throw error;
    }
  }

  /**
   * 删除地图提供商
   * Delete map provider
   */
  async deleteProvider(providerId: string): Promise<void> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    try {
      // 从数据库删除
      await this.db.run('DELETE FROM map_providers WHERE id = ?', [providerId]);

      // 从内存缓存删除
      this.providers.delete(providerId);
      this.performanceStats.delete(providerId);
      this.healthChecks.delete(providerId);

      // 如果删除的是当前提供商，切换到第一个可用的提供商
      if (this.currentProvider === providerId) {
        const availableProviders = await this.getAvailableProviders();
        this.currentProvider = availableProviders.length > 0 ? (availableProviders[0]?.id || null) : null;
      }

      this.emit('providerDeleted', providerId);
    } catch (error) {
      this.emit('error', { code: ErrorCode.DATABASE_ERROR, message: 'Failed to delete provider', error });
      throw error;
    }
  }

  /**
   * 启用/禁用地图提供商
   * Enable/disable map provider
   */
  async setProviderStatus(providerId: string, isActive: boolean): Promise<void> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    await this.updateProvider(providerId, { isActive });
  }

  /**
   * 获取提供商健康状态
   * Get provider health status
   */
  getProviderHealth(providerId: string): ProviderHealthCheck | null {
    return this.healthChecks.get(providerId) || null;
  }

  /**
   * 获取所有提供商健康状态
   * Get all providers health status
   */
  getAllProvidersHealth(): ProviderHealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  /**
   * 获取提供商性能统计
   * Get provider performance statistics
   */
  getProviderPerformance(providerId: string): ProviderPerformanceStats | null {
    return this.performanceStats.get(providerId) || null;
  }

  /**
   * 获取所有提供商性能统计
   * Get all providers performance statistics
   */
  getAllProvidersPerformance(): ProviderPerformanceStats[] {
    return Array.from(this.performanceStats.values());
  }

  /**
   * 测试提供商连接
   * Test provider connection
   */
  async testProviderConnection(providerId: string): Promise<boolean> {
    const provider = await this.getProvider(providerId);
    if (!provider) {
      return false;
    }

    try {
      const startTime = Date.now();
      
      // 测试瓦片请求
      const testUrl = this.buildTileUrl(provider, 0, 0, 0);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(testUrl, { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;

      // 更新健康检查状态
      const healthCheck: ProviderHealthCheck = {
        providerId,
        status: isHealthy ? ProviderStatus.ACTIVE : ProviderStatus.ERROR,
        responseTime,
        lastChecked: new Date(),
        errorMessage: isHealthy ? '' : `HTTP ${response.status}`
      };
      this.healthChecks.set(providerId, healthCheck);

      return isHealthy;
    } catch (error) {
      // 更新健康检查状态
      const errorHealthCheck: ProviderHealthCheck = {
        providerId,
        status: ProviderStatus.ERROR,
        responseTime: 0,
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
      this.healthChecks.set(providerId, errorHealthCheck);

      return false;
    }
  }

  /**
   * 开始健康监控
   * Start health monitoring
   */
  private async startHealthMonitoring(): Promise<void> {
    // 每5分钟检查一次提供商健康状态
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, 5 * 60 * 1000);

    // 立即执行一次健康检查
    await this.performHealthChecks();
  }

  /**
   * 执行健康检查
   * Perform health checks
   */
  private async performHealthChecks(): Promise<void> {
    const providers = await this.getAvailableProviders();
    
    for (const provider of providers) {
      try {
        await this.testProviderConnection(provider.id);
      } catch (error) {
        this.emit('healthCheckError', { providerId: provider.id, error });
      }
    }

    this.emit('healthChecksCompleted');
  }

  /**
   * 更新使用统计
   * Update usage statistics
   */
  private async updateUsageStats(providerId: string): Promise<void> {
    const stats = this.performanceStats.get(providerId);
    if (stats) {
      stats.lastUsed = new Date();
      this.performanceStats.set(providerId, stats);
    }
  }

  /**
   * 记录请求统计
   * Record request statistics
   */
  recordRequest(providerId: string, success: boolean, responseTime: number): void {
    const stats = this.performanceStats.get(providerId);
    if (stats) {
      stats.totalRequests++;
      if (success) {
        stats.successfulRequests++;
      } else {
        stats.failedRequests++;
      }
      
      // 更新平均响应时间
      stats.averageResponseTime = (stats.averageResponseTime * (stats.totalRequests - 1) + responseTime) / stats.totalRequests;
      
      // 更新正常运行时间
      stats.uptime = (stats.successfulRequests / stats.totalRequests) * 100;
      
      this.performanceStats.set(providerId, stats);
    }
  }

  /**
   * 构建瓦片URL
   * Build tile URL
   */
  private buildTileUrl(provider: MapProvider, z: number, x: number, y: number): string {
    const config = provider.apiConfig;
    let url = config.baseUrl || '';
    
    // 替换URL模板中的占位符
    url = url.replace('{z}', z.toString());
    url = url.replace('{x}', x.toString());
    url = url.replace('{y}', y.toString());
    
    // 替换子域名
    if (config.subdomains.length > 0) {
      const subdomain = config.subdomains[Math.floor(Math.random() * config.subdomains.length)];
      url = url.replace('{s}', subdomain || '');
    }
    
    return url;
  }

  /**
   * 验证提供商配置
   * Validate provider configuration
   */
  private validateProviderConfig(provider: Omit<MapProvider, 'createdAt' | 'updatedAt'>): void {
    if (!provider.id || !provider.name || !provider.nameZh) {
      throw new Error('Provider ID, name, and Chinese name are required');
    }

    if (!provider.apiConfig.baseUrl) {
      throw new Error('Provider API base URL is required');
    }

    if (provider.apiConfig.maxZoom < provider.apiConfig.minZoom) {
      throw new Error('Max zoom must be greater than or equal to min zoom');
    }

    if (provider.apiConfig.tileSize <= 0) {
      throw new Error('Tile size must be positive');
    }
  }

  /**
   * 停止健康监控
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * 清理资源
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.stopHealthMonitoring();
    this.removeAllListeners();
  }
}

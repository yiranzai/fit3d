/**
 * 地图样式引擎
 * Map Style Engine
 */

import { MapStyle, MapStyleConfig, StyleModification, MapStyleType, ActivityType } from '@/types';
import { SQLiteDatabase } from '@/core/database/sqlite-database';
import { EventEmitter } from 'events';

export interface StylePreview {
  styleId: string;
  imageUrl: string;
  thumbnailUrl: string;
  sampleCoordinates: {
    lat: number;
    lng: number;
    zoom: number;
  };
}

export interface CustomStyleCreationOptions {
  name: string;
  nameZh: string;
  description?: string;
  descriptionZh?: string;
  baseStyleId: string;
  modifications: StyleModification[];
  suitableActivities: string[];
}

export class MapStyleEngine extends EventEmitter {
  private db: SQLiteDatabase;
  private styles: Map<string, MapStyle> = new Map();
  private currentStyle: string | null = null;
  private styleCache: Map<string, MapStyleConfig> = new Map();

  constructor(db: SQLiteDatabase) {
    super();
    this.db = db;
  }

  /**
   * 初始化地图样式引擎
   * Initialize map style engine
   */
  async initialize(): Promise<void> {
    await this.loadStyles();
    this.emit('initialized');
  }

  /**
   * 加载所有地图样式
   * Load all map styles
   */
  private async loadStyles(): Promise<void> {
    try {
      const providers = await this.db.getActiveProviders();
      
      for (const provider of providers) {
        const styles = await this.db.getProviderStyles(provider.id);
        
        for (const style of styles) {
          this.styles.set(style.id, style);
          this.styleCache.set(style.id, style.styleConfig);
        }
      }

      // 设置默认样式
      if (this.styles.size > 0 && !this.currentStyle) {
        const defaultStyle = Array.from(this.styles.values()).find(style => style.isDefault);
        this.currentStyle = defaultStyle ? defaultStyle.id : Array.from(this.styles.keys())[0];
      }

      this.emit('stylesLoaded', Array.from(this.styles.values()));
    } catch (error) {
      this.emit('error', { message: 'Failed to load styles', error });
      throw error;
    }
  }

  /**
   * 获取所有可用的地图样式
   * Get all available map styles
   */
  async getAvailableStyles(): Promise<MapStyle[]> {
    return Array.from(this.styles.values()).filter(style => style.isActive);
  }

  /**
   * 获取特定地图样式
   * Get specific map style
   */
  async getStyle(styleId: string): Promise<MapStyle | null> {
    return this.styles.get(styleId) || null;
  }

  /**
   * 获取当前地图样式
   * Get current map style
   */
  getCurrentStyle(): MapStyle | null {
    if (!this.currentStyle) {
      return null;
    }
    return this.styles.get(this.currentStyle) || null;
  }

  /**
   * 切换地图样式
   * Switch map style
   */
  async switchStyle(styleId: string): Promise<void> {
    const style = await this.getStyle(styleId);
    if (!style) {
      throw new Error(`Style ${styleId} not found or inactive`);
    }

    const previousStyle = this.currentStyle;
    this.currentStyle = styleId;

    this.emit('styleSwitched', { 
      from: previousStyle, 
      to: styleId, 
      style 
    });
  }

  /**
   * 按类型获取地图样式
   * Get map styles by type
   */
  async getStylesByType(type: MapStyleType): Promise<MapStyle[]> {
    return Array.from(this.styles.values()).filter(style => 
      style.isActive && style.type === type
    );
  }

  /**
   * 按活动类型获取推荐样式
   * Get recommended styles by activity type
   */
  async getRecommendedStyles(activityType: ActivityType): Promise<MapStyle[]> {
    return Array.from(this.styles.values()).filter(style => 
      style.isActive && style.suitableActivities.includes(activityType)
    );
  }

  /**
   * 创建自定义地图样式
   * Create custom map style
   */
  async createCustomStyle(options: CustomStyleCreationOptions): Promise<MapStyle> {
    try {
      // 验证基础样式
      const baseStyle = await this.getStyle(options.baseStyleId);
      if (!baseStyle) {
        throw new Error(`Base style ${options.baseStyleId} not found`);
      }

      // 生成自定义样式ID
      const customStyleId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 应用修改到基础样式配置
      const customConfig = this.applyModifications(baseStyle.styleConfig, options.modifications);

      // 创建自定义样式对象
      const customStyle: MapStyle = {
        id: customStyleId,
        providerId: baseStyle.providerId,
        name: options.name,
        nameZh: options.nameZh,
        description: options.description,
        descriptionZh: options.descriptionZh,
        type: MapStyleType.CUSTOM,
        suitableActivities: options.suitableActivities,
        styleConfig: customConfig,
        isDefault: false,
        isActive: true,
        sortOrder: 1000, // 自定义样式排在最后
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 保存到数据库
      await this.db.run(`
        INSERT INTO map_styles (
          id, provider_id, name, name_zh, description, description_zh,
          type, suitable_activities, style_config, is_default, is_active, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        customStyle.id, customStyle.providerId, customStyle.name, customStyle.nameZh,
        customStyle.description, customStyle.descriptionZh, customStyle.type,
        JSON.stringify(customStyle.suitableActivities), JSON.stringify(customStyle.styleConfig),
        customStyle.isDefault, customStyle.isActive, customStyle.sortOrder
      ]);

      // 添加到内存缓存
      this.styles.set(customStyle.id, customStyle);
      this.styleCache.set(customStyle.id, customStyle.styleConfig);

      this.emit('customStyleCreated', customStyle);
      return customStyle;
    } catch (error) {
      this.emit('error', { message: 'Failed to create custom style', error });
      throw error;
    }
  }

  /**
   * 更新地图样式
   * Update map style
   */
  async updateStyle(styleId: string, updates: Partial<MapStyle>): Promise<MapStyle> {
    const existingStyle = this.styles.get(styleId);
    if (!existingStyle) {
      throw new Error(`Style ${styleId} not found`);
    }

    try {
      const updatedStyle: MapStyle = {
        ...existingStyle,
        ...updates,
        updatedAt: new Date()
      };

      // 更新数据库
      await this.db.run(`
        UPDATE map_styles SET
          name = ?, name_zh = ?, description = ?, description_zh = ?,
          type = ?, suitable_activities = ?, style_config = ?,
          is_default = ?, is_active = ?, sort_order = ?, updated_at = ?
        WHERE id = ?
      `, [
        updatedStyle.name, updatedStyle.nameZh, updatedStyle.description,
        updatedStyle.descriptionZh, updatedStyle.type, JSON.stringify(updatedStyle.suitableActivities),
        JSON.stringify(updatedStyle.styleConfig), updatedStyle.isDefault,
        updatedStyle.isActive, updatedStyle.sortOrder, updatedStyle.updatedAt.toISOString(),
        styleId
      ]);

      // 更新内存缓存
      this.styles.set(styleId, updatedStyle);
      this.styleCache.set(styleId, updatedStyle.styleConfig);

      this.emit('styleUpdated', updatedStyle);
      return updatedStyle;
    } catch (error) {
      this.emit('error', { message: 'Failed to update style', error });
      throw error;
    }
  }

  /**
   * 删除自定义地图样式
   * Delete custom map style
   */
  async deleteStyle(styleId: string): Promise<void> {
    const style = this.styles.get(styleId);
    if (!style) {
      throw new Error(`Style ${styleId} not found`);
    }

    // 不允许删除非自定义样式
    if (style.type !== MapStyleType.CUSTOM) {
      throw new Error('Only custom styles can be deleted');
    }

    try {
      // 从数据库删除
      await this.db.run('DELETE FROM map_styles WHERE id = ?', [styleId]);

      // 从内存缓存删除
      this.styles.delete(styleId);
      this.styleCache.delete(styleId);

      // 如果删除的是当前样式，切换到默认样式
      if (this.currentStyle === styleId) {
        const defaultStyle = Array.from(this.styles.values()).find(s => s.isDefault);
        this.currentStyle = defaultStyle ? defaultStyle.id : Array.from(this.styles.keys())[0];
      }

      this.emit('styleDeleted', styleId);
    } catch (error) {
      this.emit('error', { message: 'Failed to delete style', error });
      throw error;
    }
  }

  /**
   * 生成样式预览
   * Generate style preview
   */
  async generateStylePreview(styleId: string, coordinates: { lat: number; lng: number; zoom: number }): Promise<StylePreview> {
    const style = await this.getStyle(styleId);
    if (!style) {
      throw new Error(`Style ${styleId} not found`);
    }

    try {
      // 这里应该调用实际的预览生成服务
      // 目前返回模拟数据
      const preview: StylePreview = {
        styleId,
        imageUrl: `/api/preview/${styleId}?lat=${coordinates.lat}&lng=${coordinates.lng}&zoom=${coordinates.zoom}`,
        thumbnailUrl: `/api/preview/${styleId}/thumbnail?lat=${coordinates.lat}&lng=${coordinates.lng}&zoom=${coordinates.zoom}`,
        sampleCoordinates: coordinates
      };

      this.emit('previewGenerated', preview);
      return preview;
    } catch (error) {
      this.emit('error', { message: 'Failed to generate preview', error });
      throw error;
    }
  }

  /**
   * 获取样式配置
   * Get style configuration
   */
  getStyleConfig(styleId: string): MapStyleConfig | null {
    return this.styleCache.get(styleId) || null;
  }

  /**
   * 应用样式修改
   * Apply style modifications
   */
  private applyModifications(baseConfig: MapStyleConfig, modifications: StyleModification[]): MapStyleConfig {
    let config = JSON.parse(JSON.stringify(baseConfig)); // 深拷贝

    for (const modification of modifications) {
      config = this.applyModification(config, modification);
    }

    return config;
  }

  /**
   * 应用单个样式修改
   * Apply single style modification
   */
  private applyModification(config: MapStyleConfig, modification: StyleModification): MapStyleConfig {
    switch (modification.type) {
      case 'color':
        return this.applyColorModification(config, modification);
      case 'layer':
        return this.applyLayerModification(config, modification);
      case 'filter':
        return this.applyFilterModification(config, modification);
      case 'layout':
        return this.applyLayoutModification(config, modification);
      default:
        throw new Error(`Unknown modification type: ${modification.type}`);
    }
  }

  /**
   * 应用颜色修改
   * Apply color modification
   */
  private applyColorModification(config: MapStyleConfig, modification: StyleModification): MapStyleConfig {
    if (modification.target === 'water') {
      config.colorScheme.primary = modification.value;
    } else if (modification.target === 'land') {
      config.colorScheme.secondary = modification.value;
    } else if (modification.target === 'background') {
      config.colorScheme.background = modification.value;
    }
    return config;
  }

  /**
   * 应用图层修改
   * Apply layer modification
   */
  private applyLayerModification(config: MapStyleConfig, modification: StyleModification): MapStyleConfig {
    if (!config.customLayers) {
      config.customLayers = [];
    }

    const existingLayerIndex = config.customLayers.findIndex(layer => layer.id === modification.target);
    
    if (existingLayerIndex >= 0) {
      // 更新现有图层
      config.customLayers[existingLayerIndex] = {
        ...config.customLayers[existingLayerIndex],
        ...modification.value
      };
    } else {
      // 添加新图层
      config.customLayers.push({
        id: modification.target,
        type: 'line',
        source: 'default',
        paint: {},
        layout: {},
        visibility: 'visible',
        ...modification.value
      });
    }

    return config;
  }

  /**
   * 应用过滤器修改
   * Apply filter modification
   */
  private applyFilterModification(config: MapStyleConfig, modification: StyleModification): MapStyleConfig {
    // 这里可以实现过滤器逻辑
    // 目前只是简单返回配置
    return config;
  }

  /**
   * 应用布局修改
   * Apply layout modification
   */
  private applyLayoutModification(config: MapStyleConfig, modification: StyleModification): MapStyleConfig {
    // 这里可以实现布局逻辑
    // 目前只是简单返回配置
    return config;
  }

  /**
   * 验证样式配置
   * Validate style configuration
   */
  private validateStyleConfig(config: MapStyleConfig): void {
    if (!config.tileServer || !config.tileServer.urlTemplate) {
      throw new Error('Tile server configuration is required');
    }

    if (!config.colorScheme || !config.colorScheme.primary) {
      throw new Error('Color scheme configuration is required');
    }

    if (config.tileServer.maxZoom < config.tileServer.minZoom) {
      throw new Error('Max zoom must be greater than or equal to min zoom');
    }
  }

  /**
   * 获取样式统计信息
   * Get style statistics
   */
  async getStyleStatistics(): Promise<any> {
    const styles = await this.getAvailableStyles();
    
    const stats = {
      total: styles.length,
      byType: {} as Record<string, number>,
      byProvider: {} as Record<string, number>,
      custom: 0,
      default: 0
    };

    for (const style of styles) {
      // 按类型统计
      stats.byType[style.type] = (stats.byType[style.type] || 0) + 1;
      
      // 按提供商统计
      stats.byProvider[style.providerId] = (stats.byProvider[style.providerId] || 0) + 1;
      
      // 自定义样式统计
      if (style.type === MapStyleType.CUSTOM) {
        stats.custom++;
      }
      
      // 默认样式统计
      if (style.isDefault) {
        stats.default++;
      }
    }

    return stats;
  }

  /**
   * 清理资源
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.styles.clear();
    this.styleCache.clear();
    this.removeAllListeners();
  }
}

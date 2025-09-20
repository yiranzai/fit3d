/**
 * 地图样式引擎
 * Map Style Engine
 */
import { MapStyle, MapStyleConfig, StyleModification, MapStyleType, ActivityType } from '../types/index.js';
import { SQLiteDatabase } from '../core/database/sqlite-database.js';
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
export declare class MapStyleEngine extends EventEmitter {
    private db;
    private styles;
    private currentStyle;
    private styleCache;
    constructor(db: SQLiteDatabase);
    /**
     * 初始化地图样式引擎
     * Initialize map style engine
     */
    initialize(): Promise<void>;
    /**
     * 加载所有地图样式
     * Load all map styles
     */
    private loadStyles;
    /**
     * 获取所有可用的地图样式
     * Get all available map styles
     */
    getAvailableStyles(): Promise<MapStyle[]>;
    /**
     * 获取特定地图样式
     * Get specific map style
     */
    getStyle(styleId: string): Promise<MapStyle | null>;
    /**
     * 获取当前地图样式
     * Get current map style
     */
    getCurrentStyle(): MapStyle | null;
    /**
     * 切换地图样式
     * Switch map style
     */
    switchStyle(styleId: string): Promise<void>;
    /**
     * 按类型获取地图样式
     * Get map styles by type
     */
    getStylesByType(type: MapStyleType): Promise<MapStyle[]>;
    /**
     * 按活动类型获取推荐样式
     * Get recommended styles by activity type
     */
    getRecommendedStyles(activityType: ActivityType): Promise<MapStyle[]>;
    /**
     * 创建自定义地图样式
     * Create custom map style
     */
    createCustomStyle(options: CustomStyleCreationOptions): Promise<MapStyle>;
    /**
     * 更新地图样式
     * Update map style
     */
    updateStyle(styleId: string, updates: Partial<MapStyle>): Promise<MapStyle>;
    /**
     * 删除自定义地图样式
     * Delete custom map style
     */
    deleteStyle(styleId: string): Promise<void>;
    /**
     * 生成样式预览
     * Generate style preview
     */
    generateStylePreview(styleId: string, coordinates: {
        lat: number;
        lng: number;
        zoom: number;
    }): Promise<StylePreview>;
    /**
     * 获取样式配置
     * Get style configuration
     */
    getStyleConfig(styleId: string): MapStyleConfig | null;
    /**
     * 应用样式修改
     * Apply style modifications
     */
    private applyModifications;
    /**
     * 应用单个样式修改
     * Apply single style modification
     */
    private applyModification;
    /**
     * 应用颜色修改
     * Apply color modification
     */
    private applyColorModification;
    /**
     * 应用图层修改
     * Apply layer modification
     */
    private applyLayerModification;
    /**
     * 应用过滤器修改
     * Apply filter modification
     */
    private applyFilterModification;
    /**
     * 应用布局修改
     * Apply layout modification
     */
    private applyLayoutModification;
    /**
     * 验证样式配置
     * Validate style configuration
     */
    /**
     * 获取样式统计信息
     * Get style statistics
     */
    getStyleStatistics(): Promise<any>;
    /**
     * 清理资源
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=map-style-engine.d.ts.map
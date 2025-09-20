/**
 * 地图可视化引擎
 * Map Visualization Engine
 */
import { BoundingBox, ActivityType } from '../types/index.js';
import { MapProviderManager } from '../providers/map-provider-manager.js';
import { MapStyleEngine } from '../styles/map-style-engine.js';
import { TileCacheSystem } from '../cache/tile-cache-system.js';
import { EventEmitter } from 'events';
export interface MapViewport {
    center: {
        lat: number;
        lng: number;
    };
    zoom: number;
    bounds?: BoundingBox;
}
export interface MapInteraction {
    type: 'click' | 'drag' | 'zoom' | 'pan';
    coordinates?: {
        lat: number;
        lng: number;
    };
    zoom?: number;
    bounds?: BoundingBox;
}
export interface ActivityTrack {
    id: string;
    name: string;
    activityType: ActivityType;
    coordinates: Array<{
        lat: number;
        lng: number;
        elevation?: number;
        timestamp?: Date;
    }>;
    style?: {
        color: string;
        weight: number;
        opacity: number;
    };
}
export interface MapRenderOptions {
    width: number;
    height: number;
    format: 'png' | 'jpeg' | 'webp';
    quality?: number;
    includeTracks?: boolean;
    includeMarkers?: boolean;
    watermark?: boolean;
}
export interface MapRenderResult {
    imageData: Buffer;
    format: string;
    size: {
        width: number;
        height: number;
    };
    metadata: {
        provider: string;
        style: string;
        center: {
            lat: number;
            lng: number;
        };
        zoom: number;
        renderedAt: Date;
    };
}
export declare class MapVisualizationEngine extends EventEmitter {
    private providerManager;
    private styleEngine;
    private cacheSystem;
    private currentViewport;
    private activityTracks;
    private isRendering;
    constructor(providerManager: MapProviderManager, styleEngine: MapStyleEngine, cacheSystem: TileCacheSystem);
    /**
     * 初始化地图可视化引擎
     * Initialize map visualization engine
     */
    initialize(): Promise<void>;
    /**
     * 设置地图视口
     * Set map viewport
     */
    setViewport(viewport: MapViewport): void;
    /**
     * 获取当前视口
     * Get current viewport
     */
    getCurrentViewport(): MapViewport;
    /**
     * 添加活动轨迹
     * Add activity track
     */
    addActivityTrack(track: ActivityTrack): void;
    /**
     * 移除活动轨迹
     * Remove activity track
     */
    removeActivityTrack(trackId: string): void;
    /**
     * 获取所有活动轨迹
     * Get all activity tracks
     */
    getActivityTracks(): ActivityTrack[];
    /**
     * 清除所有活动轨迹
     * Clear all activity tracks
     */
    clearActivityTracks(): void;
    /**
     * 渲染地图
     * Render map
     */
    renderMap(options: MapRenderOptions): Promise<MapRenderResult>;
    /**
     * 生成地图预览
     * Generate map preview
     */
    generatePreview(styleId: string, coordinates: {
        lat: number;
        lng: number;
        zoom: number;
    }, size?: {
        width: number;
        height: number;
    }): Promise<Buffer>;
    /**
     * 处理地图交互
     * Handle map interaction
     */
    handleInteraction(interaction: MapInteraction): void;
    /**
     * 获取地图统计信息
     * Get map statistics
     */
    getMapStatistics(): Promise<any>;
    /**
     * 预加载视口瓦片
     * Preload viewport tiles
     */
    private preloadViewportTiles;
    /**
     * 渲染地图图像
     * Render map image
     */
    private renderMapImage;
    /**
     * 绘制地图瓦片
     * Draw map tiles
     */
    private drawMapTiles;
    /**
     * 绘制活动轨迹
     * Draw activity tracks
     */
    private drawActivityTracks;
    /**
     * 绘制标记
     * Draw markers
     */
    private drawMarkers;
    /**
     * 绘制水印
     * Draw watermark
     */
    private drawWatermark;
    /**
     * 处理提供商切换
     * Handle provider switch
     */
    private handleProviderSwitch;
    /**
     * 处理样式切换
     * Handle style switch
     */
    private handleStyleSwitch;
    /**
     * 处理地图点击
     * Handle map click
     */
    private handleMapClick;
    /**
     * 处理地图拖拽
     * Handle map drag
     */
    private handleMapDrag;
    /**
     * 处理地图缩放
     * Handle map zoom
     */
    private handleMapZoom;
    /**
     * 处理地图平移
     * Handle map pan
     */
    private handleMapPan;
    /**
     * 计算视口边界
     * Calculate viewport bounds
     */
    private calculateViewportBounds;
    /**
     * 获取最优缩放级别
     * Get optimal zoom levels
     */
    private getOptimalZoomLevels;
    /**
     * 计算可见瓦片
     * Calculate visible tiles
     */
    private calculateVisibleTiles;
    /**
     * 经纬度转屏幕坐标
     * Convert lat/lng to screen coordinates
     */
    private latLngToScreen;
    /**
     * 获取默认轨迹颜色
     * Get default track color
     */
    private getDefaultTrackColor;
    /**
     * 计算总距离
     * Calculate total distance
     */
    private calculateTotalDistance;
    /**
     * 计算两点间距离
     * Calculate distance between two points
     */
    private calculateDistance;
    /**
     * 获取活动类型
     * Get activity types
     */
    private getActivityTypes;
    /**
     * 创建画布
     * Create canvas
     */
    private createCanvas;
    /**
     * 从缓冲区加载图像
     * Load image from buffer
     */
    private loadImageFromBuffer;
    /**
     * 绘制错误瓦片
     * Draw error tile
     */
    private drawErrorTile;
    /**
     * 绘制标记
     * Draw marker
     */
    private drawMarker;
    /**
     * 画布转缓冲区
     * Convert canvas to buffer
     */
    private canvasToBuffer;
    /**
     * 清理资源
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=map-visualization-engine.d.ts.map
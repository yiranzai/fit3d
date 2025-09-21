/**
 * 地图渲染器
 * Map Renderer
 */
import { TrajectoryData, TrajectoryStyle, MapBounds } from './trajectory-generator.js';
import { ActivityType } from '../types/index.js';
export interface MapRenderOptions {
    width: number;
    height: number;
    style: 'terrain' | 'satellite' | 'street' | 'topographic';
    showTrajectory: boolean;
    showElevation: boolean;
    showSpeed: boolean;
    showHeartRate: boolean;
    showPower: boolean;
    showCadence: boolean;
    backgroundColor?: string;
    trajectoryStyle?: TrajectoryStyle;
}
export interface MapRenderResult {
    success: boolean;
    imagePath?: string;
    error?: string;
    bounds: MapBounds;
    center: {
        lat: number;
        lng: number;
    };
    zoom: number;
    trajectoryStats: {
        totalDistance: number;
        totalElevationGain: number;
        totalElevationLoss: number;
        maxElevation: number;
        minElevation: number;
        maxSpeed: number;
        avgSpeed: number;
        maxHeartRate: number;
        avgHeartRate: number;
        maxPower: number;
        avgPower: number;
        maxCadence: number;
        avgCadence: number;
        duration: number;
    };
}
export declare class MapRenderer {
    /**
     * 渲染地图轨迹
     * Render map trajectory
     */
    static renderTrajectory(trajectoryData: TrajectoryData, options: MapRenderOptions): Promise<MapRenderResult>;
    /**
     * 生成地图瓦片URL
     * Generate map tile URLs
     */
    private static generateTileUrls;
    /**
     * 获取瓦片URL
     * Get tile URL
     */
    private static getTileUrl;
    /**
     * 经度转瓦片X坐标
     * Convert longitude to tile X coordinate
     */
    private static lngToTileX;
    /**
     * 纬度转瓦片Y坐标
     * Convert latitude to tile Y coordinate
     */
    private static latToTileY;
    /**
     * 模拟地图渲染过程
     * Simulate map rendering process
     */
    private static simulateMapRendering;
    /**
     * 延迟函数
     * Delay function
     */
    private static delay;
    /**
     * 扩展边界以添加边距
     * Expand bounds to add margin
     */
    private static expandBounds;
    /**
     * 计算边界中心点
     * Calculate bounds center point
     */
    private static getBoundsCenter;
    /**
     * 计算合适的缩放级别
     * Calculate appropriate zoom level
     */
    private static calculateZoomLevel;
    /**
     * 获取活动类型的默认样式
     * Get default style for activity type
     */
    static getDefaultStyle(activityType: ActivityType): TrajectoryStyle;
}
//# sourceMappingURL=map-renderer.d.ts.map
/**
 * 轨迹生成器
 * Trajectory Generator
 */
import { FITRecord } from '../parsers/fit-parser.js';
import { GPXTrackPoint } from '../parsers/gpx-parser.js';
import { ActivityType } from '../types/index.js';
export interface TrajectoryPoint {
    lat: number;
    lng: number;
    elevation?: number | undefined;
    timestamp?: Date | undefined;
    heartRate?: number | undefined;
    speed?: number | undefined;
    cadence?: number | undefined;
    power?: number | undefined;
}
export interface TrajectoryStyle {
    color: string;
    weight: number;
    opacity: number;
    dashArray?: string;
}
export interface TrajectoryOptions {
    activityType: ActivityType;
    style?: TrajectoryStyle;
    showElevation?: boolean;
    showSpeed?: boolean;
    showHeartRate?: boolean;
    showPower?: boolean;
    showCadence?: boolean;
}
export interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}
export interface TrajectoryData {
    points: TrajectoryPoint[];
    bounds: MapBounds;
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
    startTime?: Date | undefined;
    endTime?: Date | undefined;
    duration: number;
}
export declare class TrajectoryGenerator {
    /**
     * 从FIT记录生成轨迹数据
     * Generate trajectory data from FIT records
     */
    static generateFromFITRecords(records: FITRecord[], options: TrajectoryOptions): TrajectoryData;
    /**
     * 从GPX轨迹点生成轨迹数据
     * Generate trajectory data from GPX track points
     */
    static generateFromGPXPoints(points: GPXTrackPoint[], options: TrajectoryOptions): TrajectoryData;
    /**
     * 获取默认轨迹样式
     * Get default trajectory style
     */
    static getDefaultStyle(activityType: ActivityType): TrajectoryStyle;
    /**
     * 计算两点间距离（Haversine公式）
     * Calculate distance between two points using Haversine formula
     */
    private static calculateDistance;
    /**
     * 角度转弧度
     * Convert degrees to radians
     */
    private static toRadians;
    /**
     * 扩展边界以添加边距
     * Expand bounds to add margin
     */
    static expandBounds(bounds: MapBounds, marginPercent?: number): MapBounds;
    /**
     * 计算边界中心点
     * Calculate bounds center point
     */
    static getBoundsCenter(bounds: MapBounds): {
        lat: number;
        lng: number;
    };
    /**
     * 计算合适的缩放级别
     * Calculate appropriate zoom level
     */
    static calculateZoomLevel(bounds: MapBounds, mapSize: {
        width: number;
        height: number;
    }): number;
}
//# sourceMappingURL=trajectory-generator.d.ts.map
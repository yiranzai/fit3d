/**
 * 轨迹生成器
 * Trajectory Generator
 */
import { ActivityType } from '../types/index.js';
export class TrajectoryGenerator {
    /**
     * 从FIT记录生成轨迹数据
     * Generate trajectory data from FIT records
     */
    static generateFromFITRecords(records, options) {
        const points = [];
        let bounds = null;
        let totalDistance = 0;
        let totalElevationGain = 0;
        let totalElevationLoss = 0;
        let maxElevation = -Infinity;
        let minElevation = Infinity;
        let maxSpeed = 0;
        let totalSpeed = 0;
        let speedCount = 0;
        let maxHeartRate = 0;
        let totalHeartRate = 0;
        let heartRateCount = 0;
        let maxPower = 0;
        let totalPower = 0;
        let powerCount = 0;
        let maxCadence = 0;
        let totalCadence = 0;
        let cadenceCount = 0;
        let startTime;
        let endTime;
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            if (record.position_lat && record.position_long) {
                const point = {
                    lat: record.position_lat,
                    lng: record.position_long,
                    elevation: record.altitude,
                    timestamp: record.timestamp,
                    heartRate: record.heart_rate,
                    speed: record.speed,
                    cadence: record.cadence,
                    power: record.power,
                };
                points.push(point);
                // 更新边界
                if (!bounds) {
                    bounds = {
                        north: point.lat,
                        south: point.lat,
                        east: point.lng,
                        west: point.lng,
                    };
                }
                else {
                    bounds.north = Math.max(bounds.north, point.lat);
                    bounds.south = Math.min(bounds.south, point.lat);
                    bounds.east = Math.max(bounds.east, point.lng);
                    bounds.west = Math.min(bounds.west, point.lng);
                }
                // 更新高程统计
                if (point.elevation !== undefined) {
                    maxElevation = Math.max(maxElevation, point.elevation);
                    minElevation = Math.min(minElevation, point.elevation);
                    if (i > 0 && points[i - 1]?.elevation !== undefined) {
                        const elevationDiff = point.elevation - (points[i - 1]?.elevation || 0);
                        if (elevationDiff > 0) {
                            totalElevationGain += elevationDiff;
                        }
                        else {
                            totalElevationLoss += Math.abs(elevationDiff);
                        }
                    }
                }
                // 更新速度统计
                if (point.speed !== undefined) {
                    maxSpeed = Math.max(maxSpeed, point.speed);
                    totalSpeed += point.speed;
                    speedCount++;
                }
                // 更新心率统计
                if (point.heartRate !== undefined) {
                    maxHeartRate = Math.max(maxHeartRate, point.heartRate);
                    totalHeartRate += point.heartRate;
                    heartRateCount++;
                }
                // 更新功率统计
                if (point.power !== undefined) {
                    maxPower = Math.max(maxPower, point.power);
                    totalPower += point.power;
                    powerCount++;
                }
                // 更新踏频统计
                if (point.cadence !== undefined) {
                    maxCadence = Math.max(maxCadence, point.cadence);
                    totalCadence += point.cadence;
                    cadenceCount++;
                }
                // 更新时间范围
                if (!startTime || (point.timestamp && point.timestamp < startTime)) {
                    startTime = point.timestamp;
                }
                if (!endTime || (point.timestamp && point.timestamp > endTime)) {
                    endTime = point.timestamp;
                }
            }
        }
        // 计算总距离
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const distance = this.calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
            totalDistance += distance;
        }
        const duration = startTime && endTime ? endTime.getTime() - startTime.getTime() : 0;
        return {
            points,
            bounds: bounds || { north: 0, south: 0, east: 0, west: 0 },
            totalDistance,
            totalElevationGain,
            totalElevationLoss,
            maxElevation: maxElevation === -Infinity ? 0 : maxElevation,
            minElevation: minElevation === Infinity ? 0 : minElevation,
            maxSpeed,
            avgSpeed: speedCount > 0 ? totalSpeed / speedCount : 0,
            maxHeartRate,
            avgHeartRate: heartRateCount > 0 ? totalHeartRate / heartRateCount : 0,
            maxPower,
            avgPower: powerCount > 0 ? totalPower / powerCount : 0,
            maxCadence,
            avgCadence: cadenceCount > 0 ? totalCadence / cadenceCount : 0,
            startTime,
            endTime,
            duration,
        };
    }
    /**
     * 从GPX轨迹点生成轨迹数据
     * Generate trajectory data from GPX track points
     */
    static generateFromGPXPoints(points, options) {
        const trajectoryPoints = [];
        let bounds = null;
        let totalDistance = 0;
        let totalElevationGain = 0;
        let totalElevationLoss = 0;
        let maxElevation = -Infinity;
        let minElevation = Infinity;
        let startTime;
        let endTime;
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const trajectoryPoint = {
                lat: point.lat,
                lng: point.lon,
                elevation: point.ele,
                timestamp: point.time,
            };
            trajectoryPoints.push(trajectoryPoint);
            // 更新边界
            if (!bounds) {
                bounds = {
                    north: point.lat,
                    south: point.lat,
                    east: point.lon,
                    west: point.lon,
                };
            }
            else {
                bounds.north = Math.max(bounds.north, point.lat);
                bounds.south = Math.min(bounds.south, point.lat);
                bounds.east = Math.max(bounds.east, point.lon);
                bounds.west = Math.min(bounds.west, point.lon);
            }
            // 更新高程统计
            if (point.ele !== undefined) {
                maxElevation = Math.max(maxElevation, point.ele);
                minElevation = Math.min(minElevation, point.ele);
                if (i > 0 && points[i - 1]?.ele !== undefined) {
                    const elevationDiff = point.ele - (points[i - 1]?.ele || 0);
                    if (elevationDiff > 0) {
                        totalElevationGain += elevationDiff;
                    }
                    else {
                        totalElevationLoss += Math.abs(elevationDiff);
                    }
                }
            }
            // 更新时间范围
            if (point.time) {
                if (!startTime || point.time < startTime) {
                    startTime = point.time;
                }
                if (!endTime || point.time > endTime) {
                    endTime = point.time;
                }
            }
        }
        // 计算总距离
        for (let i = 1; i < trajectoryPoints.length; i++) {
            const prev = trajectoryPoints[i - 1];
            const curr = trajectoryPoints[i];
            const distance = this.calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
            totalDistance += distance;
        }
        const duration = startTime && endTime ? endTime.getTime() - startTime.getTime() : 0;
        return {
            points: trajectoryPoints,
            bounds: bounds || { north: 0, south: 0, east: 0, west: 0 },
            totalDistance,
            totalElevationGain,
            totalElevationLoss,
            maxElevation: maxElevation === -Infinity ? 0 : maxElevation,
            minElevation: minElevation === Infinity ? 0 : minElevation,
            maxSpeed: 0, // GPX通常不包含速度数据
            avgSpeed: 0,
            maxHeartRate: 0, // GPX通常不包含心率数据
            avgHeartRate: 0,
            maxPower: 0, // GPX通常不包含功率数据
            avgPower: 0,
            maxCadence: 0, // GPX通常不包含踏频数据
            avgCadence: 0,
            startTime,
            endTime,
            duration,
        };
    }
    /**
     * 获取默认轨迹样式
     * Get default trajectory style
     */
    static getDefaultStyle(activityType) {
        switch (activityType) {
            case ActivityType.HIKING:
                return {
                    color: '#2E8B57', // 海绿色
                    weight: 4,
                    opacity: 0.8,
                };
            case ActivityType.CYCLING:
                return {
                    color: '#FF6B35', // 橙红色
                    weight: 5,
                    opacity: 0.9,
                };
            default:
                return {
                    color: '#4169E1', // 皇家蓝
                    weight: 3,
                    opacity: 0.7,
                };
        }
    }
    /**
     * 计算两点间距离（Haversine公式）
     * Calculate distance between two points using Haversine formula
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // 地球半径（公里）
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    /**
     * 角度转弧度
     * Convert degrees to radians
     */
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    /**
     * 扩展边界以添加边距
     * Expand bounds to add margin
     */
    static expandBounds(bounds, marginPercent = 0.1) {
        const latMargin = (bounds.north - bounds.south) * marginPercent;
        const lngMargin = (bounds.east - bounds.west) * marginPercent;
        return {
            north: bounds.north + latMargin,
            south: bounds.south - latMargin,
            east: bounds.east + lngMargin,
            west: bounds.west - lngMargin,
        };
    }
    /**
     * 计算边界中心点
     * Calculate bounds center point
     */
    static getBoundsCenter(bounds) {
        return {
            lat: (bounds.north + bounds.south) / 2,
            lng: (bounds.east + bounds.west) / 2,
        };
    }
    /**
     * 计算合适的缩放级别
     * Calculate appropriate zoom level
     */
    static calculateZoomLevel(bounds, mapSize) {
        const latDiff = bounds.north - bounds.south;
        const lngDiff = bounds.east - bounds.west;
        // 简化的缩放级别计算
        const maxDiff = Math.max(latDiff, lngDiff);
        if (maxDiff > 10)
            return 5;
        if (maxDiff > 5)
            return 6;
        if (maxDiff > 2)
            return 7;
        if (maxDiff > 1)
            return 8;
        if (maxDiff > 0.5)
            return 9;
        if (maxDiff > 0.2)
            return 10;
        if (maxDiff > 0.1)
            return 11;
        if (maxDiff > 0.05)
            return 12;
        if (maxDiff > 0.02)
            return 13;
        if (maxDiff > 0.01)
            return 14;
        if (maxDiff > 0.005)
            return 15;
        return 16;
    }
}
//# sourceMappingURL=trajectory-generator.js.map
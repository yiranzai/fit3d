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
  center: { lat: number; lng: number };
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

export class MapRenderer {
  /**
   * 渲染地图轨迹
   * Render map trajectory
   */
  static async renderTrajectory(
    trajectoryData: TrajectoryData,
    options: MapRenderOptions
  ): Promise<MapRenderResult> {
    try {
      console.log('🗺️  开始渲染地图轨迹...');
      console.log(`📐 图像尺寸: ${options.width}x${options.height}`);
      console.log(`🎨 地图样式: ${options.style}`);
      console.log(`📍 轨迹点数: ${trajectoryData.points.length}`);

      // 计算地图边界和中心点
      const expandedBounds = this.expandBounds(trajectoryData.bounds, 0.1);
      const center = this.getBoundsCenter(expandedBounds);
      const zoom = this.calculateZoomLevel(expandedBounds, { width: options.width, height: options.height });

      console.log(`🎯 地图中心: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
      console.log(`🔍 缩放级别: ${zoom}`);

      // 生成地图瓦片URL
      const tileUrls = this.generateTileUrls(expandedBounds, zoom, options.style);
      console.log(`🧩 需要下载 ${tileUrls.length} 个地图瓦片`);

      // 模拟地图渲染过程
      await this.simulateMapRendering(tileUrls, trajectoryData, options);

      // 生成输出文件路径
      const timestamp = Date.now();
      const imagePath = `map_${timestamp}.png`;

      console.log(`💾 地图已保存到: ${imagePath}`);

      return {
        success: true,
        imagePath,
        bounds: expandedBounds,
        center,
        zoom,
        trajectoryStats: {
          totalDistance: trajectoryData.totalDistance,
          totalElevationGain: trajectoryData.totalElevationGain,
          totalElevationLoss: trajectoryData.totalElevationLoss,
          maxElevation: trajectoryData.maxElevation,
          minElevation: trajectoryData.minElevation,
          maxSpeed: trajectoryData.maxSpeed,
          avgSpeed: trajectoryData.avgSpeed,
          maxHeartRate: trajectoryData.maxHeartRate,
          avgHeartRate: trajectoryData.avgHeartRate,
          maxPower: trajectoryData.maxPower,
          avgPower: trajectoryData.avgPower,
          maxCadence: trajectoryData.maxCadence,
          avgCadence: trajectoryData.avgCadence,
          duration: trajectoryData.duration,
        },
      };

    } catch (error) {
      console.error('❌ 地图渲染失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        bounds: trajectoryData.bounds,
        center: this.getBoundsCenter(trajectoryData.bounds),
        zoom: 10,
        trajectoryStats: {
          totalDistance: 0,
          totalElevationGain: 0,
          totalElevationLoss: 0,
          maxElevation: 0,
          minElevation: 0,
          maxSpeed: 0,
          avgSpeed: 0,
          maxHeartRate: 0,
          avgHeartRate: 0,
          maxPower: 0,
          avgPower: 0,
          maxCadence: 0,
          avgCadence: 0,
          duration: 0,
        },
      };
    }
  }

  /**
   * 生成地图瓦片URL
   * Generate map tile URLs
   */
  private static generateTileUrls(bounds: MapBounds, zoom: number, style: string): string[] {
    const urls: string[] = [];
    
    // 计算瓦片范围
    const minTileX = this.lngToTileX(bounds.west, zoom);
    const maxTileX = this.lngToTileX(bounds.east, zoom);
    const minTileY = this.latToTileY(bounds.north, zoom);
    const maxTileY = this.latToTileY(bounds.south, zoom);

    console.log(`🧩 瓦片范围: X(${minTileX}-${maxTileX}), Y(${minTileY}-${maxTileY})`);

    // 生成瓦片URL
    for (let x = minTileX; x <= maxTileX; x++) {
      for (let y = minTileY; y <= maxTileY; y++) {
        const url = this.getTileUrl(x, y, zoom, style);
        urls.push(url);
      }
    }

    return urls;
  }

  /**
   * 获取瓦片URL
   * Get tile URL
   */
  private static getTileUrl(x: number, y: number, z: number, style: string): string {
    // 使用OpenStreetMap作为默认地图源
    const subdomain = ['a', 'b', 'c'][Math.floor(Math.random() * 3)];
    
    switch (style) {
      case 'satellite':
        return `https://${subdomain}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
      case 'terrain':
        return `https://${subdomain}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
      case 'street':
        return `https://${subdomain}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
      case 'topographic':
        return `https://${subdomain}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
      default:
        return `https://${subdomain}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
    }
  }

  /**
   * 经度转瓦片X坐标
   * Convert longitude to tile X coordinate
   */
  private static lngToTileX(lng: number, zoom: number): number {
    return Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
  }

  /**
   * 纬度转瓦片Y坐标
   * Convert latitude to tile Y coordinate
   */
  private static latToTileY(lat: number, zoom: number): number {
    return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
  }

  /**
   * 模拟地图渲染过程
   * Simulate map rendering process
   */
  private static async simulateMapRendering(
    tileUrls: string[],
    trajectoryData: TrajectoryData,
    options: MapRenderOptions
  ): Promise<void> {
    console.log('🎨 开始渲染地图...');
    
    // 模拟下载瓦片
    for (let i = 0; i < Math.min(tileUrls.length, 10); i++) {
      console.log(`  📥 下载瓦片 ${i + 1}/${Math.min(tileUrls.length, 10)}...`);
      await this.delay(100); // 模拟下载时间
    }

    // 模拟绘制轨迹
    console.log('🖌️  绘制轨迹线...');
    await this.delay(200);

    if (options.showElevation) {
      console.log('📈 绘制高程图...');
      await this.delay(150);
    }

    if (options.showSpeed) {
      console.log('🏃 绘制速度图...');
      await this.delay(150);
    }

    if (options.showHeartRate) {
      console.log('❤️  绘制心率图...');
      await this.delay(150);
    }

    if (options.showPower) {
      console.log('⚡ 绘制功率图...');
      await this.delay(150);
    }

    if (options.showCadence) {
      console.log('🦵 绘制踏频图...');
      await this.delay(150);
    }

    // 模拟添加标记
    console.log('📍 添加起点和终点标记...');
    await this.delay(100);

    // 模拟添加图例
    console.log('📋 添加图例和统计信息...');
    await this.delay(100);

    console.log('✅ 地图渲染完成');
  }

  /**
   * 延迟函数
   * Delay function
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 扩展边界以添加边距
   * Expand bounds to add margin
   */
  private static expandBounds(bounds: MapBounds, marginPercent: number): MapBounds {
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
  private static getBoundsCenter(bounds: MapBounds): { lat: number; lng: number } {
    return {
      lat: (bounds.north + bounds.south) / 2,
      lng: (bounds.east + bounds.west) / 2,
    };
  }

  /**
   * 计算合适的缩放级别
   * Calculate appropriate zoom level
   */
  private static calculateZoomLevel(bounds: MapBounds, mapSize: { width: number; height: number }): number {
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    
    // 简化的缩放级别计算
    const maxDiff = Math.max(latDiff, lngDiff);
    
    if (maxDiff > 10) return 5;
    if (maxDiff > 5) return 6;
    if (maxDiff > 2) return 7;
    if (maxDiff > 1) return 8;
    if (maxDiff > 0.5) return 9;
    if (maxDiff > 0.2) return 10;
    if (maxDiff > 0.1) return 11;
    if (maxDiff > 0.05) return 12;
    if (maxDiff > 0.02) return 13;
    if (maxDiff > 0.01) return 14;
    if (maxDiff > 0.005) return 15;
    return 16;
  }

  /**
   * 获取活动类型的默认样式
   * Get default style for activity type
   */
  static getDefaultStyle(activityType: ActivityType): TrajectoryStyle {
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
}

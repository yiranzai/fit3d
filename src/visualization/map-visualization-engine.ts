/**
 * 地图可视化引擎
 * Map Visualization Engine
 */

import { MapProvider, MapStyle, TileCache, BoundingBox, ActivityType } from '@/types';
import { MapProviderManager } from '@/providers/map-provider-manager';
import { MapStyleEngine } from '@/styles/map-style-engine';
import { TileCacheSystem } from '@/cache/tile-cache-system';
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
    center: { lat: number; lng: number };
    zoom: number;
    renderedAt: Date;
  };
}

export class MapVisualizationEngine extends EventEmitter {
  private providerManager: MapProviderManager;
  private styleEngine: MapStyleEngine;
  private cacheSystem: TileCacheSystem;
  private currentViewport: MapViewport;
  private activityTracks: Map<string, ActivityTrack> = new Map();
  private isRendering = false;

  constructor(
    providerManager: MapProviderManager,
    styleEngine: MapStyleEngine,
    cacheSystem: TileCacheSystem
  ) {
    super();
    this.providerManager = providerManager;
    this.styleEngine = styleEngine;
    this.cacheSystem = cacheSystem;
    
    // 默认视口：北京天安门
    this.currentViewport = {
      center: { lat: 39.9042, lng: 116.4074 },
      zoom: 13
    };
  }

  /**
   * 初始化地图可视化引擎
   * Initialize map visualization engine
   */
  async initialize(): Promise<void> {
    // 监听提供商和样式变化
    this.providerManager.on('providerSwitched', this.handleProviderSwitch.bind(this));
    this.styleEngine.on('styleSwitched', this.handleStyleSwitch.bind(this));
    
    this.emit('initialized');
  }

  /**
   * 设置地图视口
   * Set map viewport
   */
  setViewport(viewport: MapViewport): void {
    this.currentViewport = viewport;
    this.emit('viewportChanged', viewport);
  }

  /**
   * 获取当前视口
   * Get current viewport
   */
  getCurrentViewport(): MapViewport {
    return { ...this.currentViewport };
  }

  /**
   * 添加活动轨迹
   * Add activity track
   */
  addActivityTrack(track: ActivityTrack): void {
    this.activityTracks.set(track.id, track);
    this.emit('trackAdded', track);
  }

  /**
   * 移除活动轨迹
   * Remove activity track
   */
  removeActivityTrack(trackId: string): void {
    const track = this.activityTracks.get(trackId);
    if (track) {
      this.activityTracks.delete(trackId);
      this.emit('trackRemoved', trackId);
    }
  }

  /**
   * 获取所有活动轨迹
   * Get all activity tracks
   */
  getActivityTracks(): ActivityTrack[] {
    return Array.from(this.activityTracks.values());
  }

  /**
   * 清除所有活动轨迹
   * Clear all activity tracks
   */
  clearActivityTracks(): void {
    this.activityTracks.clear();
    this.emit('tracksCleared');
  }

  /**
   * 渲染地图
   * Render map
   */
  async renderMap(options: MapRenderOptions): Promise<MapRenderResult> {
    if (this.isRendering) {
      throw new Error('Map is already being rendered');
    }

    this.isRendering = true;
    const startTime = Date.now();

    try {
      const currentProvider = this.providerManager.getCurrentProvider();
      const currentStyle = this.styleEngine.getCurrentStyle();

      if (!currentProvider || !currentStyle) {
        throw new Error('No active provider or style');
      }

      // 预加载视口瓦片
      await this.preloadViewportTiles();

      // 渲染地图
      const imageData = await this.renderMapImage(options);

      const result: MapRenderResult = {
        imageData,
        format: options.format,
        size: {
          width: options.width,
          height: options.height
        },
        metadata: {
          provider: currentProvider.id,
          style: currentStyle.id,
          center: this.currentViewport.center,
          zoom: this.currentViewport.zoom,
          renderedAt: new Date()
        }
      };

      const renderTime = Date.now() - startTime;
      this.emit('mapRendered', { result, renderTime });

      return result;
    } catch (error) {
      this.emit('renderError', { error, options });
      throw error;
    } finally {
      this.isRendering = false;
    }
  }

  /**
   * 生成地图预览
   * Generate map preview
   */
  async generatePreview(
    styleId: string,
    coordinates: { lat: number; lng: number; zoom: number },
    size: { width: number; height: number } = { width: 400, height: 300 }
  ): Promise<Buffer> {
    const originalViewport = this.currentViewport;
    
    try {
      // 临时设置视口
      this.setViewport({
        center: { lat: coordinates.lat, lng: coordinates.lng },
        zoom: coordinates.zoom
      });

      // 临时切换样式
      const originalStyle = this.styleEngine.getCurrentStyle();
      await this.styleEngine.switchStyle(styleId);

      // 渲染预览
      const result = await this.renderMap({
        width: size.width,
        height: size.height,
        format: 'png',
        quality: 80,
        includeTracks: false,
        includeMarkers: false,
        watermark: true
      });

      return result.imageData;
    } finally {
      // 恢复原始状态
      this.setViewport(originalViewport);
      if (originalStyle) {
        await this.styleEngine.switchStyle(originalStyle.id);
      }
    }
  }

  /**
   * 处理地图交互
   * Handle map interaction
   */
  handleInteraction(interaction: MapInteraction): void {
    switch (interaction.type) {
      case 'click':
        this.handleMapClick(interaction);
        break;
      case 'drag':
        this.handleMapDrag(interaction);
        break;
      case 'zoom':
        this.handleMapZoom(interaction);
        break;
      case 'pan':
        this.handleMapPan(interaction);
        break;
    }

    this.emit('interaction', interaction);
  }

  /**
   * 获取地图统计信息
   * Get map statistics
   */
  async getMapStatistics(): Promise<any> {
    const provider = this.providerManager.getCurrentProvider();
    const style = this.styleEngine.getCurrentStyle();
    const cacheStats = await this.cacheSystem.getCacheStats();
    const tracks = this.getActivityTracks();

    return {
      currentProvider: provider ? {
        id: provider.id,
        name: provider.name,
        nameZh: provider.nameZh
      } : null,
      currentStyle: style ? {
        id: style.id,
        name: style.name,
        nameZh: style.nameZh,
        type: style.type
      } : null,
      viewport: this.currentViewport,
      tracks: {
        count: tracks.length,
        totalDistance: this.calculateTotalDistance(tracks),
        activities: this.getActivityTypes(tracks)
      },
      cache: cacheStats,
      performance: {
        isRendering: this.isRendering,
        memoryUsage: process.memoryUsage()
      }
    };
  }

  /**
   * 预加载视口瓦片
   * Preload viewport tiles
   */
  private async preloadViewportTiles(): Promise<void> {
    const provider = this.providerManager.getCurrentProvider();
    const style = this.styleEngine.getCurrentStyle();

    if (!provider || !style) {
      return;
    }

    const bounds = this.calculateViewportBounds();
    const zoomLevels = this.getOptimalZoomLevels();

    await this.cacheSystem.preloadRegion(
      provider.id,
      style.id,
      bounds,
      zoomLevels
    );
  }

  /**
   * 渲染地图图像
   * Render map image
   */
  private async renderMapImage(options: MapRenderOptions): Promise<Buffer> {
    // 这里应该实现实际的地图渲染逻辑
    // 目前返回模拟的PNG数据
    const canvas = this.createCanvas(options.width, options.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // 绘制背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, options.width, options.height);

    // 绘制地图瓦片
    await this.drawMapTiles(ctx, options);

    // 绘制活动轨迹
    if (options.includeTracks) {
      this.drawActivityTracks(ctx, options);
    }

    // 绘制标记
    if (options.includeMarkers) {
      this.drawMarkers(ctx, options);
    }

    // 添加水印
    if (options.watermark) {
      this.drawWatermark(ctx, options);
    }

    // 转换为指定格式
    return this.canvasToBuffer(canvas, options.format, options.quality);
  }

  /**
   * 绘制地图瓦片
   * Draw map tiles
   */
  private async drawMapTiles(ctx: CanvasRenderingContext2D, options: MapRenderOptions): Promise<void> {
    const provider = this.providerManager.getCurrentProvider();
    const style = this.styleEngine.getCurrentStyle();

    if (!provider || !style) {
      return;
    }

    const tileSize = 256;
    const tiles = this.calculateVisibleTiles();

    for (const tile of tiles) {
      try {
        const tileData = await this.cacheSystem.getTile({
          providerId: provider.id,
          styleId: style.id,
          z: tile.z,
          x: tile.x,
          y: tile.y
        });

        if (tileData) {
          const image = await this.loadImageFromBuffer(tileData.data);
          ctx.drawImage(
            image,
            tile.screenX,
            tile.screenY,
            tileSize,
            tileSize
          );
        }
      } catch (error) {
        // 绘制错误瓦片
        this.drawErrorTile(ctx, tile.screenX, tile.screenY, tileSize);
      }
    }
  }

  /**
   * 绘制活动轨迹
   * Draw activity tracks
   */
  private drawActivityTracks(ctx: CanvasRenderingContext2D, options: MapRenderOptions): void {
    const tracks = this.getActivityTracks();

    for (const track of tracks) {
      if (track.coordinates.length < 2) {
        continue;
      }

      ctx.strokeStyle = track.style?.color || this.getDefaultTrackColor(track.activityType);
      ctx.lineWidth = track.style?.weight || 3;
      ctx.globalAlpha = track.style?.opacity || 0.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      
      for (let i = 0; i < track.coordinates.length; i++) {
        const coord = track.coordinates[i];
        const screenPos = this.latLngToScreen(coord.lat, coord.lng, options.width, options.height);
        
        if (i === 0) {
          ctx.moveTo(screenPos.x, screenPos.y);
        } else {
          ctx.lineTo(screenPos.x, screenPos.y);
        }
      }

      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
  }

  /**
   * 绘制标记
   * Draw markers
   */
  private drawMarkers(ctx: CanvasRenderingContext2D, options: MapRenderOptions): void {
    // 绘制起点和终点标记
    const tracks = this.getActivityTracks();

    for (const track of tracks) {
      if (track.coordinates.length === 0) {
        continue;
      }

      // 起点
      const startCoord = track.coordinates[0];
      const startPos = this.latLngToScreen(startCoord.lat, startCoord.lng, options.width, options.height);
      this.drawMarker(ctx, startPos.x, startPos.y, 'start', track.activityType);

      // 终点
      if (track.coordinates.length > 1) {
        const endCoord = track.coordinates[track.coordinates.length - 1];
        const endPos = this.latLngToScreen(endCoord.lat, endCoord.lng, options.width, options.height);
        this.drawMarker(ctx, endPos.x, endPos.y, 'end', track.activityType);
      }
    }
  }

  /**
   * 绘制水印
   * Draw watermark
   */
  private drawWatermark(ctx: CanvasRenderingContext2D, options: MapRenderOptions): void {
    const provider = this.providerManager.getCurrentProvider();
    const style = this.styleEngine.getCurrentStyle();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';

    const text = `Fit3D - ${provider?.nameZh || provider?.name || 'Unknown'} - ${style?.nameZh || style?.name || 'Unknown'}`;
    ctx.fillText(text, options.width - 10, options.height - 10);
  }

  /**
   * 处理提供商切换
   * Handle provider switch
   */
  private handleProviderSwitch(event: any): void {
    this.emit('providerChanged', event);
  }

  /**
   * 处理样式切换
   * Handle style switch
   */
  private handleStyleSwitch(event: any): void {
    this.emit('styleChanged', event);
  }

  /**
   * 处理地图点击
   * Handle map click
   */
  private handleMapClick(interaction: MapInteraction): void {
    if (interaction.coordinates) {
      this.emit('mapClick', {
        lat: interaction.coordinates.lat,
        lng: interaction.coordinates.lng
      });
    }
  }

  /**
   * 处理地图拖拽
   * Handle map drag
   */
  private handleMapDrag(interaction: MapInteraction): void {
    if (interaction.bounds) {
      this.currentViewport.bounds = interaction.bounds;
      this.emit('mapDrag', interaction.bounds);
    }
  }

  /**
   * 处理地图缩放
   * Handle map zoom
   */
  private handleMapZoom(interaction: MapInteraction): void {
    if (interaction.zoom !== undefined) {
      this.currentViewport.zoom = interaction.zoom;
      this.emit('mapZoom', interaction.zoom);
    }
  }

  /**
   * 处理地图平移
   * Handle map pan
   */
  private handleMapPan(interaction: MapInteraction): void {
    if (interaction.coordinates) {
      this.currentViewport.center = interaction.coordinates;
      this.emit('mapPan', interaction.coordinates);
    }
  }

  /**
   * 计算视口边界
   * Calculate viewport bounds
   */
  private calculateViewportBounds(): BoundingBox {
    const center = this.currentViewport.center;
    const zoom = this.currentViewport.zoom;
    
    // 简化的边界计算
    const latRange = 180 / Math.pow(2, zoom);
    const lngRange = 360 / Math.pow(2, zoom);

    return {
      north: center.lat + latRange / 2,
      south: center.lat - latRange / 2,
      east: center.lng + lngRange / 2,
      west: center.lng - lngRange / 2
    };
  }

  /**
   * 获取最优缩放级别
   * Get optimal zoom levels
   */
  private getOptimalZoomLevels(): number[] {
    const currentZoom = this.currentViewport.zoom;
    return [currentZoom - 1, currentZoom, currentZoom + 1];
  }

  /**
   * 计算可见瓦片
   * Calculate visible tiles
   */
  private calculateVisibleTiles(): Array<{ z: number; x: number; y: number; screenX: number; screenY: number }> {
    const zoom = this.currentViewport.zoom;
    const bounds = this.calculateViewportBounds();
    
    // 简化的瓦片计算
    const tiles: Array<{ z: number; x: number; y: number; screenX: number; screenY: number }> = [];
    
    // 这里应该实现完整的瓦片计算逻辑
    // 目前返回模拟数据
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        tiles.push({
          z: zoom,
          x: Math.floor((bounds.west + 180) / 360 * Math.pow(2, zoom)) + x,
          y: Math.floor((1 - Math.log(Math.tan(bounds.north * Math.PI / 180) + 1 / Math.cos(bounds.north * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)) + y,
          screenX: x * 256,
          screenY: y * 256
        });
      }
    }

    return tiles;
  }

  /**
   * 经纬度转屏幕坐标
   * Convert lat/lng to screen coordinates
   */
  private latLngToScreen(lat: number, lng: number, width: number, height: number): { x: number; y: number } {
    // 简化的坐标转换
    const center = this.currentViewport.center;
    const zoom = this.currentViewport.zoom;
    
    const scale = Math.pow(2, zoom);
    const x = (lng - center.lng) * scale * width / 360 + width / 2;
    const y = (center.lat - lat) * scale * height / 180 + height / 2;
    
    return { x, y };
  }

  /**
   * 获取默认轨迹颜色
   * Get default track color
   */
  private getDefaultTrackColor(activityType: ActivityType): string {
    const colors = {
      [ActivityType.HIKING]: '#059669',
      [ActivityType.CYCLING]: '#2563eb',
      [ActivityType.RUNNING]: '#dc2626',
      [ActivityType.MOUNTAIN_BIKING]: '#7c3aed',
      [ActivityType.CLIMBING]: '#ea580c',
      [ActivityType.LEISURE]: '#0891b2'
    };
    
    return colors[activityType] || '#6b7280';
  }

  /**
   * 计算总距离
   * Calculate total distance
   */
  private calculateTotalDistance(tracks: ActivityTrack[]): number {
    let totalDistance = 0;
    
    for (const track of tracks) {
      for (let i = 1; i < track.coordinates.length; i++) {
        const prev = track.coordinates[i - 1];
        const curr = track.coordinates[i];
        totalDistance += this.calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
      }
    }
    
    return totalDistance;
  }

  /**
   * 计算两点间距离
   * Calculate distance between two points
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 获取活动类型
   * Get activity types
   */
  private getActivityTypes(tracks: ActivityTrack[]): string[] {
    const types = new Set(tracks.map(track => track.activityType));
    return Array.from(types);
  }

  /**
   * 创建画布
   * Create canvas
   */
  private createCanvas(width: number, height: number): HTMLCanvasElement {
    // 这里应该使用实际的Canvas实现
    // 目前返回模拟对象
    return {
      width,
      height,
      getContext: () => ({
        fillStyle: '',
        lineWidth: 0,
        globalAlpha: 1,
        lineCap: 'butt',
        lineJoin: 'miter',
        textAlign: 'start',
        textBaseline: 'alphabetic',
        font: '',
        fillRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        drawImage: () => {},
        fillText: () => {}
      } as any)
    } as any;
  }

  /**
   * 从缓冲区加载图像
   * Load image from buffer
   */
  private async loadImageFromBuffer(buffer: Buffer): Promise<HTMLImageElement> {
    // 这里应该实现实际的图像加载
    // 目前返回模拟对象
    return {
      width: 256,
      height: 256
    } as any;
  }

  /**
   * 绘制错误瓦片
   * Draw error tile
   */
  private drawErrorTile(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(x, y, size, size);
    
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, size, size);
    
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Error', x + size / 2, y + size / 2);
  }

  /**
   * 绘制标记
   * Draw marker
   */
  private drawMarker(ctx: CanvasRenderingContext2D, x: number, y: number, type: 'start' | 'end', activityType: ActivityType): void {
    const color = this.getDefaultTrackColor(activityType);
    const radius = type === 'start' ? 8 : 6;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * 画布转缓冲区
   * Convert canvas to buffer
   */
  private canvasToBuffer(canvas: HTMLCanvasElement, format: string, quality?: number): Buffer {
    // 这里应该实现实际的画布转换
    // 目前返回模拟的PNG数据
    return Buffer.from('mock-png-data');
  }

  /**
   * 清理资源
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.activityTracks.clear();
    this.removeAllListeners();
  }
}

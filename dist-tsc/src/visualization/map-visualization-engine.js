/**
 * 地图可视化引擎
 * Map Visualization Engine
 */
import { ActivityType } from '../types/index.js';
import { EventEmitter } from 'events';
export class MapVisualizationEngine extends EventEmitter {
    providerManager;
    styleEngine;
    cacheSystem;
    currentViewport;
    activityTracks = new Map();
    isRendering = false;
    constructor(providerManager, styleEngine, cacheSystem) {
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
    async initialize() {
        // 监听提供商和样式变化
        this.providerManager.on('providerSwitched', this.handleProviderSwitch.bind(this));
        this.styleEngine.on('styleSwitched', this.handleStyleSwitch.bind(this));
        this.emit('initialized');
    }
    /**
     * 设置地图视口
     * Set map viewport
     */
    setViewport(viewport) {
        this.currentViewport = viewport;
        this.emit('viewportChanged', viewport);
    }
    /**
     * 获取当前视口
     * Get current viewport
     */
    getCurrentViewport() {
        return { ...this.currentViewport };
    }
    /**
     * 添加活动轨迹
     * Add activity track
     */
    addActivityTrack(track) {
        this.activityTracks.set(track.id, track);
        this.emit('trackAdded', track);
    }
    /**
     * 移除活动轨迹
     * Remove activity track
     */
    removeActivityTrack(trackId) {
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
    getActivityTracks() {
        return Array.from(this.activityTracks.values());
    }
    /**
     * 清除所有活动轨迹
     * Clear all activity tracks
     */
    clearActivityTracks() {
        this.activityTracks.clear();
        this.emit('tracksCleared');
    }
    /**
     * 渲染地图
     * Render map
     */
    async renderMap(options) {
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
            const result = {
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
        }
        catch (error) {
            this.emit('renderError', { error, options });
            throw error;
        }
        finally {
            this.isRendering = false;
        }
    }
    /**
     * 生成地图预览
     * Generate map preview
     */
    async generatePreview(styleId, coordinates, size = { width: 400, height: 300 }) {
        const originalViewport = this.currentViewport;
        try {
            // 临时设置视口
            this.setViewport({
                center: { lat: coordinates.lat, lng: coordinates.lng },
                zoom: coordinates.zoom
            });
            // 临时切换样式
            // const originalStyle = this.styleEngine.getCurrentStyle();
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
        }
        finally {
            // 恢复原始状态
            this.setViewport(originalViewport);
            // if (currentStyle) {
            //   await this.styleEngine.switchStyle(currentStyle.id);
            // }
        }
    }
    /**
     * 处理地图交互
     * Handle map interaction
     */
    handleInteraction(interaction) {
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
    async getMapStatistics() {
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
    async preloadViewportTiles() {
        const provider = this.providerManager.getCurrentProvider();
        const style = this.styleEngine.getCurrentStyle();
        if (!provider || !style) {
            return;
        }
        const bounds = this.calculateViewportBounds();
        const zoomLevels = this.getOptimalZoomLevels();
        await this.cacheSystem.preloadRegion(provider.id, style.id, bounds, zoomLevels);
    }
    /**
     * 渲染地图图像
     * Render map image
     */
    async renderMapImage(options) {
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
    async drawMapTiles(ctx, _options) {
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
                    ctx.drawImage(image, tile.screenX, tile.screenY, tileSize, tileSize);
                }
            }
            catch (error) {
                // 绘制错误瓦片
                this.drawErrorTile(ctx, tile.screenX, tile.screenY, tileSize);
            }
        }
    }
    /**
     * 绘制活动轨迹
     * Draw activity tracks
     */
    drawActivityTracks(ctx, options) {
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
                const screenPos = this.latLngToScreen(coord?.lat || 0, coord?.lng || 0, options.width, options.height);
                if (i === 0) {
                    ctx.moveTo(screenPos.x, screenPos.y);
                }
                else {
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
    drawMarkers(ctx, options) {
        // 绘制起点和终点标记
        const tracks = this.getActivityTracks();
        for (const track of tracks) {
            if (track.coordinates.length === 0) {
                continue;
            }
            // 起点
            const startCoord = track.coordinates[0];
            const startPos = this.latLngToScreen(startCoord?.lat || 0, startCoord?.lng || 0, options.width, options.height);
            this.drawMarker(ctx, startPos.x, startPos.y, 'start', track.activityType);
            // 终点
            if (track.coordinates.length > 1) {
                const endCoord = track.coordinates[track.coordinates.length - 1];
                const endPos = this.latLngToScreen(endCoord?.lat || 0, endCoord?.lng || 0, options.width, options.height);
                this.drawMarker(ctx, endPos.x, endPos.y, 'end', track.activityType);
            }
        }
    }
    /**
     * 绘制水印
     * Draw watermark
     */
    drawWatermark(ctx, options) {
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
    handleProviderSwitch(event) {
        this.emit('providerChanged', event);
    }
    /**
     * 处理样式切换
     * Handle style switch
     */
    handleStyleSwitch(event) {
        this.emit('styleChanged', event);
    }
    /**
     * 处理地图点击
     * Handle map click
     */
    handleMapClick(interaction) {
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
    handleMapDrag(interaction) {
        if (interaction.bounds) {
            this.currentViewport.bounds = interaction.bounds;
            this.emit('mapDrag', interaction.bounds);
        }
    }
    /**
     * 处理地图缩放
     * Handle map zoom
     */
    handleMapZoom(interaction) {
        if (interaction.zoom !== undefined) {
            this.currentViewport.zoom = interaction.zoom;
            this.emit('mapZoom', interaction.zoom);
        }
    }
    /**
     * 处理地图平移
     * Handle map pan
     */
    handleMapPan(interaction) {
        if (interaction.coordinates) {
            this.currentViewport.center = interaction.coordinates;
            this.emit('mapPan', interaction.coordinates);
        }
    }
    /**
     * 计算视口边界
     * Calculate viewport bounds
     */
    calculateViewportBounds() {
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
    getOptimalZoomLevels() {
        const currentZoom = this.currentViewport.zoom;
        return [currentZoom - 1, currentZoom, currentZoom + 1];
    }
    /**
     * 计算可见瓦片
     * Calculate visible tiles
     */
    calculateVisibleTiles() {
        const zoom = this.currentViewport.zoom;
        const bounds = this.calculateViewportBounds();
        // 简化的瓦片计算
        const tiles = [];
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
    latLngToScreen(lat, lng, width, height) {
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
    getDefaultTrackColor(activityType) {
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
    calculateTotalDistance(tracks) {
        let totalDistance = 0;
        for (const track of tracks) {
            for (let i = 1; i < track.coordinates.length; i++) {
                const prev = track.coordinates[i - 1];
                const curr = track.coordinates[i];
                totalDistance += this.calculateDistance(prev?.lat || 0, prev?.lng || 0, curr?.lat || 0, curr?.lng || 0);
            }
        }
        return totalDistance;
    }
    /**
     * 计算两点间距离
     * Calculate distance between two points
     */
    calculateDistance(lat1, lng1, lat2, lng2) {
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
    getActivityTypes(tracks) {
        const types = new Set(tracks.map(track => track.activityType));
        return Array.from(types);
    }
    /**
     * 创建画布
     * Create canvas
     */
    createCanvas(width, height) {
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
                fillRect: () => { },
                beginPath: () => { },
                moveTo: () => { },
                lineTo: () => { },
                stroke: () => { },
                drawImage: () => { },
                fillText: () => { }
            })
        };
    }
    /**
     * 从缓冲区加载图像
     * Load image from buffer
     */
    async loadImageFromBuffer(_buffer) {
        // 这里应该实现实际的图像加载
        // 目前返回模拟对象
        return {
            width: 256,
            height: 256
        };
    }
    /**
     * 绘制错误瓦片
     * Draw error tile
     */
    drawErrorTile(ctx, x, y, size) {
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
    drawMarker(ctx, x, y, type, activityType) {
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
    canvasToBuffer(_canvas, _format, _quality) {
        // 这里应该实现实际的画布转换
        // 目前返回模拟的PNG数据
        return Buffer.from('mock-png-data');
    }
    /**
     * 清理资源
     * Cleanup resources
     */
    async cleanup() {
        this.activityTracks.clear();
        this.removeAllListeners();
    }
}
//# sourceMappingURL=map-visualization-engine.js.map
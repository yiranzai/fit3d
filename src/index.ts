/**
 * Fit3D 多样化地图样式系统 - 主入口
 * Fit3D Diverse Map Styles System - Main Entry Point
 */

export * from './types';
export * from './core/database/sqlite-database';
export * from './core/database/duckdb-database';
export * from './providers/map-provider-manager';
export * from './styles/map-style-engine';
export * from './cache/tile-cache-system';
export * from './visualization/map-visualization-engine';

// 版本信息
export const VERSION = '1.0.0';
export const DESCRIPTION = 'Fit3D多样化开源地图样式系统';

// 默认配置
export const DEFAULT_CONFIG = {
  database: {
    sqlite: {
      path: '~/.fit3d/maps.db'
    },
    duckdb: {
      path: '~/.fit3d/maps-analytics.db'
    }
  },
  cache: {
    strategy: 'hybrid' as const,
    maxMemoryTiles: 1000,
    maxDiskSize: 1024 * 1024 * 1024, // 1GB
    maxTileAge: 7 * 24 * 60 * 60 * 1000, // 7天
    compressionEnabled: true,
    preloadEnabled: true
  },
  providers: {
    maxConcurrent: 6,
    timeout: 30000,
    retries: 3
  },
  server: {
    port: 3000,
    host: 'localhost',
    cors: {
      origin: ['http://localhost:3000'],
      credentials: true
    }
  },
  logging: {
    level: 'info',
    file: '~/.fit3d/logs/app.log',
    maxSize: '10MB',
    maxFiles: 5
  }
};

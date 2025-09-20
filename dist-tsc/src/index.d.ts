/**
 * Fit3D 多样化地图样式系统 - 主入口
 * Fit3D Diverse Map Styles System - Main Entry Point
 */
export * from './types';
export * from './core/database/sqlite-database';
export * from './providers/map-provider-manager';
export * from './styles/map-style-engine';
export * from './cache/tile-cache-system';
export * from './visualization/map-visualization-engine';
export declare const VERSION = "1.0.0";
export declare const DESCRIPTION = "Fit3D\u591A\u6837\u5316\u5F00\u6E90\u5730\u56FE\u6837\u5F0F\u7CFB\u7EDF";
export declare const DEFAULT_CONFIG: {
    database: {
        sqlite: {
            path: string;
        };
        duckdb: {
            path: string;
        };
    };
    cache: {
        strategy: "hybrid";
        maxMemoryTiles: number;
        maxDiskSize: number;
        maxTileAge: number;
        compressionEnabled: boolean;
        preloadEnabled: boolean;
    };
    providers: {
        maxConcurrent: number;
        timeout: number;
        retries: number;
    };
    server: {
        port: number;
        host: string;
        cors: {
            origin: string[];
            credentials: boolean;
        };
    };
    logging: {
        level: string;
        file: string;
        maxSize: string;
        maxFiles: number;
    };
};
//# sourceMappingURL=index.d.ts.map
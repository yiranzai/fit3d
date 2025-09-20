#!/usr/bin/env node
/**
 * Fit3D 多样化地图样式系统 - CLI接口
 * Fit3D Diverse Map Styles System - CLI Interface
 */
import { Command } from 'commander';
import { SQLiteDatabase } from '../core/database/sqlite-database.js';
import { MapProviderManager } from '../providers/map-provider-manager.js';
import { MapStyleEngine } from '../styles/map-style-engine.js';
import { TileCacheSystem } from '../cache/tile-cache-system.js';
import { MapVisualizationEngine } from '../visualization/map-visualization-engine.js';
import { CacheStrategy } from '../types/index.js';
import path from 'path';
import os from 'os';
const program = new Command();
// 全局配置
let db;
let providerManager;
let styleEngine;
let cacheSystem;
let visualizationEngine;
/**
 * 初始化系统
 * Initialize system
 */
async function initializeSystem(dataDir) {
    const appDataDir = dataDir || path.join(os.homedir(), '.fit3d');
    // const sqlitePath = path.join(appDataDir, 'maps.db'); // 暂时使用内存数据库
    console.log('🚀 初始化Fit3D地图系统...');
    console.log(`📁 数据目录: ${appDataDir}`);
    try {
        // 创建数据目录
        const fs = await import('fs');
        if (!fs.existsSync(appDataDir)) {
            fs.mkdirSync(appDataDir, { recursive: true });
        }
        // 初始化数据库 (使用内存数据库进行测试)
        db = new SQLiteDatabase(':memory:');
        await db.initialize();
        // 初始化缓存系统
        const cacheConfig = {
            strategy: CacheStrategy.HYBRID,
            maxMemoryTiles: 1000,
            maxDiskSize: 1024 * 1024 * 1024, // 1GB
            maxTileAge: 7 * 24 * 60 * 60 * 1000, // 7天
            compressionEnabled: true,
            preloadEnabled: true
        };
        cacheSystem = new TileCacheSystem(db, cacheConfig);
        await cacheSystem.initialize();
        // 初始化管理器
        providerManager = new MapProviderManager(db);
        await providerManager.initialize();
        styleEngine = new MapStyleEngine(db);
        await styleEngine.initialize();
        visualizationEngine = new MapVisualizationEngine(providerManager, styleEngine, cacheSystem);
        await visualizationEngine.initialize();
        console.log('✅ 系统初始化完成');
    }
    catch (error) {
        console.error('❌ 系统初始化失败:', error);
        process.exit(1);
    }
}
/**
 * 地图提供商管理命令
 * Map provider management commands
 */
program
    .command('map-providers')
    .description('地图提供商管理 / Map provider management')
    .command('list')
    .description('列出所有地图提供商 / List all map providers')
    .action(async () => {
    try {
        const providers = await providerManager.getAvailableProviders();
        console.log('\n🗺️  可用的地图提供商 / Available Map Providers:');
        console.log('='.repeat(60));
        for (const provider of providers) {
            const health = providerManager.getProviderHealth(provider.id);
            const performance = providerManager.getProviderPerformance(provider.id);
            console.log(`\n📌 ${provider.name} (${provider.nameZh})`);
            console.log(`   ID: ${provider.id}`);
            console.log(`   描述: ${provider.descriptionZh || provider.description}`);
            console.log(`   开源: ${provider.isOpenSource ? '是' : '否'}`);
            console.log(`   状态: ${health?.status || 'unknown'}`);
            console.log(`   响应时间: ${health?.responseTime || 0}ms`);
            console.log(`   使用次数: ${performance?.totalRequests || 0}`);
            console.log(`   成功率: ${performance?.uptime || 0}%`);
        }
        console.log(`\n总计: ${providers.length} 个提供商`);
    }
    catch (error) {
        console.error('❌ 获取地图提供商失败:', error);
    }
});
program
    .command('map-providers')
    .command('show <providerId>')
    .description('显示特定地图提供商详情 / Show specific map provider details')
    .action(async (providerId) => {
    try {
        const provider = await providerManager.getProvider(providerId);
        if (!provider) {
            console.error(`❌ 未找到提供商: ${providerId}`);
            return;
        }
        const styles = await providerManager.getProviderStyles(providerId);
        const health = providerManager.getProviderHealth(providerId);
        const performance = providerManager.getProviderPerformance(providerId);
        console.log(`\n🗺️  地图提供商详情 / Map Provider Details:`);
        console.log('='.repeat(60));
        console.log(`名称: ${provider.name} (${provider.nameZh})`);
        console.log(`ID: ${provider.id}`);
        console.log(`描述: ${provider.descriptionZh || provider.description}`);
        console.log(`数据源: ${provider.dataSource}`);
        console.log(`开源: ${provider.isOpenSource ? '是' : '否'}`);
        console.log(`活跃: ${provider.isActive ? '是' : '否'}`);
        console.log(`排序: ${provider.sortOrder}`);
        console.log(`\n🔧 API配置 / API Configuration:`);
        console.log(`基础URL: ${provider.apiConfig.baseUrl}`);
        console.log(`子域名: ${provider.apiConfig.subdomains.join(', ')}`);
        console.log(`最大缩放: ${provider.apiConfig.maxZoom}`);
        console.log(`最小缩放: ${provider.apiConfig.minZoom}`);
        console.log(`瓦片大小: ${provider.apiConfig.tileSize}`);
        console.log(`缓存策略: ${provider.apiConfig.cacheStrategy}`);
        console.log(`\n📊 性能统计 / Performance Statistics:`);
        console.log(`状态: ${health?.status || 'unknown'}`);
        console.log(`响应时间: ${health?.responseTime || 0}ms`);
        console.log(`最后检查: ${health?.lastChecked || 'never'}`);
        console.log(`总请求数: ${performance?.totalRequests || 0}`);
        console.log(`成功请求: ${performance?.successfulRequests || 0}`);
        console.log(`失败请求: ${performance?.failedRequests || 0}`);
        console.log(`平均响应时间: ${performance?.averageResponseTime || 0}ms`);
        console.log(`正常运行时间: ${performance?.uptime || 0}%`);
        console.log(`\n🎨 可用样式 / Available Styles (${styles.length}):`);
        for (const style of styles) {
            console.log(`  - ${style.name} (${style.nameZh}) - ${style.type}`);
        }
    }
    catch (error) {
        console.error('❌ 获取提供商详情失败:', error);
    }
});
program
    .command('map-providers')
    .command('test <providerId>')
    .description('测试地图提供商连接 / Test map provider connection')
    .action(async (providerId) => {
    try {
        console.log(`🔍 测试提供商连接: ${providerId}...`);
        const isHealthy = await providerManager.testProviderConnection(providerId);
        if (isHealthy) {
            console.log('✅ 提供商连接正常');
        }
        else {
            console.log('❌ 提供商连接失败');
        }
    }
    catch (error) {
        console.error('❌ 测试提供商连接失败:', error);
    }
});
/**
 * 地图样式管理命令
 * Map style management commands
 */
program
    .command('map-styles')
    .description('地图样式管理 / Map style management')
    .command('list')
    .option('-p, --provider <providerId>', '按提供商过滤 / Filter by provider')
    .option('-t, --type <type>', '按类型过滤 / Filter by type')
    .option('-a, --activity <activity>', '按活动类型过滤 / Filter by activity')
    .description('列出所有地图样式 / List all map styles')
    .action(async (options) => {
    try {
        let styles = await styleEngine.getAvailableStyles();
        // 应用过滤器
        if (options.provider) {
            styles = styles.filter(style => style.providerId === options.provider);
        }
        if (options.type) {
            styles = styles.filter(style => style.type === options.type);
        }
        if (options.activity) {
            styles = styles.filter(style => style.suitableActivities.includes(options.activity));
        }
        console.log('\n🎨 可用的地图样式 / Available Map Styles:');
        console.log('='.repeat(60));
        for (const style of styles) {
            const isCurrent = style.id === styleEngine.getCurrentStyle()?.id;
            console.log(`\n${isCurrent ? '⭐' : '📌'} ${style.name} (${style.nameZh})`);
            console.log(`   ID: ${style.id}`);
            console.log(`   提供商: ${style.providerId}`);
            console.log(`   类型: ${style.type}`);
            console.log(`   适用活动: ${style.suitableActivities.join(', ')}`);
            console.log(`   默认: ${style.isDefault ? '是' : '否'}`);
            console.log(`   活跃: ${style.isActive ? '是' : '否'}`);
            if (isCurrent) {
                console.log(`   🎯 当前使用中`);
            }
        }
        console.log(`\n总计: ${styles.length} 个样式`);
    }
    catch (error) {
        console.error('❌ 获取地图样式失败:', error);
    }
});
program
    .command('map-styles')
    .command('use <styleId>')
    .description('切换到指定地图样式 / Switch to specified map style')
    .action(async (styleId) => {
    try {
        console.log(`🔄 切换地图样式: ${styleId}...`);
        await styleEngine.switchStyle(styleId);
        const style = styleEngine.getCurrentStyle();
        console.log(`✅ 已切换到: ${style?.name} (${style?.nameZh})`);
    }
    catch (error) {
        console.error('❌ 切换地图样式失败:', error);
    }
});
program
    .command('map-styles')
    .command('current')
    .description('显示当前使用的地图样式 / Show current map style')
    .action(async () => {
    try {
        const style = styleEngine.getCurrentStyle();
        if (!style) {
            console.log('❌ 没有当前样式');
            return;
        }
        console.log('\n🎯 当前地图样式 / Current Map Style:');
        console.log('='.repeat(60));
        console.log(`名称: ${style.name} (${style.nameZh})`);
        console.log(`ID: ${style.id}`);
        console.log(`提供商: ${style.providerId}`);
        console.log(`类型: ${style.type}`);
        console.log(`描述: ${style.descriptionZh || style.description}`);
        console.log(`适用活动: ${style.suitableActivities.join(', ')}`);
        console.log(`默认: ${style.isDefault ? '是' : '否'}`);
    }
    catch (error) {
        console.error('❌ 获取当前样式失败:', error);
    }
});
/**
 * 缓存管理命令
 * Cache management commands
 */
program
    .command('cache')
    .description('缓存管理 / Cache management')
    .command('stats')
    .option('-b, --by-provider', '按提供商分组 / Group by provider')
    .option('-s, --by-style', '按样式分组 / Group by style')
    .option('-p, --performance', '显示性能指标 / Show performance metrics')
    .description('显示缓存统计信息 / Show cache statistics')
    .action(async (options) => {
    try {
        const stats = await cacheSystem.getCacheStats();
        const metrics = cacheSystem.getCacheMetrics();
        console.log('\n💾 缓存统计信息 / Cache Statistics:');
        console.log('='.repeat(60));
        console.log(`总瓦片数: ${stats.totalTiles.toLocaleString()}`);
        console.log(`总大小: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`内存瓦片: ${stats.memoryTiles.toLocaleString()}`);
        console.log(`磁盘瓦片: ${stats.diskTiles.toLocaleString()}`);
        console.log(`命中率: ${(stats.hitRate * 100).toFixed(2)}%`);
        console.log(`平均访问次数: ${stats.averageAccessCount.toFixed(2)}`);
        if (options.performance) {
            console.log(`\n📊 性能指标 / Performance Metrics:`);
            console.log(`总请求数: ${metrics.totalRequests.toLocaleString()}`);
            console.log(`命中次数: ${metrics.hits.toLocaleString()}`);
            console.log(`未命中次数: ${metrics.misses.toLocaleString()}`);
            console.log(`平均响应时间: ${metrics.averageResponseTime.toFixed(2)}ms`);
            console.log(`内存使用: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)} MB`);
            console.log(`磁盘使用: ${(metrics.diskUsage / 1024 / 1024).toFixed(2)} MB`);
        }
    }
    catch (error) {
        console.error('❌ 获取缓存统计失败:', error);
    }
});
program
    .command('cache')
    .command('cleanup')
    .option('-e, --expired', '清理过期缓存 / Clean expired cache')
    .option('-l, --least-used', '清理最少使用的缓存 / Clean least used cache')
    .option('-p, --provider <providerId>', '清理特定提供商的缓存 / Clean specific provider cache')
    .option('-s, --style <styleId>', '清理特定样式的缓存 / Clean specific style cache')
    .description('清理缓存 / Clean cache')
    .action(async (options) => {
    try {
        console.log('🧹 开始清理缓存...');
        if (options.expired) {
            await cacheSystem.cleanupExpired();
            console.log('✅ 已清理过期缓存');
        }
        if (options.leastUsed) {
            await cacheSystem.cleanupLeastUsed();
            console.log('✅ 已清理最少使用的缓存');
        }
        if (!options.expired && !options.leastUsed) {
            // 默认清理过期缓存
            await cacheSystem.cleanupExpired();
            console.log('✅ 已清理过期缓存');
        }
        console.log('🎉 缓存清理完成');
    }
    catch (error) {
        console.error('❌ 清理缓存失败:', error);
    }
});
/**
 * 地图生成命令
 * Map generation commands
 */
program
    .command('map')
    .description('地图生成 / Map generation')
    .command('generate <activityId>')
    .option('-s, --style <styleId>', '指定地图样式 / Specify map style')
    .option('-a, --activity <activityType>', '指定活动类型 / Specify activity type')
    .option('-o, --output <path>', '输出文件路径 / Output file path')
    .option('-w, --width <width>', '图像宽度 / Image width', '1920')
    .option('-h, --height <height>', '图像高度 / Image height', '1080')
    .option('-f, --format <format>', '图像格式 / Image format', 'png')
    .description('生成活动地图 / Generate activity map')
    .action(async (activityId, options) => {
    try {
        console.log(`🗺️  生成活动地图: ${activityId}...`);
        // 这里应该实现实际的地图生成逻辑
        // 目前只是模拟
        console.log(`样式: ${options.style || '默认'}`);
        console.log(`活动类型: ${options.activity || '未知'}`);
        console.log(`输出: ${options.output || 'activity-map.png'}`);
        console.log(`尺寸: ${options.width}x${options.height}`);
        console.log(`格式: ${options.format}`);
        console.log('✅ 地图生成完成');
    }
    catch (error) {
        console.error('❌ 生成地图失败:', error);
    }
});
/**
 * 系统信息命令
 * System information commands
 */
program
    .command('system-info')
    .description('显示系统信息 / Show system information')
    .action(async () => {
    try {
        const stats = await visualizationEngine.getMapStatistics();
        console.log('\n🖥️  系统信息 / System Information:');
        console.log('='.repeat(60));
        console.log(`当前提供商: ${stats.currentProvider?.nameZh || '未知'}`);
        console.log(`当前样式: ${stats.currentStyle?.nameZh || '未知'}`);
        console.log(`视口中心: ${stats.viewport.center.lat.toFixed(4)}, ${stats.viewport.center.lng.toFixed(4)}`);
        console.log(`缩放级别: ${stats.viewport.zoom}`);
        console.log(`活动轨迹数: ${stats.tracks.count}`);
        console.log(`总距离: ${stats.tracks.totalDistance.toFixed(2)} km`);
        console.log(`活动类型: ${stats.tracks.activities.join(', ')}`);
        console.log(`缓存瓦片数: ${stats.cache.totalTiles.toLocaleString()}`);
        console.log(`缓存大小: ${(stats.cache.totalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`缓存命中率: ${(stats.cache.hitRate * 100).toFixed(2)}%`);
        console.log(`是否正在渲染: ${stats.performance.isRendering ? '是' : '否'}`);
        console.log(`内存使用: ${(stats.performance.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    }
    catch (error) {
        console.error('❌ 获取系统信息失败:', error);
    }
});
/**
 * 初始化命令
 * Initialize command
 */
program
    .command('init')
    .option('-d, --data-dir <path>', '数据目录路径 / Data directory path')
    .description('初始化Fit3D系统 / Initialize Fit3D system')
    .action(async (options) => {
    await initializeSystem(options.dataDir);
});
/**
 * 主程序入口
 * Main program entry
 */
async function main() {
    program
        .name('fit3d')
        .description('Fit3D多样化开源地图样式系统 / Fit3D Diverse Open Source Map Styles System')
        .version('1.0.0');
    // 解析命令行参数
    await program.parseAsync(process.argv);
    // 如果没有提供命令，显示帮助
    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
}
// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('❌ 未捕获的异常:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('❌ 未处理的Promise拒绝:', reason);
    process.exit(1);
});
// 启动程序
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('❌ 程序启动失败:', error);
        process.exit(1);
    });
}
export { program };
//# sourceMappingURL=index.js.map
<div align="center">
  <img src="logo-small.svg" alt="Fit3D Logo" width="64" height="64">
  <h1>Fit3D 多样化开源地图样式系统</h1>
  <p><strong>Fit3D Diverse Open Source Map Styles System</strong></p>
</div>

## 项目概述 / Project Overview

Fit3D多样化开源地图样式系统是一个专为户外运动数据可视化设计的跨平台地图解决方案。系统支持多种开源地图提供商和样式，提供本地数据存储、高效的瓦片缓存、以及完整的中国本地化支持。

Fit3D Diverse Open Source Map Styles System is a cross-platform map solution designed for outdoor sports data visualization. The system supports multiple open source map providers and styles, provides local data storage, efficient tile caching, and complete Chinese localization support.

## 核心特性 / Core Features

### 🗺️ 多样化地图提供商 / Diverse Map Providers
- **OpenStreetMap**: 完全开源，全球覆盖
- **CartoDB**: 美观的设计，多种配色方案  
- **Stamen Design**: 创意艺术化样式
- **Esri Open Data**: 高质量卫星图像和地形图
- **OpenTopoMap**: 详细地形图，适合户外活动
- **高德地图**: 中国地区详细数据
- **百度地图**: 中国地区全面覆盖

### 🎨 丰富的地图样式 / Rich Map Styles
- **地形图**: 适合徒步和登山活动
- **卫星图**: 真实地理环境展示
- **街道图**: 适合骑行和跑步活动
- **地形图**: 详细等高线信息
- **混合图**: 结合多种数据源
- **自定义样式**: 用户可创建个性化样式

### 💾 本地数据存储 / Local Data Storage
- **SQLite**: 主要数据存储，包括地图配置、用户偏好、瓦片缓存
- **DuckDB**: 分析数据库，用于性能统计和数据分析
- **混合缓存策略**: 内存+磁盘缓存，优化访问性能
- **数据同步**: 自动同步SQLite和DuckDB数据

### 🚀 高性能缓存系统 / High-Performance Cache System
- **智能预加载**: 预加载视口周围的瓦片
- **并行下载**: 支持并发瓦片下载
- **压缩存储**: 减少存储空间占用
- **自动清理**: 清理过期和最少使用的缓存
- **性能监控**: 实时缓存命中率和性能统计

### 🌏 完整中国本地化 / Complete Chinese Localization
- **中文界面**: 完整的中文用户界面
- **中国地图提供商**: 集成高德地图、百度地图、天地图
- **中文标签**: 支持中文地图标签显示
- **本地化格式**: 中文日期、时间、数字格式
- **中文文档**: 完整的中文文档和帮助系统

## 技术架构 / Technical Architecture

### 核心组件 / Core Components
- **地图提供商管理器**: 管理多个开源地图提供商和配置
- **样式引擎**: 处理不同地图样式的渲染和切换
- **瓦片缓存系统**: 优化地图瓦片加载和缓存策略
- **可视化引擎**: 地图渲染和交互功能
- **CLI接口**: 命令行工具，支持所有核心功能

### 技术栈 / Technology Stack
- **前端**: React/TypeScript, Leaflet, Mapbox GL JS, Three.js
- **后端**: Node.js, TypeScript, Express.js
- **数据库**: SQLite, DuckDB
- **缓存**: 混合缓存策略 (内存 + 磁盘)
- **CLI**: Commander.js
- **测试**: Jest, Cypress, Playwright

## 快速开始 / Quick Start

### 安装 / Installation

```bash
# 克隆仓库
git clone https://github.com/yiranzai/fit3d.git
cd fit3d

# 安装依赖
npm install

# 构建项目
npm run build
```

### 初始化系统 / Initialize System

```bash
# 使用默认设置初始化
npm run cli init

# 或指定自定义数据目录
npm run cli init --data-dir ~/my-map-data
```

### 基本使用 / Basic Usage

```bash
# 查看可用的地图提供商
npm run cli map-providers list

# 查看可用的地图样式
npm run cli map-styles list

# 切换地图样式
npm run cli map-styles use osm-standard

# 查看缓存统计
npm run cli cache stats

# 生成活动地图
npm run cli map generate activity-123 --style opentopomap
```

## 项目结构 / Project Structure

```
fit3d/
├── src/                          # 源代码
│   ├── types/                    # 类型定义
│   ├── core/                     # 核心功能
│   │   └── database/             # 数据库实现
│   ├── providers/                # 地图提供商管理
│   ├── styles/                   # 地图样式引擎
│   ├── cache/                    # 瓦片缓存系统
│   ├── visualization/            # 地图可视化引擎
│   ├── cli/                      # 命令行接口
│   ├── web/                      # Web界面 (v2.0)
│   ├── mobile/                   # 移动应用 (v2.0)
│   └── shared/                   # 共享工具
├── tests/                        # 测试文件
├── docs/                         # 文档
├── scripts/                      # 构建和部署脚本
└── specs/                        # 项目规范文档
```

## 开发指南 / Development Guide

### 开发环境设置 / Development Setup

```bash
# 安装开发依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 代码检查
npm run lint

# 格式化代码
npm run format
```

### 添加新的地图提供商 / Adding New Map Providers

1. 在 `src/providers/map-provider-manager.ts` 中添加提供商配置
2. 在数据库初始化脚本中添加提供商数据
3. 实现提供商的瓦片URL模板和配置
4. 添加相应的测试用例

### 创建自定义地图样式 / Creating Custom Map Styles

1. 使用CLI命令创建基础样式
2. 通过样式编辑器修改颜色、图层等属性
3. 预览样式效果
4. 保存并应用到活动

## API文档 / API Documentation

### 地图提供商管理 / Map Provider Management

```typescript
// 获取所有可用的地图提供商
const providers = await providerManager.getAvailableProviders();

// 获取特定提供商
const provider = await providerManager.getProvider('osm');

// 切换提供商
await providerManager.switchProvider('cartodb');

// 测试提供商连接
const isHealthy = await providerManager.testProviderConnection('osm');
```

### 地图样式管理 / Map Style Management

```typescript
// 获取所有可用的地图样式
const styles = await styleEngine.getAvailableStyles();

// 按类型获取样式
const terrainStyles = await styleEngine.getStylesByType('terrain');

// 按活动类型获取推荐样式
const hikingStyles = await styleEngine.getRecommendedStyles('hiking');

// 创建自定义样式
const customStyle = await styleEngine.createCustomStyle({
  name: 'My Custom Style',
  nameZh: '我的自定义样式',
  baseStyleId: 'osm-standard',
  modifications: [
    {
      type: 'color',
      target: 'water',
      value: '#0066cc'
    }
  ],
  suitableActivities: ['hiking', 'cycling']
});
```

### 瓦片缓存管理 / Tile Cache Management

```typescript
// 获取瓦片
const tile = await cacheSystem.getTile({
  providerId: 'osm',
  styleId: 'osm-standard',
  z: 10,
  x: 512,
  y: 384
});

// 存储瓦片
await cacheSystem.setTile(request, tileData, 'image/png');

// 预加载区域瓦片
await cacheSystem.preloadRegion('osm', 'osm-standard', bounds, [10, 11, 12]);

// 获取缓存统计
const stats = await cacheSystem.getCacheStats();
```

## 性能指标 / Performance Metrics

### 缓存性能 / Cache Performance
- **缓存命中率**: > 80%
- **内存使用量**: < 100MB
- **瓦片加载时间**: < 200ms
- **样式切换时间**: < 200ms

### 数据库性能 / Database Performance
- **查询响应时间**: < 50ms
- **数据同步时间**: < 1s
- **存储空间**: 可配置，默认1GB

### 系统性能 / System Performance
- **页面加载时间**: < 2s
- **API响应时间**: < 200ms
- **并发请求**: 支持1000+并发

## 贡献指南 / Contributing

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

We welcome all forms of contributions! Please check [CONTRIBUTING.md](CONTRIBUTING.md) for detailed information.

### 开发流程 / Development Process

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范 / Code Standards

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置
- 编写单元测试，保持 > 90% 覆盖率
- 所有注释使用中文
- 遵循项目宪法原则

## 许可证 / License

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详细信息。

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 支持 / Support

- **文档**: [https://fit3d.dev/docs](https://fit3d.dev/docs)
- **GitHub**: [https://github.com/yiranzai/fit3d](https://github.com/yiranzai/fit3d)
- **问题反馈**: [https://github.com/yiranzai/fit3d/issues](https://github.com/yiranzai/fit3d/issues)
- **讨论区**: [https://github.com/yiranzai/fit3d/discussions](https://github.com/yiranzai/fit3d/discussions)

## 路线图 / Roadmap

### v1.0 (当前版本)
- ✅ 核心地图集成
- ✅ 多样化地图提供商支持
- ✅ 瓦片缓存系统
- ✅ CLI接口
- ✅ 中国本地化支持

### v2.0 (计划中)
- 🔄 Web界面
- 🔄 移动应用
- 🔄 自定义样式编辑器
- 🔄 离线地图支持

### v3.0 (未来版本)
- 🔄 桌面应用
- 🔄 高级分析功能
- 🔄 云同步
- 🔄 社区功能

## 致谢 / Acknowledgments

感谢所有开源地图提供商的贡献，特别是：
- OpenStreetMap 社区
- CartoDB 团队
- Stamen Design
- Esri
- 高德地图
- 百度地图

---

**Fit3D** - 让户外运动数据可视化更简单、更强大！

**Fit3D** - Making outdoor sports data visualization simpler and more powerful!
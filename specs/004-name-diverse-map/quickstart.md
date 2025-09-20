# Fit3D 多样化地图样式快速开始指南

## 快速开始指南

Welcome to Fit3D's diverse map styles system! This guide will help you get started with using multiple open source map providers and styles for your outdoor activity visualization.

欢迎使用Fit3D的多样化地图样式系统！本指南将帮助您开始使用多个开源地图提供商和样式来可视化您的户外活动。

## 先决条件 / Prerequisites

### 系统要求 / System Requirements
- **Node.js**: Version 18.0 or higher
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Memory**: Minimum 4GB RAM (8GB recommended for large datasets)
- **Storage**: 2GB free space for application, map cache, and offline maps

### 支持的地图提供商 / Supported Map Providers
- **OpenStreetMap**: 完全开源，全球覆盖
- **CartoDB**: 美观的设计，多种配色方案
- **Stamen Design**: 创意艺术化样式
- **Esri Open Data**: 高质量卫星图像和地形图
- **OpenTopoMap**: 详细地形图，适合户外活动
- **高德地图**: 中国地区详细数据
- **百度地图**: 中国地区全面覆盖

## 安装 / Installation

### 选项1: CLI安装 / Option 1: CLI Installation
```bash
# 全局安装
npm install -g fit3d

# 验证安装
fit3d --version
```

### 选项2: 开发环境设置 / Option 2: Development Setup
```bash
# 克隆仓库
git clone https://github.com/your-org/fit3d.git
cd fit3d

# 安装依赖
npm install

# 构建应用程序
npm run build

# 启动CLI
npm start
```

## 第一步 / First Steps

### 1. 初始化应用程序 / Initialize the Application
```bash
# 使用默认设置初始化Fit3D
fit3d init

# 或指定自定义数据目录
fit3d init --data-dir ~/my-map-data
```

这将创建本地数据库并设置数据目录结构。

### 2. 查看可用的地图提供商 / View Available Map Providers
```bash
# 列出所有地图提供商
fit3d map-providers list

# 查看特定提供商详情
fit3d map-providers show osm
fit3d map-providers show cartodb
```

### 3. 查看可用的地图样式 / View Available Map Styles
```bash
# 列出所有地图样式
fit3d map-styles list

# 按提供商过滤样式
fit3d map-styles list --provider osm
fit3d map-styles list --provider cartodb

# 按类型过滤样式
fit3d map-styles list --type terrain
fit3d map-styles list --type satellite
```

## 基本使用 / Basic Usage

### 地图样式管理 / Map Style Management

#### 切换地图样式 / Switch Map Styles
```bash
# 切换到OpenStreetMap标准样式
fit3d map-styles use osm-standard

# 切换到CartoDB浅色样式
fit3d map-styles use cartodb-light

# 切换到地形图样式
fit3d map-styles use stamen-terrain

# 切换到卫星图像样式
fit3d map-styles use esri-world-imagery
```

#### 查看当前地图配置 / View Current Map Configuration
```bash
# 查看当前使用的地图样式
fit3d map-styles current

# 查看地图配置详情
fit3d map-styles show osm-standard
```

### 活动可视化 / Activity Visualization

#### 生成地图轨迹 / Generate Map Trajectories
```bash
# 使用默认样式生成地图
fit3d map generate activity-123

# 使用特定样式生成地图
fit3d map generate activity-123 --style stamen-terrain

# 为徒步活动生成地形图
fit3d map generate activity-123 --style opentopomap --activity hiking

# 为骑行活动生成街道图
fit3d map generate activity-123 --style cartodb-light --activity cycling
```

#### 批量生成地图 / Batch Generate Maps
```bash
# 为多个活动生成地图
fit3d map generate activity-123 activity-124 activity-125

# 为特定类别的所有活动生成地图
fit3d map generate --category hiking --style opentopomap

# 为特定类别的所有活动生成地图
fit3d map generate --category cycling --style cartodb-light
```

### 自定义地图样式 / Custom Map Styles

#### 创建自定义样式 / Create Custom Styles
```bash
# 基于现有样式创建自定义样式
fit3d map-styles create "My Hiking Style" --base opentopomap

# 创建自定义样式并配置参数
fit3d map-styles create "Blue Water Style" \
  --base osm-standard \
  --modify water-color "#0066cc" \
  --modify land-color "#90EE90"
```

#### 管理自定义样式 / Manage Custom Styles
```bash
# 列出自定义样式
fit3d map-styles list --custom

# 编辑自定义样式
fit3d map-styles edit "My Hiking Style"

# 删除自定义样式
fit3d map-styles delete "My Hiking Style"
```

### 瓦片缓存管理 / Tile Cache Management

#### 查看缓存统计 / View Cache Statistics
```bash
# 查看缓存概览
fit3d cache stats

# 查看按提供商分组的缓存统计
fit3d cache stats --by-provider

# 查看按样式分组的缓存统计
fit3d cache stats --by-style

# 查看缓存性能指标
fit3d cache stats --performance
```

#### 管理缓存 / Manage Cache
```bash
# 清理过期缓存
fit3d cache cleanup --expired

# 清理最少使用的缓存
fit3d cache cleanup --least-used

# 清理特定提供商的缓存
fit3d cache cleanup --provider osm

# 清理特定样式的缓存
fit3d cache cleanup --style osm-standard
```

#### 预加载瓦片 / Preload Tiles
```bash
# 预加载指定区域的瓦片
fit3d cache preload --bounds "39.8,116.4,39.9,116.5" --zoom 10-15

# 预加载活动区域的瓦片
fit3d cache preload --activity activity-123 --zoom 10-15

# 预加载多个活动的瓦片
fit3d cache preload --activities activity-123,activity-124 --zoom 10-15
```

### 离线地图管理 / Offline Map Management

#### 下载离线地图 / Download Offline Maps
```bash
# 下载指定区域的离线地图
fit3d offline download "Beijing Area" \
  --bounds "39.8,116.4,39.9,116.5" \
  --style osm-standard \
  --zoom 10-15

# 下载活动区域的离线地图
fit3d offline download "Hiking Trail" \
  --activity activity-123 \
  --style opentopomap \
  --zoom 10-16

# 下载多个样式的离线地图
fit3d offline download "Multi-Style Area" \
  --bounds "39.8,116.4,39.9,116.5" \
  --styles osm-standard,stamen-terrain \
  --zoom 10-15
```

#### 管理离线地图 / Manage Offline Maps
```bash
# 列出已下载的离线地图
fit3d offline list

# 查看离线地图详情
fit3d offline show "Beijing Area"

# 删除离线地图
fit3d offline delete "Beijing Area"

# 清理所有离线地图
fit3d offline cleanup
```

## 高级功能 / Advanced Features

### 地图提供商配置 / Map Provider Configuration

#### 添加自定义地图提供商 / Add Custom Map Providers
```bash
# 添加自定义地图提供商
fit3d map-providers add "My Provider" \
  --url-template "https://example.com/{z}/{x}/{y}.png" \
  --max-zoom 18 \
  --tile-size 256

# 配置中国地图提供商
fit3d map-providers add "Amap" \
  --url-template "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}" \
  --subdomains "1,2,3,4" \
  --max-zoom 18
```

#### 管理地图提供商 / Manage Map Providers
```bash
# 启用/禁用地图提供商
fit3d map-providers enable osm
fit3d map-providers disable esri

# 更新地图提供商配置
fit3d map-providers update osm --max-zoom 20

# 删除自定义地图提供商
fit3d map-providers delete "My Provider"
```

### 性能优化 / Performance Optimization

#### 缓存优化 / Cache Optimization
```bash
# 优化缓存设置
fit3d cache optimize --strategy hybrid --max-size 2GB

# 设置缓存策略
fit3d cache strategy --memory 1000 --disk 10000

# 预热缓存
fit3d cache warmup --activities activity-123,activity-124
```

#### 网络优化 / Network Optimization
```bash
# 配置并发下载数
fit3d config set max-concurrent-downloads 6

# 配置超时设置
fit3d config set download-timeout 30000

# 配置重试策略
fit3d config set max-retries 3
```

### 批量操作 / Batch Operations

#### 批量样式切换 / Batch Style Switching
```bash
# 为所有徒步活动切换到地形图
fit3d map-styles batch-switch --category hiking --style opentopomap

# 为所有骑行活动切换到街道图
fit3d map-styles batch-switch --category cycling --style cartodb-light

# 为特定日期范围的活动切换样式
fit3d map-styles batch-switch \
  --start-date 2024-01-01 \
  --end-date 2024-12-31 \
  --style stamen-terrain
```

#### 批量缓存管理 / Batch Cache Management
```bash
# 为所有活动预加载瓦片
fit3d cache batch-preload --all-activities --zoom 10-15

# 为特定类别预加载瓦片
fit3d cache batch-preload --category hiking --zoom 10-16

# 批量清理缓存
fit3d cache batch-cleanup --strategy expired --older-than 7days
```

## 配置 / Configuration

### 用户偏好设置 / User Preferences
```bash
# 查看当前设置
fit3d config list

# 设置默认地图提供商
fit3d config set default-provider osm

# 设置默认地图样式
fit3d config set default-style osm-standard

# 设置活动特定的地图偏好
fit3d config set activity-preference hiking opentopomap
fit3d config set activity-preference cycling cartodb-light

# 设置语言
fit3d config set language zh-CN

# 设置缓存目录
fit3d config set cache-directory ~/fit3d-cache
```

### 地图提供商偏好 / Map Provider Preferences
```bash
# 设置地图提供商优先级
fit3d config set provider-priority "osm,cartodb,stamen,esri"

# 设置备用地图提供商
fit3d config set fallback-provider osm

# 设置中国地图提供商
fit3d config set chinese-provider amap
```

## 故障排除 / Troubleshooting

### 常见问题 / Common Issues

#### 地图加载问题 / Map Loading Issues
```bash
# 检查地图提供商状态
fit3d map-providers status

# 测试地图提供商连接
fit3d map-providers test osm
fit3d map-providers test cartodb

# 检查网络连接
fit3d network test

# 重置地图配置
fit3d map-providers reset
```

#### 缓存问题 / Cache Issues
```bash
# 检查缓存状态
fit3d cache status

# 验证缓存完整性
fit3d cache verify

# 重建缓存索引
fit3d cache rebuild-index

# 清理损坏的缓存
fit3d cache cleanup --corrupted
```

#### 性能问题 / Performance Issues
```bash
# 检查系统性能
fit3d system-check

# 分析缓存性能
fit3d cache analyze --performance

# 优化数据库
fit3d database optimize

# 检查磁盘空间
fit3d system-check --disk-usage
```

### 获取帮助 / Getting Help
```bash
# 一般帮助
fit3d --help

# 命令特定帮助
fit3d map-styles --help
fit3d cache --help
fit3d offline --help

# 版本信息
fit3d --version

# 系统信息
fit3d system-info

# 调试模式
fit3d --debug map-styles list
```

## 示例 / Examples

### 完整工作流程 / Complete Workflow
```bash
# 1. 初始化Fit3D
fit3d init --data-dir ~/sports-data

# 2. 查看可用的地图提供商
fit3d map-providers list

# 3. 查看可用的地图样式
fit3d map-styles list

# 4. 为徒步活动设置地形图偏好
fit3d config set activity-preference hiking opentopomap

# 5. 为骑行活动设置街道图偏好
fit3d config set activity-preference cycling cartodb-light

# 6. 生成徒步活动的地形图
fit3d map generate activity-123 --style opentopomap

# 7. 生成骑行活动的街道图
fit3d map generate activity-124 --style cartodb-light

# 8. 预加载常用区域的瓦片
fit3d cache preload --bounds "39.8,116.4,39.9,116.5" --zoom 10-15

# 9. 下载离线地图
fit3d offline download "Beijing Area" \
  --bounds "39.8,116.4,39.9,116.5" \
  --style osm-standard \
  --zoom 10-15

# 10. 查看缓存统计
fit3d cache stats
```

### 中文使用 / Chinese Usage
```bash
# 设置中文语言
fit3d config set language zh-CN

# 使用中文界面
fit3d map-providers list

# 生成带中文标签的地图
fit3d map generate activity-123 --style amap-street

# 使用中国地图提供商
fit3d map-styles use amap-street
```

## 下一步 / Next Steps

1. **探索Web界面**: 使用 `fit3d serve` 启动Web服务器并打开 `http://localhost:3000`
2. **尝试移动应用**: 下载iOS/Android移动应用（v2.0版本即将推出）
3. **桌面应用程序**: 使用桌面应用获得高级功能（v3.0版本即将推出）
4. **加入社区**: 访问我们的GitHub仓库获取更新和社区支持

1. **Explore the Web Interface**: Start the web server with `fit3d serve` and open `http://localhost:3000`
2. **Try Mobile App**: Download the mobile app for iOS/Android (coming in v2.0)
3. **Desktop Application**: Use the desktop app for advanced features (coming in v3.0)
4. **Join the Community**: Visit our GitHub repository for updates and community support

## 支持 / Support

- **文档**: [https://fit3d.dev/docs](https://fit3d.dev/docs)
- **GitHub**: [https://github.com/your-org/fit3d](https://github.com/your-org/fit3d)
- **问题反馈**: [https://github.com/your-org/fit3d/issues](https://github.com/your-org/fit3d/issues)
- **讨论区**: [https://github.com/your-org/fit3d/discussions](https://github.com/your-org/fit3d/discussions)

- **Documentation**: [https://fit3d.dev/docs](https://fit3d.dev/docs)
- **GitHub**: [https://github.com/your-org/fit3d](https://github.com/your-org/fit3d)
- **Issues**: [https://github.com/your-org/fit3d/issues](https://github.com/your-org/fit3d/issues)
- **Discussions**: [https://github.com/your-org/fit3d/discussions](https://github.com/your-org/fit3d/discussions)

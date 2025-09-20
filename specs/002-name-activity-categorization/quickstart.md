# Fit3D Quick Start Guide

## 快速开始指南

Welcome to Fit3D, the cross-platform outdoor sports data management application! This guide will help you get started with importing, managing, and visualizing your outdoor activity data.

欢迎使用 Fit3D，跨平台户外运动数据管理应用程序！本指南将帮助您开始导入、管理和可视化您的户外活动数据。

## Prerequisites / 先决条件

### System Requirements / 系统要求
- **Node.js**: Version 18.0 or higher
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Memory**: Minimum 4GB RAM (8GB recommended for large datasets)
- **Storage**: 1GB free space for application and data

### Supported File Formats / 支持的文件格式
- **FIT Files**: Garmin and other fitness device exports
- **GPX Files**: GPS Exchange Format files
- **File Size**: Up to 100MB per file

## Installation / 安装

### Option 1: CLI Installation / 命令行安装
```bash
# Install globally
npm install -g fit3d

# Verify installation
fit3d --version
```

### Option 2: Development Setup / 开发环境设置
```bash
# Clone the repository
git clone https://github.com/your-org/fit3d.git
cd fit3d

# Install dependencies
npm install

# Build the application
npm run build

# Start the CLI
npm start
```

## First Steps / 第一步

### 1. Initialize the Application / 初始化应用程序
```bash
# Initialize Fit3D with default settings
fit3d init

# Or specify a custom data directory
fit3d init --data-dir ~/my-sports-data
```

This creates the local database and sets up the data directory structure.

这将创建本地数据库并设置数据目录结构。

### 2. Import Your First Activity / 导入您的第一个活动
```bash
# Import a single file
fit3d import activity.gpx

# Import multiple files
fit3d import *.fit

# Import with custom name
fit3d import activity.gpx --name "My First Hike"
```

### 3. View Your Activities / 查看您的活动
```bash
# List all activities
fit3d list

# List activities by category
fit3d list --category hiking
fit3d list --category cycling

# List with details
fit3d list --detailed
```

## Basic Usage / 基本使用

### Activity Management / 活动管理

#### View Activity Details / 查看活动详情
```bash
# View specific activity
fit3d show <activity-id>

# View with GPS points
fit3d show <activity-id> --gps-points

# View statistics
fit3d stats <activity-id>
```

#### Update Activity Information / 更新活动信息
```bash
# Rename activity
fit3d update <activity-id> --name "Updated Activity Name"

# Change category
fit3d update <activity-id> --category cycling

# Add custom metadata
fit3d update <activity-id> --metadata '{"weather": "sunny", "companions": 2}'
```

#### Delete Activities / 删除活动
```bash
# Delete single activity
fit3d delete <activity-id>

# Delete multiple activities
fit3d delete <activity-id-1> <activity-id-2>

# Delete by category
fit3d delete --category hiking --confirm
```

### Visualization / 可视化

#### Generate Map Trajectories / 生成地图轨迹
```bash
# Generate map for single activity
fit3d map <activity-id>

# Generate map for multiple activities
fit3d map <activity-id-1> <activity-id-2>

# Generate with custom style
fit3d map <activity-id> --style terrain --show-elevation

# Generate with Chinese labels
fit3d map <activity-id> --language zh-CN
```

#### Generate 3D Videos / 生成3D视频
```bash
# Generate 3D video
fit3d video <activity-id>

# Generate with custom settings
fit3d video <activity-id> --camera-angle 45 --camera-height 100 --speed 2x

# Generate with image insertions
fit3d video <activity-id> --insert-image "photo.jpg" --timestamp "2024-01-01T10:30:00Z"
```

### Analytics / 分析

#### View Statistics / 查看统计信息
```bash
# Overall statistics
fit3d analytics summary

# Statistics by category
fit3d analytics summary --category hiking

# Statistics by date range
fit3d analytics summary --start-date 2024-01-01 --end-date 2024-12-31

# Performance trends
fit3d analytics trends --metric distance --period month
```

#### Export Data / 导出数据
```bash
# Export single activity
fit3d export <activity-id> --format gpx

# Export multiple activities
fit3d export --category hiking --format json

# Export statistics
fit3d export --analytics --format csv
```

## Configuration / 配置

### User Preferences / 用户偏好设置
```bash
# View current settings
fit3d config list

# Set language
fit3d config set language zh-CN

# Set default category
fit3d config set default-category hiking

# Set auto-categorization
fit3d config set auto-categorize true

# Set data directory
fit3d config set data-directory ~/my-sports-data
```

### Category Configuration / 类别配置
```bash
# List available categories
fit3d categories list

# View category details
fit3d categories show hiking

# Add custom category (future feature)
fit3d categories add running --name "Running" --name-zh "跑步"
```

## Advanced Features / 高级功能

### Batch Operations / 批量操作
```bash
# Import entire directory
fit3d import --directory ~/Downloads/gps-files

# Generate maps for all activities
fit3d map --all --style satellite

# Generate videos for category
fit3d video --category cycling --camera-angle 30
```

### Data Management / 数据管理
```bash
# Backup data
fit3d backup --output ~/fit3d-backup.tar.gz

# Restore data
fit3d restore --input ~/fit3d-backup.tar.gz

# Clean up old data
fit3d cleanup --older-than 1year

# Optimize database
fit3d optimize
```

### Development Mode / 开发模式
```bash
# Start with debug logging
fit3d --debug import activity.gpx

# Start API server
fit3d serve --port 3000

# Run tests
fit3d test

# Generate documentation
fit3d docs
```

## Troubleshooting / 故障排除

### Common Issues / 常见问题

#### Import Errors / 导入错误
```bash
# Check file format
fit3d validate activity.gpx

# Import with verbose output
fit3d import activity.gpx --verbose

# Check file permissions
ls -la activity.gpx
```

#### Performance Issues / 性能问题
```bash
# Check database status
fit3d status

# Optimize database
fit3d optimize

# Check disk space
fit3d status --disk-usage
```

#### Visualization Problems / 可视化问题
```bash
# Check system requirements
fit3d system-check

# Test WebGL support
fit3d test-webgl

# Generate with lower resolution
fit3d video <activity-id> --resolution 720p
```

### Getting Help / 获取帮助
```bash
# General help
fit3d --help

# Command-specific help
fit3d import --help
fit3d map --help

# Version information
fit3d --version

# System information
fit3d system-info
```

## Examples / 示例

### Complete Workflow / 完整工作流程
```bash
# 1. Initialize Fit3D
fit3d init --data-dir ~/sports-data

# 2. Import hiking activities
fit3d import ~/Downloads/hiking/*.gpx

# 3. Import cycling activities
fit3d import ~/Downloads/cycling/*.fit

# 4. View all activities
fit3d list --detailed

# 5. Generate hiking map
fit3d map --category hiking --style terrain --show-elevation

# 6. Generate cycling video
fit3d video --category cycling --camera-angle 30 --speed 4x

# 7. View statistics
fit3d analytics summary --category hiking
```

### Chinese Language Usage / 中文使用
```bash
# Set Chinese language
fit3d config set language zh-CN

# Import with Chinese interface
fit3d import activity.gpx

# Generate map with Chinese labels
fit3d map <activity-id> --language zh-CN

# View Chinese help
fit3d --help --language zh-CN
```

## Next Steps / 下一步

1. **Explore the Web Interface**: Start the web server with `fit3d serve` and open `http://localhost:3000`
2. **Try Mobile App**: Download the mobile app for iOS/Android (coming in v2.0)
3. **Desktop Application**: Use the desktop app for advanced features (coming in v3.0)
4. **Join the Community**: Visit our GitHub repository for updates and community support

1. **探索Web界面**: 使用 `fit3d serve` 启动Web服务器并打开 `http://localhost:3000`
2. **尝试移动应用**: 下载iOS/Android移动应用（v2.0版本即将推出）
3. **桌面应用程序**: 使用桌面应用获得高级功能（v3.0版本即将推出）
4. **加入社区**: 访问我们的GitHub仓库获取更新和社区支持

## Support / 支持

- **Documentation**: [https://fit3d.dev/docs](https://fit3d.dev/docs)
- **GitHub**: [https://github.com/your-org/fit3d](https://github.com/your-org/fit3d)
- **Issues**: [https://github.com/your-org/fit3d/issues](https://github.com/your-org/fit3d/issues)
- **Discussions**: [https://github.com/your-org/fit3d/discussions](https://github.com/your-org/fit3d/discussions)

- **文档**: [https://fit3d.dev/docs/zh](https://fit3d.dev/docs/zh)
- **GitHub**: [https://github.com/your-org/fit3d](https://github.com/your-org/fit3d)
- **问题反馈**: [https://github.com/your-org/fit3d/issues](https://github.com/your-org/fit3d/issues)
- **讨论区**: [https://github.com/your-org/fit3d/discussions](https://github.com/your-org/fit3d/discussions)

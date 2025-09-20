# PNPM和Vite构建系统快速开始指南

## 系统要求

### 必需软件
- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Git**: >= 2.30.0

### 推荐软件
- **VS Code**: 最新版本
- **VS Code扩展**: 
  - Vite
  - TypeScript Importer
  - ESLint
  - Prettier

## 安装指南

### 1. 安装pnpm

#### 使用npm安装（一次性）
```bash
npm install -g pnpm
```

#### 使用官方安装脚本
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

#### 验证安装
```bash
pnpm --version
# 应该显示 8.x.x 或更高版本
```

### 2. 安装项目依赖

```bash
# 克隆项目（如果还没有）
git clone https://github.com/yiranzai/fit3d.git
cd fit3d

# 使用pnpm安装依赖
pnpm install
```

### 3. 验证环境

```bash
# 检查Node.js版本
node --version

# 检查pnpm版本
pnpm --version

# 检查项目依赖
pnpm list
```

## 快速开始

### 1. 初始化构建配置

```bash
# 初始化构建配置
pnpm build-config init

# 验证配置
pnpm build-config validate
```

### 2. 启动开发服务器

```bash
# 启动开发服务器
pnpm dev

# 或者指定端口
pnpm dev --port 3000
```

### 3. 构建生产版本

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 基本使用

### 开发工作流

#### 1. 日常开发
```bash
# 启动开发服务器
pnpm dev

# 在另一个终端运行测试
pnpm test

# 代码检查
pnpm lint
```

#### 2. 代码提交前
```bash
# 运行所有检查
pnpm lint
pnpm test
pnpm type-check

# 格式化代码
pnpm format
```

#### 3. 构建部署
```bash
# 构建生产版本
pnpm build

# 分析构建产物
pnpm build --analyze
```

### 依赖管理

#### 添加依赖
```bash
# 添加生产依赖
pnpm add <package-name>

# 添加开发依赖
pnpm add -D <package-name>

# 添加全局依赖
pnpm add -g <package-name>
```

#### 更新依赖
```bash
# 检查过时依赖
pnpm outdated

# 更新所有依赖
pnpm update

# 更新特定依赖
pnpm update <package-name>
```

#### 移除依赖
```bash
# 移除依赖
pnpm remove <package-name>

# 清理未使用的依赖
pnpm prune
```

### 构建配置

#### Vite配置
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
})
```

#### PNPM配置
```ini
# .npmrc
strict-peer-dependencies=false
auto-install-peers=true
prefer-frozen-lockfile=true
save-exact=true
store-dir=~/.pnpm-store
cache-dir=~/.pnpm-cache
```

## 高级功能

### 1. 工作区管理

#### 创建工作区
```bash
# 创建pnpm-workspace.yaml
echo "packages:
  - 'packages/*'
  - 'apps/*'" > pnpm-workspace.yaml
```

#### 工作区命令
```bash
# 在所有包中运行命令
pnpm -r <command>

# 在特定包中运行命令
pnpm --filter <package-name> <command>

# 添加依赖到特定包
pnpm --filter <package-name> add <dependency>
```

### 2. 性能优化

#### 构建优化
```typescript
// vite.config.ts 优化配置
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'dayjs'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
```

#### 缓存优化
```bash
# 清理pnpm缓存
pnpm store prune

# 查看缓存使用情况
pnpm store path
```

### 3. 安全审计

#### 依赖安全检查
```bash
# 运行安全审计
pnpm audit

# 修复安全问题
pnpm audit --fix

# 检查过时依赖
pnpm outdated
```

#### 依赖分析
```bash
# 分析依赖使用情况
pnpm deps analyze

# 检查未使用的依赖
pnpm deps analyze --unused
```

## 故障排除

### 常见问题

#### 1. pnpm命令未找到
```bash
# 解决方案：重新安装pnpm
npm install -g pnpm

# 或者使用npx
npx pnpm <command>
```

#### 2. 依赖安装失败
```bash
# 清理缓存和重新安装
pnpm store prune
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

#### 3. 构建失败
```bash
# 检查Node.js版本
node --version

# 检查依赖完整性
pnpm list

# 重新构建
pnpm build --force
```

#### 4. 开发服务器启动失败
```bash
# 检查端口占用
lsof -i :3000

# 使用不同端口
pnpm dev --port 3001
```

### 调试技巧

#### 1. 启用详细日志
```bash
# 启用pnpm调试日志
pnpm --loglevel debug <command>

# 启用Vite调试日志
pnpm dev --debug
```

#### 2. 检查配置
```bash
# 验证Vite配置
pnpm build-config validate

# 检查pnpm配置
pnpm config list
```

#### 3. 性能分析
```bash
# 分析构建时间
pnpm build --analyze

# 分析依赖大小
pnpm deps analyze --size
```

## 最佳实践

### 1. 项目结构
```
fit3d/
├── src/                    # 源代码
├── public/                 # 静态资源
├── dist/                   # 构建输出
├── node_modules/           # 依赖（pnpm管理）
├── package.json            # 项目配置
├── pnpm-lock.yaml         # 依赖锁定文件
├── pnpm-workspace.yaml    # 工作区配置
├── .npmrc                 # pnpm配置
├── vite.config.ts         # Vite配置
└── tsconfig.json          # TypeScript配置
```

### 2. 脚本配置
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "type-check": "tsc --noEmit"
  }
}
```

### 3. Git钩子配置
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "pnpm test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
```

## 中文本地化支持

### 1. 错误信息本地化
所有错误信息都提供中文版本：
```bash
# 英文错误信息
Error: Package manager validation failed

# 中文错误信息
错误：包管理器验证失败
```

### 2. 帮助文档本地化
```bash
# 获取中文帮助
pnpm help --lang zh-CN

# 获取命令帮助
pnpm <command> --help
```

### 3. 配置文件注释
所有配置文件都包含中文注释：
```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  // 开发服务器配置
  server: {
    port: 3000,    // 端口号
    open: true,    // 自动打开浏览器
  },
  // 构建配置
  build: {
    outDir: 'dist', // 输出目录
    sourcemap: true, // 生成sourcemap
  },
})
```

## 获取帮助

### 1. 在线文档
- [PNPM官方文档](https://pnpm.io/zh/)
- [Vite官方文档](https://cn.vitejs.dev/)
- [项目文档](https://github.com/yiranzai/fit3d)

### 2. 社区支持
- [GitHub Issues](https://github.com/yiranzai/fit3d/issues)
- [GitHub Discussions](https://github.com/yiranzai/fit3d/discussions)

### 3. 命令行帮助
```bash
# 获取pnpm帮助
pnpm help

# 获取特定命令帮助
pnpm <command> --help

# 获取Vite帮助
pnpm vite --help
```

---

**注意**: 本指南假设您已经熟悉基本的命令行操作和JavaScript/TypeScript开发。如果您是初学者，建议先学习相关基础知识。


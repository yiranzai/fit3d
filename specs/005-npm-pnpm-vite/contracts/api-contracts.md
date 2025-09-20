# PNPM和Vite构建系统API合约

## API概述

本文档定义了PNPM和Vite构建系统的所有API接口，包括REST API、CLI命令和内部服务接口。

## 基础配置

### 基础URL
```
开发环境: http://localhost:3000/api
生产环境: https://api.fit3d.dev/v1
```

### 认证
```typescript
// 请求头
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### 错误响应格式
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    messageZh: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

## REST API接口

### 构建配置管理

#### 获取构建配置
```http
GET /build-configurations
```

**响应:**
```typescript
interface BuildConfigResponse {
  data: {
    id: number;
    packageManager: 'pnpm' | 'yarn' | 'npm';
    buildTool: 'vite' | 'webpack' | 'rollup' | 'esbuild';
    nodeVersion: string;
    pnpmVersion: string;
    viteVersion: string;
    projectRoot: string;
    configFilePath?: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
```

#### 更新构建配置
```http
PUT /build-configurations/{id}
```

**请求体:**
```typescript
interface UpdateBuildConfigRequest {
  packageManager?: 'pnpm' | 'yarn' | 'npm';
  buildTool?: 'vite' | 'webpack' | 'rollup' | 'esbuild';
  nodeVersion?: string;
  pnpmVersion?: string;
  viteVersion?: string;
  configFilePath?: string;
  isActive?: boolean;
}
```

#### 创建构建配置
```http
POST /build-configurations
```

**请求体:**
```typescript
interface CreateBuildConfigRequest {
  packageManager: 'pnpm' | 'yarn' | 'npm';
  buildTool: 'vite' | 'webpack' | 'rollup' | 'esbuild';
  nodeVersion: string;
  pnpmVersion: string;
  viteVersion: string;
  projectRoot: string;
  configFilePath?: string;
}
```

### 依赖管理

#### 获取依赖列表
```http
GET /dependencies
```

**查询参数:**
- `packageManager`: 包管理器类型
- `dependencyType`: 依赖类型
- `isDev`: 是否为开发依赖
- `page`: 页码
- `limit`: 每页数量

**响应:**
```typescript
interface DependenciesResponse {
  data: DependencyInfo[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
```

#### 依赖安全审计
```http
POST /dependencies/audit
```

**响应:**
```typescript
interface SecurityAuditResponse {
  data: {
    vulnerabilities: Vulnerability[];
    summary: {
      total: number;
      high: number;
      medium: number;
      low: number;
    };
    recommendations: string[];
  };
  meta: {
    auditDate: string;
    duration: number;
  };
}
```

#### 依赖使用分析
```http
GET /dependencies/analysis
```

**响应:**
```typescript
interface DependencyAnalysisResponse {
  data: {
    totalDependencies: number;
    devDependencies: number;
    peerDependencies: number;
    unusedDependencies: string[];
    outdatedDependencies: OutdatedDependency[];
    duplicateDependencies: DuplicateDependency[];
  };
  meta: {
    analysisDate: string;
    recommendations: string[];
  };
}
```

### 构建历史

#### 获取构建历史
```http
GET /build-history
```

**查询参数:**
- `buildType`: 构建类型
- `success`: 是否成功
- `startDate`: 开始日期
- `endDate`: 结束日期
- `page`: 页码
- `limit`: 每页数量

**响应:**
```typescript
interface BuildHistoryResponse {
  data: BuildHistory[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
```

#### 创建构建记录
```http
POST /build-history
```

**请求体:**
```typescript
interface CreateBuildHistoryRequest {
  buildType: 'development' | 'production' | 'test' | 'preview';
  startTime: string;
  configUsed?: string;
  environmentVariables?: string;
}
```

#### 更新构建记录
```http
PUT /build-history/{id}
```

**请求体:**
```typescript
interface UpdateBuildHistoryRequest {
  endTime?: string;
  success?: boolean;
  errorMessage?: string;
  buildOutputPath?: string;
  bundleSizeBytes?: number;
  chunkCount?: number;
}
```

### 性能指标

#### 获取性能指标
```http
GET /performance-metrics
```

**查询参数:**
- `metricName`: 指标名称
- `environment`: 环境
- `startDate`: 开始日期
- `endDate`: 结束日期
- `aggregation`: 聚合方式 (avg, min, max, sum)

**响应:**
```typescript
interface PerformanceMetricsResponse {
  data: {
    metricName: string;
    environment: string;
    aggregatedValue: number;
    measurementCount: number;
    dateRange: {
      start: string;
      end: string;
    };
  }[];
  meta: {
    aggregationType: string;
    totalMeasurements: number;
  };
}
```

#### 记录性能指标
```http
POST /performance-metrics
```

**请求体:**
```typescript
interface CreatePerformanceMetricRequest {
  metricName: string;
  metricValue: number;
  metricUnit: string;
  buildId?: number;
  environment: 'development' | 'production' | 'ci';
}
```

### 包管理器验证

#### 验证包管理器使用
```http
POST /package-manager/validate
```

**请求体:**
```typescript
interface ValidatePackageManagerRequest {
  validationType: 'npm_detection' | 'pnpm_requirement' | 'lockfile_check';
  filePath?: string;
  commandUsed?: string;
}
```

**响应:**
```typescript
interface PackageManagerValidationResponse {
  data: {
    validationResult: boolean;
    validationMessage: string;
    suggestions?: string[];
    detectedIssues?: ValidationIssue[];
  };
  meta: {
    validationDate: string;
    validationType: string;
  };
}
```

#### 获取验证历史
```http
GET /package-manager/validation-history
```

**响应:**
```typescript
interface ValidationHistoryResponse {
  data: PackageManagerValidation[];
  meta: {
    total: number;
    successRate: number;
    lastValidation: string;
  };
}
```

## CLI命令接口

### 构建配置命令

#### 初始化构建配置
```bash
pnpm build-config init [options]
```

**选项:**
- `--package-manager <manager>`: 指定包管理器 (默认: pnpm)
- `--build-tool <tool>`: 指定构建工具 (默认: vite)
- `--node-version <version>`: 指定Node.js版本
- `--force`: 强制覆盖现有配置

#### 验证构建配置
```bash
pnpm build-config validate [options]
```

**选项:**
- `--config-file <path>`: 指定配置文件路径
- `--verbose`: 详细输出
- `--fix`: 自动修复问题

#### 更新构建配置
```bash
pnpm build-config update [options]
```

**选项:**
- `--package-manager <manager>`: 更新包管理器
- `--build-tool <tool>`: 更新构建工具
- `--version <version>`: 更新版本

### 依赖管理命令

#### 依赖审计
```bash
pnpm deps audit [options]
```

**选项:**
- `--security`: 安全审计
- `--outdated`: 检查过时依赖
- `--unused`: 检查未使用依赖
- `--format <format>`: 输出格式 (json, table, summary)

#### 依赖分析
```bash
pnpm deps analyze [options]
```

**选项:**
- `--depth <number>`: 分析深度
- `--include-dev`: 包含开发依赖
- `--export <path>`: 导出分析结果

### 构建管理命令

#### 启动开发服务器
```bash
pnpm dev [options]
```

**选项:**
- `--port <port>`: 指定端口
- `--host <host>`: 指定主机
- `--open`: 自动打开浏览器
- `--config <path>`: 指定配置文件

#### 构建生产版本
```bash
pnpm build [options]
```

**选项:**
- `--mode <mode>`: 构建模式
- `--out-dir <dir>`: 输出目录
- `--sourcemap`: 生成sourcemap
- `--analyze`: 分析构建产物

#### 预览构建结果
```bash
pnpm preview [options]
```

**选项:**
- `--port <port>`: 指定端口
- `--host <host>`: 指定主机
- `--out-dir <dir>`: 指定输出目录

### 验证命令

#### 验证包管理器
```bash
pnpm validate package-manager [options]
```

**选项:**
- `--check-npm`: 检查npm使用
- `--check-lockfile`: 检查lockfile
- `--fix`: 自动修复问题

#### 验证构建配置
```bash
pnpm validate build-config [options]
```

**选项:**
- `--config-file <path>`: 指定配置文件
- `--strict`: 严格模式
- `--fix`: 自动修复问题

## WebSocket事件

### 构建状态事件

#### 构建开始
```typescript
interface BuildStartEvent {
  type: 'build:start';
  data: {
    buildId: string;
    buildType: string;
    startTime: string;
  };
}
```

#### 构建进度
```typescript
interface BuildProgressEvent {
  type: 'build:progress';
  data: {
    buildId: string;
    progress: number;
    stage: string;
    message: string;
  };
}
```

#### 构建完成
```typescript
interface BuildCompleteEvent {
  type: 'build:complete';
  data: {
    buildId: string;
    success: boolean;
    duration: number;
    outputPath?: string;
    errorMessage?: string;
  };
}
```

### 依赖更新事件

#### 依赖安装开始
```typescript
interface DependencyInstallStartEvent {
  type: 'deps:install:start';
  data: {
    packageManager: string;
    packageCount: number;
  };
}
```

#### 依赖安装完成
```typescript
interface DependencyInstallCompleteEvent {
  type: 'deps:install:complete';
  data: {
    packageManager: string;
    duration: number;
    success: boolean;
    installedCount: number;
  };
}
```

## 错误代码

### 构建相关错误
- `BUILD_CONFIG_INVALID`: 构建配置无效
- `BUILD_TOOL_NOT_FOUND`: 构建工具未找到
- `BUILD_TIMEOUT`: 构建超时
- `BUILD_FAILED`: 构建失败

### 依赖相关错误
- `DEPENDENCY_NOT_FOUND`: 依赖未找到
- `DEPENDENCY_VERSION_CONFLICT`: 依赖版本冲突
- `DEPENDENCY_SECURITY_ISSUE`: 依赖安全问题
- `LOCKFILE_CORRUPTED`: Lockfile损坏

### 包管理器相关错误
- `PACKAGE_MANAGER_NOT_SUPPORTED`: 不支持的包管理器
- `NPM_USAGE_DETECTED`: 检测到npm使用
- `PNPM_NOT_INSTALLED`: pnpm未安装
- `PNPM_VERSION_INCOMPATIBLE`: pnpm版本不兼容

### 配置相关错误
- `CONFIG_FILE_NOT_FOUND`: 配置文件未找到
- `CONFIG_VALIDATION_FAILED`: 配置验证失败
- `CONFIG_PERMISSION_DENIED`: 配置权限不足

## 响应状态码

- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未授权
- `403 Forbidden`: 禁止访问
- `404 Not Found`: 资源未找到
- `409 Conflict`: 资源冲突
- `422 Unprocessable Entity`: 请求格式正确但语义错误
- `500 Internal Server Error`: 服务器内部错误
- `503 Service Unavailable`: 服务不可用


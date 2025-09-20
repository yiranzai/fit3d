# PNPM和Vite构建系统数据模型

## 数据库架构设计

### SQLite主数据库架构

#### 构建配置表
```sql
-- 构建配置表
CREATE TABLE build_configurations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_manager TEXT NOT NULL DEFAULT 'pnpm',
  build_tool TEXT NOT NULL DEFAULT 'vite',
  node_version TEXT NOT NULL,
  pnpm_version TEXT NOT NULL,
  vite_version TEXT NOT NULL,
  project_root TEXT NOT NULL,
  config_file_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  
  CONSTRAINT chk_package_manager CHECK (package_manager IN ('pnpm', 'yarn', 'npm')),
  CONSTRAINT chk_build_tool CHECK (build_tool IN ('vite', 'webpack', 'rollup', 'esbuild'))
);

-- 创建索引
CREATE INDEX idx_build_config_active ON build_configurations(is_active);
CREATE INDEX idx_build_config_updated ON build_configurations(updated_at);
```

#### 依赖管理记录表
```sql
-- 依赖管理记录表
CREATE TABLE dependency_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_name TEXT NOT NULL,
  version TEXT NOT NULL,
  package_manager TEXT NOT NULL DEFAULT 'pnpm',
  install_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT NOT NULL, -- 'package.json', 'pnpm-lock.yaml', 'manual'
  dependency_type TEXT NOT NULL, -- 'dependencies', 'devDependencies', 'peerDependencies'
  is_dev_dependency BOOLEAN DEFAULT 0,
  license TEXT,
  repository_url TEXT,
  homepage_url TEXT,
  
  CONSTRAINT chk_dependency_type CHECK (dependency_type IN ('dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'))
);

-- 创建索引
CREATE INDEX idx_dependency_package ON dependency_audit(package_name);
CREATE INDEX idx_dependency_manager ON dependency_audit(package_manager);
CREATE INDEX idx_dependency_install_date ON dependency_audit(install_date);
```

#### 构建历史记录表
```sql
-- 构建历史记录表
CREATE TABLE build_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  build_type TEXT NOT NULL, -- 'development', 'production', 'test'
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_ms INTEGER,
  success BOOLEAN DEFAULT 0,
  error_message TEXT,
  build_output_path TEXT,
  bundle_size_bytes INTEGER,
  chunk_count INTEGER,
  config_used TEXT, -- JSON string of config
  environment_variables TEXT, -- JSON string of env vars
  
  CONSTRAINT chk_build_type CHECK (build_type IN ('development', 'production', 'test', 'preview'))
);

-- 创建索引
CREATE INDEX idx_build_history_start_time ON build_history(start_time);
CREATE INDEX idx_build_history_success ON build_history(success);
CREATE INDEX idx_build_history_duration ON build_history(duration_ms);
```

#### 性能指标表
```sql
-- 性能指标表
CREATE TABLE performance_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  metric_unit TEXT NOT NULL,
  measurement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  build_id INTEGER,
  environment TEXT NOT NULL, -- 'development', 'production', 'ci'
  
  FOREIGN KEY (build_id) REFERENCES build_history(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX idx_performance_metric_name ON performance_metrics(metric_name);
CREATE INDEX idx_performance_measurement_date ON performance_metrics(measurement_date);
CREATE INDEX idx_performance_environment ON performance_metrics(environment);
```

#### 包管理器验证表
```sql
-- 包管理器验证表
CREATE TABLE package_manager_validation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  validation_type TEXT NOT NULL, -- 'npm_detection', 'pnpm_requirement', 'lockfile_check'
  validation_result BOOLEAN NOT NULL,
  validation_message TEXT,
  validation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  file_path TEXT,
  line_number INTEGER,
  command_used TEXT
);

-- 创建索引
CREATE INDEX idx_validation_type ON package_manager_validation(validation_type);
CREATE INDEX idx_validation_result ON package_manager_validation(validation_result);
CREATE INDEX idx_validation_date ON package_manager_validation(validation_date);
```

### DuckDB分析数据库架构

#### 构建性能分析视图
```sql
-- 构建性能分析视图
CREATE VIEW build_performance_analytics AS
SELECT 
  DATE(start_time) as build_date,
  build_type,
  AVG(duration_ms) as avg_duration_ms,
  MIN(duration_ms) as min_duration_ms,
  MAX(duration_ms) as max_duration_ms,
  COUNT(*) as build_count,
  SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_count,
  AVG(bundle_size_bytes) as avg_bundle_size,
  AVG(chunk_count) as avg_chunk_count
FROM build_history
GROUP BY DATE(start_time), build_type
ORDER BY build_date DESC, build_type;
```

#### 依赖使用分析视图
```sql
-- 依赖使用分析视图
CREATE VIEW dependency_usage_analytics AS
SELECT 
  package_name,
  COUNT(*) as usage_count,
  MAX(install_date) as last_used,
  dependency_type,
  package_manager,
  COUNT(DISTINCT version) as version_count
FROM dependency_audit
GROUP BY package_name, dependency_type, package_manager
ORDER BY usage_count DESC, last_used DESC;
```

#### 性能趋势分析视图
```sql
-- 性能趋势分析视图
CREATE VIEW performance_trend_analytics AS
SELECT 
  metric_name,
  DATE(measurement_date) as measurement_date,
  environment,
  AVG(metric_value) as avg_value,
  MIN(metric_value) as min_value,
  MAX(metric_value) as max_value,
  COUNT(*) as measurement_count
FROM performance_metrics
GROUP BY metric_name, DATE(measurement_date), environment
ORDER BY measurement_date DESC, metric_name, environment;
```

## TypeScript接口定义

### 核心配置接口
```typescript
// 构建配置接口
export interface BuildConfiguration {
  id?: number;
  packageManager: 'pnpm' | 'yarn' | 'npm';
  buildTool: 'vite' | 'webpack' | 'rollup' | 'esbuild';
  nodeVersion: string;
  pnpmVersion: string;
  viteVersion: string;
  projectRoot: string;
  configFilePath?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
}

// Vite配置接口
export interface ViteConfiguration {
  plugins: string[];
  build: {
    target: string;
    outDir: string;
    sourcemap: boolean;
    rollupOptions?: {
      output?: {
        manualChunks?: Record<string, string[]>;
      };
    };
  };
  server: {
    port: number;
    open: boolean;
    host?: string;
  };
  resolve: {
    alias: Record<string, string>;
  };
  optimizeDeps: {
    include: string[];
    exclude?: string[];
  };
}

// 依赖信息接口
export interface DependencyInfo {
  id?: number;
  packageName: string;
  version: string;
  packageManager: 'pnpm' | 'yarn' | 'npm';
  installDate: Date;
  source: 'package.json' | 'pnpm-lock.yaml' | 'manual';
  dependencyType: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';
  isDevDependency: boolean;
  license?: string;
  repositoryUrl?: string;
  homepageUrl?: string;
}
```

### 构建相关接口
```typescript
// 构建历史接口
export interface BuildHistory {
  id?: number;
  buildType: 'development' | 'production' | 'test' | 'preview';
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  success: boolean;
  errorMessage?: string;
  buildOutputPath?: string;
  bundleSizeBytes?: number;
  chunkCount?: number;
  configUsed?: string;
  environmentVariables?: string;
}

// 性能指标接口
export interface PerformanceMetric {
  id?: number;
  metricName: string;
  metricValue: number;
  metricUnit: string;
  measurementDate: Date;
  buildId?: number;
  environment: 'development' | 'production' | 'ci';
}

// 包管理器验证接口
export interface PackageManagerValidation {
  id?: number;
  validationType: 'npm_detection' | 'pnpm_requirement' | 'lockfile_check';
  validationResult: boolean;
  validationMessage?: string;
  validationDate: Date;
  filePath?: string;
  lineNumber?: number;
  commandUsed?: string;
}
```

### 工具类接口
```typescript
// 包管理器验证器接口
export interface PackageManagerValidator {
  validateNpmUsage(): Promise<ValidationResult>;
  validatePnpmRequirement(): Promise<ValidationResult>;
  validateLockfileIntegrity(): Promise<ValidationResult>;
  detectNpmCommands(): Promise<NpmCommandDetection[]>;
}

// Vite配置管理器接口
export interface ViteConfigManager {
  generateConfig(): Promise<ViteConfiguration>;
  validateConfig(config: ViteConfiguration): Promise<ValidationResult>;
  optimizeConfig(config: ViteConfiguration): Promise<ViteConfiguration>;
  getDefaultConfig(): ViteConfiguration;
}

// 依赖审计器接口
export interface DependencyAuditor {
  auditDependencies(): Promise<DependencyInfo[]>;
  checkDependencySecurity(): Promise<SecurityReport>;
  analyzeDependencyUsage(): Promise<UsageAnalysis>;
  generateDependencyReport(): Promise<DependencyReport>;
}

// 构建脚本生成器接口
export interface BuildScriptGenerator {
  generatePackageJsonScripts(): Promise<PackageJsonScripts>;
  generateViteConfig(): Promise<string>;
  generatePnpmConfig(): Promise<string>;
  generateHuskyHooks(): Promise<HuskyHooks>;
}

// 预提交钩子接口
export interface PreCommitHook {
  setupHooks(): Promise<void>;
  validateCommit(): Promise<ValidationResult>;
  runLinting(): Promise<LintResult>;
  runTests(): Promise<TestResult>;
}
```

### 辅助类型定义
```typescript
// 验证结果类型
export interface ValidationResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
  suggestions?: string[];
}

// NPM命令检测类型
export interface NpmCommandDetection {
  command: string;
  filePath: string;
  lineNumber: number;
  severity: 'error' | 'warning' | 'info';
  suggestion: string;
}

// 安全报告类型
export interface SecurityReport {
  vulnerabilities: Vulnerability[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
}

// 漏洞信息类型
export interface Vulnerability {
  packageName: string;
  version: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

// 使用分析类型
export interface UsageAnalysis {
  totalDependencies: number;
  devDependencies: number;
  peerDependencies: number;
  unusedDependencies: string[];
  outdatedDependencies: OutdatedDependency[];
  duplicateDependencies: DuplicateDependency[];
}

// 过时依赖类型
export interface OutdatedDependency {
  packageName: string;
  currentVersion: string;
  latestVersion: string;
  type: 'major' | 'minor' | 'patch';
}

// 重复依赖类型
export interface DuplicateDependency {
  packageName: string;
  versions: string[];
  locations: string[];
}

// 依赖报告类型
export interface DependencyReport {
  summary: UsageAnalysis;
  recommendations: string[];
  actionItems: ActionItem[];
}

// 行动项类型
export interface ActionItem {
  type: 'update' | 'remove' | 'add' | 'security';
  packageName: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

// 包JSON脚本类型
export interface PackageJsonScripts {
  dev: string;
  build: string;
  preview: string;
  test: string;
  lint: string;
  format: string;
  'lint:fix': string;
  'type-check': string;
}

// Husky钩子类型
export interface HuskyHooks {
  'pre-commit': string;
  'pre-push': string;
  'commit-msg': string;
}
```

## 数据初始化脚本

### 初始数据插入
```sql
-- 插入默认构建配置
INSERT INTO build_configurations (
  package_manager, 
  build_tool, 
  node_version, 
  pnpm_version, 
  vite_version, 
  project_root, 
  is_active
) VALUES (
  'pnpm',
  'vite',
  '18.0.0',
  '8.0.0',
  '5.0.0',
  '/Users/admin/work/somethings/fit3d',
  1
);

-- 插入性能基准数据
INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, environment) VALUES
('build_time_ms', 30000, 'milliseconds', 'development'),
('build_time_ms', 120000, 'milliseconds', 'production'),
('bundle_size_bytes', 2100000, 'bytes', 'production'),
('chunk_count', 15, 'count', 'production'),
('dev_server_startup_ms', 3000, 'milliseconds', 'development'),
('hot_reload_ms', 50, 'milliseconds', 'development');
```

## 性能优化策略

### 索引优化
- 为常用查询字段创建复合索引
- 定期分析查询性能并优化索引
- 使用覆盖索引减少回表查询

### 数据清理策略
- 定期清理过期的构建历史记录
- 压缩和归档旧的性能数据
- 清理无效的验证记录

### 缓存策略
- 缓存频繁查询的配置信息
- 使用内存缓存存储热点数据
- 实现智能缓存失效机制


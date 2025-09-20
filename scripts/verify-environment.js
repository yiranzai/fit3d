#!/usr/bin/env node

/**
 * 环境验证脚本
 * 验证Node.js、pnpm和Vite的版本和基本功能
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 版本要求
const REQUIREMENTS = {
  node: '18.0.0',
  pnpm: '8.0.0',
  vite: '5.0.0'
};

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function compareVersions(version1, version2) {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part > v2part) return 1;
    if (v1part < v2part) return -1;
  }
  
  return 0;
}

function checkVersion(tool, currentVersion, requiredVersion) {
  const isCompatible = compareVersions(currentVersion, requiredVersion) >= 0;
  
  if (isCompatible) {
    log(`✅ ${tool}: ${currentVersion} (要求: >= ${requiredVersion})`, 'green');
    return true;
  } else {
    log(`❌ ${tool}: ${currentVersion} (要求: >= ${requiredVersion})`, 'red');
    return false;
  }
}

function getVersion(tool) {
  try {
    const output = execSync(`${tool} --version`, { encoding: 'utf8' });
    const version = output.trim();
    // 去掉版本号前的v前缀
    return version.startsWith('v') ? version.substring(1) : version;
  } catch (error) {
    return null;
  }
}

function testBasicFunctionality() {
  log('\n🔧 测试基本功能...', 'blue');
  
  try {
    // 测试pnpm基本功能
    execSync('pnpm --help', { stdio: 'pipe' });
    log('✅ pnpm基本功能正常', 'green');
  } catch (error) {
    log('❌ pnpm基本功能异常', 'red');
    return false;
  }
  
  try {
    // 测试Vite基本功能
    execSync('npx vite --help', { stdio: 'pipe' });
    log('✅ Vite基本功能正常', 'green');
  } catch (error) {
    log('❌ Vite基本功能异常', 'red');
    return false;
  }
  
  return true;
}

function createProjectStructure() {
  log('\n📁 创建项目结构...', 'blue');
  
  const directories = [
    'src/build-system',
    'src/validators',
    'src/config-managers',
    'src/auditors',
    'src/generators',
    'tests/unit',
    'tests/integration',
    'tests/e2e',
    'scripts'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      log(`✅ 创建目录: ${dir}`, 'green');
    } else {
      log(`ℹ️  目录已存在: ${dir}`, 'yellow');
    }
  });
}

function main() {
  log('🚀 Fit3D构建系统环境验证', 'blue');
  log('='.repeat(50), 'blue');
  
  let allPassed = true;
  
  // 检查Node.js版本
  const nodeVersion = getVersion('node');
  if (!nodeVersion) {
    log('❌ Node.js未安装或不在PATH中', 'red');
    allPassed = false;
  } else {
    allPassed &= checkVersion('Node.js', nodeVersion, REQUIREMENTS.node);
  }
  
  // 检查pnpm版本
  const pnpmVersion = getVersion('pnpm');
  if (!pnpmVersion) {
    log('❌ pnpm未安装或不在PATH中', 'red');
    allPassed = false;
  } else {
    allPassed &= checkVersion('pnpm', pnpmVersion, REQUIREMENTS.pnpm);
  }
  
  // 检查Vite版本
  const viteVersion = getVersion('npx vite');
  if (!viteVersion) {
    log('❌ Vite未安装或无法访问', 'red');
    allPassed = false;
  } else {
    // 提取版本号（去掉vite/前缀）
    const version = viteVersion.split('/')[1] || viteVersion;
    allPassed &= checkVersion('Vite', version, REQUIREMENTS.vite);
  }
  
  // 测试基本功能
  if (allPassed) {
    allPassed &= testBasicFunctionality();
  }
  
  // 创建项目结构
  if (allPassed) {
    createProjectStructure();
  }
  
  log('\n' + '='.repeat(50), 'blue');
  
  if (allPassed) {
    log('🎉 环境验证通过！所有工具都已正确安装并可以正常使用。', 'green');
    process.exit(0);
  } else {
    log('❌ 环境验证失败！请检查上述错误并修复后重新运行。', 'red');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, checkVersion, getVersion };

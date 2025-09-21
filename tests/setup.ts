/**
 * 测试环境设置
 * Test Environment Setup
 */

// 设置测试超时时间
jest.setTimeout(30000);

// 模拟控制台输出，避免测试时产生过多输出
// 暂时禁用console.log的模拟以便调试
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// 模拟文件系统操作 - 只模拟特定的方法，保留其他方法
jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    // 只模拟这些方法，保留writeFileSync、readFileSync、mkdirSync和existsSync
    rmSync: jest.fn(),
  };
});

// 模拟路径操作
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...args) => args.join('/')),
}));

// 模拟操作系统信息
jest.mock('os', () => ({
  ...jest.requireActual('os'),
  homedir: jest.fn(() => '/mock/home'),
  tmpdir: jest.fn(() => '/mock/tmp'),
}));

// 测试配置文件
export const testConfig = {
  // 测试超时时间（毫秒）
  timeout: 10000,
  
  // 测试环境配置
  env: {
    NODE_ENV: 'test',
    PORT: 3000
  },
  
  // 测试覆盖率配置
  coverage: {
    enabled: true,
    threshold: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80
    }
  },
  
  // 测试报告配置
  reporters: ['console', 'json'],
  
  // 测试文件模式
  testMatch: [
    'tests/**/*.test.js'
  ],
  
  // 忽略的测试文件
  testIgnore: [
    'tests/fixtures/**',
    'tests/temp/**'
  ],
  
  // 测试前置条件
  setup: [
    'tests/setup.js'
  ],
  
  // 测试后清理
  teardown: [
    'tests/teardown.js'
  ]
}

export default testConfig
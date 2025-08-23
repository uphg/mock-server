// 测试环境设置
import fs from 'fs/promises'
import path from 'path'

console.log('🔧 设置测试环境...')

// 设置测试环境变量
process.env.NODE_ENV = 'test'

// 创建测试临时目录
const tempDir = path.join(process.cwd(), 'tests', 'temp')
try {
  await fs.mkdir(tempDir, { recursive: true })
  console.log('✓ 创建临时测试目录')
} catch (error) {
  console.warn('⚠️ 创建临时目录失败:', error.message)
}

// 检查测试依赖
const dependencies = ['supertest']
for (const dep of dependencies) {
  try {
    await import(dep)
    console.log(`✓ 测试依赖 ${dep} 可用`)
  } catch (error) {
    console.error(`❌ 缺少测试依赖: ${dep}`)
    console.error('请运行: npm install supertest')
    process.exit(1)
  }
}

// 设置全局测试配置
global.testConfig = {
  timeout: 5000,
  tempDir: tempDir
}

console.log('✅ 测试环境设置完成')

export default {}
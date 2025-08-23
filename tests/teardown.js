// 测试环境清理
import fs from 'fs/promises'
import path from 'path'

console.log('🧹 清理测试环境...')

// 清理临时文件
const tempDir = path.join(process.cwd(), 'tests', 'temp')
try {
  await fs.rmdir(tempDir, { recursive: true })
  console.log('✓ 清理临时测试目录')
} catch (error) {
  // 忽略目录不存在的错误
  if (error.code !== 'ENOENT') {
    console.warn('⚠️ 清理临时目录失败:', error.message)
  }
}

// 清理临时配置文件
const tempFiles = [
  'temp-test-config.json',
  'temp-e2e-config.json'
]

for (const file of tempFiles) {
  try {
    await fs.unlink(path.join(process.cwd(), file))
    console.log(`✓ 清理临时文件: ${file}`)
  } catch (error) {
    // 忽略文件不存在的错误
    if (error.code !== 'ENOENT') {
      console.warn(`⚠️ 清理文件失败: ${file}`, error.message)
    }
  }
}

console.log('✅ 测试环境清理完成')

export default {}
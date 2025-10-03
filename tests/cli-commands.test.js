import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import fs from 'fs/promises'
import path from 'path'
import { initCommand } from '../src/cli/init.js'

describe('CLI Commands', () => {
  let tempDir
  let originalCwd

  beforeEach(async () => {
    // 保存原始工作目录
    originalCwd = process.cwd()

    // 创建临时目录用于测试
    tempDir = path.join(process.cwd(), 'temp-cli-test')
    await fs.mkdir(tempDir, { recursive: true })

    // 切换到临时目录
    process.chdir(tempDir)
  })

  afterEach(async () => {
    // 恢复原始工作目录
    process.chdir(originalCwd)

    // 清理临时目录
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (error) {
      // 忽略清理错误
    }
  })

  describe('initCommand', () => {
    test('应该创建mock目录结构', async () => {
      const options = { dir: '.' }

      // 重定向console.log以捕获输出
      let consoleOutput = []
      const originalLog = console.log
      const originalError = console.error
      console.log = (...args) => consoleOutput.push(args.join(' '))
      console.error = (...args) => consoleOutput.push(args.join(' '))

      try {
        await initCommand(options)

        // 检查目录是否创建
        const mockDir = path.join(tempDir, 'mock')
        const dataDir = path.join(mockDir, 'data')
        const configPath = path.join(mockDir, 'mock.config.json')

        // 检查文件系统
        const mockDirExists = await fs.access(mockDir).then(() => true).catch(() => false)
        const dataDirExists = await fs.access(dataDir).then(() => true).catch(() => false)
        const configExists = await fs.access(configPath).then(() => true).catch(() => false)

        assert.strictEqual(mockDirExists, true, '应该创建mock目录')
        assert.strictEqual(dataDirExists, true, '应该创建data目录')
        assert.strictEqual(configExists, true, '应该创建配置文件')

        // 检查配置文件内容
        const configContent = await fs.readFile(configPath, 'utf-8')
        const config = JSON.parse(configContent)

        assert.ok(config.routes, '配置文件应该包含routes')
        assert.ok(Array.isArray(config.routes), 'routes应该是数组')
        assert.ok(config.routes.length > 0, '应该有示例路由')

        // 检查输出
        const outputStr = consoleOutput.join('\n')
        assert.ok(outputStr.includes('Mock server initialized successfully'), '应该显示成功消息')

      } finally {
        console.log = originalLog
        console.error = originalError
      }
    })

    test('应该处理已存在的文件', async () => {
      const options = { dir: '.' }

      // 预先创建一些文件
      const mockDir = path.join(tempDir, 'mock')
      const dataDir = path.join(mockDir, 'data')
      await fs.mkdir(dataDir, { recursive: true })

      const configPath = path.join(mockDir, 'mock.config.json')
      await fs.writeFile(configPath, '{"test": "existing"}')

      let consoleOutput = []
      const originalLog = console.log
      console.log = (...args) => consoleOutput.push(args.join(' '))

      try {
        await initCommand(options)

        const outputStr = consoleOutput.join('\n')
        assert.ok(outputStr.includes('already exists'), '应该显示文件已存在的消息')

      } finally {
        console.log = originalLog
      }
    })

    test('应该更新package.json脚本', async () => {
      const options = { dir: '.' }

      // 创建package.json
      const packageJsonPath = path.join(tempDir, 'package.json')
      const packageJson = {
        name: 'test-project',
        scripts: {}
      }
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))

      let consoleOutput = []
      const originalLog = console.log
      console.log = (...args) => consoleOutput.push(args.join(' '))

      try {
        await initCommand(options)

        // 检查package.json是否更新
        const updatedContent = await fs.readFile(packageJsonPath, 'utf-8')
        const updatedPackage = JSON.parse(updatedContent)

        assert.strictEqual(updatedPackage.scripts['mock:start'], 'mockfly dev')
        assert.strictEqual(updatedPackage.scripts['mock:docs'], 'mockfly docs --dev')

        const outputStr = consoleOutput.join('\n')
        assert.ok(outputStr.includes('已添加 package.json 脚本'), '应该显示脚本添加消息')

      } finally {
        console.log = originalLog
      }
    })
  })

  // 注意：docsCommand和startCommand的测试需要更复杂的mock设置，
  // 因为它们涉及子进程和文件系统操作
  // 在实际项目中，可能需要使用mock库来拦截spawn和fs操作
})
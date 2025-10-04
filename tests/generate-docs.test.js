import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import fs from 'fs/promises'
import path from 'path'
import { DocsPlugin } from '../plugins/docs-plugin/index.js'

describe('DocsPlugin', () => {
  let tempDir
  let originalCwd
  let docsPlugin

  beforeEach(async () => {
    // 保存原始环境
    originalCwd = process.cwd()

    // 创建临时目录和测试文件
    tempDir = path.join(process.cwd(), 'temp-docs-plugin-test')
    await fs.mkdir(tempDir, { recursive: true })

    // 创建测试配置文件
    const testConfig = {
      port: 3000,
      routes: [
        {
          path: '/test',
          method: 'GET',
          response: { message: 'test' }
        }
      ]
    }
    const configPath = path.join(tempDir, 'mock.config.json')
    await fs.writeFile(configPath, JSON.stringify(testConfig, null, 2))

    // 切换到临时目录
    process.chdir(tempDir)

    // 创建插件实例
    docsPlugin = new DocsPlugin()
  })

  afterEach(async () => {
    // 恢复原始环境
    process.chdir(originalCwd)

    // 清理临时目录
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (error) {
      // 忽略清理错误
    }
  })

  test('应该正确初始化插件', async () => {
    assert.ok(docsPlugin instanceof DocsPlugin)
    assert.strictEqual(docsPlugin.name, 'docs-plugin')
    assert.strictEqual(docsPlugin.version, '1.0.0')
  })

  test('应该返回正确的插件信息', async () => {
    const info = docsPlugin.getInfo()
    assert.deepStrictEqual(info, {
      name: 'docs-plugin',
      version: '1.0.0',
      description: 'Documentation generation plugin for Mockfly'
    })
  })

  test('应该不支持文件扩展名', async () => {
    const extensions = docsPlugin.getSupportedExtensions()
    assert.deepStrictEqual(extensions, [])
  })

  test('应该抛出错误当尝试加载数据时', async () => {
    await assert.rejects(
      async () => await docsPlugin.loadData({}, {}),
      /Docs plugin does not support data loading/
    )
  })

  test('应该生成文档', async () => {
    const testConfig = {
      port: 3000,
      routes: [
        {
          path: '/test',
          method: 'GET',
          response: { message: 'test' }
        }
      ]
    }

    const outputDir = path.join(tempDir, 'docs')
    await docsPlugin.generateDocs(testConfig, outputDir)

    // 检查文档是否生成
    const readmePath = path.join(outputDir, 'README.md')
    const routeDocPath = path.join(outputDir, 'get-test.md')

    const readmeExists = await fs.access(readmePath).then(() => true).catch(() => false)
    const routeDocExists = await fs.access(routeDocPath).then(() => true).catch(() => false)

    assert.ok(readmeExists, 'README.md should be generated')
    assert.ok(routeDocExists, 'Route documentation should be generated')
  })
})
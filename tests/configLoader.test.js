import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import fs from 'fs/promises'
import path from 'path'
import { ConfigLoader } from '../src/configLoader.js'

describe('ConfigLoader', () => {
  let tempConfigPath
  let configLoader

  beforeEach(async () => {
    // 创建临时配置文件
    tempConfigPath = path.join(process.cwd(), 'temp-test-config.json')
    const testConfig = {
      port: 3000,
      routes: [
        {
          path: '/api/test',
          method: 'GET',
          response: { message: 'test' }
        }
      ]
    }
    await fs.writeFile(tempConfigPath, JSON.stringify(testConfig, null, 2))
    configLoader = new ConfigLoader(tempConfigPath)
  })

  afterEach(async () => {
    // 清理临时文件
    try {
      await fs.unlink(tempConfigPath)
    } catch (error) {
      // 忽略文件不存在的错误
    }
  })

  test('应该成功加载有效的配置文件', async () => {
    const config = await configLoader.loadConfig()
    
    assert.strictEqual(config.port, 3000)
    assert.strictEqual(Array.isArray(config.routes), true)
    assert.strictEqual(config.routes.length, 1)
    assert.strictEqual(config.routes[0].path, '/api/test')
  })

  test('应该在配置文件不存在时抛出错误', async () => {
    const invalidLoader = new ConfigLoader('non-existent-config.json')
    
    await assert.rejects(
      async () => await invalidLoader.loadConfig(),
      /加载配置文件失败/
    )
  })

  test('应该在配置文件格式无效时抛出错误', async () => {
    await fs.writeFile(tempConfigPath, 'invalid json')
    
    await assert.rejects(
      async () => await configLoader.loadConfig(),
      /加载配置文件失败/
    )
  })

  test('应该验证必需字段', async () => {
    const invalidConfig = { port: 3000 } // 缺少 routes 字段
    await fs.writeFile(tempConfigPath, JSON.stringify(invalidConfig))
    
    await assert.rejects(
      async () => await configLoader.loadConfig(),
      /配置缺少必需字段: routes/
    )
  })

  test('应该验证路由配置', async () => {
    const invalidConfig = {
      routes: [
        { method: 'GET' } // 缺少 path 字段
      ]
    }
    await fs.writeFile(tempConfigPath, JSON.stringify(invalidConfig))
    
    await assert.rejects(
      async () => await configLoader.loadConfig(),
      /路由配置必须包含 path 字段/
    )
  })

  test('应该验证路由必须有响应或响应文件', async () => {
    const invalidConfig = {
      routes: [
        { path: '/api/test', method: 'GET' } // 缺少 response 或 responseFile
      ]
    }
    await fs.writeFile(tempConfigPath, JSON.stringify(invalidConfig))
    
    await assert.rejects(
      async () => await configLoader.loadConfig(),
      /必须包含 response 或 responseFile 字段/
    )
  })

  test('应该验证HTTP方法', async () => {
    const invalidConfig = {
      routes: [
        { 
          path: '/api/test', 
          method: 'INVALID', 
          response: { message: 'test' }
        }
      ]
    }
    await fs.writeFile(tempConfigPath, JSON.stringify(invalidConfig))
    
    await assert.rejects(
      async () => await configLoader.loadConfig(),
      /method 必须是 GET, POST, PUT, DELETE, 或 PATCH/
    )
  })

  test('应该处理响应文件导入', async () => {
    // 创建测试数据文件
    const dataDir = path.join(path.dirname(tempConfigPath), 'test-data')
    await fs.mkdir(dataDir, { recursive: true })
    const dataFile = path.join(dataDir, 'test-response.json')
    const responseData = { message: 'from file' }
    await fs.writeFile(dataFile, JSON.stringify(responseData))

    const configWithFile = {
      mockDir: './test-data',
      routes: [
        {
          path: '/api/test',
          method: 'GET',
          responseFile: 'test-response.json'
        }
      ]
    }
    await fs.writeFile(tempConfigPath, JSON.stringify(configWithFile))

    const config = await configLoader.loadConfig()
    
    assert.deepStrictEqual(config.routes[0].response, responseData)
    assert.strictEqual(config.routes[0].responseFile, undefined)

    // 清理测试文件
    await fs.unlink(dataFile)
    await fs.rmdir(dataDir)
  })

  test('应该在响应文件不存在时抛出错误', async () => {
    const configWithInvalidFile = {
      routes: [
        {
          path: '/api/test',
          method: 'GET',
          responseFile: 'non-existent.json'
        }
      ]
    }
    await fs.writeFile(tempConfigPath, JSON.stringify(configWithInvalidFile))

    await assert.rejects(
      async () => await configLoader.loadConfig(),
      /加载响应文件失败/
    )
  })
})
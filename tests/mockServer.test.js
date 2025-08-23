import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import request from 'supertest'
import path from 'path'
import { MockServer } from '../src/index.js'

describe('MockServer Integration Tests', () => {
  let mockServer
  let app

  beforeEach(async () => {
    mockServer = new MockServer()
    const configPath = path.join(process.cwd(), 'tests/fixtures/test-config.json')
    await mockServer.start(configPath)
    app = mockServer.app
  })

  afterEach(async () => {
    if (mockServer.server) {
      await new Promise((resolve) => {
        mockServer.server.close(resolve)
      })
    }
    if (mockServer.watcher) {
      await mockServer.watcher.close()
    }
  })

  test('应该启动服务器并响应健康检查', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)

    assert.strictEqual(response.body.status, 'ok')
    assert.ok(response.body.timestamp)
  })

  test('应该返回API文档', async () => {
    const response = await request(app)
      .get('/api/docs')
      .expect(200)

    assert.strictEqual(response.body.title, 'Mock API 文档')
    assert.ok(Array.isArray(response.body.routes))
    assert.ok(response.body.routes.length > 0)
  })

  test('应该从JSON文件返回数据', async () => {
    const response = await request(app)
      .get('/api/test-users')
      .expect(200)

    assert.ok(Array.isArray(response.body))
    assert.strictEqual(response.body.length, 2)
    assert.strictEqual(response.body[0].name, '测试用户1')
    assert.strictEqual(response.headers['x-total-count'], '2')
  })

  test('应该处理URL参数模板', async () => {
    const response = await request(app)
      .get('/api/test-users/123')
      .expect(200)

    assert.strictEqual(response.body.id, '123')
    assert.strictEqual(response.body.name, '测试用户123')
    assert.strictEqual(response.body.email, 'test123@example.com')
  })

  test('应该处理POST请求和请求体模板', async () => {
    const userData = {
      id: 999,
      name: '新用户',
      email: 'new@example.com'
    }

    const response = await request(app)
      .post('/api/test-users')
      .send(userData)
      .expect(201)

    assert.strictEqual(response.body.id, '999')
    assert.strictEqual(response.body.name, '新用户')
    assert.strictEqual(response.body.email, 'new@example.com')
    assert.strictEqual(response.body.created, true)
  })

  test('应该处理查询参数模板', async () => {
    const response = await request(app)
      .get('/api/search?q=测试查询')
      .expect(200)

    assert.strictEqual(response.body.query, '测试查询')
    assert.ok(Array.isArray(response.body.results))
  })

  test('应该处理自定义状态码', async () => {
    const response = await request(app)
      .get('/api/error')
      .expect(400)

    assert.strictEqual(response.body.error, 'Bad Request')
    assert.strictEqual(response.body.message, '测试错误')
  })

  test('应该处理延迟响应', async () => {
    const startTime = Date.now()
    
    await request(app)
      .get('/api/delayed')
      .expect(200)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // 应该至少延迟100ms（允许一些误差）
    assert.ok(duration >= 90, `响应时间应该至少90ms，实际: ${duration}ms`)
  })

  test('应该支持CORS', async () => {
    const response = await request(app)
      .get('/api/test-users')
      .expect(200)

    assert.ok(response.headers['access-control-allow-origin'])
  })

  test('应该处理不存在的路由', async () => {
    await request(app)
      .get('/api/non-existent')
      .expect(404)
  })

  test('应该处理JSON解析错误', async () => {
    await request(app)
      .post('/api/test-users')
      .set('Content-Type', 'application/json')
      .send('invalid json')
      .expect(400)
  })

  test('应该记录请求日志', async () => {
    // 捕获console.log输出
    const originalLog = console.log
    const logs = []
    console.log = (...args) => {
      logs.push(args.join(' '))
    }

    await request(app)
      .get('/api/test-users')
      .expect(200)

    console.log = originalLog

    // 检查是否有请求日志
    const requestLog = logs.find(log => log.includes('GET /api/test-users'))
    assert.ok(requestLog, '应该记录请求日志')
  })
})
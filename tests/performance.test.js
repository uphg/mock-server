import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import request from 'supertest'
import path from 'path'
import { MockServer } from '../src/index.js'

describe('Performance Tests', () => {
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

  test('应该在合理时间内响应简单请求', async () => {
    const startTime = Date.now()
    
    await request(app)
      .get('/api/test-users')
      .expect(200)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // 简单请求应该在100ms内完成
    assert.ok(duration < 100, `响应时间应该小于100ms，实际: ${duration}ms`)
  })

  test('应该处理并发请求', async () => {
    const concurrentRequests = 10
    const promises = []
    
    const startTime = Date.now()
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        request(app)
          .get('/api/test-users')
          .expect(200)
      )
    }
    
    const results = await Promise.all(promises)
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // 所有请求都应该成功
    assert.strictEqual(results.length, concurrentRequests)
    
    // 并发请求应该在合理时间内完成
    assert.ok(duration < 1000, `并发请求应该在1秒内完成，实际: ${duration}ms`)
    
    console.log(`✓ ${concurrentRequests}个并发请求在${duration}ms内完成`)
  })

  test('应该处理大量模板变量替换', async () => {
    const largeId = '1'.repeat(100) // 100个字符的ID
    
    const startTime = Date.now()
    
    const response = await request(app)
      .get(`/api/test-users/${largeId}`)
      .expect(200)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // 验证模板变量正确替换
    assert.strictEqual(response.body.id, largeId)
    assert.strictEqual(response.body.name, `测试用户${largeId}`)
    
    // 模板处理应该在合理时间内完成
    assert.ok(duration < 50, `模板处理应该在50ms内完成，实际: ${duration}ms`)
  })

  test('应该处理大型JSON响应', async () => {
    // 创建大型响应数据的配置
    const largeResponse = {
      data: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `用户${i}`,
        email: `user${i}@example.com`,
        metadata: {
          created: new Date().toISOString(),
          tags: [`tag${i}`, `category${i % 10}`],
          settings: {
            theme: 'dark',
            language: 'zh-CN',
            notifications: true
          }
        }
      }))
    }
    
    // 临时添加大型响应路由
    const originalRoutes = mockServer.routeGenerator.getActiveRoutes()
    mockServer.app.get('/api/large-data', (_req, res) => {
      res.json(largeResponse)
    })
    
    const startTime = Date.now()
    
    const response = await request(app)
      .get('/api/large-data')
      .expect(200)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // 验证响应数据
    assert.strictEqual(response.body.data.length, 1000)
    assert.strictEqual(response.body.data[0].name, '用户0')
    
    // 大型响应应该在合理时间内完成
    assert.ok(duration < 500, `大型响应应该在500ms内完成，实际: ${duration}ms`)
    
    console.log(`✓ 1000条记录的响应在${duration}ms内完成`)
  })

  test('应该处理复杂模板变量场景', async () => {
    const complexData = {
      user: 'testuser',
      category: 'electronics',
      filters: JSON.stringify({ price: { min: 100, max: 1000 }, brand: 'apple' })
    }
    
    const startTime = Date.now()
    
    const response = await request(app)
      .post('/api/test-users')
      .send(complexData)
      .expect(201)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // 验证复杂数据处理
    assert.ok(response.body.created)
    
    // 复杂模板处理应该在合理时间内完成
    assert.ok(duration < 100, `复杂模板处理应该在100ms内完成，实际: ${duration}ms`)
  })

  test('应该在延迟配置下保持性能', async () => {
    const startTime = Date.now()
    
    await request(app)
      .get('/api/delayed') // 配置了100ms延迟
      .expect(200)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // 应该接近配置的延迟时间（100ms），允许一些误差
    assert.ok(duration >= 90 && duration <= 150, 
      `延迟响应时间应该在90-150ms之间，实际: ${duration}ms`)
  })

  test('应该处理内存使用', async () => {
    const initialMemory = process.memoryUsage()
    
    // 执行多个请求
    const requests = 50
    const promises = []
    
    for (let i = 0; i < requests; i++) {
      promises.push(
        request(app)
          .get('/api/test-users')
          .expect(200)
      )
    }
    
    await Promise.all(promises)
    
    // 强制垃圾回收（如果可用）
    if (global.gc) {
      global.gc()
    }
    
    const finalMemory = process.memoryUsage()
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
    
    // 内存增长应该在合理范围内（小于10MB）
    const memoryIncreaseMB = memoryIncrease / 1024 / 1024
    assert.ok(memoryIncreaseMB < 10, 
      `内存增长应该小于10MB，实际: ${memoryIncreaseMB.toFixed(2)}MB`)
    
    console.log(`✓ ${requests}个请求后内存增长: ${memoryIncreaseMB.toFixed(2)}MB`)
  })
})
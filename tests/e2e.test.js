import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import request from 'supertest'
import path from 'path'
import fs from 'fs/promises'
import { MockServer } from '../src/index.js'

describe('End-to-End Tests', () => {
  let mockServer
  let app
  let tempConfigPath

  beforeEach(async () => {
    mockServer = new MockServer()
    tempConfigPath = path.join(process.cwd(), 'temp-e2e-config.json')
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
    
    // 清理临时文件
    try {
      await fs.unlink(tempConfigPath)
    } catch (error) {
      // 忽略文件不存在的错误
    }
  })

  test('应该完整地处理用户管理API流程', async () => {
    // 创建完整的用户管理配置
    const config = {
      port: 3003,
      baseUrl: '/api/v1',
      routes: [
        {
          path: '/users',
          method: 'GET',
          description: '获取用户列表',
          response: [
            { id: 1, name: '张三', email: 'zhang@example.com' },
            { id: 2, name: '李四', email: 'li@example.com' }
          ]
        },
        {
          path: '/users/:id',
          method: 'GET',
          description: '获取用户详情',
          response: {
            id: '{{params.id}}',
            name: '用户{{params.id}}',
            email: 'user{{params.id}}@example.com',
            profile: {
              age: 25,
              city: '北京'
            }
          }
        },
        {
          path: '/users',
          method: 'POST',
          description: '创建用户',
          statusCode: 201,
          response: {
            id: '{{body.id}}',
            name: '{{body.name}}',
            email: '{{body.email}}',
            created: true,
            timestamp: '2024-01-01T00:00:00Z'
          }
        },
        {
          path: '/users/:id',
          method: 'PUT',
          description: '更新用户',
          response: {
            id: '{{params.id}}',
            name: '{{body.name}}',
            email: '{{body.email}}',
            updated: true
          }
        },
        {
          path: '/users/:id',
          method: 'DELETE',
          description: '删除用户',
          statusCode: 204,
          response: {}
        }
      ]
    }

    await fs.writeFile(tempConfigPath, JSON.stringify(config, null, 2))
    await mockServer.start(tempConfigPath)
    app = mockServer.app

    // 1. 获取用户列表
    const listResponse = await request(app)
      .get('/api/v1/users')
      .expect(200)

    assert.ok(Array.isArray(listResponse.body))
    assert.strictEqual(listResponse.body.length, 2)
    assert.strictEqual(listResponse.body[0].name, '张三')

    // 2. 获取特定用户
    const userResponse = await request(app)
      .get('/api/v1/users/123')
      .expect(200)

    assert.strictEqual(userResponse.body.id, '123')
    assert.strictEqual(userResponse.body.name, '用户123')
    assert.strictEqual(userResponse.body.profile.city, '北京')

    // 3. 创建新用户
    const newUser = {
      id: 999,
      name: '新用户',
      email: 'new@example.com'
    }

    const createResponse = await request(app)
      .post('/api/v1/users')
      .send(newUser)
      .expect(201)

    assert.strictEqual(createResponse.body.id, 999)
    assert.strictEqual(createResponse.body.created, true)

    // 4. 更新用户
    const updateData = {
      name: '更新的用户',
      email: 'updated@example.com'
    }

    const updateResponse = await request(app)
      .put('/api/v1/users/123')
      .send(updateData)
      .expect(200)

    assert.strictEqual(updateResponse.body.id, '123')
    assert.strictEqual(updateResponse.body.name, '更新的用户')
    assert.strictEqual(updateResponse.body.updated, true)

    // 5. 删除用户
    await request(app)
      .delete('/api/v1/users/123')
      .expect(204)
  })

  test('应该处理电商API完整流程', async () => {
    const config = {
      port: 3004,
      baseUrl: '/api',
      routes: [
        {
          path: '/products',
          method: 'GET',
          description: '获取产品列表',
          response: {
            products: [
              { id: 1, name: 'iPhone', price: 999, category: '手机' },
              { id: 2, name: 'MacBook', price: 1999, category: '电脑' }
            ],
            total: 2,
            page: 1
          }
        },
        {
          path: '/products/search',
          method: 'GET',
          description: '搜索产品',
          response: {
            query: '{{query.q}}',
            category: '{{query.category}}',
            results: [
              {
                id: 1,
                name: '搜索结果: {{query.q}}',
                category: '{{query.category}}'
              }
            ]
          }
        },
        {
          path: '/cart',
          method: 'POST',
          description: '添加到购物车',
          response: {
            productId: '{{body.productId}}',
            quantity: '{{body.quantity}}',
            added: true,
            cartTotal: 1999
          }
        },
        {
          path: '/orders',
          method: 'POST',
          description: '创建订单',
          statusCode: 201,
          response: {
            orderId: 'ORDER-{{body.userId}}-001',
            userId: '{{body.userId}}',
            items: '{{body.items}}',
            total: '{{body.total}}',
            status: 'pending'
          }
        }
      ]
    }

    await fs.writeFile(tempConfigPath, JSON.stringify(config, null, 2))
    await mockServer.start(tempConfigPath)
    app = mockServer.app

    // 1. 浏览产品
    const productsResponse = await request(app)
      .get('/api/products')
      .expect(200)

    assert.strictEqual(productsResponse.body.total, 2)
    assert.ok(Array.isArray(productsResponse.body.products))

    // 2. 搜索产品
    const searchResponse = await request(app)
      .get('/api/products/search?q=iPhone&category=手机')
      .expect(200)

    assert.strictEqual(searchResponse.body.query, 'iPhone')
    assert.strictEqual(searchResponse.body.category, '手机')
    assert.strictEqual(searchResponse.body.results[0].name, '搜索结果: iPhone')

    // 3. 添加到购物车
    const cartData = {
      productId: 1,
      quantity: 2
    }

    const cartResponse = await request(app)
      .post('/api/cart')
      .send(cartData)
      .expect(200)

    assert.strictEqual(cartResponse.body.productId, '1')
    assert.strictEqual(cartResponse.body.quantity, '2')
    assert.strictEqual(cartResponse.body.added, true)

    // 4. 创建订单
    const orderData = {
      userId: 123,
      items: [{ productId: 1, quantity: 2 }],
      total: 1998
    }

    const orderResponse = await request(app)
      .post('/api/orders')
      .send(orderData)
      .expect(201)

    assert.strictEqual(orderResponse.body.orderId, 'ORDER-123-001')
    assert.strictEqual(orderResponse.body.status, 'pending')
  })

  test('应该处理复杂的嵌套模板变量', async () => {
    const config = {
      port: 3005,
      routes: [
        {
          path: '/complex/:userId/profile',
          method: 'POST',
          description: '复杂模板测试',
          response: {
            user: {
              id: '{{params.userId}}',
              profile: {
                name: '{{body.profile.name}}',
                email: '{{body.profile.email}}',
                preferences: {
                  theme: '{{body.preferences.theme}}',
                  language: '{{query.lang}}'
                }
              },
              metadata: {
                lastLogin: '{{body.lastLogin}}',
                source: '{{query.source}}'
              }
            },
            success: true
          }
        }
      ]
    }

    await fs.writeFile(tempConfigPath, JSON.stringify(config, null, 2))
    await mockServer.start(tempConfigPath)
    app = mockServer.app

    const complexData = {
      profile: {
        name: '复杂用户',
        email: 'complex@example.com'
      },
      preferences: {
        theme: 'dark'
      },
      lastLogin: '2024-01-01T10:00:00Z'
    }

    const response = await request(app)
      .post('/complex/456/profile?lang=zh-CN&source=mobile')
      .send(complexData)
      .expect(200)

    assert.strictEqual(response.body.user.id, '456')
    assert.strictEqual(response.body.user.profile.name, '复杂用户')
    assert.strictEqual(response.body.user.profile.email, 'complex@example.com')
    assert.strictEqual(response.body.user.profile.preferences.theme, 'dark')
    assert.strictEqual(response.body.user.profile.preferences.language, 'zh-CN')
    assert.strictEqual(response.body.user.metadata.lastLogin, '2024-01-01T10:00:00Z')
    assert.strictEqual(response.body.user.metadata.source, 'mobile')
  })

  test('应该处理错误场景和边界情况', async () => {
    const config = {
      port: 3006,
      routes: [
        {
          path: '/api/success',
          method: 'GET',
          response: { status: 'ok' }
        },
        {
          path: '/api/client-error',
          method: 'GET',
          statusCode: 400,
          response: { error: 'Bad Request' }
        },
        {
          path: '/api/server-error',
          method: 'GET',
          statusCode: 500,
          response: { error: 'Internal Server Error' }
        },
        {
          path: '/api/not-found',
          method: 'GET',
          statusCode: 404,
          response: { error: 'Not Found' }
        }
      ]
    }

    await fs.writeFile(tempConfigPath, JSON.stringify(config, null, 2))
    await mockServer.start(tempConfigPath)
    app = mockServer.app

    // 测试成功响应
    await request(app)
      .get('/api/success')
      .expect(200)

    // 测试客户端错误
    const clientErrorResponse = await request(app)
      .get('/api/client-error')
      .expect(400)
    assert.strictEqual(clientErrorResponse.body.error, 'Bad Request')

    // 测试服务器错误
    const serverErrorResponse = await request(app)
      .get('/api/server-error')
      .expect(500)
    assert.strictEqual(serverErrorResponse.body.error, 'Internal Server Error')

    // 测试404错误
    const notFoundResponse = await request(app)
      .get('/api/not-found')
      .expect(404)
    assert.strictEqual(notFoundResponse.body.error, 'Not Found')

    // 测试未定义的路由
    await request(app)
      .get('/api/undefined-route')
      .expect(404)
  })
})
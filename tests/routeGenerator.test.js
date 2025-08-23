import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert'
import express from 'express'
import { RouteGenerator } from '../src/routeGenerator.js'

describe('RouteGenerator', () => {
  let app
  let routeGenerator

  beforeEach(() => {
    app = express()
    app.use(express.json())
    routeGenerator = new RouteGenerator(app)
  })

  test('应该注册基本路由', () => {
    const config = {
      routes: [
        {
          path: '/api/test',
          method: 'GET',
          response: { message: 'test' }
        }
      ]
    }

    routeGenerator.generateRoutes(config)
    
    const activeRoutes = routeGenerator.getActiveRoutes()
    assert.strictEqual(activeRoutes.length, 1)
    assert.strictEqual(activeRoutes[0], 'get:/api/test')
  })

  test('应该处理baseUrl前缀', () => {
    const config = {
      baseUrl: '/api/v1',
      routes: [
        {
          path: '/users',
          method: 'GET',
          response: { users: [] }
        }
      ]
    }

    routeGenerator.generateRoutes(config)
    
    const activeRoutes = routeGenerator.getActiveRoutes()
    assert.strictEqual(activeRoutes[0], 'get:/api/v1/users')
  })

  test('应该处理已有baseUrl前缀的路径', () => {
    const config = {
      baseUrl: '/api/v1',
      routes: [
        {
          path: '/api/v1/users',
          method: 'GET',
          response: { users: [] }
        }
      ]
    }

    routeGenerator.generateRoutes(config)
    
    const activeRoutes = routeGenerator.getActiveRoutes()
    assert.strictEqual(activeRoutes[0], 'get:/api/v1/users')
  })

  test('应该处理模板变量 - URL参数', () => {
    const mockReq = {
      params: { id: '123' },
      query: {},
      body: {}
    }

    const template = '用户ID: {{params.id}}'
    const result = routeGenerator.processTemplate(template, mockReq)
    
    assert.strictEqual(result, '用户ID: 123')
  })

  test('应该处理模板变量 - 查询参数', () => {
    const mockReq = {
      params: {},
      query: { search: 'test' },
      body: {}
    }

    const template = '搜索: {{query.search}}'
    const result = routeGenerator.processTemplate(template, mockReq)
    
    assert.strictEqual(result, '搜索: test')
  })

  test('应该处理模板变量 - 请求体', () => {
    const mockReq = {
      params: {},
      query: {},
      body: { name: 'John' }
    }

    const template = '姓名: {{body.name}}'
    const result = routeGenerator.processTemplate(template, mockReq)
    
    assert.strictEqual(result, '姓名: John')
  })

  test('应该处理复杂对象中的模板变量', () => {
    const mockReq = {
      params: { id: '456' },
      query: { type: 'admin' },
      body: { email: 'test@example.com' }
    }

    const response = {
      user: {
        id: '{{params.id}}',
        type: '{{query.type}}',
        contact: {
          email: '{{body.email}}'
        }
      },
      metadata: {
        processed: true
      }
    }

    const result = routeGenerator.processResponse(response, mockReq)
    
    assert.deepStrictEqual(result, {
      user: {
        id: '456',
        type: 'admin',
        contact: {
          email: 'test@example.com'
        }
      },
      metadata: {
        processed: true
      }
    })
  })

  test('应该处理数组中的模板变量', () => {
    const mockReq = {
      params: { category: 'electronics' },
      query: {},
      body: {}
    }

    const response = [
      { name: 'Product 1', category: '{{params.category}}' },
      { name: 'Product 2', category: '{{params.category}}' }
    ]

    const result = routeGenerator.processResponse(response, mockReq)
    
    assert.deepStrictEqual(result, [
      { name: 'Product 1', category: 'electronics' },
      { name: 'Product 2', category: 'electronics' }
    ])
  })

  test('应该处理缺失的模板变量', () => {
    const mockReq = {
      params: {},
      query: {},
      body: {}
    }

    const template = 'ID: {{params.id}}, Name: {{body.name}}'
    const result = routeGenerator.processTemplate(template, mockReq)
    
    assert.strictEqual(result, 'ID: , Name: ')
  })

  test('应该清除现有路由', () => {
    const config1 = {
      routes: [
        { path: '/api/test1', method: 'GET', response: { message: 'test1' } }
      ]
    }
    
    const config2 = {
      routes: [
        { path: '/api/test2', method: 'GET', response: { message: 'test2' } }
      ]
    }

    routeGenerator.generateRoutes(config1)
    assert.strictEqual(routeGenerator.getActiveRoutes().length, 1)

    routeGenerator.generateRoutes(config2)
    const activeRoutes = routeGenerator.getActiveRoutes()
    assert.strictEqual(activeRoutes.length, 1)
    assert.strictEqual(activeRoutes[0], 'get:/api/test2')
  })

  test('应该支持多种HTTP方法', () => {
    const config = {
      routes: [
        { path: '/api/users', method: 'GET', response: { users: [] } },
        { path: '/api/users', method: 'POST', response: { created: true } },
        { path: '/api/users/:id', method: 'PUT', response: { updated: true } },
        { path: '/api/users/:id', method: 'DELETE', response: { deleted: true } }
      ]
    }

    routeGenerator.generateRoutes(config)
    
    const activeRoutes = routeGenerator.getActiveRoutes()
    assert.strictEqual(activeRoutes.length, 4)
    assert.ok(activeRoutes.includes('get:/api/users'))
    assert.ok(activeRoutes.includes('post:/api/users'))
    assert.ok(activeRoutes.includes('put:/api/users/:id'))
    assert.ok(activeRoutes.includes('delete:/api/users/:id'))
  })

  test('应该默认使用GET方法', () => {
    const config = {
      routes: [
        { path: '/api/test', response: { message: 'test' } } // 没有指定method
      ]
    }

    routeGenerator.generateRoutes(config)
    
    const activeRoutes = routeGenerator.getActiveRoutes()
    assert.strictEqual(activeRoutes[0], 'get:/api/test')
  })
})
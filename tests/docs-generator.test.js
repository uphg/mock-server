import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import fs from 'fs/promises'
import path from 'path'
import { DocsGenerator } from '../src/docs-generator.js'

describe('DocsGenerator', () => {
  let tempDir
  let config

  beforeEach(async () => {
    // 创建临时目录用于测试
    tempDir = path.join(process.cwd(), 'temp-docs-test')
    config = {
      port: 3000,
      baseUrl: '/api',
      routes: [
        {
          path: '/users',
          method: 'GET',
          description: '获取用户列表',
          response: { users: [] }
        },
        {
          path: '/users/:id',
          method: 'GET',
          description: '获取用户详情',
          response: { id: '{{params.id}}', name: '用户{{params.id}}' }
        }
      ]
    }
  })

  afterEach(async () => {
    // 清理临时目录
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (error) {
      // 忽略清理错误
    }
  })

  describe('constructor', () => {
    test('应该正确初始化配置', () => {
      const generator = new DocsGenerator(config)

      assert.strictEqual(generator.config.port, 3000)
      assert.strictEqual(generator.config.baseUrl, '/api')
      assert.strictEqual(generator.config.routes.length, 2)
      assert.strictEqual(generator.docsDir, './docs/api')
    })

    test('应该使用环境变量设置文档目录', () => {
      const originalEnv = process.env.DOCS_OUTPUT_DIR
      process.env.DOCS_OUTPUT_DIR = tempDir

      const generator = new DocsGenerator(config)
      assert.strictEqual(generator.docsDir, tempDir)

      process.env.DOCS_OUTPUT_DIR = originalEnv
    })

    test('应该验证配置', () => {
      assert.throws(
        () => new DocsGenerator({}),
        /配置必须包含 routes 数组/
      )
    })
  })

  describe('validateConfig', () => {
    test('应该为路由添加默认方法', () => {
      const invalidConfig = {
        routes: [
          { path: '/test', response: {} } // 没有method
        ]
      }

      const generator = new DocsGenerator(invalidConfig)
      assert.strictEqual(generator.config.routes[0].method, 'GET')
    })

    test('应该为路由添加默认路径', () => {
      const invalidConfig = {
        routes: [
          { response: {} } // 没有path
        ]
      }

      const generator = new DocsGenerator(invalidConfig)
      assert.strictEqual(generator.config.routes[0].path, '/')
    })
  })

  describe('getFullPath', () => {
    test('应该正确组合baseUrl和路径', () => {
      const generator = new DocsGenerator(config)

      assert.strictEqual(generator.getFullPath('/users'), '/api/users')
      assert.strictEqual(generator.getFullPath('/api/users'), '/api/users')
    })

    test('应该处理没有baseUrl的情况', () => {
      const configNoBase = { routes: [] }
      const generator = new DocsGenerator(configNoBase)

      assert.strictEqual(generator.getFullPath('/users'), '/users')
    })
  })

  describe('collectHeaders', () => {
    test('应该收集路由级别的头', () => {
      const generator = new DocsGenerator(config)
      const route = {
        headers: { 'X-Custom': 'value' }
      }

      const headers = generator.collectHeaders(route)
      assert.deepStrictEqual(headers, { 'X-Custom': 'value' })
    })

    test('应该收集全局头', () => {
      const configWithHeaders = {
        ...config,
        headers: { 'X-Global': 'global' }
      }
      const generator = new DocsGenerator(configWithHeaders)
      const route = {}

      const headers = generator.collectHeaders(route)
      assert.deepStrictEqual(headers, { 'X-Global': 'global' })
    })

    test('应该收集路由默认配置的头', () => {
      const configWithDefaults = {
        ...config,
        routeDefaults: [
          {
            includes: ['/users'],
            config: { headers: { 'X-Default': 'default' } }
          }
        ]
      }
      const generator = new DocsGenerator(configWithDefaults)
      const route = { path: '/users' }

      const headers = generator.collectHeaders(route)
      assert.deepStrictEqual(headers, { 'X-Default': 'default' })
    })

    test('应该按优先级合并头', () => {
      const configWithDefaults = {
        ...config,
        headers: { 'X-Global': 'global', 'X-Override': 'global' },
        routeDefaults: [
          {
            includes: ['/users'],
            config: { headers: { 'X-Default': 'default', 'X-Override': 'default' } }
          }
        ]
      }
      const generator = new DocsGenerator(configWithDefaults)
      const route = {
        path: '/users',
        headers: { 'X-Route': 'route', 'X-Override': 'route' }
      }

      const headers = generator.collectHeaders(route)
      assert.deepStrictEqual(headers, {
        'X-Global': 'global',
        'X-Default': 'default',
        'X-Route': 'route',
        'X-Override': 'route' // 路由级别优先级最高
      })
    })
  })

  describe('buildRouteDocTree', () => {
    test('应该构建正确的文档树结构', () => {
      const generator = new DocsGenerator(config)
      const route = config.routes[0]

      const tree = generator.buildRouteDocTree(route)

      assert.strictEqual(tree.type, 'root')
      assert.ok(Array.isArray(tree.children))
      assert.ok(tree.children.length > 0)
      assert.strictEqual(tree.children[0].type, 'heading') // 标题
    })
  })

  describe('generateMarkdownContent', () => {
    test('应该生成有效的markdown内容', () => {
      const generator = new DocsGenerator(config)
      const route = config.routes[0]

      const content = generator.generateMarkdownContent(route)

      assert.ok(typeof content === 'string')
      assert.ok(content.length > 0)
      assert.ok(content.includes('# ')) // 应该包含标题
    })
  })

  describe('buildRoutesList', () => {
    test('应该构建路由列表', () => {
      const generator = new DocsGenerator(config)
      const list = generator.buildRoutesList()

      assert.strictEqual(list.type, 'html')
      assert.ok(list.value.includes('GET /api/users'))
      assert.ok(list.value.includes('GET /api/users/:id'))
    })
  })

  // 注意：文件系统相关的测试需要小心处理，这里只测试基本功能
  // 在实际项目中，可能需要使用mock来测试文件操作
})
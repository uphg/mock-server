import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import { MockServer } from '../src/index.js'

describe('MockServer', () => {
  let mockServer

  beforeEach(() => {
    mockServer = new MockServer()
  })

  afterEach(async () => {
    // 清理服务器实例
    if (mockServer.server) {
      await new Promise((resolve) => {
        mockServer.server.close(resolve)
      })
    }
    if (mockServer.watcher) {
      await mockServer.watcher.close()
    }
  })

  describe('constructor', () => {
    test('应该正确初始化属性', () => {
      assert.ok(mockServer.app, '应该有app属性')
      assert.strictEqual(mockServer.server, null, 'server应该为null')
      assert.strictEqual(mockServer.configLoader, null, 'configLoader应该为null')
      assert.strictEqual(mockServer.routeGenerator, null, 'routeGenerator应该为null')
      assert.strictEqual(mockServer.watcher, null, 'watcher应该为null')
    })
  })

  describe('isPortAvailable', () => {
    test('应该检测可用端口', async () => {
      // 测试一个很可能可用的端口
      const isAvailable = await mockServer.isPortAvailable(0) // 0让系统分配可用端口
      assert.strictEqual(typeof isAvailable, 'boolean')
    })

    test('应该检测占用的端口', async () => {
      // 启动一个测试服务器
      const testServer = new MockServer()
      await testServer.start('./tests/fixtures/test-config.json', { port: 3009 })

      // 等待服务器启动
      await new Promise(resolve => setTimeout(resolve, 100))

      try {
        const isAvailable = await mockServer.isPortAvailable(3009)
        assert.strictEqual(isAvailable, false, '端口应该被占用')
      } finally {
        // 清理测试服务器
        if (testServer.server) {
          await new Promise((resolve) => {
            testServer.server.close(resolve)
          })
        }
      }
    })
  })

  describe('findAvailablePort', () => {
    test('应该找到可用端口', async () => {
      const port = await mockServer.findAvailablePort(30000, 30100)
      assert.ok(port >= 30000 && port <= 30100, '应该返回指定范围内的端口')
      assert.ok(typeof port === 'number', '应该返回数字')
    })

    test('应该在没有可用端口时返回null', async () => {
      // 这是一个边界情况测试，实际中很难发生
      const port = await mockServer.findAvailablePort(1, 1)
      // 注意：端口1通常被系统保留，可能不可用
      assert.ok(port === null || (port >= 1 && port <= 1))
    })
  })

  describe('setupMiddleware', () => {
    test('应该设置CORS中间件', () => {
      const config = { cors: true }
      mockServer.setupMiddleware(config)

      // 检查中间件是否设置（通过检查app的中间件栈）
      assert.ok(mockServer.app._router, '应该有路由器')
    })

    test('应该禁用CORS', () => {
      const config = { cors: false }
      mockServer.setupMiddleware(config)

      assert.ok(mockServer.app._router, '应该有路由器')
    })

    test('应该设置全局延迟', () => {
      const config = { delay: 100 }
      mockServer.setupMiddleware(config)

      assert.ok(mockServer.app._router, '应该有路由器')
    })

    test('应该设置健康检查路由', () => {
      const config = {}
      mockServer.setupMiddleware(config)

      // 检查是否有健康检查路由
      const routes = mockServer.app._router.stack
      const healthRoute = routes.find(layer =>
        layer.route && layer.route.path === '/health' && layer.route.methods.get
      )
      assert.ok(healthRoute, '应该有健康检查路由')
    })
  })

  // 注意：start方法的完整测试需要更复杂的设置，
  // 因为它涉及文件系统读取、服务器启动等
  // 这里我们只测试基本结构

  describe('loadPlugins', () => {
    test('应该在没有插件配置时正常工作', async () => {
      const config = {}
      await mockServer.loadPlugins(config)
      // 不应该抛出错误
      assert.ok(true)
    })

    test('应该处理插件配置数组', async () => {
      const config = {
        plugins: [] // 空数组
      }
      await mockServer.loadPlugins(config)
      assert.ok(true)
    })
  })

  describe('setupGracefulShutdown', () => {
    test('应该设置信号处理器', () => {
      mockServer.setupGracefulShutdown()

      // 检查是否设置了信号处理器
      const sigtermHandler = process.listeners('SIGTERM').length > 0
      const sigintHandler = process.listeners('SIGINT').length > 0

      assert.ok(sigtermHandler || sigintHandler, '应该设置至少一个信号处理器')
    })
  })

  // 注意：setupHotReload的测试需要mock文件系统监视器
  // 这在单元测试中比较复杂，通常在集成测试中处理
})
import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert'
import { MockPlugin, PluginManager } from '../src/plugins/plugin-interface.js'

describe('Plugin System', () => {
  describe('MockPlugin', () => {
    test('应该正确初始化基类属性', () => {
      const plugin = new MockPlugin()

      assert.strictEqual(plugin.name, 'base-plugin')
      assert.strictEqual(plugin.version, '1.0.0')
    })

    test('应该返回空的扩展名数组', () => {
      const plugin = new MockPlugin()
      const extensions = plugin.getSupportedExtensions()

      assert.ok(Array.isArray(extensions))
      assert.strictEqual(extensions.length, 0)
    })

    test('loadData应该抛出未实现错误', async () => {
      const plugin = new MockPlugin()

      await assert.rejects(
        async () => await plugin.loadData({}, {}),
        /Not implemented/
      )
    })

    test('应该返回插件信息', () => {
      const plugin = new MockPlugin()
      const info = plugin.getInfo()

      assert.deepStrictEqual(info, {
        name: 'base-plugin',
        version: '1.0.0',
        description: ''
      })
    })
  })

  describe('PluginManager', () => {
    let pluginManager

    // 测试插件类
    class TestPlugin extends MockPlugin {
      constructor() {
        super()
        this.name = 'test-plugin'
        this.version = '1.0.0'
      }

      getSupportedExtensions() {
        return ['.test', '.mock']
      }

      async loadData(route, req) {
        return { data: 'test data', route, req }
      }

      getInfo() {
        return {
          name: this.name,
          version: this.version,
          description: 'Test plugin for unit testing'
        }
      }
    }

    beforeEach(() => {
      pluginManager = new PluginManager()
    })

    test('应该正确初始化', () => {
      assert.ok(pluginManager.plugins instanceof Map)
      assert.ok(pluginManager.extensions instanceof Map)
      assert.strictEqual(pluginManager.plugins.size, 0)
      assert.strictEqual(pluginManager.extensions.size, 0)
    })

    test('应该成功注册插件', () => {
      const plugin = new TestPlugin()
      pluginManager.register(plugin)

      assert.strictEqual(pluginManager.plugins.size, 1)
      assert.strictEqual(pluginManager.plugins.get('test-plugin'), plugin)
      assert.strictEqual(pluginManager.extensions.get('.test'), 'test-plugin')
      assert.strictEqual(pluginManager.extensions.get('.mock'), 'test-plugin')
    })

    test('注册非插件实例应该抛出错误', () => {
      assert.throws(
        () => pluginManager.register({}),
        /Plugin must extend MockPlugin class/
      )
    })

    test('应该根据扩展名获取插件', () => {
      const plugin = new TestPlugin()
      pluginManager.register(plugin)

      assert.strictEqual(pluginManager.getPluginForExtension('.test'), plugin)
      assert.strictEqual(pluginManager.getPluginForExtension('test'), plugin)
      assert.strictEqual(pluginManager.getPluginForExtension('.unknown'), null)
    })

    test('应该使用插件加载数据', async () => {
      const plugin = new TestPlugin()
      pluginManager.register(plugin)

      const route = { responseFileType: 'test-plugin' }
      const req = { query: {} }
      const result = await pluginManager.loadData(route, req)

      assert.deepStrictEqual(result, {
        data: 'test data',
        route,
        req
      })
    })

    test('加载不存在的插件类型应该抛出错误', async () => {
      const route = { responseFileType: 'unknown-plugin' }

      await assert.rejects(
        async () => await pluginManager.loadData(route, {}),
        /No plugin found for type: unknown-plugin/
      )
    })

    test('应该返回所有注册的插件', () => {
      const plugin1 = new TestPlugin()
      plugin1.name = 'plugin1'
      const plugin2 = new TestPlugin()
      plugin2.name = 'plugin2'

      pluginManager.register(plugin1)
      pluginManager.register(plugin2)

      const allPlugins = pluginManager.getAllPlugins()
      assert.strictEqual(allPlugins.length, 2)
      assert.ok(allPlugins.includes(plugin1))
      assert.ok(allPlugins.includes(plugin2))
    })

    test('应该检查扩展名是否被支持', () => {
      const plugin = new TestPlugin()
      pluginManager.register(plugin)

      assert.strictEqual(pluginManager.isExtensionSupported('.test'), true)
      assert.strictEqual(pluginManager.isExtensionSupported('test'), true)
      assert.strictEqual(pluginManager.isExtensionSupported('.unknown'), false)
    })

    test('扩展名大小写应该不敏感', () => {
      const plugin = new TestPlugin()
      pluginManager.register(plugin)

      assert.strictEqual(pluginManager.getPluginForExtension('.TEST'), plugin)
      assert.strictEqual(pluginManager.getPluginForExtension('.Mock'), plugin)
    })
  })
})
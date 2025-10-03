import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert'
import { createHandler, tryParseValue, getNetworkUrls } from '../src/utils/route.js'

describe('Route Utils', () => {
  describe('createHandler', () => {
    let mockReq
    let mockRes
    let route
    let globalConfig

    beforeEach(() => {
      mockReq = {
        query: {},
        params: {},
        body: {},
        headers: {},
        method: 'GET',
        url: '/test',
        path: '/test'
      }

      mockRes = {
        status: function(code) { this.statusCode = code; return this },
        json: function(data) { this.data = data; return this },
        setHeader: function(key, value) { this.headers = this.headers || {}; this.headers[key] = value }
      }

      route = {
        path: '/test',
        response: { message: 'test' }
      }

      globalConfig = {
        mockDir: './mock/data'
      }
    })

    test('应该创建处理函数', async () => {
      const handler = createHandler(route, globalConfig)
      assert.ok(typeof handler === 'function')
    })

    test('应该处理基本JSON响应', async () => {
      const handler = createHandler(route, globalConfig)
      await handler(mockReq, mockRes)

      assert.strictEqual(mockRes.statusCode, 200)
      assert.deepStrictEqual(mockRes.data, { message: 'test' })
    })

    test('应该处理自定义状态码', async () => {
      route.statusCode = 201
      const handler = createHandler(route, globalConfig)
      await handler(mockReq, mockRes)

      assert.strictEqual(mockRes.statusCode, 201)
    })

    test('应该处理自定义头', async () => {
      route.headers = { 'X-Custom': 'value' }
      const handler = createHandler(route, globalConfig)
      await handler(mockReq, mockRes)

      assert.strictEqual(mockRes.headers['X-Custom'], 'value')
    })

    test('应该处理延迟', async () => {
      route.delay = 10
      const handler = createHandler(route, globalConfig)

      const startTime = Date.now()
      await handler(mockReq, mockRes)
      const endTime = Date.now()

      assert.ok(endTime - startTime >= 10)
    })

    test('应该处理函数响应', async () => {
      route.response = (req) => ({ path: req.path })
      const handler = createHandler(route, globalConfig)
      await handler(mockReq, mockRes)

      assert.deepStrictEqual(mockRes.data, { path: '/test' })
    })

    // 注意：blob响应和插件响应的测试需要更复杂的mock设置
    // 这里我们主要测试基本功能
  })

  describe('tryParseValue', () => {
    test('应该解析布尔值', () => {
      assert.strictEqual(tryParseValue('true'), true)
      assert.strictEqual(tryParseValue('false'), false)
    })

    test('应该解析null和undefined', () => {
      assert.strictEqual(tryParseValue('null'), null)
      assert.strictEqual(tryParseValue('undefined'), undefined)
    })

    test('应该解析JSON数组', () => {
      const input = '[1, 2, 3]'
      const result = tryParseValue(input)
      assert.deepStrictEqual(result, [1, 2, 3])
    })

    test('应该解析JSON对象', () => {
      const input = '{"key": "value"}'
      const result = tryParseValue(input)
      assert.deepStrictEqual(result, { key: 'value' })
    })

    test('应该处理无效JSON', () => {
      const input = '{"invalid": json}'
      const result = tryParseValue(input)
      assert.strictEqual(result, input)
    })

    test('应该保留包含模板语法的字符串', () => {
      const input = '{{variable}}'
      const result = tryParseValue(input)
      assert.strictEqual(result, input)
    })

    test('应该返回非字符串值不变', () => {
      assert.strictEqual(tryParseValue(123), 123)
      assert.strictEqual(tryParseValue(null), null)
      assert.deepStrictEqual(tryParseValue([1, 2, 3]), [1, 2, 3])
    })
  })

  describe('getNetworkUrls', () => {
    test('应该返回网络URL数组', () => {
      const urls = getNetworkUrls(3000, '/api')
      assert.ok(Array.isArray(urls))
    })

    test('应该正确格式化URL', () => {
      // 注意：这个测试依赖于系统的网络接口
      // 在CI环境中可能没有外部网络接口
      const urls = getNetworkUrls(8080, '/test')

      urls.forEach(url => {
        assert.ok(url.startsWith('http://'))
        assert.ok(url.includes(':8080'))
        assert.ok(url.endsWith('/test'))
      })
    })

    test('应该处理错误情况', () => {
      // Mock require to throw error
      const originalRequire = global.require
      global.require = () => { throw new Error('Mock error') }

      const urls = getNetworkUrls(3000, '/api')
      assert.deepStrictEqual(urls, [])

      global.require = originalRequire
    })
  })
})
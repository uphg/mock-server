import { test, describe } from 'node:test'
import assert from 'node:assert'
import {
  validateConfig,
  applyRouteDefaults,
  convertSimpleWildcard
} from '../src/utils/config.js'

describe('Config Utils', () => {
  describe('validateConfig', () => {
    test('应该验证有效的配置', () => {
      const config = {
        routes: [
          { path: '/test', response: { message: 'test' } }
        ]
      }

      assert.doesNotThrow(() => validateConfig(config))
    })

    test('应该在缺少必需字段时抛出错误', () => {
      const config = {} // 缺少routes

      assert.throws(
        () => validateConfig(config),
        /配置缺少必需字段: routes/
      )
    })

    test('应该在routes不是数组时抛出错误', () => {
      const config = { routes: 'not an array' }

      assert.throws(
        () => validateConfig(config),
        /routes 必须是数组/
      )
    })

    test('应该验证路由配置', () => {
      const config = {
        routes: [
          {} // 缺少path
        ]
      }

      assert.throws(
        () => validateConfig(config),
        /路由配置必须包含 path 字段/
      )
    })

    test('应该验证路由必须有response或responseFile', () => {
      const config = {
        routes: [
          { path: '/test' } // 缺少response和responseFile
        ]
      }

      assert.throws(
        () => validateConfig(config),
        /必须包含 response 或 responseFile 字段/
      )
    })

    test('应该验证HTTP方法', () => {
      const config = {
        routes: [
          { path: '/test', method: 'INVALID', response: {} }
        ]
      }

      assert.throws(
        () => validateConfig(config),
        /method 必须是 GET, POST, PUT, DELETE, 或 PATCH/
      )
    })
  })

  describe('applyRouteDefaults', () => {
    test('应该在没有routeDefaults时直接返回', () => {
      const config = {
        routes: [{ path: '/test', response: {} }]
      }

      assert.doesNotThrow(() => applyRouteDefaults(config))
    })

    test('应该应用全局默认配置', () => {
      const config = {
        delay: 100,
        headers: { 'X-Global': 'global' },
        routes: [
          { path: '/test', response: {} }
        ]
      }

      applyRouteDefaults(config)

      assert.strictEqual(config.routes[0].delay, 100)
      assert.deepStrictEqual(config.routes[0].headers, { 'X-Global': 'global' })
    })

    test('应该应用路由默认配置', () => {
      const config = {
        routeDefaults: [
          {
            includes: ['/api/*'],
            config: { delay: 200, headers: { 'X-Default': 'default' } }
          }
        ],
        routes: [
          { path: '/api/test', response: {} }
        ]
      }

      applyRouteDefaults(config)

      assert.strictEqual(config.routes[0].delay, 200)
      assert.deepStrictEqual(config.routes[0].headers, { 'X-Default': 'default' })
    })
  })

  describe('convertSimpleWildcard', () => {
    test('应该转换单独的*', () => {
      assert.strictEqual(convertSimpleWildcard('*'), '/*path')
    })

    test('应该转换末尾的*', () => {
      assert.strictEqual(convertSimpleWildcard('/api/*'), '/api/*path')
    })

    test('应该转换中间的*', () => {
      assert.strictEqual(convertSimpleWildcard('/files/*/docs'), '/files/*segment/docs')
    })

    test('应该转换多个*', () => {
      assert.strictEqual(convertSimpleWildcard('/a/*/b/*/c'), '/a/*segment/b/*segment/c')
    })
  })
})
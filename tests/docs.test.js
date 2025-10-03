import { test, describe } from 'node:test'
import assert from 'node:assert'
import {
  generateFileName,
  extractParams,
  buildRequestExample,
  buildResponseExample,
  buildErrorResponse,
  buildBasicInfo,
  buildRequestParams,
  flattenArray
} from '../src/utils/docs.js'

describe('Documentation Utils', () => {
  describe('generateFileName', () => {
    test('应该为GET请求生成正确的文件名', () => {
      const route = { path: '/api/users', method: 'GET' }
      const result = generateFileName(route)
      assert.strictEqual(result, 'get-api-users.md')
    })

    test('应该为POST请求生成正确的文件名', () => {
      const route = { path: '/api/users', method: 'POST' }
      const result = generateFileName(route)
      assert.strictEqual(result, 'post-api-users.md')
    })

    test('应该处理路径参数', () => {
      const route = { path: '/api/users/:id', method: 'GET' }
      const result = generateFileName(route)
      assert.strictEqual(result, 'get-api-users-id.md')
    })

    test('应该处理可选参数', () => {
      const route = { path: '/api/users{/:id}', method: 'GET' }
      const result = generateFileName(route)
      assert.strictEqual(result, 'get-api-users-id.md')
    })

    test('应该处理通配符', () => {
      const route = { path: '/api/*path', method: 'GET' }
      const result = generateFileName(route)
      assert.strictEqual(result, 'get-api-wildcardpath.md')
    })

    test('应该处理特殊字符', () => {
      const route = { path: '/api/users@123', method: 'GET' }
      const result = generateFileName(route)
      assert.strictEqual(result, 'get-api-users123.md')
    })

    test('应该处理空路径', () => {
      const route = { path: '', method: 'GET' }
      const result = generateFileName(route)
      assert.strictEqual(result, 'get-root.md')
    })

    test('应该默认使用GET方法', () => {
      const route = { path: '/api/test' }
      const result = generateFileName(route)
      assert.strictEqual(result, 'get-api-test.md')
    })
  })

  describe('extractParams', () => {
    test('应该从路径参数中提取参数', () => {
      const route = { path: '/api/users/:id/posts/:postId' }
      const params = extractParams(route)

      assert.strictEqual(params.length, 2)
      assert.ok(params.find(p => p.name === 'id' && p.type === 'path'))
      assert.ok(params.find(p => p.name === 'postId' && p.type === 'path'))
    })

    test('应该从模板中提取查询参数', () => {
      const route = {
        path: '/api/search',
        response: { query: '{{query.q}}', category: '{{query.category}}' }
      }
      const params = extractParams(route)

      assert.ok(params.find(p => p.name === 'q' && p.type === 'query'))
      assert.ok(params.find(p => p.name === 'category' && p.type === 'query'))
    })

    test('应该从模板中提取请求体参数', () => {
      const route = {
        path: '/api/users',
        response: { name: '{{body.name}}', email: '{{body.email}}' }
      }
      const params = extractParams(route)

      assert.ok(params.find(p => p.name === 'name' && p.type === 'body'))
      assert.ok(params.find(p => p.name === 'email' && p.type === 'body'))
    })

    test('应该从模板中提取路径参数', () => {
      const route = {
        path: '/api/users',
        response: { userId: '{{params.id}}' }
      }
      const params = extractParams(route)

      assert.ok(params.find(p => p.name === 'id' && p.type === 'params'))
    })

    test('应该处理通配符参数', () => {
      const route = { path: '/api/*path' }
      const params = extractParams(route)

      assert.ok(params.find(p => p.name === 'path' && p.type === 'path'))
    })

    test('应该避免重复参数', () => {
      const route = {
        path: '/api/users',
        response: { id: '{{params.id}}', name: '{{body.name}}', query: '{{query.q}}', again: '{{params.id}}' }
      }
      const params = extractParams(route)

      const idParams = params.filter(p => p.name === 'id' && p.type === 'params')
      assert.strictEqual(idParams.length, 1) // 只应该有一个id参数（params类型）
    })
  })

  describe('buildRequestExample', () => {
    test('应该为POST请求生成请求示例', () => {
      const route = {
        response: { id: '{{body.id}}', name: '{{body.name}}' }
      }
      const result = buildRequestExample(route, 'POST')

      assert.strictEqual(result.length, 2)
      assert.strictEqual(result[0].type, 'heading')
      assert.strictEqual(result[1].type, 'code')
    })

    test('应该为非POST请求返回空数组', () => {
      const route = { response: { data: 'test' } }
      const result = buildRequestExample(route, 'GET')

      assert.deepStrictEqual(result, [])
    })

    test('应该在没有请求体参数时返回空数组', () => {
      const route = { response: { data: 'static' } }
      const result = buildRequestExample(route, 'POST')

      assert.deepStrictEqual(result, [])
    })
  })

  describe('buildResponseExample', () => {
    test('应该生成响应示例', () => {
      const route = { response: { id: 1, name: 'test' } }
      const result = buildResponseExample(route)

      assert.strictEqual(result.length, 2)
      assert.strictEqual(result[0].type, 'heading')
      assert.strictEqual(result[1].type, 'code')
    })

    test('应该处理模板变量', () => {
      const route = { response: { id: '{{params.id}}', name: '{{query.name}}' } }
      const result = buildResponseExample(route)

      assert.strictEqual(result.length, 2)
      const codeContent = result[1].value
      assert.ok(codeContent.includes('"id": "123"'))
      assert.ok(codeContent.includes('"name": "搜索关键词"'))
    })

    test('应该处理blob响应类型', () => {
      const route = {
        responseType: 'blob',
        contentType: 'application/pdf',
        fileName: 'document.pdf'
      }
      const result = buildResponseExample(route)

      assert.strictEqual(result.length, 2)
      const codeContent = result[1].value
      const parsed = JSON.parse(codeContent)
      assert.strictEqual(parsed.contentType, 'application/pdf')
      assert.strictEqual(parsed.fileName, 'document.pdf')
    })

    test('应该在没有响应时返回空数组', () => {
      const route = {}
      const result = buildResponseExample(route)

      assert.deepStrictEqual(result, [])
    })
  })

  describe('buildErrorResponse', () => {
    test('应该为正常响应生成错误响应部分', () => {
      const route = { statusCode: 200 }
      const result = buildErrorResponse(route)

      assert.strictEqual(result.length, 3)
      assert.strictEqual(result[0].type, 'heading')
      assert.strictEqual(result[1].type, 'paragraph')
      assert.strictEqual(result[2].type, 'code')
    })

    test('应该为错误响应返回空数组', () => {
      const route = { statusCode: 400 }
      const result = buildErrorResponse(route)

      assert.deepStrictEqual(result, [])
    })
  })

  describe('buildBasicInfo', () => {
    test('应该生成基本信息', () => {
      const route = {
        description: '获取用户列表',
        statusCode: 201,
        delay: 100
      }
      const result = buildBasicInfo(route, 'GET', '/api/users')

      assert.strictEqual(result.type, 'html')
      assert.ok(result.value.includes('基本信息'))
      assert.ok(result.value.includes('获取用户列表'))
      assert.ok(result.value.includes('201'))
      assert.ok(result.value.includes('100ms'))
    })

    test('应该处理没有描述的路由', () => {
      const route = {
        statusCode: 200 // 没有描述，但有状态码
      }
      const result = buildBasicInfo(route, 'GET', '/api/test')

      assert.strictEqual(result.type, 'html')
      assert.ok(result.value.includes('基本信息'))
      // 没有描述时不应该包含描述行
      assert.ok(!result.value.includes('暂无描述'))
    })
  })

  describe('buildRequestParams', () => {
    test('应该生成请求参数部分', () => {
      const route = {
        path: '/api/users/:id',
        response: { name: '{{body.name}}', search: '{{query.q}}' }
      }
      const result = buildRequestParams(route, 'POST')

      assert.ok(Array.isArray(result))
      assert.ok(result.length > 0)
    })

    test('应该在没有参数时返回空数组', () => {
      const route = { path: '/api/simple', response: { data: 'static' } }
      const result = buildRequestParams(route, 'GET')

      assert.deepStrictEqual(result, [])
    })
  })

  describe('flattenArray', () => {
    test('应该扁平化数组并过滤空值', () => {
      const input = [1, null, [2, 3], undefined, 4]
      const result = flattenArray(input)

      assert.deepStrictEqual(result, [1, 2, 3, 4])
    })

    test('应该处理非数组输入', () => {
      assert.deepStrictEqual(flattenArray('test'), ['test'])
      assert.deepStrictEqual(flattenArray(null), [])
      assert.deepStrictEqual(flattenArray(undefined), [])
    })
  })
})
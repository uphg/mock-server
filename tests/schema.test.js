import { test, describe } from 'node:test'
import assert from 'node:assert'
import { mockConfigSchema } from '../src/schema.js'

describe('Schema Validation', () => {
  test('应该定义正确的配置结构', () => {
    assert.strictEqual(mockConfigSchema.type, 'object')
    assert.ok(mockConfigSchema.properties)
    assert.ok(Array.isArray(mockConfigSchema.required))
    assert.ok(mockConfigSchema.required.includes('routes'))
  })

  test('应该包含所有必要的属性定义', () => {
    const properties = mockConfigSchema.properties
    
    // 检查基本属性
    assert.ok(properties.port)
    assert.ok(properties.baseUrl)
    assert.ok(properties.delay)
    assert.ok(properties.cors)
    assert.ok(properties.mockDir)
    assert.ok(properties.routes)
    
    // 检查端口配置
    assert.strictEqual(properties.port.type, 'number')
    assert.strictEqual(properties.port.default, 3000)
    
    // 检查延迟配置
    assert.strictEqual(properties.delay.type, 'number')
    assert.strictEqual(properties.delay.default, 0)
    assert.strictEqual(properties.delay.minimum, 0)
    
    // 检查CORS配置
    assert.strictEqual(properties.cors.type, 'boolean')
    assert.strictEqual(properties.cors.default, true)
  })

  test('应该正确定义路由结构', () => {
    const routesSchema = mockConfigSchema.properties.routes
    
    assert.strictEqual(routesSchema.type, 'array')
    assert.ok(routesSchema.items)
    assert.strictEqual(routesSchema.items.type, 'object')
    
    const routeProperties = routesSchema.items.properties
    
    // 检查路由属性
    assert.ok(routeProperties.path)
    assert.ok(routeProperties.method)
    assert.ok(routeProperties.description)
    assert.ok(routeProperties.response)
    assert.ok(routeProperties.responseFile)
    assert.ok(routeProperties.statusCode)
    assert.ok(routeProperties.delay)
    assert.ok(routeProperties.headers)
    
    // 检查路径是必需的
    assert.ok(routesSchema.items.required.includes('path'))
    
    // 检查HTTP方法枚举
    assert.ok(routeProperties.method.enum)
    assert.ok(routeProperties.method.enum.includes('GET'))
    assert.ok(routeProperties.method.enum.includes('POST'))
    assert.ok(routeProperties.method.enum.includes('PUT'))
    assert.ok(routeProperties.method.enum.includes('DELETE'))
    assert.ok(routeProperties.method.enum.includes('PATCH'))
  })

  test('应该定义响应类型的oneOf约束', () => {
    const routeSchema = mockConfigSchema.properties.routes.items
    const responseProperty = routeSchema.properties.response
    
    assert.ok(responseProperty.oneOf)
    assert.ok(Array.isArray(responseProperty.oneOf))
    
    // 检查支持的响应类型
    const types = responseProperty.oneOf.map(item => item.type)
    assert.ok(types.includes('object'))
    assert.ok(types.includes('array'))
    assert.ok(types.includes('string'))
    assert.ok(types.includes('number'))
    assert.ok(types.includes('boolean'))
  })

  test('应该要求response或responseFile其中之一', () => {
    const routeSchema = mockConfigSchema.properties.routes.items
    
    assert.ok(routeSchema.oneOf)
    assert.strictEqual(routeSchema.oneOf.length, 2)
    
    // 检查第一个选项要求response
    assert.ok(routeSchema.oneOf[0].required.includes('response'))
    
    // 检查第二个选项要求responseFile
    assert.ok(routeSchema.oneOf[1].required.includes('responseFile'))
  })

  test('应该设置正确的默认值', () => {
    const properties = mockConfigSchema.properties
    const routeProperties = properties.routes.items.properties
    
    // 检查全局默认值
    assert.strictEqual(properties.port.default, 3000)
    assert.strictEqual(properties.baseUrl.default, '')
    assert.strictEqual(properties.delay.default, 0)
    assert.strictEqual(properties.cors.default, true)
    assert.strictEqual(properties.mockDir.default, './mock/data')
    
    // 检查路由默认值
    assert.strictEqual(routeProperties.method.default, 'GET')
    assert.strictEqual(routeProperties.statusCode.default, 200)
    assert.strictEqual(routeProperties.delay.default, 0)
  })

  test('应该定义正确的数据类型', () => {
    const properties = mockConfigSchema.properties
    const routeProperties = properties.routes.items.properties
    
    // 检查基本类型
    assert.strictEqual(properties.port.type, 'number')
    assert.strictEqual(properties.baseUrl.type, 'string')
    assert.strictEqual(properties.delay.type, 'number')
    assert.strictEqual(properties.cors.type, 'boolean')
    assert.strictEqual(properties.mockDir.type, 'string')
    assert.strictEqual(properties.routes.type, 'array')
    
    // 检查路由类型
    assert.strictEqual(routeProperties.path.type, 'string')
    assert.strictEqual(routeProperties.method.type, 'string')
    assert.strictEqual(routeProperties.description.type, 'string')
    assert.strictEqual(routeProperties.responseFile.type, 'string')
    assert.strictEqual(routeProperties.statusCode.type, 'number')
    assert.strictEqual(routeProperties.delay.type, 'number')
    assert.strictEqual(routeProperties.headers.type, 'object')
  })
})
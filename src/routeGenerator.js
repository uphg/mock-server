import Handlebars from 'handlebars'

export class RouteGenerator {
  constructor(app) {
    this.app = app
    this.activeRoutes = new Map()
  }

  generateRoutes(config) {
    // 清除现有路由
    this.clearRoutes()
    
    // 注册新路由
    for (const route of config.routes) {
      this.registerRoute(route, config)
    }
  }

  registerRoute(route, config) {
    const method = (route.method || 'GET').toLowerCase()
    
    // 处理 baseUrl 前缀
    let fullPath = route.path
    if (config.baseUrl && !route.path.startsWith(config.baseUrl)) {
      // 确保 baseUrl 不以 / 结尾，path 以 / 开头
      const baseUrl = config.baseUrl.replace(/\/$/, '')
      fullPath = `${baseUrl}${route.path}`
    }
    
    const key = `${method}:${fullPath}`

    // 创建路由处理器
    const handler = this.createHandler(route, config)

    // 注册路由
    this.app[method](fullPath, handler)
    this.activeRoutes.set(key, { method, path: fullPath, handler })

    console.log(`✓ 注册路由: ${route.method || 'GET'} ${fullPath}`)
    if (route.description) {
      console.log(`  描述: ${route.description}`)
    }
  }

  createHandler(route, _config) {
    return async (req, res) => {
      try {
        // 路由级延迟（优先级高于全局延迟）
        if (route.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, route.delay))
        }

        // 设置状态码
        const statusCode = route.statusCode || 200

        // 设置自定义头
        if (route.headers) {
          Object.entries(route.headers).forEach(([key, value]) => {
            res.setHeader(key, value)
          })
        }

        // 处理动态响应
        const response = this.processResponse(route.response, req)

        // 发送响应
        res.status(statusCode).json(response)

      } catch (error) {
        console.error(`路由处理错误 ${route.path}:`, error)
        res.status(500).json({
          error: 'Internal Server Error',
          message: error.message
        })
      }
    }
  }

  processResponse(response, req) {
    if (typeof response === 'function') {
      return response(req)
    }

    // 处理模板变量
    if (typeof response === 'string') {
      return this.processTemplate(response, req)
    }

    // 深度处理对象和数组
    if (Array.isArray(response)) {
      return response.map(item => this.processResponse(item, req))
    }

    if (typeof response === 'object' && response !== null) {
      const processed = {}
      for (const [key, value] of Object.entries(response)) {
        processed[key] = this.processResponse(value, req)
      }
      return processed
    }

    return response
  }

  processTemplate(template, req) {
    if (typeof template !== 'string') return template

    try {
      // 编译 Handlebars 模板
      const compiledTemplate = Handlebars.compile(template)
      
      // 准备模板数据
      const templateData = {
        query: req.query || {},
        params: req.params || {},
        body: req.body || {},
        headers: req.headers || {},
        method: req.method,
        url: req.url,
        path: req.path
      }
      
      // 渲染模板
      const result = compiledTemplate(templateData)
      
      // 简化处理：只处理基本的类型转换，模板替换结果保持为字符串
      return this.tryParseValue(result)
    } catch (error) {
      console.error('模板处理错误:', error)
      return template // 如果模板处理失败，返回原始字符串
    }
  }

  tryParseValue(value) {
    if (typeof value !== 'string') return value
    
    // 如果字符串包含模板语法但没有被替换，直接返回
    if (value.includes('{{') && value.includes('}}')) {
      return value
    }
    
    // 尝试解析为布尔值
    if (value === 'true') return true
    if (value === 'false') return false
    
    // 尝试解析为null或undefined
    if (value === 'null') return null
    if (value === 'undefined') return undefined
    
    // 尝试解析为JSON（数组或对象）
    if ((value.startsWith('[') && value.endsWith(']')) || 
        (value.startsWith('{') && value.endsWith('}'))) {
      try {
        return JSON.parse(value)
      } catch {
        // 如果JSON解析失败，返回原字符串
      }
    }
    
    // 对于模板替换的结果，保持为字符串
    // 这样行为更加可预测和一致
    return value
  }

  clearRoutes() {
    // Express.js 没有直接清除路由的方法
    // 这里只是记录哪些路由应该被清除
    // 实际应用中可能需要重启服务器或使用路由组
    this.activeRoutes.clear()
  }

  getActiveRoutes() {
    return Array.from(this.activeRoutes.keys())
  }

  printRoutes() {
    console.log('\n=== 激活的路由 ===')
    this.activeRoutes.forEach((route, _key) => {
      console.log(`${route.method.toUpperCase()} ${route.path}`)
    })
    console.log('==================\n')
  }
}
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
      this.registerRoute(route, config.port || 3000)
    }
  }

  registerRoute(route, port) {
    const method = (route.method || 'GET').toLowerCase()
    const path = route.path
    const key = `${method}:${path}`

    // 创建路由处理器
    const handler = this.createHandler(route)

    // 注册路由
    this.app[method](path, handler)
    this.activeRoutes.set(key, { method, path, handler })

    console.log(`✓ 注册路由: ${route.method || 'GET'} ${path}`)
    if (route.description) {
      console.log(`  描述: ${route.description}`)
    }
  }

  createHandler(route) {
    return async (req, res) => {
      try {
        // 添加延迟
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

    return template
      .replace(/\{\{query\.([^}]+)\}\}/g, (match, key) => {
        return req.query[key] || ''
      })
      .replace(/\{\{params\.([^}]+)\}\}/g, (match, key) => {
        return req.params[key] || ''
      })
      .replace(/\{\{body\.([^}]+)\}\}/g, (match, key) => {
        return req.body[key] || ''
      })
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
    this.activeRoutes.forEach((route, key) => {
      console.log(`${route.method.toUpperCase()} ${route.path}`)
    })
    console.log('==================\n')
  }
}
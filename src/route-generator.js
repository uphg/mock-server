import { createHandler } from './utils/route.js'

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
    const handler = createHandler(route, config)

    // 注册路由
    this.app[method](fullPath, handler)
    this.activeRoutes.set(key, { method, path: fullPath, handler })

    console.log(`✓ 注册路由: ${route.method || 'GET'} ${fullPath}`)
    if (route.description) {
      console.log(`  描述: ${route.description}`)
    }
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
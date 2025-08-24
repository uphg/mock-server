import fs from 'fs/promises'
import path from 'path'
import merge from 'lodash.merge'
import { mockConfigSchema } from './schema.js'

export class ConfigLoader {
  constructor(configPath) {
    this.configPath = configPath
    this.baseDir = path.dirname(configPath)
  }

  async loadConfig() {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8')
      const config = JSON.parse(configContent)
      
      // 验证基础配置
      this.validateConfig(config)
      
      // 处理响应文件导入
      await this.processResponseFiles(config)
      
      // 应用路由默认配置
      this.applyRouteDefaults(config)
      
      return config
    } catch (error) {
      throw new Error(`加载配置文件失败: ${error.message}`)
    }
  }

  validateConfig(config) {
    const { required } = mockConfigSchema
    
    // 检查必需字段
    for (const field of required) {
      if (!(field in config)) {
        throw new Error(`配置缺少必需字段: ${field}`)
      }
    }

    // 验证路由配置
    if (!Array.isArray(config.routes)) {
      throw new Error('routes 必须是数组')
    }

    for (const route of config.routes) {
      this.validateRoute(route)
    }
  }

  validateRoute(route) {
    if (!route.path) {
      throw new Error('路由配置必须包含 path 字段')
    }

    if (!route.response && !route.responseFile) {
      throw new Error(`路由 ${route.path} 必须包含 response 或 responseFile 字段`)
    }

    if (route.method && !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(route.method)) {
      throw new Error(`路由 ${route.path} 的 method 必须是 GET, POST, PUT, DELETE, 或 PATCH`)
    }
  }

  async processResponseFiles(config) {
    const mockDir = config.mockDir || './data'
    
    for (const route of config.routes) {
      if (route.responseFile) {
        // 构建完整的文件路径
        const filePath = path.resolve(this.baseDir, mockDir, route.responseFile)
        
        try {
          const fileContent = await fs.readFile(filePath, 'utf-8')
          route.response = JSON.parse(fileContent)
          delete route.responseFile
        } catch (error) {
          throw new Error(`加载响应文件失败: ${filePath} - ${error.message}`)
        }
      }
    }
  }

  async watchConfig(onChange) {
    const chokidar = await import('chokidar')
    
    // 获取配置来确定 mockDir
    let config
    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8')
      config = JSON.parse(configContent)
    } catch {
      config = { mockDir: './data' }
    }
    
    const mockDir = config.mockDir || './data'
    
    const watcher = chokidar.watch([
      this.configPath, 
      path.join(this.baseDir, mockDir, '**/*.json')
    ], {
      ignored: /node_modules/,
      persistent: true
    })

    watcher.on('change', async () => {
      try {
        const newConfig = await this.loadConfig()
        onChange(newConfig)
      } catch (error) {
        console.error('配置文件热更新失败:', error.message)
      }
    })

    return watcher
  }

  /**
   * 应用路由默认配置
   * 优先级：路由显式配置 > 路由默认配置（defaults） > 全局默认配置
   */
  applyRouteDefaults(config) {
    if (!config.routeDefaults || !Array.isArray(config.routeDefaults)) {
      return
    }

    // 为每个路由应用匹配的默认配置
    for (const route of config.routes) {
      // 获取全局默认配置（除了 routes 和 routeDefaults）
      const globalDefaults = this.extractGlobalDefaults(config)
      
      // 获取匹配的路由默认配置
      const matchingDefaults = this.getMatchingRouteDefaults(route, config.routeDefaults)
      
      // 按优先级合并配置：全局默认 < 路由默认 < 路由显式配置
      let mergedConfig = merge({}, globalDefaults)
      
      // 依次应用匹配的路由默认配置
      for (const defaultConfig of matchingDefaults) {
        mergedConfig = merge(mergedConfig, defaultConfig.config)
      }
      
      // 最后应用路由的显式配置（优先级最高）
      const routeExplicitConfig = { ...route }
      delete routeExplicitConfig.path // path 不参与合并
      delete routeExplicitConfig.method // method 不参与合并
      delete routeExplicitConfig.description // description 不参与合并
      
      mergedConfig = merge(mergedConfig, routeExplicitConfig)
      
      // 将合并后的配置应用到路由（保留原有的 path, method, description）
      Object.assign(route, mergedConfig)
    }
  }

  /**
   * 提取全局默认配置
   */
  extractGlobalDefaults(config) {
    const globalDefaults = {}
    
    // 可以作为默认配置的全局字段
    const globalDefaultFields = ['delay', 'headers', 'statusCode']
    
    for (const field of globalDefaultFields) {
      if (config[field] !== undefined) {
        globalDefaults[field] = config[field]
      }
    }
    
    return globalDefaults
  }

  /**
   * 获取匹配指定路由的默认配置
   */
  getMatchingRouteDefaults(route, routeDefaults) {
    const matchingDefaults = []
    
    for (const defaultConfig of routeDefaults) {
      if (this.isRouteMatched(route, defaultConfig)) {
        matchingDefaults.push(defaultConfig)
      }
    }
    
    return matchingDefaults
  }

  /**
   * 检查路由是否匹配默认配置的条件
   */
  isRouteMatched(route, defaultConfig) {
    const routePath = route.path
    
    // 检查 excludes 条件
    if (defaultConfig.excludes && Array.isArray(defaultConfig.excludes)) {
      for (const excludePattern of defaultConfig.excludes) {
        if (this.matchPattern(routePath, excludePattern)) {
          return false // 被排除
        }
      }
    }
    
    // 检查 includes 条件
    if (defaultConfig.includes && Array.isArray(defaultConfig.includes)) {
      for (const includePattern of defaultConfig.includes) {
        if (this.matchPattern(routePath, includePattern)) {
          return true // 被包含
        }
      }
      return false // 有 includes 但不匹配
    }
    
    // 如果没有 includes 条件，且没有被 excludes 排除，则匹配
    return true
  }

  /**
   * 模式匹配（支持通配符 *）
   */
  matchPattern(path, pattern) {
    // 简化的模式匹配：将 * 替换为正则表达式
    const escapedPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
      .replace(/\*/g, '.*') // * 匹配任意字符
    
    const regex = new RegExp('^' + escapedPattern + '$')
    return regex.test(path)
  }
}
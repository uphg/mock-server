import fs from 'fs/promises'
import path from 'path'
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
}
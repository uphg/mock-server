import fs from 'fs/promises'
import path from 'path'
import { applyRouteDefaults, validateConfig } from './utils/config.js'
import { blobExtensions, getContentType } from './utils/type.js'

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
      validateConfig(config)

      // 处理响应文件导入
      await this.processResponseFiles(config)

      // 应用路由默认配置
      applyRouteDefaults(config)

      return config
    } catch (error) {
      throw new Error(`加载配置文件失败: ${error.message}`)
    }
  }

  async processResponseFiles(config) {
    const mockDir = config.mockDir || './data'
    for (const route of config.routes) {
      if (route.responseFile) {
        const filePath = path.resolve(this.baseDir, mockDir, route.responseFile)

        try {
          // 检查文件是否存在
          await fs.access(filePath)

          // 如果已经明确设置了 responseType 为 blob，保留 responseFile
          if (route.responseType === 'blob') {
            route.responseFilePath = filePath
            route.contentType = route.contentType || getContentType(path.extname(filePath))
            route.response = null // 文件流将在请求时处理
            continue // 继续处理下一个路由
          }

          // 检查文件扩展名
          const ext = path.extname(filePath).toLowerCase()

          if (blobExtensions.includes(ext)) {
            // Blob 文件类型
            route.responseType = 'blob'
            route.responseFilePath = filePath
            route.contentType = route.contentType || getContentType(ext)
            route.response = null // 文件流将在请求时处理
            // 对于 blob 文件，保留 responseFile 用于文件名处理
          } else if (ext === '.db') {
            // SQLite 数据库文件
            route.responseFileType = 'sqlite'
            route.responseFilePath = filePath
            route.response = null // 将在请求时动态加载
            delete route.responseFile
          } else if (ext === '.csv') {
            // CSV 文件
            route.responseFileType = 'csv'
            route.responseFilePath = filePath
            route.response = null // 将在请求时动态加载
            delete route.responseFile
          } else {
            // 其他文件类型，尝试作为 JSON 解析
            const fileContent = await fs.readFile(filePath, 'utf-8')
            try {
              route.response = JSON.parse(fileContent)
            } catch {
              throw new Error(`文件 ${route.responseFile} 不是有效的 JSON 格式`)
            }
            delete route.responseFile
          }
        } catch (error) {
          if (error.code === 'ENOENT') {
            throw new Error(`文件 ${route.responseFile} 不存在`)
          }
          throw error
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
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { ConfigLoader } from './config-loader.js'
import { RouteGenerator } from './route-generator.js'
import { DocsGenerator } from './docs-generator.js'
import net from 'net'

const __filename = fileURLToPath(import.meta.url)
path.dirname(__filename)

class MockServer {
  constructor() {
    this.app = express()
    this.server = null
    this.configLoader = null
    this.routeGenerator = null
    this.watcher = null
  }

  /**
   * 检查端口是否可用
   * @param {number} port - 要检查的端口号
   * @returns {Promise<boolean>} 端口是否可用
   */
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = net.createServer()
      server.unref()
      server.on('error', () => {
        resolve(false)
      })
      server.listen(port, () => {
        server.close(() => {
          resolve(true)
        })
      })
    })
  }

  /**
   * 查找可用端口
   * @param {number} startPort - 起始端口号
   * @param {number} maxPort - 最大端口号
   * @returns {Promise<number|null>} 可用端口号或null
   */
  async findAvailablePort(startPort, maxPort = 65535) {
    for (let port = startPort; port <= maxPort; port++) {
      if (await this.isPortAvailable(port)) {
        return port
      }
    }
    return null
  }

  async start(configPath = './mock.config.json') {
    try {
      // 初始化配置加载器
      const fullConfigPath = path.resolve(process.cwd(), configPath)
      this.configLoader = new ConfigLoader(fullConfigPath)
      
      // 加载配置
      const config = await this.configLoader.loadConfig()
      
      // 设置Express中间件
      this.setupMiddleware(config)
      
      // 初始化路由生成器
      this.routeGenerator = new RouteGenerator(this.app)
      
      // 生成路由
      this.routeGenerator.generateRoutes(config)
      
      // 生成API文档
      await this.generateApiDocs(config)
      
      // 启动服务器
      let port = config.port || 3000
      const host = config.host || 'localhost'
      
      // 检查端口是否可用，如果不可用则查找下一个可用端口
      if (!(await this.isPortAvailable(port))) {
        console.log(`⚠️  端口 ${port} 已被占用，正在查找可用端口...`)
        const availablePort = await this.findAvailablePort(port + 1)
        if (availablePort) {
          console.log(`✅ 找到可用端口: ${availablePort}`)
          port = availablePort
        } else {
          console.error('❌ 无法找到可用端口')
          process.exit(1)
        }
      }
      
      this.server = this.app.listen(port, () => {
        const serverUrl = `http://${host}:${port}`
        const baseUrl = config.baseUrl || '/'
        const fullServerUrl = baseUrl === '/' ? serverUrl : `${serverUrl}${baseUrl}`
        
        console.log(`🚀 Mock服务器启动成功！`)
        console.log(`- 服务器地址: ${serverUrl}`)
        console.log(`- 完整路径: ${fullServerUrl}`)
        console.log(`- 健康检查: ${serverUrl}/health`)
        console.log(`- API文档: ${serverUrl}${config.baseUrl ? `${config.baseUrl}/docs` : '/api/docs'}`)
        console.log(`- 端口: ${port}`)
        console.log(`- 配置文件: ${fullConfigPath}`)
        console.log(`- 基础路径: ${config.baseUrl || '/'}`)
        console.log(`- 全局延迟: ${config.delay || 0}ms`)
        console.log(`- CORS: ${config.cors !== false ? '启用' : '禁用'}`)
        console.log(`- Mock目录: ${config.mockDir || './data'}`)
        console.log('')
        this.routeGenerator.printRoutes()
      })
      
      // 设置配置文件热更新
      if (process.env.NODE_ENV !== 'production') {
        this.setupHotReload()
      }
      
      // 设置优雅关闭
      this.setupGracefulShutdown()
      
    } catch (error) {
      console.error('❌ 启动失败:', error.message)
      process.exit(1)
    }
  }

  setupMiddleware(config) {
    // CORS支持 - 根据配置启用或禁用
    if (config.cors !== false) {
      this.app.use(cors())
    }
    
    // JSON解析
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true }))
    
    // 全局延迟中间件
    if (config.delay > 0) {
      this.app.use((req, res, next) => {
        setTimeout(next, config.delay)
      })
    }
    
    // 日志中间件
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] ${req.method} ${req.path}`)
      next()
    })
    
    // 健康检查
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() })
    })
    
    // API文档
    const docsPath = config.baseUrl ? `${config.baseUrl}/docs` : '/api/docs'
    this.app.get(docsPath, (_req, res) => {
      res.json(this.generateApiDocs())
    })
  }

  async setupHotReload() {
    try {
      this.watcher = await this.configLoader.watchConfig(async (newConfig) => {
        console.log('\n🔄 检测到配置变更，重新加载...')
        this.routeGenerator.generateRoutes(newConfig)
        await this.generateApiDocs(newConfig)
        console.log('✅ 配置热更新完成')
        this.routeGenerator.printRoutes()
      })
      
      console.log('🔥 配置文件热更新已启用')
    } catch (error) {
      console.warn('⚠️  配置文件热更新启用失败:', error.message)
    }
  }

  async generateApiDocs(config) {
    try {
      const docsGenerator = new DocsGenerator(config)
      await docsGenerator.generateAllDocs()
      console.log('📚 API文档生成完成')
    } catch (error) {
      console.warn('⚠️  API文档生成失败:', error.message)
    }
  }

  setupGracefulShutdown() {
    const shutdown = async () => {
      console.log('\n🛑 正在关闭服务器...')
      
      if (this.watcher) {
        await this.watcher.close()
        console.log('👀 配置文件监听器已关闭')
      }
      
      if (this.server) {
        this.server.close(() => {
          console.log('✅ 服务器已安全关闭')
          process.exit(0)
        })
      }
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  }
}

// 命令行启动
if (import.meta.url === `file://${process.argv[1]}`) {
  const configPath = process.argv[2] || './mock.config.json'
  const server = new MockServer()
  server.start(configPath)
}

export { MockServer }
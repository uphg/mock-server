import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { ConfigLoader } from './config-loader.js'
import { RouteGenerator } from './route-generator.js'
import { pluginManager } from './plugins/plugin-manager.js'
import { colorUrl, logger } from './utils/logger.js'
import net from 'net'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { version } = require('../package.json')
import pc from 'picocolors'
import { getNetworkUrls } from './utils/route.js'

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

  async loadPlugins(config) {
    // 自动加载内置插件（如果存在）
    try {
      // 尝试加载SQLite插件
      const { default: sqlitePlugin } = await import('../plugins/sqlite-plugin/index.js')
      pluginManager.register(sqlitePlugin)
    } catch (error) {
      // SQLite插件不可用，跳过
      logger.info('PLUGIN', 'SQLite plugin not available')
    }

    try {
      // 尝试加载CSV插件
      const { default: csvPlugin } = await import('../plugins/csv-plugin/index.js')
      pluginManager.register(csvPlugin)
    } catch (error) {
      // CSV插件不可用，跳过
      logger.info('PLUGIN', 'CSV plugin not available')
    }

    // TODO: 支持从配置中加载外部插件
    if (config.plugins && Array.isArray(config.plugins)) {
      for (const pluginName of config.plugins) {
        try {
          const pluginModule = await import(pluginName)
          pluginManager.register(pluginModule.default)
        } catch (error) {
          logger.warn('PLUGIN', `Failed to load plugin ${pluginName}: ${error.message}`)
        }
      }
    }
  }

  async start(configPath = './mock/mock.config.json', options = {}) {
    const startTime = Date.now()

    // Set logger verbosity based on --log flag
    logger.setVerbose(options.log || false)

    try {
      // 初始化配置加载器
      const fullConfigPath = path.resolve(process.cwd(), configPath)
      this.configLoader = new ConfigLoader(fullConfigPath)

      // 加载配置
      const config = await this.configLoader.loadConfig()

      // 加载插件
      // await this.loadPlugins(config)

      // 设置Express中间件
      this.setupMiddleware(config)

      // 初始化路由生成器
      this.routeGenerator = new RouteGenerator(this.app)

      // 生成路由
      this.routeGenerator.generateRoutes(config)

      // 启动服务器
      let port = config.port || 3000
      const host = config.host || 'localhost'

      // 检查端口是否可用，如果不可用则查找下一个可用端口
      if (!(await this.isPortAvailable(port))) {
        logger.warn('SERVER', `端口 ${port} 已被占用，正在查找可用端口...`)
        const availablePort = await this.findAvailablePort(port + 1)
        if (availablePort) {
          logger.info('SERVER', `找到可用端口: ${availablePort}`)
          port = availablePort
        } else {
          logger.error('SERVER', '无法找到可用端口')
          process.exit(1)
        }
      }

      this.server = this.app.listen(port, () => {
        const serverUrl = `http://${host}:${port}`
        const baseUrl = config.baseUrl || '/'

        // 修复URL拼接逻辑
        let fullServerUrl = serverUrl
        if (baseUrl !== '/') {
          if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
            // baseUrl是完整URL，直接使用
            fullServerUrl = baseUrl
          } else {
            // baseUrl是路径，确保以/开头并拼接到serverUrl后面
            const normalizedBaseUrl = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`
            fullServerUrl = `${serverUrl}${normalizedBaseUrl}`
          }
        }

        const startupTime = Date.now() - startTime

        if (!options.log) {
          // Minimal output by default
          console.log(`  ${pc.bold('Mockfly')} ${pc.cyan(`v${version}`)}  ` + pc.gray(`ready in ${pc.bold(startupTime)} ms`))
          
          // 本地访问地址
          let localUrl = `http://localhost:${port}`
          if (baseUrl && baseUrl !== '/' && !baseUrl.startsWith('http')) {
            localUrl += baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`
          }
          console.log(`  ${pc.green('➜')}  ${pc.bold('Local')}:   ${colorUrl(localUrl)}`)

          // 网络访问地址（获取本机IP）
          const networkUrls = getNetworkUrls(port, baseUrl)
          if (networkUrls.length > 0) {
            networkUrls.forEach(url => {
              console.log(`  ${pc.green('➜')}  ${pc.bold('Network')}: ${colorUrl(url)}`)
            })
          } else {
            console.log(
              pc.dim(`  ${pc.green('➜')}  ${pc.bold('Network')}: use `) +
              pc.bold('--host') +
              pc.dim(' to expose')
            )
          }

          // // Help 帮助文档
          console.log(pc.dim(`  ${pc.green('➜')}  ${pc.bold('Help')}: use `) + pc.bold('--help') + pc.dim(' or ') + pc.bold('-h') + pc.dim(' to show help'))

          // Log 日志输出
          console.log(pc.dim(`  ${pc.green('➜')}  ${pc.bold('Log')}: use `) + pc.bold('--log') + pc.dim(' to output'))
          console.log('')

        } else {
          // Detailed output when --log is enabled
          logger.success('SERVER', `Mock服务器启动成功: ${fullServerUrl}`)

          // 如果启用 verbose 模式，打印详细信息
          if (options.verbose) {
            logger.info('SERVER', `服务器地址: ${serverUrl}`)
            logger.info('SERVER', `健康检查: ${serverUrl}/health`)
            logger.info('SERVER', `端口: ${port}`)
            logger.info('SERVER', `配置文件: ${fullConfigPath}`)
            logger.info('SERVER', `基础路径: ${config.baseUrl || '/'}`)
            logger.info('SERVER', `全局延迟: ${config.delay || 0}ms`)
            logger.info('SERVER', `CORS: ${config.cors !== false ? '启用' : '禁用'}`)
            logger.info('SERVER', `Mock目录: ${config.mockDir || './mock/data'}`)
          }

          this.routeGenerator.printRoutes()
        }

      })

      // 设置配置文件热更新
      if (process.env.NODE_ENV !== 'production') {
        this.setupHotReload()
      }

      // 设置优雅关闭
      this.setupGracefulShutdown()

    } catch (error) {
      logger.error('SERVER', `启动失败: ${error.message}`)
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
      const start = Date.now()
      res.on('finish', () => {
        const duration = Date.now() - start
        logger.debug('REQUEST', `${req.method} ${req.path} [${res.statusCode}] ${duration}ms`)
      })
      next()
    })

    // 健康检查
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() })
    })
  }

  async setupHotReload() {
    try {
      this.watcher = await this.configLoader.watchConfig(async (newConfig) => {
        logger.info('SERVER', '检测到配置变更，重新加载...')
        this.routeGenerator.generateRoutes(newConfig)
        logger.success('SERVER', '配置热更新完成')
        this.routeGenerator.printRoutes()
      })

      logger.info('SERVER', '配置文件热更新已启用')
    } catch (error) {
      logger.warn('SERVER', `配置文件热更新启用失败: ${error.message}`)
    }
  }

  setupGracefulShutdown() {
    const shutdown = async () => {
      logger.info('SERVER', '正在关闭服务器...')

      if (this.watcher) {
        await this.watcher.close()
        logger.info('SERVER', '配置文件监听器已关闭')
      }

      if (this.server) {
        this.server.close(() => {
          logger.success('SERVER', '服务器已安全关闭')
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
  const configPath = process.argv[2] || './mock/mock.config.json'
  const verbose = process.argv.includes('--verbose')
  const log = process.argv.includes('--log')
  const server = new MockServer()
  server.start(configPath, { verbose, log })
}


export { MockServer }
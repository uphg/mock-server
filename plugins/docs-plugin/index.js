import fs from 'fs/promises'
import path from 'path'
import { toMarkdown } from 'mdast-util-to-markdown'
import { gfmTableToMarkdown } from 'mdast-util-gfm-table'
import { root, heading, paragraph, text, list, listItem } from 'mdast-builder'
import { MockPlugin } from '../../src/plugins/plugin-interface.js'
import { logger } from '../../src/utils/logger.js'
import {
  buildBasicInfo,
  buildErrorResponse,
  buildRequestExample,
  buildRequestParams,
  buildResponseExample,
  flattenArray,
  generateFileName,
  isRouteMatchedForDocs
} from '../../src/utils/docs.js'

const defaultDocsDir = './docs/api'

/**
 * Docs Plugin for Mockfly
 * Enables documentation generation for API routes
 */
export class DocsPlugin extends MockPlugin {
  constructor() {
    super()
    this.name = 'docs-plugin'
    this.version = '1.0.0'
  }

  getSupportedExtensions() {
    return [] // Docs plugin doesn't handle file extensions
  }

  async loadData(route, req) {
    throw new Error('Docs plugin does not support data loading')
  }

  async generateDocs(config, outputDir = defaultDocsDir) {
    const docsGenerator = new DocsGenerator(config, outputDir)
    await docsGenerator.generateAllDocs()
  }

  getInfo() {
    return {
      name: this.name,
      version: this.version,
      description: 'Documentation generation plugin for Mockfly'
    }
  }
}

/**
 * Documentation Generator Class
 */
class DocsGenerator {
  constructor(config, docsDir) {
    this.config = this.validateConfig(config)
    this.docsDir = docsDir || process.env.DOCS_OUTPUT_DIR || defaultDocsDir
  }

  validateConfig(config) {
    if (!config.routes || !Array.isArray(config.routes)) {
      throw new Error('配置必须包含 routes 数组')
    }

    return {
      ...config,
      routes: config.routes.map(route => ({
        method: 'GET',
        ...route,
        path: route.path || '/'
      }))
    }
  }

  /**
   * 生成所有路由的文档
   */
  async generateAllDocs() {
    try {
      // 确保文档目录存在
      await this.ensureDocsDirectory()

      // 使用 Promise.all 并发生成文档，但限制并发数
      const batchSize = 5
      for (let i = 0; i < this.config.routes.length; i += batchSize) {
        const batch = this.config.routes.slice(i, i + batchSize)
        await Promise.all(batch.map(route => this.generateRouteDoc(route)))
      }

      // 生成总览文档
      await this.generateIndexDoc()

      logger.success('DOCS', `文档生成完成: 生成${this.config.routes.length + 1}个文件 (目录: ${path.relative(process.cwd(), this.docsDir)})`)

    } catch (error) {
      logger.error('DOCS', `文档生成失败: ${error.message}`)
      throw error
    }
  }

  /**
   * 确保文档目录存在
   */
  async ensureDocsDirectory() {
    try {
      await fs.access(this.docsDir)
    } catch {
      await fs.mkdir(this.docsDir, { recursive: true })
      logger.info('DOCS', `创建文档目录: ${this.docsDir}`)
    }
  }

  /**
   * 为单个路由生成文档
   */
  async generateRouteDoc(route) {
    const fileName = generateFileName(route)
    const filePath = path.join(this.docsDir, fileName)

    // 检查文件是否已存在且内容相同
    const newContent = this.generateMarkdownContent(route)

    try {
      const existingContent = await fs.readFile(filePath, 'utf-8')
      if (existingContent === newContent) {
        logger.info('DOCS', `跳过未变更文档: ${fileName}`)
        return
      }
    } catch {
      // 文件不存在，继续生成
    }

    await fs.writeFile(filePath, newContent, 'utf-8')
    logger.info('DOCS', `生成文档: ${fileName}`)
  }

  generateMarkdownContent(route) {
    const mdastTree = this.buildRouteDocTree(route)
    return toMarkdown(mdastTree, this.markdownOptions)
  }

  get markdownOptions() {
    return {
      bullet: '-',
      fence: '`',
      fences: true,
      incrementListMarker: false,
      listItemIndent: 'one',
      tightDefinitions: true,
      extensions: [gfmTableToMarkdown()]
    }
  }

  /**
   * 构建单个路由的文档树
   */
  buildRouteDocTree(route) {
    const method = route.method || 'GET'
    const fullPath = this.getFullPath(route.path)

    const children = [
      // 标题
      heading(1, text(`${route.name || route.path}`)),

      // 基本信息
      buildBasicInfo(route, method, fullPath),

      // 请求参数
      ...flattenArray(buildRequestParams(route, method)),

      // 请求示例
      ...flattenArray(buildRequestExample(route, method)),

      // 响应示例
      ...flattenArray(buildResponseExample(route)),

      // 响应头信息
      ...flattenArray(this.buildResponseHeaders(route)),

      // 错误响应
      ...flattenArray(buildErrorResponse(route))
    ].filter(Boolean)

    return root(children)
  }

  /**
   * 构建响应头信息
   */
  buildResponseHeaders(route) {
    const headers = this.collectHeaders(route)

    if (Object.keys(headers).length === 0) {
      return []
    }

    const headerLines = Object.entries(headers).map(([key, value]) =>
      `- **${key}**: ${value}`
    )

    return [
      heading(2, text('响应头')),
      {
        type: 'html',
        value: headerLines.join('\n')
      }
    ]
  }

  /**
   * 收集所有响应头
   */
  collectHeaders(route) {
    const headers = {}

    // 全局头（优先级最低）
    if (this.config.headers) {
      Object.assign(headers, this.config.headers)
    }

    // 从路由默认配置中收集头
    if (this.config.routeDefaults) {
      for (const defaultConfig of this.config.routeDefaults) {
        if (isRouteMatchedForDocs(route, defaultConfig) && defaultConfig.config.headers) {
          Object.assign(headers, defaultConfig.config.headers)
        }
      }
    }

    // 路由级别的头（优先级最高）
    if (route.headers) {
      Object.assign(headers, route.headers)
    }

    return headers
  }

  /**
   * 获取完整路径
   */
  getFullPath(routePath) {
    const baseUrl = this.config.baseUrl || ''
    if (baseUrl && !routePath.startsWith(baseUrl)) {
      return `${baseUrl.replace(/\/$/, '')}${routePath}`
    }
    return routePath
  }

  /**
   * 生成总览文档
   */
  async generateIndexDoc() {
    const filePath = path.join(this.docsDir, 'README.md')

    const mdastTree = root([
      heading(1, text('API 接口文档')),

      paragraph([text('本文档由 Mock Server 自动生成，包含所有可用的 API 接口信息。')]),

      heading(2, text('服务器信息')),
      {
        type: 'html',
        value: [
          `- **端口**: ${this.config.port || 3000}`,
          `- **基础路径**: ${this.config.baseUrl || '/'}`,
          `- **CORS**: ${this.config.cors !== false ? '启用' : '禁用'}`,
          `- **全局延迟**: ${this.config.delay || 0}ms`
        ].join('\n')
      },

      heading(2, text('接口列表')),
      this.buildRoutesList(),

      heading(2, text('通用说明')),
      list('unordered', [
        listItem([text('所有接口返回的数据格式为 JSON')]),
        listItem([text('请求头需要包含 Content-Type: application/json')]),
        listItem([text('参数中的模板变量会根据实际请求动态替换')])
      ])
    ])

    const markdown = toMarkdown(mdastTree, {
      bullet: '-',
      fence: '`',
      fences: true,
      incrementListMarker: false,
      listItemIndent: 'one',
      tightDefinitions: true,
      extensions: [gfmTableToMarkdown()]
    })

    await fs.writeFile(filePath, markdown, 'utf-8')
    logger.info('DOCS', '生成总览文档: README.md')
  }

  /**
   * 构建路由列表
   */
  buildRoutesList() {
    const routeLines = this.config.routes.map(route => {
      const method = route.method || 'GET'
      const fullPath = this.getFullPath(route.path)
      const fileName = generateFileName(route)

      return `- **${method} ${fullPath}** - ${route.description || route.name || '暂无描述'} ([详细文档](${fileName}))`
    })

    return {
      type: 'html',
      value: routeLines.join('\n')
    }
  }
}

export { DocsGenerator }
export default new DocsPlugin()
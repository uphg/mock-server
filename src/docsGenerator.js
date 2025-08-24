import fs from 'fs/promises'
import path from 'path'
import { unified } from 'unified'
import remarkStringify from 'remark-stringify'
import { toMarkdown } from 'mdast-util-to-markdown'
import { gfmTableToMarkdown } from 'mdast-util-gfm-table'
import {
  root,
  heading,
  paragraph,
  text,
  list,
  listItem,
  table,
  tableRow,
  tableCell,
  code,
  blockquote,
  strong,
  emphasis
} from 'mdast-builder'

export class DocsGenerator {
  constructor(config) {
    this.config = config
    this.docsDir = './docs'
  }

  /**
   * 扁平化数组，过滤掉空值
   */
  flattenArray(arr) {
    if (!arr) return []
    if (!Array.isArray(arr)) return [arr]
    return arr.filter(Boolean)
  }

  /**
   * 生成所有路由的文档
   */
  async generateAllDocs() {
    try {
      // 确保文档目录存在
      await this.ensureDocsDirectory()
      
      // 为每个路由生成单独的文档文件
      for (const route of this.config.routes) {
        await this.generateRouteDoc(route)
      }
      
      // 生成总览文档
      await this.generateIndexDoc()
      
      console.log(`✅ 文档生成完成，共生成 ${this.config.routes.length + 1} 个文件`)
      console.log(`📁 文档目录: ${path.resolve(this.docsDir)}`)
      
    } catch (error) {
      console.error('❌ 文档生成失败:', error.message)
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
      console.log(`📁 创建文档目录: ${this.docsDir}`)
    }
  }

  /**
   * 为单个路由生成文档
   */
  async generateRouteDoc(route) {
    const fileName = this.generateFileName(route)
    const filePath = path.join(this.docsDir, fileName)
    
    // 构建 MDAST 树
    const mdastTree = this.buildRouteDocTree(route)
    
    // 转换为 Markdown
    const markdown = toMarkdown(mdastTree, {
      bullet: '-',
      fence: '`',
      fences: true,
      incrementListMarker: false,
      listItemIndent: 'one',
      tightDefinitions: true,
      extensions: [gfmTableToMarkdown()]
    })
    
    // 写入文件
    await fs.writeFile(filePath, markdown, 'utf-8')
    console.log(`📄 生成文档: ${fileName}`)
  }

  /**
   * 生成文件名
   */
  generateFileName(route) {
    const method = (route.method || 'GET').toLowerCase()
    const pathSegments = route.path
      .replace(/^\//, '') // 移除开头的斜杠
      .replace(/\//g, '-') // 将斜杠替换为连字符
      .replace(/:/g, '') // 移除参数标识符
      .replace(/[{}]/g, '') // 移除可选参数标识符
      .replace(/\*/g, 'wildcard') // 替换通配符
      .replace(/[^a-zA-Z0-9\-_]/g, '') // 移除其他特殊字符
    
    return `${method}-${pathSegments || 'root'}.md`
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
      this.buildBasicInfo(route, method, fullPath),
      
      // 请求参数
      ...this.flattenArray(this.buildRequestParams(route, method)),
      
      // 请求示例
      ...this.flattenArray(this.buildRequestExample(route, method)),
      
      // 响应示例
      ...this.flattenArray(this.buildResponseExample(route)),
      
      // 响应头信息
      ...this.flattenArray(this.buildResponseHeaders(route)),
      
      // 错误响应
      ...this.flattenArray(this.buildErrorResponse(route))
    ].filter(Boolean)
    
    return root(children)
  }

  /**
   * 构建基本信息部分
   */
  buildBasicInfo(route, method, fullPath) {
    const infoLines = [
      `- **描述**: ${route.description || '暂无描述'}`,
      `- **URL**: \`${fullPath}\``,
      `- **请求类型**: \`${method}\``,
    ]

    // 添加状态码信息
    if (route.statusCode && route.statusCode !== 200) {
      infoLines.push(`- **状态码**: \`${route.statusCode}\``)
    }

    // 添加延迟信息
    if (route.delay && route.delay > 0) {
      infoLines.push(`- **响应延迟**: ${route.delay}ms`)
    }

    // 返回原始 markdown 字符串节点
    return {
      type: 'html',
      value: infoLines.join('\n')
    }
  }

  /**
   * 构建请求参数部分
   */
  buildRequestParams(route, method) {
    const params = this.extractParams(route)
    
    if (params.length === 0) {
      return []
    }

    const sections = []
    
    // 路径参数
    const pathParams = params.filter(p => p.type === 'path')
    if (pathParams.length > 0) {
      sections.push(
        heading(2, text('路径参数')),
        this.buildParamsTable(pathParams)
      )
    }

    // 查询参数
    const queryParams = params.filter(p => p.type === 'query')
    if (queryParams.length > 0) {
      sections.push(
        heading(2, text('查询参数')),
        this.buildParamsTable(queryParams)
      )
    }

    // 请求体参数（POST/PUT/PATCH）
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const bodyParams = params.filter(p => p.type === 'body')
      if (bodyParams.length > 0) {
        sections.push(
          heading(2, text('请求体参数')),
          this.buildParamsTable(bodyParams)
        )
      }
    }

    return sections
  }

  /**
   * 构建参数表格
   */
  buildParamsTable(params) {
    const headerRow = tableRow([
      tableCell([text('参数名')]),
      tableCell([text('类型')]),
      tableCell([text('必填')]),
      tableCell([text('说明')])
    ])

    const dataRows = params.map(param => 
      tableRow([
        tableCell([text(param.name)]),
        tableCell([text(param.dataType || 'string')]),
        tableCell([text(param.required ? '是' : '否')]),
        tableCell([text(param.description || '暂无说明')])
      ])
    )

    // 正确构建表格节点
    const tableNode = {
      type: 'table',
      align: [null, null, null, null], // 对齐方式
      children: [headerRow, ...dataRows]
    }
    
    return tableNode
  }

  /**
   * 从路由配置中提取参数信息
   */
  extractParams(route) {
    const params = []
    
    // 提取路径参数
    const pathParamMatches = route.path.match(/:([^/]+)/g)
    if (pathParamMatches) {
      pathParamMatches.forEach(match => {
        const paramName = match.substring(1)
        params.push({
          name: paramName,
          type: 'path',
          required: true,
          description: `路径参数 ${paramName}`
        })
      })
    }

    // 从响应模板中推断参数
    if (route.response) {
      this.extractParamsFromTemplate(route.response, params)
    }



    return params
  }

  /**
   * 从模板中提取参数
   */
  extractParamsFromTemplate(obj, params, prefix = '') {
    if (typeof obj === 'string') {
      // 提取 Handlebars 模板变量
      const matches = obj.match(/\{\{([^}]+)\}\}/g)
      if (matches) {
        matches.forEach(match => {
          const variable = match.replace(/[{}]/g, '').trim()
          const [type, name] = variable.split('.')
          
          if (type && name && !params.some(p => p.name === name && p.type === type)) {
            params.push({
              name,
              type,
              required: false,
              description: `${type === 'query' ? '查询' : type === 'body' ? '请求体' : ''}参数 ${name}`
            })
          }
        })
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        this.extractParamsFromTemplate(item, params, `${prefix}[${index}]`)
      })
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        const newPrefix = prefix ? `${prefix}.${key}` : key
        this.extractParamsFromTemplate(value, params, newPrefix)
      })
    }
  }

  /**
   * 构建请求示例
   */
  buildRequestExample(route, method) {
    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
      return []
    }

    const example = this.generateRequestExample(route)
    if (!example) {
      return []
    }

    return [
      heading(2, text('请求示例')),
      code('json', JSON.stringify(example, null, 2))
    ]
  }

  /**
   * 生成请求示例
   */
  generateRequestExample(route) {
    // 基于响应模板生成请求示例
    if (route.response && typeof route.response === 'object') {
      const example = {}
      
      // 从响应中提取可能的请求字段
      this.extractExampleFromResponse(route.response, example)
      
      return Object.keys(example).length > 0 ? example : null
    }
    
    return null
  }

  /**
   * 从响应中提取示例
   */
  extractExampleFromResponse(obj, example) {
    if (typeof obj === 'string') {
      const matches = obj.match(/\{\{body\.([^}]+)\}\}/g)
      if (matches) {
        matches.forEach(match => {
          const fieldName = match.replace(/\{\{body\.|\}\}/g, '')
          if (!example[fieldName]) {
            example[fieldName] = this.generateExampleValue(fieldName)
          }
        })
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(item => {
        this.extractExampleFromResponse(item, example)
      })
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach(value => {
        this.extractExampleFromResponse(value, example)
      })
    }
  }

  /**
   * 生成示例值
   */
  generateExampleValue(fieldName) {
    const lowerField = fieldName.toLowerCase()
    
    if (lowerField.includes('id')) return 1
    if (lowerField.includes('name')) return '示例名称'
    if (lowerField.includes('email')) return 'example@example.com'
    if (lowerField.includes('phone')) return '13800138000'
    if (lowerField.includes('age')) return 25
    if (lowerField.includes('price')) return 99.99
    if (lowerField.includes('count')) return 10
    if (lowerField.includes('date') || lowerField.includes('time')) return '2024-01-01T00:00:00Z'
    if (lowerField.includes('url')) return 'https://example.com'
    if (lowerField.includes('description')) return '这是一个示例描述'
    
    return '示例值'
  }

  /**
   * 构建响应示例
   */
  buildResponseExample(route) {
    if (!route.response) {
      return []
    }

    const example = this.generateResponseExample(route.response)
    
    return [
      heading(2, text('响应示例')),
      code('json', JSON.stringify(example, null, 2))
    ]
  }

  /**
   * 生成响应示例
   */
  generateResponseExample(response) {
    if (typeof response === 'string') {
      return response.replace(/\{\{[^}]+\}\}/g, (match) => {
        const variable = match.replace(/[{}]/g, '').trim()
        return this.generateExampleValueForTemplate(variable)
      })
    }
    
    if (Array.isArray(response)) {
      return response.map(item => this.generateResponseExample(item))
    }
    
    if (typeof response === 'object' && response !== null) {
      const example = {}
      Object.entries(response).forEach(([key, value]) => {
        example[key] = this.generateResponseExample(value)
      })
      return example
    }
    
    return response
  }

  /**
   * 为模板变量生成示例值
   */
  generateExampleValueForTemplate(variable) {
    if (variable.includes('params.id')) return '123'
    if (variable.includes('query.q')) return '搜索关键词'
    if (variable.includes('body.name')) return '张三'
    if (variable.includes('body.email')) return 'zhangsan@example.com'
    if (variable.includes('body.id')) return '456'
    if (variable.includes('responseTime')) return '50'
    
    return '示例值'
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
    
    // 路由级别的头
    if (route.headers) {
      Object.assign(headers, route.headers)
    }
    
    // 从路由默认配置中收集头
    if (this.config.routeDefaults) {
      for (const defaultConfig of this.config.routeDefaults) {
        if (this.isRouteMatchedForDocs(route, defaultConfig) && defaultConfig.config.headers) {
          Object.assign(headers, defaultConfig.config.headers)
        }
      }
    }
    
    // 全局头
    if (this.config.headers) {
      Object.assign(headers, this.config.headers)
    }
    
    return headers
  }

  /**
   * 检查路由是否匹配默认配置（简化版本，用于文档生成）
   */
  isRouteMatchedForDocs(route, defaultConfig) {
    const routePath = route.path
    
    // 检查 excludes
    if (defaultConfig.excludes && Array.isArray(defaultConfig.excludes)) {
      for (const excludePattern of defaultConfig.excludes) {
        if (this.simplePatternMatch(routePath, excludePattern)) {
          return false
        }
      }
    }
    
    // 检查 includes
    if (defaultConfig.includes && Array.isArray(defaultConfig.includes)) {
      for (const includePattern of defaultConfig.includes) {
        if (this.simplePatternMatch(routePath, includePattern)) {
          return true
        }
      }
      return false
    }
    
    return true
  }

  /**
   * 简单的模式匹配（用于文档生成）
   */
  simplePatternMatch(path, pattern) {
    if (pattern === '*') return true
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1)
      return path.startsWith(prefix)
    }
    return path === pattern
  }

  /**
   * 构建错误响应
   */
  buildErrorResponse(route) {
    if (route.statusCode && route.statusCode >= 400) {
      return [] // 如果本身就是错误响应，不需要额外的错误响应部分
    }

    return [
      heading(2, text('错误响应')),
      paragraph([text('当请求出现错误时，服务器将返回相应的错误信息：')]),
      code('json', JSON.stringify({
        error: 'Error Type',
        message: '错误描述信息'
      }, null, 2))
    ]
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
    console.log('📄 生成总览文档: README.md')
  }

  /**
   * 构建路由列表
   */
  buildRoutesList() {
    const routeLines = this.config.routes.map(route => {
      const method = route.method || 'GET'
      const fullPath = this.getFullPath(route.path)
      const fileName = this.generateFileName(route)
      
      return `- **${method} ${fullPath}** - ${route.description || route.name || '暂无描述'} ([详细文档](${fileName}))`
    })
    
    return {
      type: 'html',
      value: routeLines.join('\n')
    }
  }
}
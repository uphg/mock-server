import { parse as parsePathToRegexp } from 'path-to-regexp'
import Handlebars from 'handlebars'
import { heading, paragraph, text,  tableRow, tableCell, code } from 'mdast-builder'

/**
 * 生成文件名
 */
export function generateFileName(route) {
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
 * 从模板中提取参数
 * 使用 Handlebars AST 进行更准确的模板解析
 */
function extractParamsFromTemplate(obj, params, prefix = '') {
  if (typeof obj === 'string') {
    try {
      // 使用 Handlebars 解析模板
      const ast = Handlebars.parse(obj)
      extractParamsFromAST(ast, params)
    } catch (error) {
      // 如果 Handlebars 解析失败，回退到原来的正则表达式方法
      console.warn(`模板解析失败，使用备用方法: ${obj.substring(0, 50)}...`, error.message)
      extractParamsFromTemplateRegex(obj, params)
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      extractParamsFromTemplate(item, params, `${prefix}[${index}]`)
    })
  } else if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      const newPrefix = prefix ? `${prefix}.${key}` : key
      extractParamsFromTemplate(value, params, newPrefix)
    })
  }
}

/**
 * 从 path-to-regexp tokens 中提取参数
 */
function extractParamsFromTokens(tokens, params) {
  tokens.forEach(token => {
    if (token.type === 'param') {
      params.push({
        name: token.name,
        type: 'path',
        required: !token.optional,
        description: `路径参数 ${token.name}${token.optional ? ' (可选)' : ''}`
      })
    } else if (token.type === 'wildcard') {
      params.push({
        name: token.name,
        type: 'path',
        required: true,
        description: `通配符参数 ${token.name}`
      })
    } else if (token.type === 'group' && token.tokens) {
      // 递归处理分组中的 tokens
      extractParamsFromTokens(token.tokens, params)
    }
  })
}

/**
 * 使用正则表达式提取路径参数（备用方法）
 */
function extractParamsWithRegex(path, params) {
  const pathParamMatches = path.match(/:([^/]+)/g)
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
}

/**
 * 从 Handlebars AST 中提取参数
 */
function extractParamsFromAST(ast, params) {
  if (ast.body) {
    ast.body.forEach(node => {
      visitASTNode(node, params)
    })
  }
}

/**
 * 递归访问 AST 节点提取参数
 */
function visitASTNode(node, params) {
  if (!node) return

  // 处理 Mustache 表达式 {{variable}}
  if (node.type === 'MustacheStatement' || node.type === 'SubExpression') {
    if (node.path && node.path.type === 'PathExpression') {
      const pathParts = node.path.parts
      if (pathParts.length >= 2) {
        const [type, name] = pathParts
        if (type && name && !params.some(p => p.name === name && p.type === type)) {
          params.push({
            name,
            type,
            required: false,
            description: `${getParamTypeDescription(type)}参数 ${name}`
          })
        }
      } else if (pathParts.length === 1) {
        // 处理简单变量引用，如 {{name}}
        const name = pathParts[0]
        if (name && !params.some(p => p.name === name && p.type === 'template')) {
          params.push({
            name,
            type: 'template',
            required: false,
            description: `模板变量 ${name}`
          })
        }
      }
    }
  }

  // 递归处理子节点
  if (node.params) {
    node.params.forEach(param => visitASTNode(param, params))
  }
  if (node.hash && node.hash.pairs) {
    node.hash.pairs.forEach(pair => visitASTNode(pair.value, params))
  }
  if (node.program && node.program.body) {
    node.program.body.forEach(child => visitASTNode(child, params))
  }
  if (node.inverse && node.inverse.body) {
    node.inverse.body.forEach(child => visitASTNode(child, params))
  }
}

/**
 * 获取参数类型描述
 */
function getParamTypeDescription(type) {
  switch (type) {
    case 'query': return '查询'
    case 'body': return '请求体'
    case 'params': return '路径'
    case 'headers': return '请求头'
    default: return type
  }
}

/**
 * 使用正则表达式从模板中提取参数（备用方法）
 */
function extractParamsFromTemplateRegex(obj, params) {
  // 提取 Handlebars 模板变量
  const matches = obj.match(/\{\{([^}]+)\}\}/g)
  if (matches) {
    matches.forEach(match => {
      const variable = match.replace(/[{}]/g, '').trim()
      const parts = variable.split('.')

      if (parts.length >= 2) {
        const [type, name] = parts
        if (type && name && !params.some(p => p.name === name && p.type === type)) {
          params.push({
            name,
            type,
            required: false,
            description: `${getParamTypeDescription(type)}参数 ${name}`
          })
        }
      } else if (parts.length === 1) {
        const name = parts[0]
        if (name && !params.some(p => p.name === name && p.type === 'template')) {
          params.push({
            name,
            type: 'template',
            required: false,
            description: `模板变量 ${name}`
          })
        }
      }
    })
  }
}

/**
 * 构建请求示例
 */
export function buildRequestExample(route, method) {
  if (!['POST', 'PUT', 'PATCH'].includes(method)) {
    return []
  }

  const example = generateRequestExample(route)
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
function generateRequestExample(route) {
  // 基于响应模板生成请求示例
  if (route.response && typeof route.response === 'object') {
    const example = {}

    // 从响应中提取可能的请求字段
    extractExampleFromResponse(route.response, example, route)

    return Object.keys(example).length > 0 ? example : null
  }

  return null
}

/**
 * 从响应中提取示例
 */
function extractExampleFromResponse(obj, example) {
  if (typeof obj === 'string') {
    const matches = obj.match(/\{\{body\.([^}]+)\}\}/g)
    if (matches) {
      matches.forEach(match => {
        const fieldName = match.replace(/\{\{body\.|\}\}/g, '')
        if (!example[fieldName]) {
          example[fieldName] = generateExampleValue(fieldName)
        }
      })
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(item => {
      extractExampleFromResponse(item, example)
    })
  } else if (typeof obj === 'object' && obj !== null) {
    Object.values(obj).forEach(value => {
      extractExampleFromResponse(value, example)
    })
  }
}

/**
 * 生成示例值
 */
function generateExampleValue(fieldName) {
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
export function buildResponseExample(route) {
  if (!route.response) {
    return []
  }

  const example = generateResponseExample(route.response, route)

  return [
    heading(2, text('响应示例')),
    code('json', JSON.stringify(example, null, 2))
  ]
}

/**
 * 生成响应示例
 */
function generateResponseExample(response, route = {}) {
  // 如果是 blob 响应类型，返回文件下载信息
  if (route.responseType === 'blob') {
    return {
      message: 'File download response',
      contentType: route.contentType || 'application/octet-stream',
      fileName: route.fileName || 'downloaded-file',
      disposition: 'attachment'
    }
  }

  if (typeof response === 'string') {
    return response.replace(/\{\{[^}]+\}\}/g, (match) => {
      return generateExampleValueForTemplate(match)
    })
  }

  if (Array.isArray(response)) {
    return response.map(item => generateResponseExample(item, route))
  }

  if (typeof response === 'object' && response !== null) {
    const example = {}
    Object.entries(response).forEach(([key, value]) => {
      example[key] = generateResponseExample(value, route)
    })
    return example
  }

  return response
}

/**
 * 为模板变量生成示例值
 */
function generateExampleValueForTemplate(variable) {
  if (variable.includes('params.id')) return '123'
  if (variable.includes('query.q')) return '搜索关键词'
  if (variable.includes('body.name')) return '张三'
  if (variable.includes('body.email')) return 'zhangsan@example.com'
  if (variable.includes('body.id')) return '456'
  if (variable.includes('responseTime')) return '50'

  return '示例值'
}


/**
 * 检查路由是否匹配默认配置（简化版本，用于文档生成）
 */
export function isRouteMatchedForDocs(route, defaultConfig) {
  const routePath = route.path

  // 检查 excludes
  if (defaultConfig.excludes && Array.isArray(defaultConfig.excludes)) {
    for (const excludePattern of defaultConfig.excludes) {
      if (simplePatternMatch(routePath, excludePattern)) {
        return false
      }
    }
  }

  // 检查 includes
  if (defaultConfig.includes && Array.isArray(defaultConfig.includes)) {
    for (const includePattern of defaultConfig.includes) {
      if (simplePatternMatch(routePath, includePattern)) {
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
function simplePatternMatch(path, pattern) {
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
export function buildErrorResponse(route) {
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
 * 从路由配置中提取参数信息
 * 使用 path-to-regexp 进行更准确的路径解析
 */
export function extractParams(route) {
  const params = []

  // 使用 path-to-regexp 提取路径参数
  try {
    const parsed = parsePathToRegexp(route.path)
    const tokens = parsed.tokens || []

    extractParamsFromTokens(tokens, params)
  } catch (error) {
    // 如果 path-to-regexp 解析失败，回退到原来的正则表达式方法
    console.warn(`路径解析失败，使用备用方法: ${route.path}`, error.message)
    extractParamsWithRegex(route.path, params)
  }

  // 从响应模板中推断参数
  if (route.response) {
    extractParamsFromTemplate(route.response, params)
  }

  return params
}


/**
 * 构建参数表格
 */
export function buildParamsTable(params) {
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
 * 构建基本信息部分
 */
export function buildBasicInfo(route, method, fullPath) {
  // const infoLines = [
  //   `- **描述**: ${route.description || '暂无描述'}`,
  //   `- **URL**: \`${fullPath}\``,
  //   `- **请求类型**: \`${method}\``,
  // ]

  const codeUrl = [
    `## 基本信息\n`,
    `::: code-url ${method}`,
    `\`\`\``,
    fullPath,
    `\`\`\``,
    `:::`,
  ]

  const infoLines = []

  route.description && infoLines.unshift(`- **描述**: ${route.description || '暂无描述'}`)

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
    value: codeUrl.concat(infoLines).join('\n')
  }
}

/**
 * 构建请求参数部分
 */
export function buildRequestParams(route, method) {
  const params = extractParams(route)

  if (params.length === 0) {
    return []
  }

  const sections = []

  // 路径参数
  const pathParams = params.filter(p => p.type === 'path')
  if (pathParams.length > 0) {
    sections.push(
      heading(2, text('路径参数')),
      buildParamsTable(pathParams)
    )
  }

  // 查询参数
  const queryParams = params.filter(p => p.type === 'query')
  if (queryParams.length > 0) {
    sections.push(
      heading(2, text('查询参数')),
      buildParamsTable(queryParams)
    )
  }

  // 请求体参数（POST/PUT/PATCH）
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const bodyParams = params.filter(p => p.type === 'body')
    if (bodyParams.length > 0) {
      sections.push(
        heading(2, text('请求体参数')),
        buildParamsTable(bodyParams)
      )
    }
  }

  return sections
}


/**
* 扁平化数组，过滤掉空值
*/
export function flattenArray(arr) {
  if (!arr) return []
  if (!Array.isArray(arr)) return [arr]
  return arr.filter(Boolean)
}

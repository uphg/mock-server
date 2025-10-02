import merge from 'lodash.merge'
import { mockConfigSchema } from '../schema.js'
import omit from 'lodash.omit'
import { match } from 'path-to-regexp'

export function validateConfig(config) {
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
    validateRoute(route)
  }
}

function validateRoute(route) {
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

/**
 * 应用路由默认配置
 * 优先级：路由显式配置 > 路由默认配置（defaults） > 全局默认配置
 */
export function applyRouteDefaults(config) {
  if (!config.routeDefaults || !Array.isArray(config.routeDefaults)) {
    return
  }

  // 为每个路由应用匹配的默认配置
  for (const route of config.routes) {
    // 获取全局默认配置（除了 routes 和 routeDefaults）
    const globalDefaults = extractGlobalDefaults(config)

    // 获取匹配的路由默认配置
    const matchingDefaults = getMatchingRouteDefaults(route, config.routeDefaults)

    // 按优先级合并配置：全局默认 < 路由默认 < 路由显式配置
    let mergedConfig = merge({}, globalDefaults)

    // 依次应用匹配的路由默认配置
    for (const defaultConfig of matchingDefaults) {
      mergedConfig = merge(mergedConfig, defaultConfig.config)
    }

    // 最后应用路由的显式配置（优先级最高）
    const routeExplicitConfig = omit(route, 'name', 'path', 'method', 'description')

    mergedConfig = merge(mergedConfig, routeExplicitConfig)

    // 将合并后的配置应用到路由（保留原有的 path, method, description）
    Object.assign(route, mergedConfig)
  }
}

/**
 * 提取全局默认配置
 */
function extractGlobalDefaults(config) {
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
function getMatchingRouteDefaults(route, routeDefaults) {
  const matchingDefaults = []

  for (const defaultConfig of routeDefaults) {
    if (isRouteMatched(route, defaultConfig)) {
      matchingDefaults.push(defaultConfig)
    }
  }

  return matchingDefaults
}

/**
 * 检查路由是否匹配默认配置的条件
 */
function isRouteMatched(route, defaultConfig) {
  const routePath = route.path

  // 检查 excludes 条件
  if (defaultConfig.excludes && Array.isArray(defaultConfig.excludes)) {
    for (const excludePattern of defaultConfig.excludes) {
      if (matchPattern(routePath, excludePattern)) {
        return false // 被排除
      }
    }
  }

  // 检查 includes 条件
  if (defaultConfig.includes && Array.isArray(defaultConfig.includes)) {
    for (const includePattern of defaultConfig.includes) {
      if (matchPattern(routePath, includePattern)) {
        return true // 被包含
      }
    }
    return false // 有 includes 但不匹配
  }

  // 如果没有 includes 条件，且没有被 excludes 排除，则匹配
  return true
}

/**
 * 模式匹配（使用 path-to-regexp 库）
 * 
 * 支持以下模式：
 * 
 * 1. 参数匹配：
 *    - /user/:id 匹配 /user/123, /user/abc 等
 *    - /api/:version/users/:id 匹配 /api/v1/users/123 等
 * 
 * 2. 通配符匹配：
 *    - /api/*path 匹配 /api/v1/users, /api/v2/posts/123 等
 *    - * 匹配任意路径
 *    - /files/*path 匹配 /files/docs/readme.txt 等
 * 
 * 3. 可选参数：
 *    - /users{/:id}/delete 匹配 /users/delete 和 /users/123/delete
 *    - /api{/:version} 匹配 /api 和 /api/v1
 * 
 * 4. 精确匹配：
 *    - /api/users 只匹配 /api/users
 * 
 * 5. 向后兼容的简单通配符：
 *    - /api/* 自动转换为 /api/*path
 *    - * 自动转换为 /*path
 * 
 * @param {string} path - 要匹配的路径
 * @param {string} pattern - 匹配模式
 * @returns {boolean} 是否匹配
 */
export function matchPattern(path, pattern) {
  try {
    // 处理简单的通配符模式（向后兼容）
    if (pattern.includes('*') && !pattern.includes(':') && !pattern.includes('{')) {
      // 如果是简单的通配符模式，转换为 path-to-regexp 格式
      const convertedPattern = convertSimpleWildcard(pattern)
      const matcher = match(convertedPattern, { decode: decodeURIComponent })
      const result = matcher(path)
      return result !== false
    }

    // 使用 path-to-regexp 进行匹配
    const matcher = match(pattern, { decode: decodeURIComponent })
    const result = matcher(path)
    return result !== false
  } catch (error) {
    // 如果 path-to-regexp 解析失败，回退到简单的字符串匹配
    console.warn(`Pattern parsing failed for "${pattern}": ${error.message}. Falling back to exact match.`)
    return path === pattern
  }
}

/**
 * 将简单的通配符模式转换为 path-to-regexp 格式
 * 例如：/api/* -> /api/*path
 *      * -> /*path
 */
export function convertSimpleWildcard(pattern) {
  // 如果模式只是 *，转换为 /*path
  if (pattern === '*') {
    return '/*path'
  }

  // 将末尾的 * 替换为 *path
  if (pattern.endsWith('*')) {
    return pattern.replace(/\*$/, '*path')
  }

  // 将中间的 * 替换为 *segment
  return pattern.replace(/\*/g, '*segment')
}
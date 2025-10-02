import Handlebars from 'handlebars'
import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import { getContentType } from './type.js'
import { pluginManager } from '../plugins/plugin-manager.js'
import { logger } from './logger.js'

export function createHandler(route, globalConfig) {
  return async (req, res) => {
    try {
      // 路由级延迟（优先级高于全局延迟）
      if (route.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, route.delay))
      }

      // 设置状态码
      const statusCode = route.statusCode || 200

      // 设置自定义头
      if (route.headers) {
        Object.entries(route.headers).forEach(([key, value]) => {
          res.setHeader(key, value)
        })
      }

      // 获取响应类型
      const responseType = route.responseType || 'json'

      if (responseType === 'blob') {
        // 处理文件流响应
        const mockDir = globalConfig.mockDir || './mock/data'
        const filePath = path.resolve(mockDir, route.responseFile)
        const fileName = route.fileName || path.basename(route.responseFile)

        // 检查文件是否存在
        try {
          await fsPromises.access(filePath)
        } catch {
          res.status(404).json({
            error: 'File Not Found',
            message: `File ${route.responseFile} not found`
          })
          return
        }

        // 设置下载头
        const contentType = route.contentType || getContentType(path.extname(filePath))
        res.setHeader('Content-Type', contentType)
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)

        // 发送文件流
        const fileStream = fs.createReadStream(filePath)
        fileStream.pipe(res)

        // 处理流错误
        fileStream.on('error', (error) => {
          logger.error('SERVER', `文件流错误 ${route.path}: ${error.message}`)
          if (!res.headersSent) {
            res.status(500).json({
              error: 'Internal Server Error',
              message: 'File stream error'
            })
          }
        })

      } else {
        // 处理动态响应
        let response
        if (route.responseFileType) {
          // 使用插件系统加载数据
          response = await pluginManager.loadData(route, req)
        } else {
          response = processResponse(route.response, req)
        }

        // 发送 JSON 响应
        res.status(statusCode).json(response)
      }

    } catch (error) {
      logger.error('SERVER', `路由处理错误 ${route.path}: ${error.message}`)
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal Server Error',
          message: error.message
        })
      }
    }
  }
}



export function processResponse(response, req) {
  if (typeof response === 'function') {
    return response(req)
  }

  // 处理模板变量
  if (typeof response === 'string') {
    return processTemplate(response, req)
  }

  // 深度处理对象和数组
  if (Array.isArray(response)) {
    return response.map(item => processResponse(item, req))
  }

  if (typeof response === 'object' && response !== null) {
    const processed = {}
    for (const [key, value] of Object.entries(response)) {
      processed[key] = processResponse(value, req)
    }
    return processed
  }

  return response
}


export function processTemplate(template, req) {
  if (typeof template !== 'string') return template

  try {
    // 编译 Handlebars 模板
    const compiledTemplate = Handlebars.compile(template)

    // 准备模板数据
    const templateData = {
      query: req.query || {},
      params: req.params || {},
      body: req.body || {},
      headers: req.headers || {},
      method: req.method,
      url: req.url,
      path: req.path
    }

    // 渲染模板
    const result = compiledTemplate(templateData)

    // 简化处理：只处理基本的类型转换，模板替换结果保持为字符串
    return tryParseValue(result)
  } catch (error) {
    logger.error('SERVER', `模板处理错误: ${error.message}`)
    return template // 如果模板处理失败，返回原始字符串
  }
}


export function tryParseValue(value) {
  if (typeof value !== 'string') return value

  // 如果字符串包含模板语法但没有被替换，直接返回
  if (value.includes('{{') && value.includes('}}')) {
    return value
  }

  // 尝试解析为布尔值
  if (value === 'true') return true
  if (value === 'false') return false

  // 尝试解析为null或undefined
  if (value === 'null') return null
  if (value === 'undefined') return undefined

  // 尝试解析为JSON（数组或对象）
  if ((value.startsWith('[') && value.endsWith(']')) ||
    (value.startsWith('{') && value.endsWith('}'))) {
    try {
      return JSON.parse(value)
    } catch {
      // 如果JSON解析失败，返回原字符串
    }
  }

  // 对于模板替换的结果，保持为字符串
  // 这样行为更加可预测和一致
  return value
}


export function getNetworkUrls(port, basePath) {
  const urls = []
  try {
    const networkInterfaces = require('os').networkInterfaces()
    
    Object.values(networkInterfaces).forEach(interfaces => {
      interfaces.forEach(details => {
        if (details.family === 'IPv4' && !details.internal) {
          urls.push(`http://${details.address}:${port}${basePath}`)
        }
      })
    })
  } catch (e) {
    // 忽略错误
  }
  return urls
}

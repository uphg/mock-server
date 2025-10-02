#!/usr/bin/env node

import path from 'path'
import { ConfigLoader } from './config-loader'
import { DocsGenerator } from './docs-generator'

/**
 * 生成API接口文档
 */
async function generateDocs() {
  try {
    console.log('🚀 开始生成API接口文档...')
    
    // 获取配置文件路径
    const configPath = process.argv[2] || './mock/mock.config.json'
    const fullConfigPath = path.resolve(process.cwd(), configPath)
    
    console.log(`📖 读取配置文件: ${fullConfigPath}`)
    
    // 加载配置
    const configLoader = new ConfigLoader(fullConfigPath)
    const config = await configLoader.loadConfig()
    
    console.log(`✅ 配置加载成功，发现 ${config.routes.length} 个路由`)
    
    // 生成文档
    const docsGenerator = new DocsGenerator(config)
    await docsGenerator.generateAllDocs()
    
    console.log('🎉 文档生成完成！')
    
  } catch (error) {
    console.error('❌ 文档生成失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDocs()
}

export { generateDocs }
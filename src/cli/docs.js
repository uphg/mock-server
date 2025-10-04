import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { ConfigLoader } from '../config-loader.js'
import { pluginManager } from '../plugins/plugin-manager.js'
import docsPlugin from '../../plugins/docs-plugin/index.js'

export async function docsCommand(options) {
  const configPath = path.resolve(options.config)
  const outputDir = path.resolve(options.output)

  // Check if config file exists
  if (!fs.existsSync(configPath)) {
    console.error('❌ Configuration file not found:', configPath)
    console.log('💡 Run "mock-server init" to create a configuration file')
    process.exit(1)
  }

  if (options.dev) {
    console.log('📚 Starting documentation dev server...')

    // First generate docs
    await generateDocs(configPath, outputDir)

    // Then start dev server
    const child = spawn('vitepress', ['dev', outputDir], {
      stdio: 'inherit',
      cwd: process.cwd()
    })

    child.on('error', (error) => {
      console.error('❌ Failed to start docs server:', error.message)
      if (error.code === 'ENOENT') {
        console.log('💡 Make sure vitepress is installed: npm install -D vitepress')
      }
      process.exit(1)
    })

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down docs server...')
      child.kill('SIGINT')
    })

    process.on('SIGTERM', () => {
      console.log('\n👋 Shutting down docs server...')
      child.kill('SIGTERM')
    })

  } else if (options.build) {
    console.log('📦 Building static documentation...')

    await generateDocs(configPath, outputDir)

    const child = spawn('vitepress', ['build', outputDir], {
      stdio: 'inherit',
      cwd: process.cwd()
    })

    child.on('error', (error) => {
      console.error('❌ Failed to build docs:', error.message)
      if (error.code === 'ENOENT') {
        console.log('💡 Make sure vitepress is installed: npm install -D vitepress')
      }
      process.exit(1)
    })

  } else {
    console.log('📄 Generating API documentation...')
    await generateDocs(configPath, outputDir)
    console.log('✅ Documentation generated successfully!')
    console.log(`📁 Output directory: ${outputDir}`)
  }
}

async function generateDocs(configPath, outputDir) {
  try {
    // Register docs plugin
    pluginManager.register(docsPlugin)

    // Load configuration
    const configLoader = new ConfigLoader(configPath)
    const config = await configLoader.loadConfig()

    // Get docs plugin
    const docsPluginInstance = pluginManager.plugins.get('docs-plugin')
    if (!docsPluginInstance) {
      throw new Error('Docs plugin not found. Make sure @mockfly/docs-plugin is installed.')
    }

    // Generate docs using plugin
    await docsPluginInstance.generateDocs(config, outputDir)
  } catch (error) {
    throw new Error(`Documentation generation failed: ${error.message}`)
  }
}
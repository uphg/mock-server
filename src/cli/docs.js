import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

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
  return new Promise((resolve, reject) => {
    const child = spawn('node', [
      path.resolve('src/generate-docs.js'),
      configPath
    ], {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        DOCS_OUTPUT_DIR: outputDir
      }
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Documentation generation failed with code ${code}`))
      }
    })

    child.on('error', (error) => {
      reject(error)
    })
  })
}
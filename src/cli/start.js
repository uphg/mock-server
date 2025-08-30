import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export async function startCommand(options) {
  const configPath = path.resolve(options.config)
  
  // Check if config file exists
  if (!fs.existsSync(configPath)) {
    console.error('❌ Configuration file not found:', configPath)
    console.log('💡 Run "mock-server init" to create a configuration file')
    process.exit(1)
  }

  console.log('🚀 Starting mock server...')
  console.log('📄 Config:', configPath)
  
  if (options.port) {
    console.log('🔌 Port:', options.port)
  }

  const args = [path.resolve('src/index.js'), configPath]
  
  if (options.port) {
    args.push('--port', options.port)
  }

  const nodeArgs = options.dev ? ['--watch', ...args] : args

  const child = spawn('node', nodeArgs, {
    stdio: 'inherit',
    cwd: process.cwd()
  })

  child.on('error', (error) => {
    console.error('❌ Failed to start server:', error.message)
    process.exit(1)
  })

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Server exited with code ${code}`)
      process.exit(code)
    }
  })

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down mock server...')
    child.kill('SIGINT')
  })

  process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down mock server...')
    child.kill('SIGTERM')
  })
}
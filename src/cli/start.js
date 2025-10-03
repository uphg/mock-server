import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

export async function startCommand(options, globalOptions = {}) {
  const configPath = path.resolve(options.config)

  // Check if config file exists
  if (!fs.existsSync(configPath)) {
    console.error('❌ Configuration file not found:', configPath)
    console.log('💡 Run "mockfly init" to create a configuration file')
    process.exit(1)
  }

  console.log('🚀 Starting mock server...')
  console.log('📄 Config:', configPath)

  if (options.port) {
    console.log('🔌 Port:', options.port)
  }

  // Get the correct path to src/index.js using import.meta.url
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const indexPath = path.resolve(__dirname, '../index.js')

  const args = [indexPath, configPath]

  if (options.port) {
    args.push('--port', options.port)
  }

  if (options.host) {
    args.push('--host', options.host)
  }

  if (options.verbose) {
    args.push('--verbose')
  }

  if (globalOptions.log) {
    args.push('--log')
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
import { test, describe } from 'node:test'
import assert from 'node:assert'
import { spawn } from 'child_process'
import path from 'path'

describe('CLI Tests', () => {
  const cliPath = path.resolve(process.cwd(), 'bin/cli.js')

  test('应该显示全局帮助信息', async () => {
    const child = spawn('node', [cliPath, '--help'], {
      stdio: 'pipe'
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    await new Promise((resolve, reject) => {
      child.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Process exited with code ${code}, stderr: ${stderr}`))
        }
      })
    })

    assert.ok(stdout.includes('Usage: mockfly [options] [command]'))
    assert.ok(stdout.includes('CLI tool for mockfly'))
    assert.ok(stdout.includes('Commands:'))
    assert.ok(stdout.includes('init'))
    assert.ok(stdout.includes('start'))
    assert.ok(stdout.includes('docs'))
  })

  test('应该显示 start 命令帮助信息', async () => {
    const child = spawn('node', [cliPath, 'start', '--help'], {
      stdio: 'pipe'
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    await new Promise((resolve, reject) => {
      child.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Process exited with code ${code}, stderr: ${stderr}`))
        }
      })
    })

    assert.ok(stdout.includes('Usage: mockfly start [options]'))
    assert.ok(stdout.includes('Start the mock server'))
    assert.ok(stdout.includes('--host <host>'))
    assert.ok(stdout.includes('--port <port>'))
    assert.ok(stdout.includes('--config <config>'))
  })

  test('应该使用 --host 选项启动服务器', async () => {
    const child = spawn('node', [cliPath, 'start', '--host', '0.0.0.0', '--port', '3007'], {
      stdio: 'pipe'
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    // 等待服务器启动输出
    await new Promise((resolve) => {
      const checkOutput = () => {
        if (stdout.includes('ready in')) {
          resolve()
        } else {
          setTimeout(checkOutput, 100)
        }
      }
      checkOutput()
    })

    // 终止服务器
    child.kill('SIGINT')

    await new Promise((resolve) => {
      child.on('close', () => {
        resolve()
      })
    })

    assert.ok(stdout.includes('Mockfly'))
    assert.ok(stdout.includes('ready in'))
    assert.ok(stdout.includes('Network: exposed to all interfaces'))
  })

  test('应该使用默认配置启动服务器', async () => {
    const child = spawn('node', [cliPath, 'start', '--port', '3008'], {
      stdio: 'pipe'
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    // 等待服务器启动输出
    await new Promise((resolve) => {
      const checkOutput = () => {
        if (stdout.includes('ready in')) {
          resolve()
        } else {
          setTimeout(checkOutput, 100)
        }
      }
      checkOutput()
    })

    // 终止服务器
    child.kill('SIGINT')

    await new Promise((resolve) => {
      child.on('close', () => {
        resolve()
      })
    })

    assert.ok(stdout.includes('Mockfly'))
    assert.ok(stdout.includes('ready in'))
    assert.ok(stdout.includes('Local:'))
    assert.ok(stdout.includes('use --host to expose'))
  })
})
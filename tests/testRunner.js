#!/usr/bin/env node

import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🧪 开始运行Mock Server单元测试...\n')

// 运行所有测试文件
const testFiles = [
  'schema.test.js',
  'configLoader.test.js', 
  'routeGenerator.test.js',
  'mockServer.test.js'
]

let totalTests = 0
let passedTests = 0
let failedTests = 0

async function runTest(testFile) {
  return new Promise((resolve) => {
    console.log(`📋 运行测试: ${testFile}`)
    
    const testProcess = spawn('node', ['--test', path.join(__dirname, testFile)], {
      stdio: 'pipe',
      cwd: process.cwd()
    })

    let output = ''
    let errorOutput = ''

    testProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    testProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    testProcess.on('close', (code) => {
      // 解析测试结果
      const lines = output.split('\\n')
      let testCount = 0
      let passed = 0
      let failed = 0

      for (const line of lines) {
        if (line.includes('✓')) {
          testCount++
          passed++
        } else if (line.includes('✗')) {
          testCount++
          failed++
        }
      }

      totalTests += testCount
      passedTests += passed
      failedTests += failed

      if (code === 0) {
        console.log(`  ✅ ${testFile}: ${passed} 通过, ${failed} 失败`)
      } else {
        console.log(`  ❌ ${testFile}: ${passed} 通过, ${failed} 失败`)
        if (errorOutput) {
          console.log(`  错误输出: ${errorOutput}`)
        }
      }

      resolve(code === 0)
    })
  })
}

async function runAllTests() {
  const results = []
  
  for (const testFile of testFiles) {
    const success = await runTest(testFile)
    results.push({ file: testFile, success })
  }

  console.log('\\n' + '='.repeat(50))
  console.log('📊 测试结果汇总:')
  console.log(`总测试数: ${totalTests}`)
  console.log(`通过: ${passedTests}`)
  console.log(`失败: ${failedTests}`)
  console.log(`成功率: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`)

  const failedFiles = results.filter(r => !r.success)
  if (failedFiles.length > 0) {
    console.log('\\n❌ 失败的测试文件:')
    failedFiles.forEach(f => console.log(`  - ${f.file}`))
    process.exit(1)
  } else {
    console.log('\\n🎉 所有测试通过!')
    process.exit(0)
  }
}

// 检查是否安装了supertest
async function checkDependencies() {
  try {
    await import('supertest')
    return true
  } catch (error) {
    console.log('❌ 缺少测试依赖 supertest')
    console.log('请运行: npm install supertest 或 pnpm add supertest')
    return false
  }
}

// 主函数
async function main() {
  const hasDepends = await checkDependencies()
  if (!hasDepends) {
    process.exit(1)
  }
  
  await runAllTests()
}

main().catch(console.error)
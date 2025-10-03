import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert'
import fs from 'fs/promises'
import path from 'path'
import { CSVPlugin } from '../plugins/csv-plugin/index.js'
import { SQLitePlugin } from '../plugins/sqlite-plugin/index.js'

describe('Plugin Implementations', () => {
  describe('CSVPlugin', () => {
    let csvPlugin

    beforeEach(() => {
      csvPlugin = new CSVPlugin()
    })

    test('应该正确初始化', () => {
      assert.strictEqual(csvPlugin.name, 'csv-plugin')
      assert.strictEqual(csvPlugin.version, '1.0.0')
    })

    test('应该返回支持的扩展名', () => {
      const extensions = csvPlugin.getSupportedExtensions()
      assert.deepStrictEqual(extensions, ['.csv'])
    })

    test('应该返回插件信息', () => {
      const info = csvPlugin.getInfo()
      assert.deepStrictEqual(info, {
        name: 'csv-plugin',
        version: '1.0.0',
        description: 'CSV file support for Mockfly'
      })
    })

    test('应该解析CSV数据', async () => {
      // 创建临时CSV文件
      const tempDir = path.join(process.cwd(), 'temp-csv-test')
      await fs.mkdir(tempDir, { recursive: true })

      const csvContent = `name,age,city
John,25,New York
Jane,30,London
Bob,35,Paris`

      const csvPath = path.join(tempDir, 'test.csv')
      await fs.writeFile(csvPath, csvContent)

      try {
        const route = {
          responseFilePath: csvPath,
          csvConfig: { columns: true }
        }
        const req = {}

        const result = await csvPlugin.loadData(route, req)

        assert.ok(Array.isArray(result))
        assert.strictEqual(result.length, 3)
        assert.deepStrictEqual(result[0], { name: 'John', age: '25', city: 'New York' })
        assert.deepStrictEqual(result[1], { name: 'Jane', age: '30', city: 'London' })
        assert.deepStrictEqual(result[2], { name: 'Bob', age: '35', city: 'Paris' })

      } finally {
        // 清理临时文件
        await fs.rm(tempDir, { recursive: true, force: true })
      }
    })

    test('应该处理CSV配置', async () => {
      const tempDir = path.join(process.cwd(), 'temp-csv-config-test')
      await fs.mkdir(tempDir, { recursive: true })

      const csvContent = `John,25,New York
Jane,30,London`

      const csvPath = path.join(tempDir, 'test.csv')
      await fs.writeFile(csvPath, csvContent)

      try {
        const route = {
          responseFilePath: csvPath,
          csvConfig: { columns: false } // 不使用列名
        }
        const req = {}

        const result = await csvPlugin.loadData(route, req)

        assert.ok(Array.isArray(result))
        assert.strictEqual(result.length, 2)
        assert.deepStrictEqual(result[0], ['John', '25', 'New York'])

      } finally {
        await fs.rm(tempDir, { recursive: true, force: true })
      }
    })

    test('应该处理不存在的文件', async () => {
      const route = {
        responseFilePath: '/non-existent/file.csv'
      }
      const req = {}

      await assert.rejects(
        async () => await csvPlugin.loadData(route, req),
        /CSV parsing failed/
      )
    })
  })

  describe('SQLitePlugin', () => {
    let sqlitePlugin

    beforeEach(() => {
      sqlitePlugin = new SQLitePlugin()
    })

    test('应该正确初始化', () => {
      assert.strictEqual(sqlitePlugin.name, 'sqlite-plugin')
      assert.strictEqual(sqlitePlugin.version, '1.0.0')
    })

    test('应该返回支持的扩展名', () => {
      const extensions = sqlitePlugin.getSupportedExtensions()
      assert.deepStrictEqual(extensions, ['.db', '.sqlite', '.sqlite3'])
    })

    test('应该返回插件信息', () => {
      const info = sqlitePlugin.getInfo()
      assert.deepStrictEqual(info, {
        name: 'sqlite-plugin',
        version: '1.0.0',
        description: 'SQLite database file support for Mockfly'
      })
    })

    test('应该处理模板参数', () => {
      const req = {
        params: { id: '123' },
        query: { name: 'test' }
      }

      const result1 = sqlitePlugin.processTemplate('{{params.id}}', req)
      assert.strictEqual(result1, '123')

      const result2 = sqlitePlugin.processTemplate('{{query.name}}', req)
      assert.strictEqual(result2, 'test')

      const result3 = sqlitePlugin.processTemplate('static text', req)
      assert.strictEqual(result3, 'static text')
    })

    // 注意：SQLite数据库的完整测试需要创建实际的数据库文件
    // 这在单元测试中比较复杂，通常在集成测试中处理
    // 这里我们只测试基本功能和错误处理

    test('应该处理不存在的数据库文件', async () => {
      const route = {
        responseFilePath: '/non-existent/database.db'
      }
      const req = {}

      await assert.rejects(
        async () => await sqlitePlugin.loadData(route, req),
        /SQLite query failed/
      )
    })
  })
})
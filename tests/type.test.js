import { test, describe } from 'node:test'
import assert from 'node:assert'
import { getContentType, blobExtensions } from '../src/utils/type.js'

describe('Type Utils', () => {
  describe('getContentType', () => {
    test('应该返回正确的MIME类型', () => {
      assert.strictEqual(getContentType('.xlsx'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      assert.strictEqual(getContentType('.xls'), 'application/vnd.ms-excel')
      assert.strictEqual(getContentType('.docx'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      assert.strictEqual(getContentType('.doc'), 'application/msword')
      assert.strictEqual(getContentType('.pdf'), 'application/pdf')
      assert.strictEqual(getContentType('.zip'), 'application/zip')
      assert.strictEqual(getContentType('.png'), 'image/png')
      assert.strictEqual(getContentType('.jpg'), 'image/jpeg')
      assert.strictEqual(getContentType('.jpeg'), 'image/jpeg')
      assert.strictEqual(getContentType('.gif'), 'image/gif')
      assert.strictEqual(getContentType('.txt'), 'text/plain')
      assert.strictEqual(getContentType('.csv'), 'text/csv')
      assert.strictEqual(getContentType('.json'), 'application/json')
    })

    test('应该处理大写扩展名', () => {
      assert.strictEqual(getContentType('.XLSX'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      assert.strictEqual(getContentType('.PNG'), 'image/png')
    })

    test('应该为未知扩展名返回默认类型', () => {
      assert.strictEqual(getContentType('.unknown'), 'application/octet-stream')
      assert.strictEqual(getContentType('.xyz'), 'application/octet-stream')
    })

    test('应该处理没有点的扩展名', () => {
      assert.strictEqual(getContentType('xlsx'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      assert.strictEqual(getContentType('unknown'), 'application/octet-stream')
    })
  })

  describe('blobExtensions', () => {
    test('应该包含所有支持的扩展名', () => {
      assert.ok(Array.isArray(blobExtensions))
      assert.ok(blobExtensions.length > 0)
      assert.ok(blobExtensions.includes('.xlsx'))
      assert.ok(blobExtensions.includes('.png'))
      assert.ok(blobExtensions.includes('.json'))
    })

    test('应该与contentTypes对象的键匹配', () => {
      const expectedExtensions = [
        '.xlsx', '.xls', '.docx', '.doc', '.pdf', '.zip',
        '.png', '.jpg', '.jpeg', '.gif', '.txt', '.csv', '.json'
      ]

      assert.deepStrictEqual(blobExtensions.sort(), expectedExtensions.sort())
    })
  })
})
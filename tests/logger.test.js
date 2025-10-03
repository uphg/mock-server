import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import { Logger, LOG_LEVELS, LOG_CATEGORIES, colorUrl } from '../src/utils/logger.js'

describe('Logger', () => {
  let logger
  let originalArgv
  let originalConsoleLog

  beforeEach(() => {
    // 保存原始环境
    originalArgv = process.argv
    originalConsoleLog = console.log

    // 创建新的logger实例
    logger = new Logger()
  })

  afterEach(() => {
    // 恢复原始环境
    process.argv = originalArgv
    console.log = originalConsoleLog
  })

  describe('constructor', () => {
    test('应该在有--log参数时启用verbose模式', () => {
      process.argv = ['node', 'script.js', '--log']
      const verboseLogger = new Logger()

      assert.strictEqual(verboseLogger.verbose, true)
      assert.strictEqual(verboseLogger.minLevel, LOG_LEVELS.DEBUG)
    })

    test('应该在有--verbose参数时启用verbose模式', () => {
      process.argv = ['node', 'script.js', '--verbose']
      const verboseLogger = new Logger()

      assert.strictEqual(verboseLogger.verbose, true)
      assert.strictEqual(verboseLogger.minLevel, LOG_LEVELS.DEBUG)
    })

    test('应该在没有verbose参数时使用SILENT级别', () => {
      process.argv = ['node', 'script.js']
      const silentLogger = new Logger()

      assert.strictEqual(silentLogger.verbose, false)
      assert.strictEqual(silentLogger.minLevel, LOG_LEVELS.SILENT)
    })
  })

  describe('setVerbose', () => {
    test('应该能够设置verbose模式', () => {
      logger.setVerbose(true)
      assert.strictEqual(logger.verbose, true)
      assert.strictEqual(logger.minLevel, LOG_LEVELS.DEBUG)

      logger.setVerbose(false)
      assert.strictEqual(logger.verbose, false)
      assert.strictEqual(logger.minLevel, LOG_LEVELS.SILENT)
    })
  })

  describe('formatMessage', () => {
    test('应该正确格式化消息', () => {
      const message = logger.formatMessage(LOG_LEVELS.INFO, 'TEST', 'Test message')

      assert.ok(message.includes('INFO'))
      assert.ok(message.includes('TEST'))
      assert.ok(message.includes('Test message'))
      assert.ok(message.includes('[') && message.includes(']')) // 时间戳
    })
  })

  describe('getLevelString', () => {
    test('应该返回正确的级别字符串', () => {
      assert.strictEqual(logger.getLevelString(LOG_LEVELS.DEBUG), '\x1b[90mDEBUG\x1b[39m')
      assert.strictEqual(logger.getLevelString(LOG_LEVELS.INFO), '\x1b[34mINFO \x1b[39m')
      assert.strictEqual(logger.getLevelString(LOG_LEVELS.WARN), '\x1b[33mWARN \x1b[39m')
      assert.strictEqual(logger.getLevelString(LOG_LEVELS.ERROR), '\x1b[31mERROR\x1b[39m')
      assert.strictEqual(logger.getLevelString(LOG_LEVELS.SUCCESS), '\x1b[32mSUCCESS\x1b[39m')
      assert.strictEqual(logger.getLevelString(999), 'UNKNOWN')
    })
  })

  describe('log', () => {
    test('应该在级别足够时记录日志', () => {
      logger.setVerbose(true)
      let loggedMessage = ''

      console.log = (message) => {
        loggedMessage = message
      }

      logger.log(LOG_LEVELS.INFO, 'TEST', 'Test message')

      assert.ok(loggedMessage.includes('INFO'))
      assert.ok(loggedMessage.includes('TEST'))
      assert.ok(loggedMessage.includes('Test message'))
    })

    test('应该在级别不够时跳过日志', () => {
      logger.setVerbose(false)
      let logCalled = false

      console.log = () => {
        logCalled = true
      }

      logger.log(LOG_LEVELS.DEBUG, 'TEST', 'Test message')

      assert.strictEqual(logCalled, false)
    })
  })

  describe('convenience methods', () => {
    let loggedMessages = []

    beforeEach(() => {
      loggedMessages = []
      console.log = (message) => {
        loggedMessages.push(message)
      }
      logger.setVerbose(true)
    })

    test('debug应该调用log方法', () => {
      logger.debug('TEST', 'Debug message')
      assert.strictEqual(loggedMessages.length, 1)
      assert.ok(loggedMessages[0].includes('DEBUG'))
      assert.ok(loggedMessages[0].includes('Debug message'))
    })

    test('info应该调用log方法', () => {
      logger.info('TEST', 'Info message')
      assert.strictEqual(loggedMessages.length, 1)
      assert.ok(loggedMessages[0].includes('INFO'))
      assert.ok(loggedMessages[0].includes('Info message'))
    })

    test('warn应该调用log方法', () => {
      logger.warn('TEST', 'Warn message')
      assert.strictEqual(loggedMessages.length, 1)
      assert.ok(loggedMessages[0].includes('WARN'))
      assert.ok(loggedMessages[0].includes('Warn message'))
    })

    test('error应该调用log方法', () => {
      logger.error('TEST', 'Error message')
      assert.strictEqual(loggedMessages.length, 1)
      assert.ok(loggedMessages[0].includes('ERROR'))
      assert.ok(loggedMessages[0].includes('Error message'))
    })

    test('success应该调用log方法', () => {
      logger.success('TEST', 'Success message')
      assert.strictEqual(loggedMessages.length, 1)
      assert.ok(loggedMessages[0].includes('SUCCESS'))
      assert.ok(loggedMessages[0].includes('Success message'))
    })
  })

  describe('clearScreen', () => {
    test('应该调用console.log方法', () => {
      let logCalled = false

      console.log = () => { logCalled = true }

      logger.clearScreen()

      assert.strictEqual(logCalled, true)
    })
  })

  describe('colorUrl', () => {
    test('应该正确着色URL', () => {
      const result = colorUrl('http://localhost:3000/api')
      assert.ok(result.includes('\x1b[36m')) // cyan color
      assert.ok(result.includes('\x1b[1m3000\x1b[22m')) // bold port
    })

    test('应该处理没有端口的URL', () => {
      const result = colorUrl('http://example.com/api')
      assert.ok(result.includes('\x1b[36m')) // cyan color
    })
  })

  describe('constants', () => {
    test('LOG_LEVELS应该包含正确的级别', () => {
      assert.strictEqual(LOG_LEVELS.DEBUG, 0)
      assert.strictEqual(LOG_LEVELS.INFO, 1)
      assert.strictEqual(LOG_LEVELS.WARN, 2)
      assert.strictEqual(LOG_LEVELS.ERROR, 3)
      assert.strictEqual(LOG_LEVELS.SUCCESS, 4)
      assert.strictEqual(LOG_LEVELS.SILENT, 99)
    })

    test('LOG_CATEGORIES应该包含正确的类别', () => {
      assert.strictEqual(LOG_CATEGORIES.PLUGIN, 'PLUGIN')
      assert.strictEqual(LOG_CATEGORIES.ROUTER, 'ROUTER')
      assert.strictEqual(LOG_CATEGORIES.DOCS, 'DOCS')
      assert.strictEqual(LOG_CATEGORIES.SERVER, 'SERVER')
      assert.strictEqual(LOG_CATEGORIES.REQUEST, 'REQUEST')
    })
  })
})
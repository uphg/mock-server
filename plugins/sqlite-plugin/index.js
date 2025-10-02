import Database from 'better-sqlite3'
import { MockPlugin } from '../../src/plugins/plugin-interface.js'

/**
 * SQLite Plugin for Mockfly
 * Enables support for SQLite database files (.db, .sqlite, .sqlite3)
 */
export class SQLitePlugin extends MockPlugin {
  constructor() {
    super()
    this.name = 'sqlite-plugin'
    this.version = '1.0.0'
  }

  getSupportedExtensions() {
    return ['.db', '.sqlite', '.sqlite3']
  }

  async loadData(route, req) {
    try {
      const db = new Database(route.responseFilePath)
      db.pragma('journal_mode = WAL')

      // Default query configuration
      const queryConfig = route.sqliteQuery || {
        table: 'data',
        limit: 100
      }

      let query
      let params = []

      if (queryConfig.query) {
        // Use custom query
        query = queryConfig.query
        // Process template variables in params
        if (queryConfig.params) {
          params = queryConfig.params.map(param => this.processTemplate(param, req))
        }
      } else {
        // Build default query
        const table = queryConfig.table || 'data'
        const limit = queryConfig.limit || 100
        const where = queryConfig.where || ''

        query = `SELECT * FROM ${table}`
        if (where) {
          query += ` WHERE ${where}`
        }
        query += ` LIMIT ${limit}`
      }

      const stmt = db.prepare(query)
      const result = stmt.all(...params)

      db.close()

      return result
    } catch (error) {
      throw new Error(`SQLite query failed: ${error.message}`)
    }
  }

  /**
   * Process template variables in parameters
   * @param {any} param - Parameter value
   * @param {object} req - Request object
   * @returns {any} Processed parameter
   */
  processTemplate(param, req) {
    if (typeof param === 'string') {
      // Simple template replacement for common patterns
      return param
        .replace(/\{\{params\.(\w+)\}\}/g, (match, key) => req.params[key] || match)
        .replace(/\{\{query\.(\w+)\}\}/g, (match, key) => req.query[key] || match)
    }
    return param
  }

  getInfo() {
    return {
      name: this.name,
      version: this.version,
      description: 'SQLite database file support for Mockfly'
    }
  }
}

export default new SQLitePlugin()
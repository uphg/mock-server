import { parse } from 'csv/sync'
import fs from 'fs/promises'
import { MockPlugin } from '../../src/plugins/plugin-interface.js'

/**
 * CSV Plugin for Mockfly
 * Enables support for CSV files (.csv)
 */
export class CSVPlugin extends MockPlugin {
  constructor() {
    super()
    this.name = 'csv-plugin'
    this.version = '1.0.0'
  }

  getSupportedExtensions() {
    return ['.csv']
  }

  async loadData(route, req) {
    try {
      const fileContent = await fs.readFile(route.responseFilePath, 'utf-8')

      // CSV parsing configuration
      const csvConfig = route.csvConfig || {
        columns: true,
        skip_empty_lines: true
      }

      const records = parse(fileContent, csvConfig)

      return records
    } catch (error) {
      throw new Error(`CSV parsing failed: ${error.message}`)
    }
  }

  getInfo() {
    return {
      name: this.name,
      version: this.version,
      description: 'CSV file support for Mockfly'
    }
  }
}

export default new CSVPlugin()
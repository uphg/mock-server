import pc from 'picocolors'

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SUCCESS: 4,
  SILENT: 99
}

export const LOG_CATEGORIES = {
  PLUGIN: 'PLUGIN',
  ROUTER: 'ROUTER',
  DOCS: 'DOCS',
  SERVER: 'SERVER',
  REQUEST: 'REQUEST'
}

class Logger {
  constructor() {
    this.verbose = process.argv.includes('--log') || process.argv.includes('--verbose')
    this.minLevel = this.verbose ? LOG_LEVELS.DEBUG : LOG_LEVELS.SILENT
  }

  setVerbose(verbose) {
    this.verbose = verbose
    this.minLevel = verbose ? LOG_LEVELS.DEBUG : LOG_LEVELS.SILENT
  }

  formatMessage(level, category, message) {
    const timestamp = new Date().toISOString()
    const levelStr = this.getLevelString(level)
    const categoryStr = category.padEnd(8)
    return `[${timestamp}] ${levelStr} ${categoryStr} - ${message}`
  }

  getLevelString(level) {
    switch (level) {
      case LOG_LEVELS.DEBUG: return pc.gray('DEBUG')
      case LOG_LEVELS.INFO: return pc.blue('INFO ')
      case LOG_LEVELS.WARN: return pc.yellow('WARN ')
      case LOG_LEVELS.ERROR: return pc.red('ERROR')
      case LOG_LEVELS.SUCCESS: return pc.green('SUCCESS')
      default: return 'UNKNOWN'
    }
  }

  log(level, category, message) {
    if (level < this.minLevel) return

    const formatted = this.formatMessage(level, category, message)
    console.log(formatted)
  }

  debug(category, message) {
    this.log(LOG_LEVELS.DEBUG, category, message)
  }

  info(category, message) {
    this.log(LOG_LEVELS.INFO, category, message)
  }

  warn(category, message) {
    this.log(LOG_LEVELS.WARN, category, message)
  }

  error(category, message) {
    this.log(LOG_LEVELS.ERROR, category, message)
  }

  success(category, message) {
    this.log(LOG_LEVELS.SUCCESS, category, message)
  }
}

export function colorUrl(url) {
  return pc.cyan(url.replace(/:(\d+)\//, (_, port) => `:${pc.bold(port)}/`))
}
  
export const logger = new Logger()
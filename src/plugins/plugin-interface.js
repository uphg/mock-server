/**
 * Mockfly Plugin Interface
 * All plugins must implement this interface
 */
export class MockPlugin {
  constructor() {
    this.name = 'base-plugin'
    this.version = '1.0.0'
  }

  /**
   * Return supported file extensions (with dots)
   * @returns {string[]} Array of supported extensions
   */
  getSupportedExtensions() {
    return []
  }

  /**
   * Load data from file based on route configuration
   * @param {object} route - Route configuration
   * @param {object} req - Express request object
   * @returns {Promise<any>} Parsed data
   */
  async loadData(route, req) {
    throw new Error('Not implemented')
  }

  /**
   * Return plugin information
   * @returns {object} Plugin info
   */
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      description: ''
    }
  }
}
import { MockPlugin } from './plugin-interface.js'

/**
 * Plugin Manager for Mockfly
 * Manages plugin registration and data loading
 */
export class PluginManager {
  constructor() {
    this.plugins = new Map()
    this.extensions = new Map()
  }

  /**
   * Register a plugin
   * @param {MockPlugin} plugin - Plugin instance
   */
  register(plugin) {
    if (!(plugin instanceof MockPlugin)) {
      throw new Error('Plugin must extend MockPlugin class')
    }

    this.plugins.set(plugin.name, plugin)

    // Register file extensions mapping
    for (const ext of plugin.getSupportedExtensions()) {
      this.extensions.set(ext.toLowerCase(), plugin.name)
    }

    console.log(`✅ Plugin registered: ${plugin.name} v${plugin.version}`)
  }

  /**
   * Get plugin for file extension
   * @param {string} ext - File extension (with or without dot)
   * @returns {MockPlugin|null} Plugin instance or null
   */
  getPluginForExtension(ext) {
    const normalizedExt = ext.startsWith('.') ? ext : `.${ext}`
    const pluginName = this.extensions.get(normalizedExt.toLowerCase())
    return pluginName ? this.plugins.get(pluginName) : null
  }

  /**
   * Load data using appropriate plugin
   * @param {object} route - Route configuration
   * @param {object} req - Express request object
   * @returns {Promise<any>} Loaded data
   */
  async loadData(route, req) {
    const plugin = this.plugins.get(route.responseFileType)
    if (!plugin) {
      throw new Error(`No plugin found for type: ${route.responseFileType}`)
    }

    return await plugin.loadData(route, req)
  }

  /**
   * Get all registered plugins
   * @returns {MockPlugin[]} Array of plugin instances
   */
  getAllPlugins() {
    return Array.from(this.plugins.values())
  }

  /**
   * Check if extension is supported by any plugin
   * @param {string} ext - File extension
   * @returns {boolean} Whether extension is supported
   */
  isExtensionSupported(ext) {
    return this.getPluginForExtension(ext) !== null
  }
}

// Global plugin manager instance
export const pluginManager = new PluginManager()
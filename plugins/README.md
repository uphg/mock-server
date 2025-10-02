# Mockfly Plugins

Mockfly supports extending functionality through plugins. This allows users to add support for additional file formats without bloating the core package.

## Available Plugins

### @mockfly/sqlite-plugin
Enables support for SQLite database files (.db, .sqlite, .sqlite3).

**Installation:**
```bash
npm install @mockfly/sqlite-plugin
```

**Usage:**
```json
{
  "routes": [
    {
      "path": "/api/users",
      "method": "GET",
      "responseFile": "users.db",
      "sqliteQuery": {
        "table": "users",
        "limit": 100
      }
    }
  ]
}
```

### @mockfly/csv-plugin
Enables support for CSV files (.csv).

**Installation:**
```bash
npm install @mockfly/csv-plugin
```

**Usage:**
```json
{
  "routes": [
    {
      "path": "/api/data",
      "method": "GET",
      "responseFile": "data.csv",
      "csvConfig": {
        "columns": true,
        "skip_empty_lines": true
      }
    }
  ]
}
```

## Developing Plugins

### Plugin Interface

All plugins must implement the `MockPlugin` interface:

```javascript
import { MockPlugin } from 'mockfly'

export class MyPlugin extends MockPlugin {
  constructor() {
    super()
    this.name = 'my-plugin'
    this.version = '1.0.0'
  }

  getSupportedExtensions() {
    return ['.myext']
  }

  async loadData(route, req) {
    // Implement your data loading logic
    return { data: 'loaded' }
  }
}
```

### Plugin Registration

Plugins are automatically registered when Mockfly starts. The core system scans for installed plugins and loads them.

### Publishing Plugins

To publish a plugin:

1. Create a package with `@mockfly/` prefix
2. Export a default instance of your plugin class
3. Include `mockfly` as a peer dependency
4. Follow semantic versioning

## Migration Guide

### From v0.x to v1.x

If you were using SQLite or CSV files in your mock configurations:

1. Install the appropriate plugins:
   ```bash
   npm install @mockfly/sqlite-plugin @mockfly/csv-plugin
   ```

2. Your existing configurations will continue to work unchanged

3. For new installations, only install plugins you need

## Plugin Discovery

Mockfly automatically discovers plugins by:
1. Checking for installed packages with `@mockfly/` prefix
2. Loading default plugins from the `plugins/` directory
3. Supporting custom plugin paths via configuration

## Contributing

To contribute a new plugin:
1. Create an issue describing the file format you want to support
2. Implement the plugin following the interface
3. Add tests and documentation
4. Submit a pull request
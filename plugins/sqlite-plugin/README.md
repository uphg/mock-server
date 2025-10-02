# @mockfly/sqlite-plugin

[![npm version](https://badge.fury.io/js/%40mockfly%2Fsqlite-plugin.svg)](https://badge.fury.io/js/%40mockfly%2Fsqlite-plugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A plugin for [Mockfly](https://github.com/mockfly/mockfly) that enables support for SQLite database files as mock data sources.

## Features

- 🚀 **Easy Integration**: Seamlessly integrates with Mockfly's plugin system
- 🗄️ **SQLite Support**: Full SQLite database file support (.db, .sqlite, .sqlite3)
- ⚡ **High Performance**: Uses `better-sqlite3` for optimal performance
- 🔧 **Flexible Queries**: Support for custom SQL queries and parameters
- 📝 **Template Variables**: Dynamic query parameters from request data
- 🔒 **Safe Queries**: Prepared statements prevent SQL injection

## Installation

```bash
npm install @mockfly/sqlite-plugin
```

> **Note**: This plugin requires Mockfly v1.0.0 or higher as a peer dependency.

## Quick Start

1. **Install the plugin:**
   ```bash
   npm install @mockfly/sqlite-plugin
   ```

2. **Create a SQLite database file** in your mock data directory:
   ```sql
   CREATE TABLE users (
     id INTEGER PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT UNIQUE,
     department TEXT
   );

   INSERT INTO users (name, email, department) VALUES
   ('John Doe', 'john@example.com', 'Engineering'),
   ('Jane Smith', 'jane@example.com', 'Marketing'),
   ('Bob Johnson', 'bob@example.com', 'Sales');
   ```

3. **Configure your mock server:**
   ```json
   {
     "port": 3000,
     "baseUrl": "/api",
     "mockDir": "./mock/data",
     "routes": [
       {
         "path": "/users",
         "method": "GET",
         "responseFile": "users.db",
         "sqliteQuery": {
           "table": "users"
         }
       }
     ]
   }
   ```

4. **Start your mock server:**
   ```bash
   npx mockfly start
   ```

5. **Test the endpoint:**
   ```bash
   curl http://localhost:3000/api/users
   ```

## Configuration

### Basic Configuration

```json
{
  "routes": [
    {
      "path": "/api/users",
      "method": "GET",
      "responseFile": "users.db",
      "sqliteQuery": {
        "table": "users"
      }
    }
  ]
}
```

### Advanced Configuration

```json
{
  "routes": [
    {
      "path": "/api/user/:id",
      "method": "GET",
      "responseFile": "users.db",
      "sqliteQuery": {
        "query": "SELECT * FROM users WHERE id = ?",
        "params": ["{{params.id}}"]
      }
    },
    {
      "path": "/api/users/search",
      "method": "GET",
      "responseFile": "users.db",
      "sqliteQuery": {
        "query": "SELECT * FROM users WHERE department = ?",
        "params": ["{{query.dept}}"]
      }
    }
  ]
}
```

### SQLite Query Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `table` | `string` | `"data"` | Table name for simple queries |
| `limit` | `number` | `100` | Maximum number of rows to return |
| `where` | `string` | `undefined` | WHERE clause for simple queries |
| `query` | `string` | `undefined` | Custom SQL query |
| `params` | `array` | `[]` | Parameters for custom queries |

## Examples

### Example 1: Simple Table Query

**Configuration:**
```json
{
  "routes": [
    {
      "path": "/products",
      "method": "GET",
      "responseFile": "ecommerce.db",
      "sqliteQuery": {
        "table": "products",
        "limit": 50
      }
    }
  ]
}
```

### Example 2: Custom SQL Query

**Configuration:**
```json
{
  "routes": [
    {
      "path": "/user/:id",
      "method": "GET",
      "responseFile": "users.db",
      "sqliteQuery": {
        "query": "SELECT id, name, email FROM users WHERE id = ?",
        "params": ["{{params.id}}"]
      }
    }
  ]
}
```

### Example 3: Dynamic Filtering

**Configuration:**
```json
{
  "routes": [
    {
      "path": "/users/search",
      "method": "GET",
      "responseFile": "users.db",
      "sqliteQuery": {
        "query": "SELECT * FROM users WHERE department = ? AND active = 1",
        "params": ["{{query.department}}"]
      }
    }
  ]
}
```

**Usage:**
```bash
curl "http://localhost:3000/api/users/search?department=Engineering"
```

### Example 4: Complex Joins

**Configuration:**
```json
{
  "routes": [
    {
      "path": "/orders/:userId",
      "method": "GET",
      "responseFile": "ecommerce.db",
      "sqliteQuery": {
        "query": `
          SELECT o.id, o.total, o.date, p.name as product_name
          FROM orders o
          JOIN order_items oi ON o.id = oi.order_id
          JOIN products p ON oi.product_id = p.id
          WHERE o.user_id = ?
          ORDER BY o.date DESC
        `,
        "params": ["{{params.userId}}"]
      }
    }
  ]
}
```

## Template Variables

The plugin supports template variables in query parameters:

- `{{params.paramName}}` - URL path parameters
- `{{query.paramName}}` - Query string parameters
- `{{body.paramName}}` - Request body parameters (for POST/PUT requests)

## Database Schema Tips

### Recommended Schema Patterns

1. **Use INTEGER PRIMARY KEY for IDs:**
   ```sql
   CREATE TABLE users (
     id INTEGER PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT UNIQUE
   );
   ```

2. **Add indexes for frequently queried columns:**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_users_department ON users(department);
   ```

3. **Use appropriate data types:**
   - `INTEGER` for numbers
   - `REAL` for decimals
   - `TEXT` for strings
   - `BLOB` for binary data

## API Reference

### SQLitePlugin Class

The main plugin class that extends `MockPlugin`.

#### Methods

- `getSupportedExtensions()`: Returns `['.db', '.sqlite', '.sqlite3']`
- `loadData(route, req)`: Executes SQLite query and returns results
- `getInfo()`: Returns plugin information

#### Properties

- `name`: `'sqlite-plugin'`
- `version`: `'1.0.0'`

## Performance Considerations

- **Prepared Statements**: All queries use prepared statements for security and performance
- **Connection Pooling**: Database connections are managed efficiently
- **Query Limits**: Default limit of 100 rows prevents large result sets
- **Indexing**: Ensure proper indexes on frequently queried columns

## Troubleshooting

### Common Issues

1. **"Database file not found" error**
   - Ensure the SQLite file exists in the correct location
   - Check file permissions
   - Verify the `mockDir` configuration

2. **"SQL syntax error"**
   - Validate your SQL query syntax
   - Check parameter placeholders (`?`) match the params array
   - Use database tools to test queries directly

3. **"Plugin not found" error**
   - Ensure the plugin is installed: `npm install @mockfly/sqlite-plugin`
   - Check Mockfly version compatibility

4. **Performance issues**
   - Add indexes on frequently queried columns
   - Use appropriate LIMIT clauses
   - Consider query optimization

### Debug Mode

Enable verbose logging:

```bash
npx mockfly start --verbose
```

## Database Tools

### Creating SQLite Files

You can create SQLite database files using various tools:

1. **SQLite Browser** (GUI): https://sqlitebrowser.org/
2. **Command Line:**
   ```bash
   sqlite3 mydata.db
   ```

3. **Node.js Script:**
   ```javascript
   const Database = require('better-sqlite3')
   const db = new Database('data.db')

   // Create tables and insert data
   db.exec(`
     CREATE TABLE users (
       id INTEGER PRIMARY KEY,
       name TEXT,
       email TEXT
     )
   `)

   db.close()
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related

- [Mockfly](https://github.com/mockfly/mockfly) - The core mock server
- [@mockfly/csv-plugin](https://www.npmjs.com/package/@mockfly/csv-plugin) - CSV file support
- [better-sqlite3](https://www.npmjs.com/package/better-sqlite3) - The underlying SQLite library
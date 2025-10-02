# @mockfly/csv-plugin

[![npm version](https://badge.fury.io/js/%40mockfly%2Fcsv-plugin.svg)](https://badge.fury.io/js/%40mockfly%2Fcsv-plugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A plugin for [Mockfly](https://github.com/mockfly/mockfly) that enables support for CSV (Comma-Separated Values) files as mock data sources.

## Features

- 🚀 **Easy Integration**: Seamlessly integrates with Mockfly's plugin system
- 📊 **CSV Parsing**: Supports standard CSV format with customizable options
- ⚡ **High Performance**: Uses the `csv` library for efficient parsing
- 🔧 **Configurable**: Extensive configuration options for different CSV formats
- 📝 **TypeScript Support**: Full TypeScript definitions included

## Installation

```bash
npm install @mockfly/csv-plugin
```

> **Note**: This plugin requires Mockfly v1.0.0 or higher as a peer dependency.

## Quick Start

1. **Install the plugin:**
   ```bash
   npm install @mockfly/csv-plugin
   ```

2. **Create a CSV file** in your mock data directory:
   ```csv
   id,name,email,department
   1,John Doe,john@example.com,Engineering
   2,Jane Smith,jane@example.com,Marketing
   3,Bob Johnson,bob@example.com,Sales
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
         "responseFile": "users.csv"
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
      "path": "/api/data",
      "method": "GET",
      "responseFile": "data.csv"
    }
  ]
}
```

### Advanced Configuration

```json
{
  "routes": [
    {
      "path": "/api/products",
      "method": "GET",
      "responseFile": "products.csv",
      "csvConfig": {
        "columns": true,
        "skip_empty_lines": true,
        "delimiter": ";",
        "quote": "\"",
        "escape": "\"",
        "comment": "#",
        "skip_lines_with_error": false
      }
    }
  ]
}
```

### CSV Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `columns` | `boolean \| string[]` | `true` | If `true`, the first row is treated as column names. If an array, specifies column names. |
| `skip_empty_lines` | `boolean` | `true` | Skip empty lines in the CSV file. |
| `delimiter` | `string` | `","` | Field delimiter character. |
| `quote` | `string` | `"\""` | Quote character for fields containing special characters. |
| `escape` | `string` | `"\""` | Escape character for quotes within fields. |
| `comment` | `string` | `undefined` | Comment character that prefixes comment lines. |
| `skip_lines_with_error` | `boolean` | `false` | Skip lines that cannot be parsed instead of throwing an error. |

## Examples

### Example 1: Basic CSV Usage

**data.csv:**
```csv
name,age,city
Alice,25,New York
Bob,30,Los Angeles
Charlie,35,Chicago
```

**Configuration:**
```json
{
  "routes": [
    {
      "path": "/people",
      "method": "GET",
      "responseFile": "data.csv"
    }
  ]
}
```

**Response:**
```json
[
  {
    "name": "Alice",
    "age": "25",
    "city": "New York"
  },
  {
    "name": "Bob",
    "age": "30",
    "city": "Los Angeles"
  },
  {
    "name": "Charlie",
    "age": "35",
    "city": "Chicago"
  }
]
```

### Example 2: Custom Delimiter

**data.tsv (Tab-separated):**
```tsv
Product	Name	Price	Category
1	Laptop	999.99	Electronics
2	Book	19.99	Books
3	Chair	149.99	Furniture
```

**Configuration:**
```json
{
  "routes": [
    {
      "path": "/products",
      "method": "GET",
      "responseFile": "data.tsv",
      "csvConfig": {
        "delimiter": "\t"
      }
    }
  ]
}
```

### Example 3: No Header Row

**data.csv:**
```csv
John,Doe,30
Jane,Smith,25
Bob,Johnson,40
```

**Configuration:**
```json
{
  "routes": [
    {
      "path": "/users",
      "method": "GET",
      "responseFile": "data.csv",
      "csvConfig": {
        "columns": ["firstName", "lastName", "age"]
      }
    }
  ]
}
```

**Response:**
```json
[
  {
    "firstName": "John",
    "lastName": "Doe",
    "age": "30"
  },
  {
    "firstName": "Jane",
    "lastName": "Smith",
    "age": "25"
  },
  {
    "firstName": "Bob",
    "lastName": "Johnson",
    "age": "40"
  }
]
```

## API Reference

### CSVPlugin Class

The main plugin class that extends `MockPlugin`.

#### Methods

- `getSupportedExtensions()`: Returns `['.csv']`
- `loadData(route, req)`: Loads and parses CSV data
- `getInfo()`: Returns plugin information

## Troubleshooting

### Common Issues

1. **"Plugin not found" error**
   - Ensure the plugin is properly installed: `npm install @mockfly/csv-plugin`
   - Check that you're using Mockfly v1.0.0 or higher

2. **CSV parsing errors**
   - Verify your CSV file format matches your configuration
   - Check for proper quoting of fields containing commas
   - Ensure consistent use of delimiters

3. **Empty response**
   - Check that the CSV file exists in the correct location
   - Verify the file path in your configuration
   - Ensure the file is readable

### Debug Mode

Enable verbose logging to troubleshoot issues:

```bash
npx mockfly start --verbose
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
- [@mockfly/sqlite-plugin](https://www.npmjs.com/package/@mockfly/sqlite-plugin) - SQLite database support
- [csv](https://www.npmjs.com/package/csv) - The underlying CSV parsing library
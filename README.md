# Mock Server

English | [中文](README.zh-CN.md)

🚀 A powerful Mock API server with configuration-driven, auto-documentation generation, and hot-reloading features.

## ✨ Features

- 📝 **Configuration-driven** - Define API routes via JSON configuration files
- 🔄 **Hot Reloading** - Automatically reloads routes when configuration files change (development mode only)
- 📚 **Auto Documentation Generation** - Automatically generates Markdown API documentation from configurations
- 🎯 **Route Default Configurations** - Supports defining common configurations for multiple routes
- 🌐 **CORS Support** - Configurable Cross-Origin Resource Sharing
- ⏱️ **Response Delay** - Simulate real network latency
- 📊 **Health Check** - Built-in health check endpoint
- 🔧 **Template Variables** - Support for dynamic response content
- 🖥️ **Clean Terminal Output** - Clears terminal and displays server info at top on startup
- 🧪 **Test-friendly** - Complete test suite

## 🚀 Quick Start

### CLI Tool (Recommended)

#### Global Installation
```bash
npm install -g mockfly
```

#### Usage within a project
```bash
# 启动 mock 服务
mockfly start

# 启动服务并指定端口
mockfly start --port 3001

# 启动服务并指定主机（暴露到网络）
mockfly start --host 0.0.0.0

# 开发模式（热重载）
mockfly dev

# 生成文档
mockfly docs

# 文档开发模式
mockfly docs --dev

# 初始化项目（如果需要保留）
mockfly init
```

#### CLI Options

| Option | Description |
|--------|-------------|
| `-c, --config <file>` | Specify configuration file (default: ./mock/mock.config.json) |
| `-p, --port <port>` | Server port (default: 3000) |
| `--host <host>` | Server host (default: localhost) |
| `--dev` | Development mode with hot reload |
| `--verbose` | Show detailed server information |
| `-l, --log` | Enable detailed logging output |
| `-h, --help` | Show help information |

### Traditional Approach

#### Install Dependencies
```bash
pnpm install
```

#### Start Server
```bash
# Production mode
pnpm start

# Development mode (hot reloading)
pnpm dev
```

#### Generate Documentation
```bash
# Generate API documentation
pnpm docs:generate
```

### Starting the Server

```bash
# Production mode
pnpm start

# Development mode (with hot reloading)
pnpm dev

# Using a custom configuration file
pnpm start custom.config.json
```

### Accessing the Service

After starting, the server will display complete access information:

```
🚀 Mock server started successfully!
- Server address: http://localhost:3001
- Full path: http://localhost:3001/api
- Health check: http://localhost:3001/health
- API documentation: http://localhost:3001/api/docs
- Port: 3001
- Configuration file: /path/to/mock.config.json
- Base path: /api
- Global delay: 0ms
- CORS: Enabled
- Mock directory: ./data
```

## 📋 Configuration File

### Basic Configuration

Create a `mock.config.json` file:

```json
{
  "port": 3001,
  "baseUrl": "/api",
  "delay": 0,
  "cors": true,
  "mockDir": "./mock/data",
  "routes": [
    {
      "name": "Get user list",
      "path": "/users",
      "method": "GET",
      "responseFile": "users.json"
    }
  ]
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | number | 3000 | Server port |
| `host` | string | localhost | Server host |
| `baseUrl` | string | / | API base path |
| `delay` | number | 0 | Global response delay (milliseconds) |
| `cors` | boolean | true | Whether to enable CORS |
| `mockDir` | string | ./mock/data | Mock data file directory |
| `plugins` | array | - | List of plugins to load |

## 🛣️ Route Configuration

### Basic Routes

```json
{
  "routes": [
    {
      "name": "Get user details",
      "path": "/users/:id",
      "method": "GET",
      "response": {
        "id": "{{params.id}}",
        "name": "User {{params.id}}",
        "email": "user{{params.id}}@example.com"
      }
    }
  ]
}
```

### Route Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | string | Yes | Route name |
| `path` | string | Yes | Route path (supports parameters) |
| `method` | string | Yes | HTTP method |
| `response` | object | No | Direct response data |
| `responseFile` | string | No | Response data file path |
| `responseType` | string | No | Response type: 'json' or 'blob' (default 'json') |
| `contentType` | string | No | Content-Type for blob responses (auto-detected) |
| `fileName` | string | No | Download filename for blob responses |
| `statusCode` | number | No | HTTP status code (default 200) |
| `headers` | object | No | Custom response headers |
| `delay` | number | No | Route-level delay |

### File Stream Responses

For downloading files (Excel, Word, PDF, etc.), use `responseType: "blob"`:

```json
{
  "routes": [
    {
      "name": "Download Excel Report",
      "path": "/download/excel",
      "method": "GET",
      "responseType": "blob",
      "responseFile": "monthly-report.xlsx",
      "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "fileName": "monthly-report.xlsx"
    }
  ]
}
```

Supported file types are automatically detected: `.xlsx`, `.xls`, `.docx`, `.doc`, `.pdf`, `.zip`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.txt`, `.csv`

### Template Variables

Template variables are supported in responses:

- `{{params.id}}` - Path parameters
- `{{query.name}}` - Query parameters
- `{{body.email}}` - Request body parameters
- `{{headers.authorization}}` - Request headers
- `{{method}}` - HTTP method
- `{{url}}` - Full request URL
- `{{path}}` - Request path

## 🔌 Plugin System

The project supports a plugin system for extending functionality. Plugins are only loaded when explicitly configured in `config.plugins`.

### Built-in Plugins

- **SQLite Plugin**: Enables database query responses
- **CSV Plugin**: Enables CSV file data responses

### Configuration Example

```json
{
  "plugins": [
    "../plugins/sqlite-plugin/index.js",
    "../plugins/csv-plugin/index.js"
  ]
}
```

### Using Plugins

Plugins can provide additional response types and data sources. Refer to individual plugin documentation for usage details.

## 🎯 Route Default Configurations

Define common configurations for multiple routes to avoid repetition:

```json
{
  "routeDefaults": [
    {
      "name": "api-headers",
      "description": "API common response header configuration",
      "config": {
        "headers": {
          "Content-Type": "application/json",
          "X-API-Version": "v1"
        }
      },
      "includes": ["/users*", "/products*"],
      "excludes": ["/error"]
    }
  ]
}
```

### Configuration Priority

1. **Explicit route configuration** - Highest priority
2. **Route default configuration** - Medium priority
3. **Global default configuration** - Lowest priority

## 📚 Documentation Generation

### Auto Generation

API documentation is automatically generated when starting the server:

```bash
pnpm start
```

### Manual Generation

```bash
# Generate documentation
pnpm docs:generate

# Generate documentation using CLI tool
mockfly docs
```

Generated documentation includes:
- API overview
- Detailed documentation for each endpoint
- Parameter tables
- Request/response examples
- Error response descriptions

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch
```

### Test Coverage

The project includes a complete test suite:

- Unit tests
- Integration tests
- E2E tests
- Performance tests

## 📁 Project Structure

```
.
├─ data/                    # Mock data files
│  ├─ users.json
│  ├─ products.json
│  └─ product-detail.json
├─ docs/                    # Generated documentation
├─ mock.config.json         # Configuration file
└─ package.json
```

## 🔧 API Endpoints

### Built-in Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `{baseUrl}/docs` | GET | API documentation |

### Example Endpoints

Available endpoints based on default configuration:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users` | GET | Get user list |
| `/api/users/:id` | GET | Get user details |
| `/api/users` | POST | Create new user |
| `/api/products` | GET | Get product list |
| `/api/products/:id` | GET | Get product details |
| `/api/search` | GET | Search interface |
| `/api/error` | GET | Error response example |

## 🌟 Usage Examples

### Get User List

```bash
curl http://localhost:3001/api/users
```

Response:
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 28,
    "city": "New York"
  }
]
```

### Get User Details

```bash
curl http://localhost:3001/api/users/123
```

Response:
```json
{
  "id": "123",
  "name": "User 123",
  "email": "user123@example.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Create User

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"new@example.com"}'
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

### Development Workflow

1. Fork the project
2. Create a feature branch
3. Commit changes
4. Run tests
5. Submit a Pull Request

## 📄 License

MIT License

---

For any issues or suggestions, please submit an [Issue](https://github.com/uphg/mock-server/issues).

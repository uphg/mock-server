# Mock Server Agents

A service that automatically generates mock data routes based on configuration files.

## Features

- 🚀 **Zero Configuration Startup**: Start a complete mock service with just one configuration file
- 📁 **JSON File Import**: Support importing mock data from external JSON files
- 🔥 **Hot Reload**: Automatically reload when configuration files are modified, no restart required
- 🎯 **Template Variables**: Support dynamic replacement of URL parameters, query parameters, and request body data
- ⏱️ **Delay Simulation**: Configurable response delays to simulate real network environments
- 📊 **API Documentation**: Automatically generate API documentation for easy viewing of all mock endpoints

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Service

```bash
# Use default configuration file (mock.config.json)
npm start

# Use specified configuration file
npm start -- custom.config.json

# Development mode (with hot reload)
npm run dev
```

### 3. Access Examples

After the service starts, you can access example endpoints through the following URLs:

- User list: `http://localhost:3000/api/users`
- User details: `http://localhost:3000/api/users/1`
- Product list: `http://localhost:3000/api/products`
- Product details: `http://localhost:3000/api/products/1`
- Search endpoint: `http://localhost:3000/api/search?q=test`
- API documentation: `http://localhost:3000/api/docs`
- Health check: `http://localhost:3000/health`

## Configuration File Format

Create a `mock.config.json` file:

```json
{
  "port": 3000,
  "routes": [
    {
      "path": "/api/users",
      "method": "GET",
      "description": "Get user list",
      "responseFile": "./data/users.json",
      "headers": {
        "X-Total-Count": "100"
      }
    },
    {
      "path": "/api/users/:id",
      "method": "GET",
      "description": "Get user details by ID",
      "response": {
        "id": "{{params.id}}",
        "name": "User{{params.id}}",
        "email": "user{{params.id}}@example.com"
      }
    },
    {
      "path": "/api/users",
      "method": "POST",
      "description": "Create new user",
      "statusCode": 201,
      "response": {
        "id": "{{body.id}}",
        "name": "{{body.name}}",
        "email": "{{body.email}}"
      }
    },
    {
      "path": "/api/search",
      "method": "GET",
      "description": "Search endpoint",
      "response": {
        "query": "{{query.q}}",
        "results": []
      }
    }
  ]
}
```

## Configuration Reference

### Route Configuration Options

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `path` | string | ✅ | Route path, supports parameters like `/users/:id` |
| `method` | string | ❌ | HTTP method, default `GET` |
| `description` | string | ❌ | Route description |
| `response` | any | ❌* | Direct response data |
| `responseFile` | string | ❌* | JSON file path |
| `statusCode` | number | ❌ | Response status code, default `200` |
| `delay` | number | ❌ | Response delay (ms), default `0` |
| `headers` | object | ❌ | Custom response headers |

*Note: Either `response` or `responseFile` must be specified

### Template Variables

Template variables are supported in responses:

- `{{params.name}}` - URL parameters
- `{{query.name}}` - Query parameters
- `{{body.name}}` - Request body data

## Project Structure

```
mock-server/
├── src/
│   ├── index.js          # Main server file
│   ├── configLoader.js   # Configuration loader
│   ├── routeGenerator.js # Route generator
│   └── schema.js         # Configuration schema definition
├── data/
│   ├── users.json        # User data
│   ├── products.json     # Product data
│   └── product-detail.json # Product detail data
├── mock.config.json      # Configuration file
├── package.json
└── README.md
```

## Advanced Usage

### Dynamic Responses

Create dynamic response functions:

```json
{
  "path": "/api/dynamic",
  "method": "GET",
  "response": {
    "timestamp": "2024-01-01T00:00:00Z",
    "random": "{{Math.random()}}",
    "userAgent": "{{headers.user-agent}}"
  }
}
```

### Error Responses

Simulate error responses:

```json
{
  "path": "/api/error",
  "method": "GET",
  "statusCode": 400,
  "response": {
    "error": "Bad Request",
    "message": "Parameter error"
  }
}
```

### Delay Simulation

Simulate network delays:

```json
{
  "path": "/api/slow",
  "method": "GET",
  "delay": 2000,
  "response": { "message": "This response was delayed by 2 seconds" }
}
```

## Development

### Adding New Features

1. When modifying configuration file format, update `src/schema.js`
2. When adding new route handling logic, modify `src/routeGenerator.js`
3. When adding new configuration loading features, modify `src/configLoader.js`

### Testing

After starting the service, you can test endpoints using curl or Postman:

```bash
# Test user list
curl http://localhost:3000/api/users

# Test user details
curl http://localhost:3000/api/users/123

# Test search
curl "http://localhost:3000/api/search?q=test"

# Test POST request
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"id": 999, "name": "Test User", "email": "test@example.com"}'
```

## Agent Integration

This mock server can be integrated with various development agents and tools:

### CI/CD Integration

The mock server can be used in continuous integration pipelines to provide consistent test data:

```yaml
# Example GitHub Actions workflow
- name: Start Mock Server
  run: |
    npm install
    npm start &
    sleep 5  # Wait for server to start

- name: Run Tests
  run: npm test
```

### Development Agents

- **API Testing Agents**: Use the mock server as a reliable backend for automated API testing
- **Frontend Development**: Provide consistent data for frontend development without backend dependencies
- **Load Testing**: Use delay simulation to test application behavior under various network conditions

### Monitoring and Logging

The mock server provides built-in health checks and can be monitored by various agents:

- Health endpoint: `http://localhost:3000/health`
- Request logging for debugging and analysis
- Configuration validation and error reporting

## License

MIT
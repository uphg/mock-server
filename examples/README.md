# Mockfly Examples

This directory contains examples demonstrating how to use Mockfly in different scenarios.

## Examples

### Basic Usage

#### 1. Initialize a new mock server
```bash
cd examples/basic-usage/init-example
../../../bin/cli.js init
```

This creates:
- `mock/mock.config.json` - Server configuration
- `mock/data/` - Directory for mock data files
- Sample data files (`users.json`, `products.json`, etc.)

#### 2. Start the mock server
```bash
cd examples/basic-usage/start-example
../../../bin/cli.js start
```

Starts the mock server on `http://localhost:3000` with the default configuration.

#### 3. Generate API documentation
```bash
cd examples/basic-usage/docs-example
../../../bin/cli.js docs
```

Generates API documentation based on your mock configuration.

### Vite Integration

This example shows how to integrate Mockfly with a Vite project for frontend development.

#### Project Structure
```
my-vite-app/
├── mock/
│   ├── mock.config.json    # Mock server configuration
│   └── data/               # Mock data files
├── src/
│   ├── App.vue            # Vue component with API calls
│   └── main.js            # Vue app entry
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite config with proxy setup
└── index.html             # HTML template
```

#### Setup

1. Install dependencies:
```bash
cd examples/vite-integration/my-vite-app
npm install
```

2. Start the mock server in one terminal:
```bash
npm run mock
```

3. Start the Vite dev server in another terminal:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173` (Vite dev server)

The Vite dev server proxies `/api/*` requests to the Mockfly server running on port 3000.

#### Key Features

- **Proxy Configuration**: Vite proxies API calls to the mock server
- **Hot Reload**: Both Vite and Mockfly support hot reloading
- **Development Workflow**: Frontend and mock API development in parallel
- **API Documentation**: Generate docs with `npm run mock:docs`

#### Mock Configuration

The mock server is configured in `mock/mock.config.json`:

```json
{
  "port": 3000,
  "baseUrl": "/api",
  "routes": [
    {
      "path": "/users",
      "method": "GET",
      "responseFile": "users.json"
    },
    {
      "path": "/products",
      "method": "GET",
      "responseFile": "products.json"
    }
  ]
}
```

#### Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

This setup allows you to:
- Develop your frontend with realistic API responses
- Test different API scenarios without a backend
- Generate and maintain API documentation
- Easily switch between mock and real APIs

## Running Examples

All examples can be run from the project root:

```bash
# Initialize a new mock server
node bin/cli.js init

# Start mock server
node bin/cli.js start

# Generate documentation
node bin/cli.js docs --dev
```

## More Examples

Feel free to contribute more examples for different frameworks and use cases!
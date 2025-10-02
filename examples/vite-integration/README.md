# Vite Integration Example

This example demonstrates how to integrate Mockfly with a Vite project for seamless frontend development.

## Overview

This setup allows you to:
- Run a mock API server alongside your Vite development server
- Proxy API requests from Vite to the mock server
- Develop frontend and API contracts simultaneously
- Generate API documentation

## Quick Start

1. **Install dependencies:**
   ```bash
   cd my-vite-app
   npm install
   ```

2. **Start the mock server:**
   ```bash
   npm run mock
   ```
   This starts Mockfly on `http://localhost:3000`

3. **Start the Vite dev server (in another terminal):**
   ```bash
   npm run dev
   ```
   This starts Vite on `http://localhost:5173`

4. **Open your browser** to `http://localhost:5173` and test the API calls

## Project Structure

```
my-vite-app/
├── mock/
│   ├── mock.config.json    # Mock server configuration
│   └── data/
│       ├── users.json      # Sample user data
│       └── products.json   # Sample product data
├── src/
│   ├── App.vue            # Vue component demonstrating API calls
│   └── main.js            # Vue app entry point
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite config with API proxy
└── index.html             # HTML template
```

## Key Features

### API Proxy Configuration

The `vite.config.js` proxies all `/api/*` requests to the mock server:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

### Mock Configuration

The mock server serves realistic API responses defined in `mock/mock.config.json`:

```json
{
  "port": 3000,
  "baseUrl": "/api",
  "routes": [
    {
      "path": "/users",
      "method": "GET",
      "responseFile": "users.json"
    }
  ]
}
```

### Vue Component Example

The `App.vue` component demonstrates:
- Fetching data from the mock API
- Loading states
- Error handling
- Responsive UI

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run mock` - Start mock server
- `npm run mock:docs` - Generate API documentation

## API Endpoints

The mock server provides these endpoints:

- `GET /api/users` - List all users
- `GET /api/products` - List all products

## Development Workflow

1. **Define API contracts** in `mock/mock.config.json`
2. **Create sample data** in `mock/data/`
3. **Implement frontend** using the mock API
4. **Generate documentation** with `npm run mock:docs`
5. **Switch to real API** when backend is ready

## Customization

### Adding New Endpoints

1. Add route configuration to `mock/mock.config.json`
2. Create corresponding data file in `mock/data/`
3. Update the Vue component to call the new endpoint

### Changing Mock Data

Edit the JSON files in `mock/data/` to change the mock responses.

### Modifying the UI

Update `src/App.vue` to change the user interface or add more API calls.
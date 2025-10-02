export const mockConfigSchema = {
  type: 'object',
  properties: {
    port: {
      type: 'number',
      default: 3000,
      description: 'Server listening port'
    },
    baseUrl: {
      type: 'string',
      default: '',
      description: 'API base path prefix'
    },
    delay: {
      type: 'number',
      default: 0,
      minimum: 0,
      description: 'Global response delay (milliseconds)'
    },
    cors: {
      type: 'boolean',
      default: true,
      description: 'Whether to enable CORS support'
    },
    mockDir: {
      type: 'string',
      default: './mock/data',
      description: 'Mock data directory'
    },
    routeDefaults: {
      type: 'array',
      description: 'Route default configurations, can define common configurations for multiple routes',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Default configuration name'
          },
          description: {
            type: 'string',
            description: 'Default configuration description'
          },
          config: {
            type: 'object',
            description: 'Default configuration items',
            properties: {
              delay: {
                type: 'number',
                minimum: 0,
                description: 'Route response delay (milliseconds)'
              },
              headers: {
                type: 'object',
                description: 'Response headers configuration'
              },
              statusCode: {
                type: 'number',
                description: 'HTTP status code'
              }
            }
          },
          includes: {
            type: 'array',
            description: 'Included route path patterns',
            items: { type: 'string' }
          },
          excludes: {
            type: 'array',
            description: 'Excluded route path patterns',
            items: { type: 'string' }
          }
        },
        required: ['name', 'config']
      }
    },
    routes: {
      type: 'array',
      description: 'Route configuration list',
      items: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Route path, supports parameters like /users/:id'
          },
          method: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            default: 'GET',
            description: 'HTTP method'
          },
          name: {
            type: 'string',
            description: 'Route name'
          },
          description: {
            type: 'string',
            description: 'Route description'
          },
          response: {
            description: 'Direct response data, supports template variables',
            oneOf: [
              { type: 'object' },
              { type: 'array' },
              { type: 'string' },
              { type: 'number' },
              { type: 'boolean' }
            ]
          },
          responseFile: {
            type: 'string',
            description: 'Response data file path (relative to mockDir)'
          },
          responseType: {
            type: 'string',
            enum: ['json', 'blob'],
            default: 'json',
            description: 'Response type: json for JSON responses, blob for file streams'
          },
          contentType: {
            type: 'string',
            description: 'Content-Type header for blob responses (auto-detected for common file types)'
          },
          fileName: {
            type: 'string',
            description: 'Download filename for blob responses (defaults to original filename)'
          },
          statusCode: {
            type: 'number',
            default: 200,
            description: 'HTTP status code'
          },
          delay: {
            type: 'number',
            default: 0,
            description: 'Route response delay (milliseconds)'
          },
          headers: {
            type: 'object',
            description: 'Response headers configuration'
          }
        },
        required: ['path'],
        oneOf: [{ required: ['response'] }, { required: ['responseFile'] }]
      }
    }
  },
  required: ['routes']
}
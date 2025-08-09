export const mockConfigSchema = {
  type: 'object',
  properties: {
    port: { type: 'number', default: 3000 },
    baseUrl: { type: 'string', default: '' },
    delay: { type: 'number', default: 0, minimum: 0 },
    cors: { type: 'boolean', default: true },
    mockDir: { type: 'string', default: './data' },
    routes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], default: 'GET' },
          description: { type: 'string' },
          response: {
            oneOf: [
              { type: 'object' },
              { type: 'array' },
              { type: 'string' },
              { type: 'number' },
              { type: 'boolean' }
            ]
          },
          responseFile: { type: 'string' },
          statusCode: { type: 'number', default: 200 },
          delay: { type: 'number', default: 0 },
          headers: { type: 'object' }
        },
        required: ['path'],
        oneOf: [{ required: ['response'] }, { required: ['responseFile'] }]
      }
    }
  },
  required: ['routes']
}
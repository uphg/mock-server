# Mock Server

自动根据配置文件生成mock数据路由的服务。

## 功能特性

- 🚀 **零配置启动** - 只需一个JSON配置文件即可启动Mock服务
- 📁 **文件响应** - 支持从JSON文件读取响应数据
- 🎯 **动态响应** - 支持基于请求参数的动态响应生成
- 🔄 **热更新** - 配置文件和数据文件变更时自动重新加载
- 🌐 **CORS支持** - 内置跨域支持，方便前端开发
- ⚡ **延迟模拟** - 支持全局和路由级别的响应延迟设置
- 🎨 **模板引擎** - 使用Handlebars模板引擎处理动态内容
- 📊 **路由默认配置** - 支持为多个路由设置默认配置
- 🔍 **模式匹配** - 支持复杂的路由匹配模式
- 📚 **自动文档生成** - 根据路由配置自动生成API接口文档

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务

```bash
# 使用默认配置文件 (mock.config.json)
npm start

# 使用指定配置文件
npm start -- custom.config.json

# 开发模式（支持热更新）
npm run dev

# 生成API文档
npm run docs:generate

# 监听模式生成文档
npm run docs:generate:watch
```

### 3. 访问示例

服务启动后，可以通过以下URL访问示例接口：

- 用户列表：`http://localhost:3000/api/users`
- 用户详情：`http://localhost:3000/api/users/1`
- 产品列表：`http://localhost:3000/api/products`
- 产品详情：`http://localhost:3000/api/products/1`
- 搜索接口：`http://localhost:3000/api/search?q=test`
- API文档：`http://localhost:3000/api/docs`
- 健康检查：`http://localhost:3000/health`

## 配置文件格式

创建 `mock.config.json` 文件：

```json
{
  "port": 3000,
  "routes": [
    {
      "path": "/api/users",
      "method": "GET",
      "description": "获取用户列表",
      "responseFile": "./data/users.json",
      "headers": {
        "X-Total-Count": "100"
      }
    },
    {
      "path": "/api/users/:id",
      "method": "GET",
      "description": "根据ID获取用户详情",
      "response": {
        "id": "{{params.id}}",
        "name": "用户{{params.id}}",
        "email": "user{{params.id}}@example.com"
      }
    },
    {
      "path": "/api/users",
      "method": "POST",
      "description": "创建新用户",
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
      "description": "搜索接口",
      "response": {
        "query": "{{query.q}}",
        "results": []
      }
    }
  ]
}
```

## 配置说明

### 路由配置项

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `path` | string | ✅ | 路由路径，支持参数如 `/users/:id` |
| `method` | string | ❌ | HTTP方法，默认 `GET` |
| `description` | string | ❌ | 路由描述 |
| `response` | any | ❌* | 直接响应数据 |
| `responseFile` | string | ❌* | JSON文件路径 |
| `statusCode` | number | ❌ | 响应状态码，默认 `200` |
| `delay` | number | ❌ | 响应延迟(ms)，默认 `0` |
| `headers` | object | ❌ | 自定义响应头 |

*注：`response` 和 `responseFile` 必须指定一个

### 模板变量

支持在响应中使用模板变量：

- `{{params.name}}` - URL参数
- `{{query.name}}` - 查询参数
- `{{body.name}}` - 请求体数据

## 项目结构

```
mock-server/
├── src/
│   ├── index.js          # 主服务器文件
│   ├── configLoader.js   # 配置加载器
│   ├── routeGenerator.js # 路由生成器
│   └── schema.js         # 配置schema定义
├── data/
│   ├── users.json        # 用户数据
│   ├── products.json     # 产品数据
│   └── product-detail.json # 产品详情数据
├── mock.config.json      # 配置文件
├── package.json
└── README.md
```

## API文档生成

Mock Server 支持根据路由配置自动生成API接口文档。

### 自动生成

当启动Mock服务时，系统会自动生成API文档到 `docs/` 目录下。

### 手动生成

也可以单独生成文档：

```bash
# 生成文档
npm run docs:generate

# 监听模式，配置变更时自动重新生成
npm run docs:generate:watch
```

### 文档结构

生成的文档包括：

- `docs/README.md` - API总览文档
- `docs/{method}-{path}.md` - 各个接口的详细文档

每个接口文档包含：

- 接口基本信息（URL、请求类型、描述等）
- 请求参数表格（路径参数、查询参数、请求体参数）
- 请求示例（适用于POST/PUT/PATCH请求）
- 响应示例
- 响应头信息
- 错误响应示例

### 文档示例

生成的文档格式参考 `interface-docs-example.md`。

## 高级用法

### 动态响应

可以创建动态响应函数：

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

### 错误响应

模拟错误响应：

```json
{
  "path": "/api/error",
  "method": "GET",
  "statusCode": 400,
  "response": {
    "error": "Bad Request",
    "message": "参数错误"
  }
}
```

### 延迟模拟

模拟网络延迟：

```json
{
  "path": "/api/slow",
  "method": "GET",
  "delay": 2000,
  "response": { "message": "这个响应延迟了2秒" }
}
```

## 开发

### 添加新功能

1. 修改配置文件格式时，更新 `src/schema.js`
2. 添加新的路由处理逻辑时，修改 `src/routeGenerator.js`
3. 添加新的配置加载功能时，修改 `src/configLoader.js`

### 测试

启动服务后，可以使用curl或Postman测试接口：

```bash
# 测试用户列表
curl http://localhost:3000/api/users

# 测试用户详情
curl http://localhost:3000/api/users/123

# 测试搜索
curl "http://localhost:3000/api/search?q=test"

# 测试POST请求
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"id": 999, "name": "测试用户", "email": "test@example.com"}'
```

## 许可证

MIT
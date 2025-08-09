# Mock Server

自动根据配置文件生成mock数据路由的服务。

## 功能特点

- 🚀 **零配置启动**：只需一个配置文件即可启动完整的mock服务
- 📁 **JSON文件导入**：支持从外部JSON文件导入mock数据
- 🔥 **热更新**：配置文件修改后自动重新加载，无需重启
- 🎯 **模板变量**：支持URL参数、查询参数、请求体数据的动态替换
- ⏱️ **延迟模拟**：可配置响应延迟，模拟真实网络环境
- 📊 **API文档**：自动生成API文档，方便查看所有mock接口

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
# Mock Server

[English](README.md) | 中文

🚀 一个功能强大的 Mock API 服务器，支持配置文件驱动、自动文档生成、热更新等特性。

## ✨ 特性

- 📝 **配置驱动** - 通过 JSON 配置文件定义 API 路由
- 🔄 **热更新** - 配置文件变更时自动重新加载路由
- 📚 **自动文档生成** - 根据配置自动生成 Markdown API 文档
- 🎯 **路由默认配置** - 支持为多个路由定义通用配置
- 🌐 **CORS 支持** - 可配置的跨域资源共享
- ⏱️ **响应延迟** - 模拟真实网络延迟
- 📊 **健康检查** - 内置健康检查端点
- 🔧 **模板变量** - 支持动态响应内容
- 🧪 **测试友好** - 完整的测试套件

## 🚀 快速开始

### CLI 工具（推荐）

#### 全局安装
```bash
npm install -g mock-server-builder
```

#### 项目内使用
```bash
# 初始化项目
mock-server init

# 启动服务
mock-server start

# 开发模式启动服务（支持热更新）
mock-server start --dev

# 生成文档
mock-server docs

# 启动文档开发服务器
mock-server docs --dev
```

### 传统方式

#### 安装依赖
```bash
pnpm install
```

#### 启动服务器
```bash
# 生产模式
pnpm start

# 开发模式（热更新）
pnpm dev
```

#### 生成文档
```bash
# 生成API文档
pnpm docs:generate
```

### 启动服务器

```bash
# 生产模式
pnpm start

# 开发模式（支持热更新）
pnpm dev

# 使用自定义配置文件
pnpm start custom.config.json
```

### 访问服务

启动后，服务器会显示完整的访问信息：

```
🚀 Mock服务器启动成功！
- 服务器地址: http://localhost:3001
- 完整路径: http://localhost:3001/api
- 健康检查: http://localhost:3001/health
- API文档: http://localhost:3001/api/docs
- 端口: 3001
- 配置文件: /path/to/mock.config.json
- 基础路径: /api
- 全局延迟: 0ms
- CORS: 启用
- Mock目录: ./data
```

## 📋 配置文件

### 基本配置

创建 `mock.config.json` 文件：

```json
{
  "port": 3001,
  "baseUrl": "/api",
  "delay": 0,
  "cors": true,
  "mockDir": "./data",
  "routes": [
    {
      "name": "获取用户列表",
      "path": "/users",
      "method": "GET",
      "responseFile": "users.json"
    }
  ]
}
```

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `port` | number | 3000 | 服务器端口 |
| `host` | string | localhost | 服务器主机 |
| `baseUrl` | string | / | API 基础路径 |
| `delay` | number | 0 | 全局响应延迟（毫秒） |
| `cors` | boolean | true | 是否启用 CORS |
| `mockDir` | string | ./data | Mock 数据文件目录 |

## 🛣️ 路由配置

### 基本路由

```json
{
  "routes": [
    {
      "name": "获取用户详情",
      "path": "/users/:id",
      "method": "GET",
      "response": {
        "id": "{{params.id}}",
        "name": "用户{{params.id}}",
        "email": "user{{params.id}}@example.com"
      }
    }
  ]
}
```

### 路由选项

| 选项 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `name` | string | 是 | 路由名称 |
| `path` | string | 是 | 路由路径（支持参数） |
| `method` | string | 是 | HTTP 方法 |
| `response` | object | 否 | 直接响应数据 |
| `responseFile` | string | 否 | 响应数据文件路径 |
| `statusCode` | number | 否 | HTTP 状态码（默认 200） |
| `headers` | object | 否 | 自定义响应头 |
| `delay` | number | 否 | 路由级别延迟 |

### 模板变量

支持在响应中使用模板变量：

- `{{params.id}}` - 路径参数
- `{{query.name}}` - 查询参数
- `{{body.email}}` - 请求体参数
- `{{responseTime}}` - 响应时间

## 🎯 路由默认配置

为多个路由定义通用配置，避免重复：

```json
{
  "routeDefaults": [
    {
      "name": "api-headers",
      "description": "API通用响应头配置",
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

### 配置优先级

1. **路由显式配置** - 最高优先级
2. **路由默认配置** - 中等优先级
3. **全局默认配置** - 最低优先级

## 📚 文档生成

### 自动生成

启动服务器时会自动生成 API 文档：

```bash
pnpm start
```

### 手动生成

```bash
# 生成文档
pnpm docs:generate

# 使用CLI工具生成文档
mock-server docs
```

生成的文档包含：
- API 总览
- 每个接口的详细文档
- 参数表格
- 请求/响应示例
- 错误响应说明

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch
```

### 测试覆盖

项目包含完整的测试套件：

- 单元测试
- 集成测试
- E2E 测试
- 性能测试

## 📁 项目结构

```
.
├─ data/                    # Mock 数据文件
│  ├─ users.json
│  ├─ products.json
│  └─ product-detail.json
├─ docs/                    # 生成的文档
├─ mock.config.json         # 配置文件
└─ package.json
```

## 🔧 API 端点

### 内置端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `{baseUrl}/docs` | GET | API 文档 |

### 示例端点

基于默认配置的可用端点：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/users` | GET | 获取用户列表 |
| `/api/users/:id` | GET | 获取用户详情 |
| `/api/users` | POST | 创建新用户 |
| `/api/products` | GET | 获取产品列表 |
| `/api/products/:id` | GET | 获取产品详情 |
| `/api/search` | GET | 搜索接口 |
| `/api/error` | GET | 错误响应示例 |

## 🌟 使用示例

### 获取用户列表

```bash
curl http://localhost:3001/api/users
```

响应：
```json
[
  {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "age": 28,
    "city": "北京"
  }
]
```

### 获取用户详情

```bash
curl http://localhost:3001/api/users/123
```

响应：
```json
{
  "id": "123",
  "name": "用户123",
  "email": "user123@example.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 创建用户

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"新用户","email":"new@example.com"}'
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 运行测试
5. 提交 Pull Request

## 📄 许可证

MIT License

---

如有问题或建议，请提交 [Issue](https://github.com/uphg/mock-server/issues)。

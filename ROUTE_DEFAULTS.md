# RouteDefaults 功能说明

## 概述

`routeDefaults` 是 mock-server 的路由默认配置功能，允许您为多个路由定义通用的配置，避免重复配置。

## 配置优先级

配置的应用优先级从高到低为：

1. **路由显式配置** - 在具体路由中直接定义的配置
2. **路由默认配置** - 在 `routeDefaults` 中定义的配置
3. **全局默认配置** - 在根级别定义的配置（如 `delay`, `headers`, `statusCode`）

## 配置结构

```json
{
  "routeDefaults": [
    {
      "name": "配置名称",
      "description": "配置描述（可选）",
      "config": {
        "delay": 1000,
        "headers": {
          "Content-Type": "application/json"
        },
        "statusCode": 200
      },
      "includes": ["/api/*", "/users*"],
      "excludes": ["/api/health"]
    }
  ]
}
```

### 字段说明

- **name**: 配置的唯一名称（必需）
- **description**: 配置的描述信息（可选）
- **config**: 要应用的配置对象（必需）
  - 可包含 `delay`, `headers`, `statusCode` 等路由配置
- **includes**: 包含模式数组（可选）
  - 只有匹配这些模式的路由才会应用此配置
  - 支持通配符 `*`
- **excludes**: 排除模式数组（可选）
  - 匹配这些模式的路由将不会应用此配置
  - 支持通配符 `*`

## 模式匹配

支持通配符 `*` 进行路径匹配：

- `/users*` - 匹配 `/users`, `/users/123`, `/users/profile` 等
- `/api/*` - 匹配 `/api/` 开头的所有路径
- `/exact` - 精确匹配 `/exact` 路径

## 深度合并

对于对象类型的配置（如 `headers`），系统会进行深度合并：

```json
// 全局配置
{
  "headers": {
    "Content-Type": "application/json"
  }
}

// 路由默认配置
{
  "config": {
    "headers": {
      "X-API-Version": "v1"
    }
  }
}

// 路由显式配置
{
  "headers": {
    "X-Custom": "value"
  }
}

// 最终合并结果
{
  "headers": {
    "Content-Type": "application/json",
    "X-API-Version": "v1", 
    "X-Custom": "value"
  }
}
```

## 示例配置

```json
{
  "port": 3001,
  "baseUrl": "/api",
  "delay": 0,
  "cors": true,
  "mockDir": "./data",
  "routeDefaults": [
    {
      "name": "api-headers",
      "description": "API通用响应头配置",
      "config": {
        "headers": {
          "Content-Type": "application/json",
          "X-API-Version": "v1",
          "X-Response-Time": "{{responseTime}}ms"
        }
      },
      "includes": ["/users*", "/products*"],
      "excludes": ["/error"]
    },
    {
      "name": "slow-response",
      "description": "慢响应配置",
      "config": {
        "delay": 1000,
        "headers": {
          "X-Slow-Response": "true"
        }
      },
      "includes": ["/products*"]
    },
    {
      "name": "cors-headers",
      "description": "CORS相关头部配置",
      "config": {
        "headers": {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      },
      "excludes": ["/error"]
    }
  ],
  "routes": [
    {
      "path": "/users",
      "method": "GET",
      "description": "获取用户列表",
      "responseFile": "users.json",
      "headers": {
        "X-Total-Count": "100"
      }
    }
  ]
}
```

## 应用效果

在上述配置中，`/users` 路由将会应用：

1. **cors-headers** 配置（因为没有被排除，且没有 includes 限制）
2. **api-headers** 配置（因为匹配 `/users*` 模式）
3. 路由自身的 `headers` 配置

最终的 headers 将是所有配置的深度合并结果。

## 注意事项

1. 如果一个路由匹配多个 `routeDefaults` 配置，所有匹配的配置都会按顺序应用
2. `excludes` 的优先级高于 `includes`
3. 如果配置中有 `includes` 数组，路由必须匹配其中至少一个模式才会应用该配置
4. 如果配置中没有 `includes` 数组，则默认应用到所有路由（除非被 `excludes` 排除）
5. 使用 lodash.merge 进行深度合并，确保对象配置的正确合并
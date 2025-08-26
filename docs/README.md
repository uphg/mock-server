# API 接口文档

本文档由 Mock Server 自动生成，包含所有可用的 API 接口信息。

## 服务器信息

- **端口**: 3001
- **基础路径**: /api
- **CORS**: 启用
- **全局延迟**: 0ms

## 接口列表

- **GET /api/users** - 获取用户列表 ([详细文档](get-users.md))
- **GET /api/users/:id** - 获取用户详情 ([详细文档](get-users-id.md))
- **POST /api/users** - 创建新用户 ([详细文档](post-users.md))
- **GET /api/products** - 获取产品列表 ([详细文档](get-products.md))
- **GET /api/products/:id** - 获取产品详情 ([详细文档](get-products-id.md))
- **GET /api/search** - 搜索接口 ([详细文档](get-search.md))
- **GET /api/error** - 错误响应示例 ([详细文档](get-error.md))

## 通用说明

- 所有接口返回的数据格式为 JSON

- 请求头需要包含 Content-Type: application/json

- 参数中的模板变量会根据实际请求动态替换

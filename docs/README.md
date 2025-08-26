# API 接口文档

本文档由 Mock Server 自动生成，包含所有可用的 API 接口信息。

## 服务器信息

- **端口**: 3002
- **基础路径**: /api
- **CORS**: 启用
- **全局延迟**: 0ms

## 接口列表

- **GET /api/test-users** - 测试用户列表 ([详细文档](get-api-test-users.md))
- **GET /api/test-users/:id** - 测试用户详情 ([详细文档](get-api-test-users-id.md))
- **POST /api/test-users** - 创建测试用户 ([详细文档](post-api-test-users.md))
- **GET /api/search** - 搜索测试 ([详细文档](get-api-search.md))
- **GET /api/delayed** - 延迟响应测试 ([详细文档](get-api-delayed.md))
- **GET /api/error** - 错误响应测试 ([详细文档](get-api-error.md))

## 通用说明

- 所有接口返回的数据格式为 JSON

- 请求头需要包含 Content-Type: application/json

- 参数中的模板变量会根据实际请求动态替换

# API 文档生成功能说明

## 概述

Mock Server 现在支持根据 `mock.config.json` 中的路由配置自动生成 API 接口文档。生成的文档采用 Markdown 格式，包含完整的接口信息和示例。

## 功能特性

- ✅ 根据路由配置自动生成文档
- ✅ 每个路由生成独立的文档文件
- ✅ 支持参数表格（路径参数、查询参数、请求体参数）
- ✅ 自动生成请求和响应示例
- ✅ 包含响应头信息
- ✅ 支持错误响应文档
- ✅ 生成总览文档
- ✅ 使用 mdast-util-gfm-table 支持表格格式

## 使用方法

### 1. 自动生成（推荐）

启动 Mock Server 时会自动生成文档：

```bash
npm start
# 或
npm run dev
```

### 2. 手动生成

单独生成文档：

```bash
npm run docs:generate
```

### 3. 监听模式

配置文件变更时自动重新生成：

```bash
npm run docs:generate:watch
```

## 生成的文档结构

```
docs/
├── README.md                 # API 总览文档
├── get-users.md             # GET /users 接口文档
├── get-users-id.md          # GET /users/:id 接口文档
├── post-users.md            # POST /users 接口文档
├── get-products.md          # GET /products 接口文档
├── get-products-id.md       # GET /products/:id 接口文档
├── get-search.md            # GET /search 接口文档
└── get-error.md             # GET /error 接口文档
```

## 文档内容

每个接口文档包含以下部分：

### 1. 基本信息
- 接口名称
- 描述
- URL
- 请求类型
- 状态码（如果非 200）
- 响应延迟（如果设置）

### 2. 参数表格
根据接口类型自动生成：
- **路径参数**：从 URL 中的 `:id` 等提取
- **查询参数**：从响应模板中的 `{{query.xxx}}` 提取
- **请求体参数**：从响应模板中的 `{{body.xxx}}` 提取（仅 POST/PUT/PATCH）

### 3. 请求示例
- 仅对 POST/PUT/PATCH 请求生成
- 基于响应模板中的参数自动生成示例数据

### 4. 响应示例
- 基于配置中的 `response` 生成
- 模板变量会被替换为示例值

### 5. 响应头
- 路由级别的自定义头
- 路由默认配置中的头
- 全局配置中的头

### 6. 错误响应
- 通用错误响应格式说明

## 技术实现

### 依赖库
- `unified` - 统一的文本处理框架
- `mdast-builder` - 构建 MDAST 语法树
- `mdast-util-to-markdown` - 将 MDAST 转换为 Markdown
- `mdast-util-gfm-table` - 支持 GitHub 风格的表格

### 核心组件
- `DocsGenerator` - 文档生成器主类
- `generateDocs.js` - 独立的文档生成脚本

### 文件命名规则
文档文件名格式：`{method}-{path}.md`

示例：
- `/users` → `get-users.md`
- `/users/:id` → `get-users-id.md`
- `POST /users` → `post-users.md`

## 配置示例

以下配置会生成相应的文档：

```json
{
  "routes": [
    {
      "name": "获取用户列表",
      "path": "/users",
      "method": "GET",
      "description": "获取用户列表",
      "responseFile": "users.json",
      "headers": {
        "X-Total-Count": "100"
      }
    },
    {
      "name": "获取用户详情",
      "path": "/users/:id",
      "method": "GET",
      "description": "根据ID获取用户详情",
      "response": {
        "id": "{{params.id}}",
        "name": "用户{{params.id}}",
        "email": "user{{params.id}}@example.com"
      }
    }
  ]
}
```

## 注意事项

1. **参数提取**：系统会自动从路由路径和响应模板中提取参数信息
2. **示例生成**：示例值会根据参数名称智能生成（如 email → example@example.com）
3. **表格支持**：使用 mdast-util-gfm-table 确保表格正确渲染
4. **热更新**：配置文件变更时会自动重新生成文档
5. **错误处理**：文档生成失败不会影响 Mock Server 的正常运行

## 自定义扩展

如需自定义文档格式，可以修改 `src/docsGenerator.js` 中的相关方法：

- `buildRouteDocTree()` - 修改文档结构
- `buildParamsTable()` - 修改参数表格格式
- `generateResponseExample()` - 修改响应示例生成逻辑
- `generateFileName()` - 修改文件命名规则
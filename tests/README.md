# Mock Server 测试套件

这是Mock Server项目的完整测试套件，包含单元测试、集成测试、性能测试和端到端测试。

## 测试结构

```
tests/
├── fixtures/                 # 测试数据和配置
│   ├── test-config.json      # 测试用配置文件
│   └── data/                 # 测试用数据文件
│       ├── create-test-db.js # 测试数据库创建脚本
│       ├── test-users.csv    # 测试用户CSV数据
│       └── test-users.json   # 测试用户JSON数据
├── cli-commands.test.js      # CLI命令测试
├── cli.test.js               # CLI功能测试
├── config.test.js            # 配置测试
├── configLoader.test.js      # 配置加载器单元测试
├── docs-generator.test.js    # 文档生成器测试
├── docs.test.js              # 文档测试
├── e2e.test.js               # 端到端测试
├── generate-docs.test.js     # 生成文档测试
├── index.test.js             # 主入口测试
├── logger.test.js            # 日志器测试
├── mockServer.test.js        # Mock服务器集成测试
├── performance.test.js       # 性能测试
├── plugin.test.js            # 插件测试
├── plugins.test.js           # 插件管理测试
├── route.test.js             # 路由测试
├── routeGenerator.test.js    # 路由生成器单元测试
├── schema.test.js            # 配置结构验证测试
├── setup.js                  # 测试环境设置
├── teardown.js               # 测试环境清理
├── test.config.js            # 测试配置
├── testRunner.js             # 测试运行器
└── type.test.js              # 类型验证测试
```

## 运行测试

### 安装测试依赖

```bash
# 使用npm
npm install supertest

# 使用pnpm
pnpm add supertest
```

### 运行所有测试

```bash
# 使用npm scripts
npm test

# 使用Node.js内置测试运行器
node --test tests/**/*.test.js

# 使用自定义测试运行器
node tests/testRunner.js
```

### 运行特定测试

```bash
# 运行单元测试
node --test tests/configLoader.test.js
node --test tests/routeGenerator.test.js
node --test tests/schema.test.js
node --test tests/cli.test.js
node --test tests/config.test.js
node --test tests/docs.test.js
node --test tests/logger.test.js
node --test tests/plugin.test.js
node --test tests/route.test.js
node --test tests/type.test.js

# 运行集成测试
node --test tests/mockServer.test.js
node --test tests/plugins.test.js

# 运行性能测试
node --test tests/performance.test.js

# 运行端到端测试
node --test tests/e2e.test.js

# 运行CLI相关测试
node --test tests/cli-commands.test.js

# 运行文档生成测试
node --test tests/docs-generator.test.js
node --test tests/generate-docs.test.js

# 运行主入口测试
node --test tests/index.test.js
```

### 监视模式

```bash
# 监视文件变化并自动运行测试
npm run test:watch

# 或者
node --test --watch tests/**/*.test.js
```

## 测试类型

### 1. 单元测试

#### ConfigLoader 测试 (`configLoader.test.js`)
- 配置文件加载和验证
- 错误处理
- 响应文件导入
- 配置验证规则

#### RouteGenerator 测试 (`routeGenerator.test.js`)
- 路由注册和生成
- 模板变量处理
- baseUrl处理
- HTTP方法支持

#### Schema 测试 (`schema.test.js`)
- 配置结构定义验证
- 默认值设置
- 数据类型验证
- 约束条件检查

#### CLI 测试 (`cli.test.js`)
- CLI功能验证
- 命令行参数处理
- 帮助信息显示

#### Config 测试 (`config.test.js`)
- 配置管理
- 默认值处理
- 配置合并

#### Docs 测试 (`docs.test.js`)
- 文档生成逻辑
- 模板处理
- 文档格式验证

#### Logger 测试 (`logger.test.js`)
- 日志记录功能
- 日志级别控制
- 输出格式

#### Plugin 测试 (`plugin.test.js`)
- 插件加载
- 插件接口验证
- 插件执行

#### Route 测试 (`route.test.js`)
- 路由匹配
- 参数提取
- 响应处理

#### Type 测试 (`type.test.js`)
- 类型验证
- 数据转换
- 类型检查

### 2. 集成测试

#### MockServer 测试 (`mockServer.test.js`)
- 服务器启动和关闭
- HTTP请求处理
- 中间件功能
- 错误处理
- CORS支持
- 健康检查
- API文档生成

#### Plugins 测试 (`plugins.test.js`)
- 插件管理器功能
- 插件注册和执行
- 插件配置处理

#### Docs Generator 测试 (`docs-generator.test.js`)
- 文档生成器集成
- 配置到文档转换
- 文档输出验证

#### Generate Docs 测试 (`generate-docs.test.js`)
- 文档生成流程
- 文件输出
- 错误处理

#### Index 测试 (`index.test.js`)
- 主入口功能
- 模块集成
- 启动流程

### 3. 性能测试

#### Performance 测试 (`performance.test.js`)
- 响应时间测试
- 并发请求处理
- 内存使用监控
- 大型数据处理
- 模板变量性能
- 延迟配置性能

### 4. 端到端测试

#### E2E 测试 (`e2e.test.js`)
- 完整API流程测试
- 用户管理场景
- 电商API场景
- 复杂模板变量场景
- 错误场景处理

## 测试覆盖的功能

### ✅ 核心功能
- [x] 配置文件加载和验证
- [x] 路由动态生成
- [x] 模板变量替换
- [x] HTTP方法支持
- [x] 状态码自定义
- [x] 响应头设置
- [x] 延迟模拟
- [x] CORS支持
- [x] 错误处理

### ✅ 高级功能
- [x] 热更新（配置文件监听）
- [x] 健康检查端点
- [x] API文档生成
- [x] 日志记录
- [x] 优雅关闭
- [x] 性能优化
- [x] 内存管理

### ✅ 边界情况
- [x] 无效配置处理
- [x] 文件不存在处理
- [x] 网络错误处理
- [x] 大数据量处理
- [x] 并发请求处理
- [x] 复杂嵌套数据

## 测试数据

### 测试配置文件
- `tests/fixtures/test-config.json`: 基础测试配置
- `tests/fixtures/data/test-users.json`: 测试用户JSON数据
- `tests/fixtures/data/test-users.csv`: 测试用户CSV数据
- `tests/fixtures/data/create-test-db.js`: 测试数据库创建脚本

### 临时文件
测试过程中会创建临时文件，测试结束后自动清理：
- `temp-test-config.json`
- `temp-e2e-config.json`
- `tests/temp/` 目录

## 测试环境

### 环境变量
- `NODE_ENV=test`: 测试环境标识
- `PORT=3000`: 默认测试端口

### 依赖要求
- Node.js 18+
- supertest: HTTP断言库
- 内置test runner: Node.js原生测试框架

## 持续集成

### GitHub Actions 示例

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

### 测试报告
测试运行器会生成详细的测试报告，包括：
- 测试通过/失败统计
- 执行时间
- 错误详情
- 覆盖率信息

## 故障排除

### 常见问题

1. **端口冲突**
   ```
   Error: listen EADDRINUSE :::3000
   ```
   解决：确保测试端口未被占用，或修改测试配置中的端口

2. **依赖缺失**
   ```
   Cannot find module 'supertest'
   ```
   解决：运行 `npm install supertest`

3. **权限错误**
   ```
   EACCES: permission denied
   ```
   解决：检查文件权限，确保测试目录可写

4. **内存不足**
   ```
   JavaScript heap out of memory
   ```
   解决：增加Node.js内存限制 `node --max-old-space-size=4096`

### 调试测试

```bash
# 启用详细输出
node --test --reporter=verbose tests/**/*.test.js

# 调试特定测试
node --inspect-brk --test tests/mockServer.test.js
```

## 贡献指南

### 添加新测试

1. 在相应的测试文件中添加测试用例
2. 确保测试覆盖新功能的所有分支
3. 添加必要的测试数据和配置
4. 更新测试文档

### 测试最佳实践

1. **独立性**: 每个测试应该独立运行
2. **清理**: 测试后清理临时文件和状态
3. **描述性**: 使用清晰的测试描述
4. **覆盖性**: 测试正常和异常情况
5. **性能**: 避免不必要的延迟和资源消耗

## 许可证

MIT
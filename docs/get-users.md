# 获取用户列表

## 基本信息

::: code-url GET
```
/api/users
```
:::

## 响应示例

```json
[
  {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "age": 28,
    "city": "北京",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "name": "李四",
    "email": "lisi@example.com",
    "age": 32,
    "city": "上海",
    "createdAt": "2024-01-16T09:30:00Z"
  },
  {
    "id": 3,
    "name": "王五",
    "email": "wangwu@example.com",
    "age": 25,
    "city": "广州",
    "createdAt": "2024-01-17T14:20:00Z"
  },
  {
    "id": 4,
    "name": "赵六",
    "email": "zhaoliu@example.com",
    "age": 35,
    "city": "深圳",
    "createdAt": "2024-01-18T11:45:00Z"
  }
]
```

## 响应头

- **Access-Control-Allow-Origin**: *
- **Access-Control-Allow-Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Access-Control-Allow-Headers**: Content-Type, Authorization
- **X-Total-Count**: 100
- **Content-Type**: application/json
- **X-API-Version**: v1
- **X-Response-Time**: {{responseTime}}ms

## 错误响应

当请求出现错误时，服务器将返回相应的错误信息：

```json
{
  "error": "Error Type",
  "message": "错误描述信息"
}
```

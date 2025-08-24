# 创建新用户

- **描述**: 创建新用户
- **URL**: `/api/users`
- **请求类型**: `POST`
- **状态码**: `201`

## 请求体参数

| 参数名       | 类型     | 必填 | 说明              |
| --------- | ------ | -- | --------------- |
| id        | string | 否  | 请求体参数 id        |
| name      | string | 否  | 请求体参数 name      |
| email     | string | 否  | 请求体参数 email     |
| createdAt | string | 否  | 请求体参数 createdAt |

## 请求示例

```json
{
  "id": 1,
  "name": "示例名称",
  "email": "example@example.com",
  "createdAt": "示例值"
}
```

## 响应示例

```json
{
  "id": "456",
  "name": "张三",
  "email": "zhangsan@example.com",
  "createdAt": "示例值"
}
```

## 响应头

- **Access-Control-Allow-Origin**: *
- **Access-Control-Allow-Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Access-Control-Allow-Headers**: Content-Type, Authorization
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

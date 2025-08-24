# 获取用户详情

- **描述**: 根据ID获取用户详情
- **URL**: `/api/users/:id`
- **请求类型**: `GET`

## 路径参数

| 参数名 | 类型     | 必填 | 说明      |
| --- | ------ | -- | ------- |
| id  | string | 是  | 路径参数 id |

## 响应示例

```json
{
  "id": "123",
  "name": "用户123",
  "email": "user123@example.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## 响应头

- **Content-Type**: application/json
- **X-API-Version**: v1
- **X-Response-Time**: {{responseTime}}ms
- **Access-Control-Allow-Origin**: *
- **Access-Control-Allow-Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Access-Control-Allow-Headers**: Content-Type, Authorization

## 错误响应

当请求出现错误时，服务器将返回相应的错误信息：

```json
{
  "error": "Error Type",
  "message": "错误描述信息"
}
```

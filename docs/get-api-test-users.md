# /api/test-users

## 基本信息

测试用户列表

::: code-url GET
```
/api/test-users
```
:::

## 响应示例

```json
[
  {
    "id": 1,
    "name": "测试用户1",
    "email": "test1@example.com",
    "role": "admin"
  },
  {
    "id": 2,
    "name": "测试用户2",
    "email": "test2@example.com",
    "role": "user"
  }
]
```

## 响应头

- **X-Total-Count**: 2

## 错误响应

当请求出现错误时，服务器将返回相应的错误信息：

```json
{
  "error": "Error Type",
  "message": "错误描述信息"
}
```

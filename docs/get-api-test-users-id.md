# /api/test-users/:id

## 基本信息

测试用户详情

::: code-url GET
```
/api/test-users/:id
```
:::

## 路径参数

| 参数名 | 类型     | 必填 | 说明      |
| --- | ------ | -- | ------- |
| id  | string | 是  | 路径参数 id |

## 响应示例

```json
{
  "id": "123",
  "name": "测试用户123",
  "email": "test123@example.com"
}
```

## 错误响应

当请求出现错误时，服务器将返回相应的错误信息：

```json
{
  "error": "Error Type",
  "message": "错误描述信息"
}
```

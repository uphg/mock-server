# /users/:id

## 基本信息

更新用户

::: code-url PUT
```
/api/v1/users/:id
```
:::

## 路径参数

| 参数名 | 类型     | 必填 | 说明      |
| --- | ------ | -- | ------- |
| id  | string | 是  | 路径参数 id |

## 请求体参数

| 参数名   | 类型     | 必填 | 说明          |
| ----- | ------ | -- | ----------- |
| name  | string | 否  | 请求体参数 name  |
| email | string | 否  | 请求体参数 email |

## 请求示例

```json
{
  "name": "示例名称",
  "email": "example@example.com"
}
```

## 响应示例

```json
{
  "id": "123",
  "name": "张三",
  "email": "zhangsan@example.com",
  "updated": true
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

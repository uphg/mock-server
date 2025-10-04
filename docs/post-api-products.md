# /api/products

## 基本信息

::: code-url POST
```
/api/products
```
:::

## 请求体参数

| 参数名   | 类型     | 必填 | 说明          |
| ----- | ------ | -- | ----------- |
| name  | string | 否  | 请求体参数 name  |
| price | string | 否  | 请求体参数 price |

## 请求示例

```json
{
  "name": "示例名称",
  "price": 99.99
}
```

## 响应示例

```json
{
  "status": 201,
  "data": {
    "id": "示例值",
    "name": "张三",
    "price": "示例值",
    "createdAt": "示例值"
  }
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

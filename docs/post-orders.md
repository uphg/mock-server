# /orders

## 基本信息

- **状态码**: `201`
创建订单

::: code-url POST
```
/api/orders
```
:::

## 请求体参数

| 参数名    | 类型     | 必填 | 说明           |
| ------ | ------ | -- | ------------ |
| userId | string | 否  | 请求体参数 userId |
| items  | string | 否  | 请求体参数 items  |
| total  | string | 否  | 请求体参数 total  |

## 请求示例

```json
{
  "userId": 1,
  "items": "示例值",
  "total": "示例值"
}
```

## 响应示例

```json
{
  "orderId": "ORDER-示例值-001",
  "userId": "示例值",
  "items": "示例值",
  "total": "示例值",
  "status": "pending"
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

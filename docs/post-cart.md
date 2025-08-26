# /cart

## 基本信息

添加到购物车

::: code-url POST
```
/api/cart
```
:::

## 请求体参数

| 参数名       | 类型     | 必填 | 说明              |
| --------- | ------ | -- | --------------- |
| productId | string | 否  | 请求体参数 productId |
| quantity  | string | 否  | 请求体参数 quantity  |

## 请求示例

```json
{
  "productId": 1,
  "quantity": "示例值"
}
```

## 响应示例

```json
{
  "productId": "示例值",
  "quantity": "示例值",
  "added": true,
  "cartTotal": 1999
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

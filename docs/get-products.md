# /products

## 基本信息

获取产品列表

::: code-url GET
```
/api/products
```
:::

## 响应示例

```json
{
  "products": [
    {
      "id": 1,
      "name": "iPhone",
      "price": 999,
      "category": "手机"
    },
    {
      "id": 2,
      "name": "MacBook",
      "price": 1999,
      "category": "电脑"
    }
  ],
  "total": 2,
  "page": 1
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

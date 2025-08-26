# /products/search

## 基本信息

搜索产品

::: code-url GET
```
/api/products/search
```
:::

## 查询参数

| 参数名      | 类型     | 必填 | 说明            |
| -------- | ------ | -- | ------------- |
| q        | string | 否  | 查询参数 q        |
| category | string | 否  | 查询参数 category |

## 响应示例

```json
{
  "query": "搜索关键词",
  "category": "示例值",
  "results": [
    {
      "id": 1,
      "name": "搜索结果: 搜索关键词",
      "category": "示例值"
    }
  ]
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

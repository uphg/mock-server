# /api/search

## 基本信息

搜索测试

::: code-url GET
```
/api/search
```
:::

## 查询参数

| 参数名 | 类型     | 必填 | 说明     |
| --- | ------ | -- | ------ |
| q   | string | 否  | 查询参数 q |

## 响应示例

```json
{
  "query": "搜索关键词",
  "results": []
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

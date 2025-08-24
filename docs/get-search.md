# 搜索接口

- **描述**: 搜索接口
- **URL**: `/api/search`
- **请求类型**: `GET`

## 查询参数

| 参数名 | 类型     | 必填 | 说明     |
| --- | ------ | -- | ------ |
| q   | string | 否  | 查询参数 q |

## 响应示例

```json
{
  "query": "搜索关键词",
  "results": [
    {
      "id": 1,
      "title": "搜索结果 搜索关键词",
      "description": "这是关于 搜索关键词 的搜索结果"
    }
  ],
  "total": 1
}
```

## 响应头

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

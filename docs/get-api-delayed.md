# /api/delayed

## 基本信息

- **响应延迟**: 100ms
延迟响应测试

::: code-url GET
```
/api/delayed
```
:::

## 响应示例

```json
{
  "message": "延迟响应"
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

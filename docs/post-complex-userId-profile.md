# /complex/:userId/profile

## 基本信息

复杂模板测试

::: code-url POST
```
/complex/:userId/profile
```
:::

## 路径参数

| 参数名    | 类型     | 必填 | 说明          |
| ------ | ------ | -- | ----------- |
| userId | string | 是  | 路径参数 userId |

## 查询参数

| 参数名    | 类型     | 必填 | 说明          |
| ------ | ------ | -- | ----------- |
| lang   | string | 否  | 查询参数 lang   |
| source | string | 否  | 查询参数 source |

## 请求体参数

| 参数名         | 类型     | 必填 | 说明                |
| ----------- | ------ | -- | ----------------- |
| profile     | string | 否  | 请求体参数 profile     |
| preferences | string | 否  | 请求体参数 preferences |
| lastLogin   | string | 否  | 请求体参数 lastLogin   |

## 请求示例

```json
{
  "profile.name": "示例名称",
  "profile.email": "example@example.com",
  "preferences.theme": "示例值",
  "lastLogin": "示例值"
}
```

## 响应示例

```json
{
  "user": {
    "id": "示例值",
    "profile": {
      "name": "示例值",
      "email": "示例值",
      "preferences": {
        "theme": "示例值",
        "language": "示例值"
      }
    },
    "metadata": {
      "lastLogin": "示例值",
      "source": "示例值"
    }
  },
  "success": true
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

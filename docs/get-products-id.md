# 获取产品详情

## 基本信息

::: code-url GET
```
/api/products/:id
```
:::
- **响应延迟**: 1000ms

## 路径参数

| 参数名 | 类型     | 必填 | 说明      |
| --- | ------ | -- | ------- |
| id  | string | 是  | 路径参数 id |

## 响应示例

```json
{
  "id": 1,
  "name": "iPhone 15 Pro",
  "price": 7999,
  "category": "手机",
  "brand": "Apple",
  "model": "iPhone 15 Pro",
  "description": "iPhone 15 Pro 是Apple最新推出的旗舰手机，搭载A17 Pro芯片，性能强劲。",
  "specifications": {
    "display": "6.1英寸 Super Retina XDR显示屏",
    "processor": "A17 Pro 芯片",
    "storage": [
      "128GB",
      "256GB",
      "512GB",
      "1TB"
    ],
    "camera": {
      "main": "4800万像素主摄",
      "ultraWide": "1200万像素超广角",
      "telephoto": "1200万像素长焦"
    },
    "battery": "3274mAh",
    "os": "iOS 17"
  },
  "images": [
    "https://example.com/images/iphone15-1.jpg",
    "https://example.com/images/iphone15-2.jpg",
    "https://example.com/images/iphone15-3.jpg"
  ],
  "reviews": [
    {
      "id": 1,
      "user": "用户A",
      "rating": 5,
      "comment": "性能非常强，拍照效果很好",
      "date": "2024-01-20"
    },
    {
      "id": 2,
      "user": "用户B",
      "rating": 4,
      "comment": "整体不错，但价格有点高",
      "date": "2024-01-19"
    }
  ],
  "stock": 50,
  "availability": "in_stock"
}
```

## 响应头

- **Content-Type**: application/json
- **X-API-Version**: v1
- **X-Response-Time**: {{responseTime}}ms
- **X-Slow-Response**: true
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

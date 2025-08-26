# 获取产品列表

## 基本信息

- **响应延迟**: 500ms
::: code-url GET
```
/api/products
```
:::

## 响应示例

```json
[
  {
    "id": 1,
    "name": "iPhone 15 Pro",
    "price": 7999,
    "category": "手机",
    "stock": 50,
    "description": "最新款iPhone，配备A17芯片",
    "image": "https://example.com/images/iphone15.jpg"
  },
  {
    "id": 2,
    "name": "MacBook Air M3",
    "price": 8999,
    "category": "笔记本电脑",
    "stock": 30,
    "description": "轻薄便携，性能强劲",
    "image": "https://example.com/images/macbook-air.jpg"
  },
  {
    "id": 3,
    "name": "AirPods Pro 2",
    "price": 1899,
    "category": "耳机",
    "stock": 100,
    "description": "主动降噪，空间音频",
    "image": "https://example.com/images/airpods-pro.jpg"
  },
  {
    "id": 4,
    "name": "iPad Pro 12.9",
    "price": 9299,
    "category": "平板电脑",
    "stock": 20,
    "description": "专业级平板电脑，支持Apple Pencil",
    "image": "https://example.com/images/ipad-pro.jpg"
  }
]
```

## 响应头

- **Access-Control-Allow-Origin**: *
- **Access-Control-Allow-Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Access-Control-Allow-Headers**: Content-Type, Authorization
- **Content-Type**: application/json
- **X-API-Version**: v1
- **X-Response-Time**: {{responseTime}}ms
- **X-Slow-Response**: true

## 错误响应

当请求出现错误时，服务器将返回相应的错误信息：

```json
{
  "error": "Error Type",
  "message": "错误描述信息"
}
```

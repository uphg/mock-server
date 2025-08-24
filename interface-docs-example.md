#  后端接口文档示例

## 1. 认证模块

### 1.1 用户登录

- **描述**：用户通过账号密码登录
- **URL**：`/api/auth/login`
- **请求类型**：`POST`
- **请求参数**：
  | 参数名   | 类型   | 必填 | 说明   |
  | -------- | ------ | ---- | ------ |
  | username | string | 是   | 用户名 |
  | password | string | 是   | 密码   |
- **请求示例**：
  ```json
  {
    "username": "admin",
    "password": "123456"
  }
  ```
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR...",
      "userInfo": {
        "id": 1,
        "username": "admin",
        "role": "super_admin"
      }
    }
  }
  ```

### 1.2 用户注册

- **描述**：新用户注册
- **URL**：`/api/auth/register`
- **请求类型**：`POST`
- **请求参数**：
  | 参数名   | 类型   | 必填 | 说明           |
  | -------- | ------ | ---- | -------------- |
  | username | string | 是   | 用户名（唯一） |
  | password | string | 是   | 密码           |
  | email    | string | 否   | 邮箱地址       |
- **请求示例**：
  ```json
  {
    "username": "testuser",
    "password": "123456",
    "email": "test@example.com"
  }
  ```
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "注册成功",
    "data": {
      "id": 1002,
      "username": "testuser"
    }
  }
  ```

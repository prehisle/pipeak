# Token刷新机制实现说明

## 概述

为了解决用户几天后重新访问时出现"连接服务器失败，请稍后重试"的问题，我们实现了完整的JWT刷新令牌机制。

## 问题描述

- 用户登录后，几天后再次访问仪表盘时会看到错误提示
- 前端控制台显示：`{message: "Token has expired"}` 和 `{message: "Authorization token is required"}`
- 原因：JWT访问令牌过期（24小时），但没有自动刷新机制

## 解决方案

### 1. 后端配置

后端已经配置了刷新令牌：
- 访问令牌有效期：24小时
- 刷新令牌有效期：30天
- 刷新端点：`POST /api/auth/refresh`

### 2. 前端实现

#### 2.1 认证存储 (authStore.js)
- 已实现 `refreshAccessToken()` 方法
- 自动存储和管理访问令牌和刷新令牌

#### 2.2 API拦截器 (api.js & realApiAdapter.js)
- 响应拦截器检测401错误和"Token has expired"消息
- 自动调用刷新令牌API
- 重试原始请求
- 刷新失败时自动跳转到登录页面

## 工作流程

1. **正常请求**：用户发起API请求
2. **令牌过期**：服务器返回401错误，消息为"Token has expired"
3. **自动刷新**：拦截器检测到过期，调用刷新API
4. **更新令牌**：获取新的访问令牌，更新存储和请求头
5. **重试请求**：使用新令牌重新发起原始请求
6. **透明体验**：用户无感知，请求正常完成

## 测试方法

### 开发环境测试
```javascript
// 在浏览器控制台中运行
await window.tokenRefreshTest.runFullTest()
```

### 手动测试步骤
1. 登录应用
2. 等待24小时或手动修改令牌过期时间
3. 尝试访问需要认证的页面
4. 观察是否自动刷新令牌并正常访问

## 关键文件修改

### 1. `frontend/src/services/api.js`
- 添加了响应拦截器处理token刷新

### 2. `frontend/src/services/realApiAdapter.js`
- 添加了响应拦截器处理token刷新

### 3. `frontend/src/stores/authStore.js`
- 已有 `refreshAccessToken()` 方法

### 4. `frontend/src/utils/tokenRefreshTest.js` (新增)
- 测试工具，验证刷新机制是否正常工作

## 安全考虑

1. **刷新令牌安全**：刷新令牌有30天有效期，过期后需要重新登录
2. **自动登出**：刷新失败时自动清除认证信息并跳转登录页
3. **防重复刷新**：使用 `_retry` 标记防止无限循环刷新
4. **错误处理**：完善的错误处理和用户提示

## 用户体验改进

- ✅ 用户无需频繁重新登录
- ✅ 24小时内的会话可以自动延续
- ✅ 30天内的用户可以无感知续期
- ✅ 网络错误和认证错误有明确区分
- ✅ 自动处理令牌过期，用户体验流畅

## 监控和调试

### 控制台日志
- 刷新成功：无特殊日志（静默处理）
- 刷新失败：`Token refresh failed` 错误日志
- 自动跳转：用户被重定向到登录页面

### 测试命令
```javascript
// 测试刷新令牌功能
await tokenRefreshTest.testRefreshToken()

// 测试API拦截器
await tokenRefreshTest.testApiInterceptor()

// 运行完整测试
await tokenRefreshTest.runFullTest()
```

## 故障排除

### 常见问题
1. **刷新令牌不存在**：用户需要重新登录
2. **刷新API失败**：检查后端服务是否正常
3. **循环刷新**：检查 `_retry` 标记是否正确设置
4. **跨域问题**：确保CORS配置正确

### 解决步骤
1. 检查浏览器控制台错误日志
2. 验证localStorage中的认证数据
3. 测试后端刷新API端点
4. 运行测试工具验证功能
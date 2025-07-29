# OAuth 配置指南

本文档将指导您如何配置Google和GitHub OAuth登录功能。

## 🔧 配置步骤

### 1. Google OAuth 配置

#### 1.1 创建Google Cloud项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API 和 Google Identity API

#### 1.2 创建OAuth 2.0客户端ID
1. 在左侧菜单中选择 "APIs & Services" > "Credentials"
2. 点击 "Create Credentials" > "OAuth 2.0 Client IDs"
3. 选择应用类型为 "Web application"
4. 配置授权重定向URI：
   - 开发环境：`http://localhost:5173/auth/callback`
   - 生产环境：`https://yourdomain.com/auth/callback`
5. 保存客户端ID和客户端密钥

#### 1.3 配置环境变量
```bash
# 后端 (.env)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 前端 (.env)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 2. GitHub OAuth 配置

#### 2.1 创建GitHub OAuth App
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - Application name: `LaTeX Speed Trainer`
   - Homepage URL: `http://localhost:5173` (开发环境)
   - Authorization callback URL: `http://localhost:5173/auth/callback`
4. 保存Client ID和Client Secret

#### 2.2 配置环境变量
```bash
# 后端 (.env)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# 前端 (.env)
VITE_GITHUB_CLIENT_ID=your-github-client-id
```

### 3. 生成加密密钥

为了安全存储OAuth访问令牌，需要生成加密密钥：

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

将生成的密钥添加到后端环境变量：
```bash
TOKEN_ENCRYPTION_KEY=your-generated-encryption-key
```

## 🚀 部署配置

### 生产环境配置

1. **更新OAuth应用设置**：
   - Google: 添加生产域名到授权重定向URI
   - GitHub: 更新Homepage URL和Authorization callback URL

2. **环境变量**：
   ```bash
   # 生产环境回调URL
   OAUTH_REDIRECT_URI=https://yourdomain.com/auth/callback
   ```

3. **HTTPS要求**：
   - 生产环境必须使用HTTPS
   - OAuth提供商要求安全连接

## 🔒 安全注意事项

1. **密钥保护**：
   - 永远不要在代码中硬编码OAuth密钥
   - 使用环境变量存储敏感信息
   - 定期轮换密钥

2. **域名验证**：
   - 只在OAuth应用中配置可信域名
   - 验证回调URL的合法性

3. **令牌管理**：
   - 访问令牌使用加密存储
   - 实现令牌刷新机制
   - 设置合理的令牌过期时间

## 🧪 测试

### 本地测试
1. 确保后端服务运行在 `http://localhost:5000`
2. 确保前端服务运行在 `http://localhost:5173`
3. 访问登录页面测试OAuth登录流程

### 测试用例
- [ ] Google登录成功
- [ ] GitHub登录成功
- [ ] 新用户自动注册
- [ ] 现有用户账号绑定
- [ ] 错误处理（取消授权、网络错误等）

## 🐛 常见问题

### 1. "redirect_uri_mismatch" 错误
- 检查OAuth应用中配置的回调URL是否与实际URL匹配
- 确保协议（http/https）、域名、端口都完全一致

### 2. "invalid_client" 错误
- 检查客户端ID和密钥是否正确
- 确认环境变量已正确设置

### 3. CORS错误
- 检查后端CORS配置
- 确认前端域名在允许列表中

### 4. 令牌解密失败
- 检查TOKEN_ENCRYPTION_KEY是否正确设置
- 确认密钥格式正确（44字符的base64字符串）

## 📚 相关文档

- [Google OAuth 2.0 文档](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth 文档](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Flask-JWT-Extended 文档](https://flask-jwt-extended.readthedocs.io/)

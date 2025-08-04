# 安全配置说明

## 数据库重置接口安全措施

### ⚠️ 重要安全警告

`/api/reset-db` 接口是一个**高风险操作**，会完全清空数据库并重新初始化。为了防止误用和恶意攻击，我们实施了多重安全保护措施。

### 🔒 安全保护机制

#### 1. 环境限制
- **生产环境自动禁用**：当 `FLASK_ENV=production` 时，接口直接返回 403 错误
- **调试模式检查**：只有当 `FLASK_DEBUG=True` 时才允许访问
- **双重验证**：必须同时满足开发环境和调试模式条件

#### 2. 可选密钥保护
- 可以设置 `DEV_RESET_SECRET` 环境变量作为额外保护
- 如果设置了密钥，访问时必须提供 `dev_key` 参数
- 示例：`/api/reset-db?dev_key=your-secret-key`

#### 3. 明确的错误信息
- 生产环境访问：返回明确的禁用信息
- 密钥错误：返回认证失败信息
- 便于开发者理解和调试

### 🛠️ 开发环境使用方法

#### 基本使用（无密钥保护）
```bash
# 确保环境变量设置正确
FLASK_ENV=development
FLASK_DEBUG=True

# 直接访问接口
curl http://localhost:5000/api/reset-db
```

#### 安全使用（带密钥保护）
```bash
# 设置环境变量
FLASK_ENV=development
FLASK_DEBUG=True
DEV_RESET_SECRET=your-secret-key-123

# 带密钥访问
curl "http://localhost:5000/api/reset-db?dev_key=your-secret-key-123"
```

### 🚀 生产环境部署检查清单

在部署到生产环境前，请确保：

- [ ] `FLASK_ENV=production`
- [ ] `FLASK_DEBUG=False`
- [ ] 删除或不设置 `DEV_RESET_SECRET`
- [ ] 验证接口返回 403 错误

### 🔍 安全测试

可以通过以下方式验证安全措施是否生效：

```bash
# 测试生产环境保护
FLASK_ENV=production curl http://your-domain/api/reset-db
# 应该返回：{"error": "Database reset is disabled in production environment"}

# 测试调试模式保护
FLASK_DEBUG=False curl http://localhost:5000/api/reset-db
# 应该返回：{"error": "Database reset is disabled in production environment"}
```

### 📝 使用场景

此接口适用于以下开发场景：
- 本地开发环境数据重置
- 测试环境初始化
- 开发过程中的快速数据恢复
- CI/CD 流程中的测试数据准备

### ⚡ 紧急情况

如果在生产环境中意外暴露了此接口：
1. 立即检查环境变量配置
2. 确认 `FLASK_ENV=production`
3. 重启应用服务
4. 检查访问日志是否有异常请求
5. 如有必要，临时禁用整个接口

### 🔧 进一步增强安全性

如需更高的安全级别，可以考虑：
- 添加 IP 白名单限制
- 实施管理员身份验证
- 添加操作审计日志
- 实施请求频率限制
- 添加二次确认机制

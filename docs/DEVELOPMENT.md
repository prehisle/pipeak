# 开发指南 - LaTeX 速成训练器

## 🚀 快速开始

### 环境要求

- **Python**: 3.8+
- **Node.js**: 16+
- **MongoDB**: 4.4+

### 1. 克隆项目

```bash
git clone <repository-url>
cd latex-trainer
```

### 2. 后端设置

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 复制环境配置文件
cp .env.example .env

# 编辑 .env 文件，配置数据库连接等信息
# 启动后端服务
python run.py
```

后端服务将在 `http://localhost:5000` 启动

### 3. 前端设置

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

### 4. 数据库设置

确保 MongoDB 服务正在运行：

```bash
# 启动 MongoDB (根据您的安装方式)
mongod

# 或者使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 📁 项目结构详解

### 后端结构

```
backend/
├── app/
│   ├── __init__.py          # Flask 应用工厂
│   ├── models/              # 数据模型
│   │   ├── __init__.py
│   │   ├── user.py          # 用户模型
│   │   ├── lesson.py        # 课程模型
│   │   ├── practice.py      # 练习模型
│   │   └── review.py        # 复习模型
│   ├── routes/              # API 路由
│   │   ├── __init__.py
│   │   ├── auth.py          # 认证路由
│   │   ├── lessons.py       # 课程路由
│   │   ├── practice.py      # 练习路由
│   │   └── reviews.py       # 复习路由
│   ├── services/            # 业务逻辑
│   └── utils/               # 工具函数
├── config.py                # 配置文件
├── requirements.txt         # Python 依赖
└── run.py                  # 应用入口
```

### 前端结构

```
frontend/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Layout.jsx       # 布局组件
│   │   └── LoadingSpinner.jsx
│   ├── pages/               # 页面组件
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LessonPage.jsx
│   │   ├── PracticePage.jsx
│   │   └── ReviewPage.jsx
│   ├── services/            # API 服务
│   │   └── api.js
│   ├── stores/              # 状态管理
│   │   └── authStore.js
│   ├── utils/               # 工具函数
│   ├── App.jsx              # 主应用组件
│   ├── main.jsx             # 应用入口
│   └── index.css            # 全局样式
├── package.json
└── vite.config.js
```

## 🔧 开发工作流

### 1. 功能开发流程

1. **创建功能分支**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **后端开发**
   - 在 `app/models/` 中定义数据模型
   - 在 `app/routes/` 中实现 API 端点
   - 在 `app/services/` 中实现业务逻辑

3. **前端开发**
   - 在 `src/components/` 中创建可复用组件
   - 在 `src/pages/` 中实现页面组件
   - 在 `src/services/` 中实现 API 调用

4. **测试**
   - 后端：使用 pytest 进行单元测试
   - 前端：使用浏览器开发者工具测试

5. **提交代码**
   ```bash
   git add .
   git commit -m "feat: add feature description"
   git push origin feature/feature-name
   ```

### 2. API 开发规范

- 使用 RESTful API 设计原则
- 统一的错误响应格式
- JWT 认证保护需要登录的端点
- 输入验证和错误处理

### 3. 前端开发规范

- 使用函数式组件和 Hooks
- 统一的样式系统（CSS 变量）
- 响应式设计
- 错误边界和加载状态处理

## 🧪 测试

### 后端测试

```bash
cd backend
pytest
```

### 前端测试

```bash
cd frontend
npm run test
```

## 📦 部署

### 开发环境部署

已在上述快速开始中说明。

### 生产环境部署

1. **环境变量配置**
   - 设置安全的 SECRET_KEY 和 JWT_SECRET_KEY
   - 配置生产环境的 MongoDB 连接

2. **后端部署**
   ```bash
   # 使用 gunicorn 部署
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 run:app
   ```

3. **前端部署**
   ```bash
   npm run build
   # 将 dist/ 目录部署到静态文件服务器
   ```

## 🐛 常见问题

### 1. MongoDB 连接失败

- 确保 MongoDB 服务正在运行
- 检查 `.env` 文件中的 `MONGODB_URI` 配置
- 确认防火墙设置

### 2. CORS 错误

- 检查后端 `config.py` 中的 `CORS_ORIGINS` 配置
- 确保前端开发服务器地址在允许列表中

### 3. JWT 认证失败

- 检查 token 是否正确设置在请求头中
- 确认 token 未过期
- 验证 JWT_SECRET_KEY 配置

### 4. 性能问题

- 检查是否有重复的API调用（查看Network面板）
- 确认缓存机制是否正常工作
- 查看控制台是否有过多的调试日志
- 使用React DevTools检查不必要的重渲染

## 🚀 性能优化指南

### 前端性能优化

1. **缓存机制**
   - 使用智能缓存避免重复API调用
   - 设置合理的缓存过期时间（默认5分钟）
   - 支持强制刷新机制

2. **状态管理优化**
   - 避免在useEffect中添加函数依赖
   - 合并相关的API调用
   - 最小化组件重渲染

3. **日志管理**
   - 生产环境移除调试日志
   - 保留必要的错误日志
   - 使用条件日志输出

### 后端性能优化

1. **数据库优化**
   - 添加适当的索引
   - 优化查询语句
   - 使用数据库连接池

2. **API设计**
   - 减少不必要的数据传输
   - 实现分页和过滤
   - 使用HTTP缓存头

## 📚 相关资源

- [Flask 官方文档](https://flask.palletsprojects.com/)
- [React 官方文档](https://react.dev/)
- [MongoDB 官方文档](https://docs.mongodb.com/)
- [KaTeX 官方文档](https://katex.org/)
- [Vite 官方文档](https://vitejs.dev/)

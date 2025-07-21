# LaTeX 速成训练器 (LaTeX Speed Trainer)

一个专注、高效的在线训练环境，帮助用户通过"学习-练习-反馈-复习"的科学闭环，快速掌握LaTeX数学公式的键盘输入方法。

## 🎯 项目目标

- ✅ 提供结构化的LaTeX学习课程 (10个课程，从基础到高级)
- ✅ 实时LaTeX预览和练习 (输入即预览)
- ✅ 智能错误提示系统 (渐进式提示)
- ✅ 交互式练习环境 (38个实战练习题)
- ✅ 提升与AI大模型沟通时的数学公式输入效率

## ✨ 核心功能

### 🎓 完整课程体系
- **第1课**: 数学环境与基础语法 (上标、下标、数学环境)
- **第2课**: 分数与根号 (分数、根号、复杂表达式)
- **第3课**: 希腊字母与常用符号 (希腊字母、数学符号)
- **第4课**: 函数与三角函数 (函数、三角函数、对数)
- **第5课**: 求和、积分与极限 (求和、积分、极限符号)
- **第6课**: 矩阵与向量 (矩阵、向量、线性代数)
- **第7课**: 方程组与不等式 (方程组、不等式、分段函数)
- **第8课**: 集合论与逻辑符号 (集合运算、逻辑符号、量词)
- **第9课**: 数论与特殊运算 (高德纳箭头、同余、组合数学)
- **第10课**: 高级分析与拓扑 (偏导数、梯度、范数、内积)

### 🚀 交互式练习
- **实时预览**: 输入LaTeX代码时即时显示渲染效果
- **智能验证**: 自动检查答案正确性，支持多种等价形式
- **渐进提示**: 答错时提供逐步指导，帮助理解
- **难度分级**: 简单/中等/困难三个难度等级
- **进度追踪**: 记录学习进度和练习成绩

### 🌐 多设备支持
- **响应式设计**: 支持桌面、平板、手机访问
- **局域网部署**: 支持多设备同时访问
- **跨平台兼容**: 支持所有现代浏览器

## 🏗️ 技术栈

### 后端
- **框架**: Flask (Python)
- **数据库**: MongoDB
- **认证**: Flask-JWT-Extended
- **API**: RESTful API

### 前端
- **框架**: React + Vite
- **LaTeX渲染**: KaTeX
- **样式**: CSS Modules / Tailwind CSS
- **状态管理**: React Context / Zustand

## 📁 项目结构

```
latex-trainer/
├── backend/                 # Flask 后端
│   ├── app/
│   │   ├── models/         # MongoDB 数据模型
│   │   ├── routes/         # API 路由
│   │   ├── services/       # 业务逻辑
│   │   ├── utils/          # 工具函数
│   │   └── __init__.py     # Flask 应用工厂
│   ├── config.py           # 配置文件
│   ├── requirements.txt    # Python 依赖
│   └── run.py             # 应用入口
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   ├── utils/          # 工具函数
│   │   └── App.jsx         # 主应用组件
│   ├── package.json        # Node.js 依赖
│   └── vite.config.js      # Vite 配置
├── docs/                   # 文档
└── README.md
```

## 🚀 开发阶段

### Phase 1: 核心功能原型 ✅ (已完成)
- [x] 项目基础架构搭建
- [x] 用户认证系统 (JWT认证)
- [x] 数据库模型设计 (MongoDB)
- [x] 基础课程展示
- [x] KaTeX实时预览
- [x] 简单答案校验
- [x] 交互式练习系统
- [x] 渐进式提示系统
- [x] 用户进度追踪

### Phase 2: 智能化功能 ✅ (已完成)
- [x] 改进答案校验算法 (LaTeX标准化)
- [x] 错误提示系统 (智能反馈)
- [x] 全面课程体系 (10个课程，38个练习题)
- [x] 高级数学符号支持 (高德纳箭头、数论、分析)
- [x] LaTeX兼容性优化

### Phase 3: 优化完善 ✅ (已完成)
- [x] 性能优化 (组件优化、错误处理)
- [x] 移动端适配 (响应式设计)
- [x] 局域网部署 (多设备访问)
- [x] CORS配置优化
- [x] 键盘快捷键支持

### Phase 4: 高级功能 🆕 (新增完成)
- [x] 完整的数学公式体系 (从基础到博士级别)
- [x] 实时LaTeX预览 (输入即预览)
- [x] 智能错误修复 (LaTeX兼容性处理)
- [x] 多难度练习题 (简单/中等/困难)
- [x] 学习进度统计

## 🛠️ 开发环境设置

### 后端设置
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```
后端服务器将在 `http://0.0.0.0:5000` 启动，支持局域网访问。

### 前端设置
```bash
cd frontend
npm install
npm run dev
```
前端服务器将在 `http://localhost:5174` 启动，同时支持局域网访问。

### 🌐 局域网访问
项目支持局域网多设备访问：
- **前端**: `http://[您的IP]:5174`
- **后端**: `http://[您的IP]:5000`
- 其他设备连接到相同WiFi即可访问

### 📋 数据库设置
确保MongoDB服务正在运行：
```bash
# 项目使用的MongoDB连接
mongodb://user:password@192.168.1.4:27017/?authSource=admin
```

## 📝 API 文档

### 认证相关 ✅
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新JWT令牌

### 课程相关 ✅
- `GET /api/lessons/` - 获取课程列表
- `GET /api/lessons/{id}` - 获取课程详情
- `POST /api/lessons/{id}/complete` - 标记课程完成

### 练习相关 ✅
- `POST /api/practice/submit` - 提交练习答案
- `POST /api/practice/hint` - 获取练习提示
- `GET /api/practice/progress/{lesson_id}` - 获取练习进度

### 用户相关 ✅
- `GET /api/users/profile` - 获取用户资料
- `PUT /api/users/profile` - 更新用户资料
- `GET /api/users/progress` - 获取学习进度统计

## 📊 项目统计

### 🎯 学习内容
- **课程数量**: 10个完整课程
- **知识点**: 24个理论知识点
- **练习题**: 38个实战练习题
- **难度分布**: 简单(12题) | 中等(16题) | 困难(10题)

### 🚀 技术成就
- **前后端分离**: React + Flask 现代化架构
- **实时渲染**: KaTeX 数学公式实时预览
- **智能验证**: LaTeX 语法标准化和兼容性处理
- **多设备支持**: 响应式设计 + 局域网部署
- **完整认证**: JWT 用户认证和权限管理

### 📈 覆盖范围
从基础的数学环境到高级的数学分析符号：
- ✅ 基础语法 (上标、下标、分数、根号)
- ✅ 希腊字母和常用符号
- ✅ 函数和三角函数
- ✅ 积分、求和、极限
- ✅ 矩阵和向量
- ✅ 集合论和逻辑符号
- ✅ 数论和高德纳箭头
- ✅ 高级分析和拓扑符号

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

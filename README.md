# LaTeX 速成训练器 (LaTeX Speed Trainer)

一个专注、高效的在线训练环境，帮助用户通过"学习-练习-反馈-复习"的科学闭环，快速掌握LaTeX数学公式的键盘输入方法。

## 🎯 项目目标

- 提供结构化的LaTeX学习课程
- 实时LaTeX预览和练习
- 智能错误提示系统
- 基于遗忘曲线的复习系统
- 提升与AI大模型沟通时的数学公式输入效率

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

### Phase 1: 核心功能原型 (当前)
- [x] 项目基础架构搭建
- [ ] 用户认证系统
- [ ] 数据库模型设计
- [ ] 基础课程展示
- [ ] KaTeX实时预览
- [ ] 简单答案校验

### Phase 2: 智能化功能
- [ ] 改进答案校验算法
- [ ] 错误提示系统
- [ ] 复习系统 (SM-2算法)

### Phase 3: 优化完善
- [ ] 性能优化
- [ ] 移动端适配
- [ ] 数据分析

## 🛠️ 开发环境设置

### 后端设置
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### 前端设置
```bash
cd frontend
npm install
npm run dev
```

## 📝 API 文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 课程相关
- `GET /api/lessons` - 获取课程列表
- `GET /api/lessons/{id}` - 获取课程详情

### 练习相关
- `POST /api/practice/submit` - 提交练习答案
- `GET /api/reviews/today` - 获取今日复习

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

# 🚀 LaTeX 速成训练器 (LaTeX Speed Trainer)

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/prehisle/pipeak?style=social)
![GitHub forks](https://img.shields.io/github/forks/prehisle/pipeak?style=social)
![GitHub issues](https://img.shields.io/github/issues/prehisle/pipeak)
![GitHub license](https://img.shields.io/github/license/prehisle/pipeak)

**一个专注、高效的在线训练环境，帮助用户通过"学习-练习-反馈-复习"的科学闭环，快速掌握LaTeX数学公式的键盘输入方法。**

[🎯 在线演示](#) | [📖 使用指南](#-快速开始) | [🤝 贡献指南](#-贡献指南) | [📄 更新日志](#-更新日志)

</div>

---

## 📺 项目演示

> **注意**: 截图正在准备中，请先启动项目体验完整功能

<!--
### 🏠 主界面
![主界面](screenshots/dashboard.png)

### 🏋️ 练习中心
![练习中心](screenshots/practice-center.png)

### 📝 练习执行
![练习执行](screenshots/practice-exercise.png)

### 📊 学习统计
![学习统计](screenshots/practice-stats.png)
-->

## 🎯 项目特色

### 🌟 为什么选择LaTeX速成训练器？

- 🎓 **系统化学习路径**: 10个精心设计的课程，从基础语法到高级应用
- 🏋️ **实战练习导向**: 38个真实场景练习题，学以致用
- 🧠 **智能学习系统**: AI驱动的个性化推荐和进度追踪
- ⚡ **即时反馈机制**: 实时预览 + 智能验证，错误立即纠正
- 📱 **全平台支持**: 响应式设计，支持桌面、平板、手机
- 🔄 **科学复习算法**: 基于SM-2算法的智能复习提醒

### 🎯 适用场景

- 📚 **学术写作**: 论文、报告中的数学公式输入
- 🤖 **AI交互**: 与ChatGPT、Claude等AI模型进行数学讨论
- 👨‍🏫 **教学辅助**: 教师制作数学课件和习题
- 📊 **技术文档**: 工程和科研文档中的公式表达

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

### 🏋️ 练习中心 (新增)
- **练习题库**: 38个精心设计的练习题，覆盖所有知识点
- **智能筛选**: 按课程、难度、完成状态筛选练习题
- **搜索功能**: 快速搜索特定题目内容
- **练习统计**: 详细的学习数据分析和进度可视化
- **个性化推荐**: 基于学习情况的智能练习建议
- **独立练习模式**: 专门的练习执行环境，专注答题

### 🚀 交互式练习
- **实时预览**: 输入LaTeX代码时即时显示渲染效果
- **增强验证**: 支持更多LaTeX等价形式的智能识别
- **渐进提示**: 答错时提供逐步指导，帮助理解
- **难度分级**: 简单/中等/困难三个难度等级
- **进度追踪**: 记录学习进度和练习成绩
- **成就反馈**: 完成练习后的即时反馈和鼓励

### 🔄 智能复习系统
- **SM-2算法**: 科学的间隔重复学习算法
- **个性化复习**: 根据掌握程度调整复习频率
- **进度追踪**: 详细的学习数据分析和可视化
- **成就系统**: 学习里程碑和成就徽章

### 🌐 多设备支持
- **响应式设计**: 支持桌面、平板、手机访问
- **局域网部署**: 支持多设备同时访问
- **跨平台兼容**: 支持所有现代浏览器
- **离线缓存**: PWA支持，部分功能可离线使用

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

## 🚀 快速开始

### 📋 环境要求

| 组件 | 版本要求 | 说明 |
|------|----------|------|
| Python | 3.8+ | 后端运行环境 |
| Node.js | 16+ | 前端构建工具 |
| MongoDB | 4.4+ | 数据库 |
| 浏览器 | 现代浏览器 | 支持ES6+和WebGL |

### ⚡ 一键启动 (推荐)

```bash
# 1. 克隆项目
git clone https://github.com/prehisle/pipeak.git
cd pipeak

# 2. 启动后端 (新终端窗口)
cd backend
pip install -r requirements.txt
python app.py

# 3. 启动前端 (新终端窗口)
cd frontend
npm install
npm run dev

# 4. 打开浏览器访问
# 前端: http://localhost:5173
# 后端API: http://localhost:5000
```

### 🎯 首次使用指南

1. **注册账户**: 访问 http://localhost:5173 并注册新账户
2. **开始学习**: 从第1课"数学环境与基础语法"开始
3. **练习巩固**: 完成课程后到练习中心进行专项训练
4. **复习提升**: 使用复习系统巩固已学知识

### 🔍 功能导览

| 页面 | 功能 | 快捷键 |
|------|------|--------|
| 学习面板 | 课程概览、学习进度 | `Ctrl+1` |
| 练习中心 | 练习题库、智能推荐 | `Ctrl+2` |
| 复习页面 | 智能复习、错题重做 | `Ctrl+3` |
| 课程页面 | 交互式学习、实时预览 | `Ctrl+Enter` 提交 |

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

我们欢迎所有形式的贡献！无论是bug报告、功能建议还是代码贡献。

### 🐛 报告问题

如果您发现了bug或有功能建议，请：

1. 检查 [Issues](https://github.com/prehisle/pipeak/issues) 确认问题未被报告
2. 创建新的Issue，详细描述问题或建议
3. 提供复现步骤、环境信息和截图（如适用）

### 💻 代码贡献

1. **Fork项目** 到您的GitHub账户
2. **创建分支** `git checkout -b feature/amazing-feature`
3. **提交更改** `git commit -m 'Add some amazing feature'`
4. **推送分支** `git push origin feature/amazing-feature`
5. **创建Pull Request**

### 🎯 贡献方向

- 🐛 修复已知bug
- ✨ 添加新的LaTeX符号支持
- 🎨 改进用户界面设计
- 📱 优化移动端体验
- 🌍 添加多语言支持
- 📊 增强数据分析功能

## 📄 更新日志

### v1.2.0 (2024-07-25) - 练习系统完善版

#### ✨ 新功能
- 🏋️ **练习中心**: 完整的练习题管理和执行环境
- 🔍 **智能搜索**: 支持按题目内容、课程名称搜索
- 💡 **个性化推荐**: 基于学习进度的智能练习建议
- 📊 **统计分析**: 详细的学习数据可视化
- 🎯 **筛选系统**: 按课程、难度、完成状态筛选

#### 🔧 改进
- 增强LaTeX答案验证，支持更多等价形式
- 优化练习完成后的反馈体验
- 改进统计图表的视觉效果
- 完善移动端响应式设计

### v1.1.0 (2024-07-24) - 核心功能完善版

#### ✨ 新功能
- 📚 完整的10个课程体系
- 🏋️ 38个实战练习题
- 🔄 SM-2智能复习算法
- 🎯 渐进式提示系统

### v1.0.0 (2024-07-23) - 首个正式版本

#### ✨ 核心功能
- � 用户认证系统
- 📖 交互式课程学习
- ⚡ 实时LaTeX预览
- 📊 学习进度追踪

## �📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [KaTeX](https://katex.org/) - 优秀的LaTeX数学公式渲染库
- [React](https://reactjs.org/) - 强大的前端框架
- [Flask](https://flask.palletsprojects.com/) - 轻量级的Python Web框架
- [MongoDB](https://www.mongodb.com/) - 灵活的NoSQL数据库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架

## 📞 联系我们

- 💬 Discussions: [GitHub Discussions](https://github.com/prehisle/pipeak/discussions)
- 🐛 Issues: [GitHub Issues](https://github.com/prehisle/pipeak/issues)

---

<div align="center">
  <strong>🎯 让LaTeX学习变得简单高效！</strong>

  如果这个项目对您有帮助，请给我们一个 ⭐ Star！

  [⬆ 回到顶部](#-latex-速成训练器-latex-speed-trainer)
</div>

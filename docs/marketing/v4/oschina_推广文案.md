# 你家小孩真的喜欢数学吗？试试这个LaTeX速成训练器就知道了

## 开发者的痛点

写技术博客时遇到数学公式就头疼？
和AI讨论算法时只能用文字描述？
给孩子检查数学作业完全看不懂？

问题不在于数学能力，而在于表达工具。

## 一个简单测试

试试用键盘输入这个公式：

```
f(x) = ∫₋∞^∞ e^(-t²) dt / √π
```

输入不了？那就对了，大多数开发者都输入不了。

但用LaTeX只需要：
```latex
f(x) = \frac{\int_{-\infty}^{\infty} e^{-t^2} dt}{\sqrt{\pi}}
```

渲染效果：
$$f(x) = \frac{\int_{-\infty}^{\infty} e^{-t^2} dt}{\sqrt{\pi}}$$

## 项目介绍

我开源了一个LaTeX学习平台，帮助开发者快速掌握数学公式输入。

**在线体验**：https://pipeak.share4y.cn/
**GitHub**：https://github.com/prehisle/pipeak

## 技术实现

```javascript
// 前端架构
React + Vite + Tailwind CSS + Zustand
KaTeX实时渲染 + i18next国际化

// 后端架构  
Flask + MongoDB + JWT认证
RESTful API + SM-2学习算法

// 部署方案
Vercel + Docker + 自动化CI/CD
```

## 核心功能

**渐进式课程**：10个课程，38个练习，从零到精通
**实时预览**：输入即渲染，错误立刻发现
**智能复习**：基于遗忘曲线的科学复习机制
**多端适配**：PC、移动端完美适配

## 开发亮点

- React Hooks + Zustand轻量级状态管理
- Flask工厂模式，模块化架构
- MongoDB灵活数据存储
- KaTeX高性能数学渲染
- 完整的用户认证和权限系统

## 学习路径

**基础篇**（1-3天）：分数、根号、基础符号
**进阶篇**（4-7天）：函数、积分、矩阵
**高级篇**（8-10天）：复杂公式、方程组

每天20分钟，10天见效。

## 应用场景

- **技术博客**：算法公式表达更专业
- **项目文档**：数学模型描述更清晰  
- **学术交流**：与AI讨论更精准
- **教育辅导**：帮助孩子学习数学

## 快速开始

```bash
# 克隆项目
git clone https://github.com/prehisle/pipeak.git

# 后端启动
cd backend
pip install -r requirements.txt
python run.py

# 前端启动
cd frontend  
npm install
npm run dev
```

## 项目价值

这不仅是一个LaTeX学习工具，更是一个完整的在线教育平台解决方案：

- 前后端分离架构参考
- 用户系统完整实现
- 学习算法实际应用
- 多语言国际化方案

## 立即体验

https://pipeak.share4y.cn/

10分钟体验，让数学表达不再是障碍。

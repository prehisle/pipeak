# 你家小孩真的喜欢数学吗？试试这个LaTeX速成训练器就知道了

## 先做个小测试

能用键盘打出这个公式吗？

```
∑(i=1 to n) i² = n(n+1)(2n+1)/6
```

打不出来？正常，99%的人都打不出来。

但如果会LaTeX，只需要：
```latex
\sum_{i=1}^{n} i^2 = \frac{n(n+1)(2n+1)}{6}
```

渲染效果：
$$\sum_{i=1}^{n} i^2 = \frac{n(n+1)(2n+1)}{6}$$

## 为什么要学LaTeX

不是为了装逼，而是为了效率。

- 写技术文档时，公式不再是痛苦
- 和AI讨论数学时，表达更精准
- 学术写作时，排版更专业
- 教孩子数学时，演示更清晰

## 我的解决方案

做了一个LaTeX训练器，10天速成，38个实战练习。

**在线体验**：https://pipeak.share4y.cn/
**源码地址**：https://github.com/prehisle/pipeak

## 技术栈

```
前端：React + Vite + Tailwind CSS
后端：Flask + MongoDB + JWT
渲染：KaTeX引擎
部署：Vercel + Docker
```

全栈开源项目，代码质量还不错。

## 学习方法

**科学路径**：从简单到复杂，循序渐进
**实时反馈**：输入错误立刻提示，正确立刻渲染
**智能复习**：SM-2算法，基于遗忘曲线

## 适合人群

- 程序员：技术博客、文档写作
- 学生：作业、论文、笔记
- 老师：课件制作、试卷编写
- 家长：辅导孩子、检查作业

## 本地部署

```bash
# 克隆项目
git clone https://github.com/prehisle/pipeak.git

# 启动后端
cd backend && pip install -r requirements.txt && python run.py

# 启动前端
cd frontend && npm install && npm run dev
```

## 学习效果

10天后你能做到：
- 3秒输入复杂积分公式
- 不查文档完成矩阵表达
- 流畅地用LaTeX做数学笔记
- 帮孩子检查数学作业

## 现在就试试

https://pipeak.share4y.cn/

10分钟体验，你就知道效果了。

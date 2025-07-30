# 🎯 你家小孩喜欢数学吗？快来挑战一下LaTeX天梯！

## 📋 项目概述

**LaTeX速成训练器** 是一个基于现代Web技术栈开发的在线数学公式学习平台。项目采用前后端分离架构，通过游戏化的"天梯挑战"机制，让LaTeX数学公式学习变得有趣且高效。

🌐 **在线演示**：https://pipeak.share4y.cn/
📦 **开源地址**：https://github.com/prehisle/pipeak
📄 **开源协议**：MIT License

## 🏗️ 技术架构

### 后端技术栈
```yaml
框架: Flask (Python 3.8+)
数据库: MongoDB 4.4+
认证: JWT + Google OAuth 2.0
API设计: RESTful
部署: Docker + Gunicorn
监控: 健康检查 + 日志系统
```

### 前端技术栈
```yaml
框架: React 18 + TypeScript
构建工具: Vite 4.x
样式方案: Tailwind CSS 3.x
状态管理: Zustand
路由: React Router 6
数学渲染: KaTeX
国际化: i18next
PWA: Workbox
```

### 项目结构
```
pipeak/
├── backend/              # Flask后端服务
│   ├── app/             # 应用核心模块
│   │   ├── models/      # 数据模型层
│   │   ├── routes/      # API路由层
│   │   ├── services/    # 业务逻辑层
│   │   └── utils/       # 工具函数
│   ├── config.py        # 配置管理
│   ├── requirements.txt # Python依赖
│   └── run.py          # 应用入口
├── frontend/            # React前端应用
│   ├── src/
│   │   ├── components/  # 可复用组件
│   │   ├── pages/      # 页面组件
│   │   ├── stores/     # 状态管理
│   │   ├── services/   # API服务
│   │   └── utils/      # 工具函数
│   ├── package.json    # Node.js依赖
│   └── vite.config.js  # 构建配置
├── docker-compose.yml   # 容器编排
└── docs/               # 项目文档
```

## 🎮 核心功能设计

### 天梯挑战系统
基于游戏化理念设计的学习进阶系统：

```javascript
// 段位等级设计
const RANKS = {
  BRONZE: { name: '青铜', level: 1, topics: ['基础语法', '分数根号'] },
  SILVER: { name: '白银', level: 2, topics: ['希腊字母', '常用符号'] },
  GOLD: { name: '黄金', level: 3, topics: ['函数', '积分求和'] },
  PLATINUM: { name: '铂金', level: 4, topics: ['矩阵', '向量'] },
  DIAMOND: { name: '钻石', level: 5, topics: ['集合论', '逻辑符号'] },
  MASTER: { name: '大师', level: 6, topics: ['高级分析', '拓扑符号'] }
}
```

### 学习算法实现
采用SM-2间隔重复算法优化学习效果：

```python
class SM2Algorithm:
    """SM-2间隔重复算法实现"""
    
    def calculate_next_review(self, quality, repetitions, easiness, interval):
        """
        计算下次复习时间
        
        Args:
            quality: 答题质量 (0-5)
            repetitions: 重复次数
            easiness: 容易度因子
            interval: 当前间隔天数
        
        Returns:
            tuple: (新间隔, 新容易度, 新重复次数)
        """
        if quality >= 3:
            if repetitions == 0:
                interval = 1
            elif repetitions == 1:
                interval = 6
            else:
                interval = round(interval * easiness)
            repetitions += 1
        else:
            repetitions = 0
            interval = 1
        
        easiness = max(1.3, easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
        
        return interval, easiness, repetitions
```

## 🔧 技术特性

### 实时数学公式渲染
集成KaTeX引擎，实现毫秒级公式渲染：

```javascript
// LaTeX实时预览组件
const LaTeXPreview = ({ input, onError }) => {
  const [html, setHtml] = useState('')
  
  useEffect(() => {
    try {
      const rendered = katex.renderToString(input, {
        throwOnError: false,
        displayMode: true,
        strict: false
      })
      setHtml(rendered)
    } catch (error) {
      onError(error.message)
    }
  }, [input])
  
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

### 智能答案验证
支持多种LaTeX等价形式的智能识别：

```python
class LaTeXValidator:
    """LaTeX答案验证器"""
    
    def normalize_latex(self, latex_str):
        """标准化LaTeX表达式"""
        # 移除多余空格
        latex_str = re.sub(r'\s+', ' ', latex_str.strip())
        
        # 标准化常见等价形式
        equivalents = {
            r'\\frac\{([^}]+)\}\{([^}]+)\}': r'\\frac{\1}{\2}',
            r'\\sqrt\[([^]]+)\]\{([^}]+)\}': r'\\sqrt[\1]{\2}',
            r'\^(\w)': r'^{\1}',
            r'_(\w)': r'_{\1}'
        }
        
        for pattern, replacement in equivalents.items():
            latex_str = re.sub(pattern, replacement, latex_str)
        
        return latex_str
    
    def validate_answer(self, user_input, correct_answer):
        """验证用户答案"""
        normalized_input = self.normalize_latex(user_input)
        normalized_answer = self.normalize_latex(correct_answer)
        
        return normalized_input == normalized_answer
```

### 性能优化策略
实现多层缓存机制提升用户体验：

```javascript
// API缓存策略
class APICache {
  constructor(ttl = 300000) { // 5分钟TTL
    this.cache = new Map()
    this.ttl = ttl
  }
  
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  set(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl
    })
  }
}
```

## 📊 数据模型设计

### 用户学习数据
```javascript
// MongoDB用户模型
const UserSchema = {
  _id: ObjectId,
  username: String,
  email: String,
  password_hash: String,
  created_at: Date,
  
  // 学习进度
  learning_progress: {
    current_rank: String,
    completed_lessons: [Number],
    total_score: Number,
    streak_days: Number
  },
  
  // 复习数据
  review_items: [{
    lesson_id: Number,
    exercise_id: Number,
    next_review: Date,
    easiness_factor: Number,
    repetitions: Number,
    interval: Number
  }],
  
  // 统计数据
  statistics: {
    total_practice_time: Number,
    correct_answers: Number,
    total_answers: Number,
    average_speed: Number
  }
}
```

### 课程内容结构
```javascript
// 课程数据模型
const LessonSchema = {
  _id: ObjectId,
  lesson_id: Number,
  title: String,
  description: String,
  rank_requirement: String,
  
  // 知识点内容
  content: {
    theory: String,        // 理论讲解
    examples: [String],    // 示例代码
    key_points: [String]   // 重点提示
  },
  
  // 练习题目
  exercises: [{
    question: String,
    answer: String,
    hints: [String],
    difficulty: Number,
    tags: [String]
  }],
  
  // 元数据
  metadata: {
    estimated_time: Number,
    prerequisite_lessons: [Number],
    difficulty_level: Number
  }
}
```

## 🚀 部署方案

### Docker容器化部署
```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:4.4
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/latex_trainer?authSource=admin
      JWT_SECRET_KEY: your-jwt-secret
    depends_on:
      - mongodb
    ports:
      - "5000:5000"

  frontend:
    build: ./frontend
    environment:
      VITE_API_BASE_URL: http://localhost:5000
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### 云平台部署
支持多种云平台一键部署：

- **Vercel**: 前端静态部署
- **Railway**: 后端服务部署
- **MongoDB Atlas**: 云数据库服务
- **Docker Hub**: 容器镜像托管

## 📈 项目特色

### 教育价值
- **科学学习路径**: 基于认知科学的渐进式学习设计
- **个性化推荐**: 根据学习能力智能调整难度
- **即时反馈**: 实时错误提示和改进建议
- **长期记忆**: SM-2算法确保知识长期保持

### 技术创新
- **实时渲染**: KaTeX引擎提供毫秒级公式渲染
- **智能验证**: 支持多种LaTeX等价形式识别
- **响应式设计**: 完美适配各种设备和屏幕
- **PWA支持**: 可安装到桌面，离线使用

### 用户体验
- **游戏化设计**: 段位系统激发学习动力
- **社交功能**: 排行榜和成就系统
- **多语言支持**: 中英文界面切换
- **无障碍访问**: 符合WCAG 2.1标准

## 🎯 应用场景

### 学术研究
- **论文写作**: 快速输入复杂数学公式
- **学术交流**: 标准化的数学表达
- **课件制作**: 教学材料中的公式编辑

### 工程应用
- **技术文档**: 算法分析和公式推导
- **数据分析**: 统计模型和机器学习公式
- **AI对话**: 与AI系统进行数学讨论

### 教育培训
- **数学教学**: 辅助数学课程教学
- **在线教育**: 远程学习平台集成
- **自主学习**: 个人技能提升工具

## 🤝 开源贡献

### 贡献指南
欢迎开发者参与项目贡献：

1. **代码贡献**: 提交Pull Request
2. **问题反馈**: 提交Issue报告
3. **功能建议**: 参与Discussions讨论
4. **文档完善**: 改进项目文档
5. **测试用例**: 增加单元测试覆盖

### 技术路线图
- [ ] 移动端原生应用开发
- [ ] AI智能出题系统
- [ ] 多人协作学习模式
- [ ] 语音输入识别功能
- [ ] 3D数学可视化

## 📞 联系方式

- **GitHub**: https://github.com/prehisle/pipeak
- **Issues**: https://github.com/prehisle/pipeak/issues
- **Discussions**: https://github.com/prehisle/pipeak/discussions

---

**让LaTeX学习变得简单高效！** 如果这个项目对您有帮助，请给我们一个 ⭐ Star！

#LaTeX #数学公式 #开源项目 #React #Flask #教育技术

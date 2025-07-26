// 完整的10课程体系 - 从后端comprehensive_lessons.py转换而来
// 支持国际化的前端课程数据

// 从后端数据转换为前端格式的函数
function convertBackendToFrontend(backendLessons) {
  return backendLessons.map(lesson => {
    // 按照cards的原始顺序转换，保持学习流程的连贯性
    const knowledgePoints = []
    let knowledgePointIndex = 1

    lesson.cards.forEach((card) => {
      if (card.type === 'knowledge') {
        // 知识点卡片：转换为纯知识点（无练习题）
        knowledgePoints.push({
          id: `kp-${lesson.sequence}-${knowledgePointIndex}`,
          title: card.title || extractTitleFromContent(card.content),
          content: card.content,
          exercises: [] // 纯知识点，无练习题
        })
        knowledgePointIndex++
      } else if (card.type === 'practice') {
        // 练习题卡片：转换为练习知识点（包含一个练习题）
        knowledgePoints.push({
          id: `kp-${lesson.sequence}-${knowledgePointIndex}`,
          title: `练习：${card.question.replace('请输入 LaTeX 代码来表示：', '').replace('请输入 LaTeX 代码来表示', '')}`,
          content: `现在让我们通过练习来巩固刚学到的知识。请根据题目要求输入正确的 LaTeX 代码。`, // 简洁的练习说明
          exercises: [{
            question: card.question,
            answer: card.target_formula,
            hint: card.hints?.[0] || '暂无提示',
            difficulty: card.difficulty || 'easy'
          }]
        })
        knowledgePointIndex++
      }
    })

    return {
      id: `lesson-${lesson.sequence}`,
      title: lesson.title,
      description: lesson.description,
      duration: 15, // 默认15分钟
      order: lesson.sequence,
      knowledgePoints
    }
  })
}

// 从内容中提取标题的辅助函数
function extractTitleFromContent(content) {
  const match = content.match(/\*\*(.*?)\*\*/)
  return match ? match[1] : '知识点'
}

// 后端课程数据（从comprehensive_lessons.py转换而来）
const backendLessonsData = [
  // 第1课：数学环境与基础语法
  {
    sequence: 1,
    title: '第1课：数学环境与基础语法',
    description: '学习LaTeX数学公式的基础语法，掌握数学环境、上标、下标的使用方法。',
    cards: [
      {
        type: 'knowledge',
        title: 'LaTeX数学环境',
        content: 'LaTeX数学公式需要在特定环境中编写：\n\n• **行内公式**：使用 `$...$` 包围，如 `$x^2$` → $x^2$\n• **独立公式**：使用 `$$...$$` 包围，如 `$$E = mc^2$$` → $$E = mc^2$$'
      },
      {
        type: 'knowledge',
        title: '上标和下标',
        content: '• 上标使用 `^` 符号：`$x^2$` → $x^2$\n• 下标使用 `_` 符号：`$x_1$` → $x_1$\n• 同时使用：`$x_1^2$` → $x_1^2$'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：x 的平方',
        target_formula: '$x^2$',
        hints: ['使用 ^ 符号表示上标', '上标内容是 2', '完整格式：$x^2$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：a 下标 1',
        target_formula: '$a_1$',
        hints: ['使用 _ 符号表示下标', '下标内容是 1', '完整格式：$a_1$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：x 下标 n 的平方',
        target_formula: '$x_n^2$',
        hints: ['先写下标 _n，再写上标 ^2', '或者写成 x_{n}^{2}', '完整格式：$x_n^2$'],
        difficulty: 'medium'
      }
    ]
  },
  
  // 第2课：分数与根号
  {
    sequence: 2,
    title: '第2课：分数与根号',
    description: '学习如何在LaTeX中表示分数和根号，掌握复杂数学表达式的写法。',
    cards: [
      {
        type: 'knowledge',
        content: '使用 `\\frac{分子}{分母}` 命令：\n\n• `$\\frac{1}{2}$` → $\\frac{1}{2}$\n• `$\\frac{a+b}{c-d}$` → $\\frac{a+b}{c-d}$\n• `$\\frac{x^2}{y^3}$` → $\\frac{x^2}{y^3}$'
      },
      {
        type: 'knowledge',
        content: '使用 `\\sqrt{}` 命令：\n\n• `$\\sqrt{x}$` → $\\sqrt{x}$ (平方根)\n• `$\\sqrt[3]{x}$` → $\\sqrt[3]{x}$ (三次根)\n• `$\\sqrt{x^2 + y^2}$` → $\\sqrt{x^2 + y^2}$'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示分数：二分之一',
        target_formula: '$\\frac{1}{2}$',
        hints: ['使用 \\frac{分子}{分母} 命令', '分子是 1，分母是 2', '完整格式：$\\frac{1}{2}$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：根号 2',
        target_formula: '$\\sqrt{2}$',
        hints: ['使用 \\sqrt{} 命令表示根号', '根号内容是 2', '完整格式：$\\sqrt{2}$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：x 加 y 的平方，除以 2',
        target_formula: '$\\frac{(x+y)^2}{2}$',
        hints: ['分子是 (x+y)^2，分母是 2', '注意括号的使用', '完整格式：$\\frac{(x+y)^2}{2}$'],
        difficulty: 'medium'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：三次根号下 8',
        target_formula: '$\\sqrt[3]{8}$',
        hints: ['使用 \\sqrt[n]{} 表示 n 次根号', '三次根号是 \\sqrt[3]{}', '完整格式：$\\sqrt[3]{8}$'],
        difficulty: 'medium'
      }
    ]
  },
  
  // 第3课：希腊字母与常用符号
  {
    sequence: 3,
    title: '第3课：希腊字母与常用符号',
    description: '学习常用的希腊字母和数学符号的LaTeX写法，为高级数学公式打基础。',
    cards: [
      {
        type: 'knowledge',
        content: '• `$\\alpha$` → $\\alpha$ (阿尔法)\n• `$\\beta$` → $\\beta$ (贝塔)\n• `$\\gamma$` → $\\gamma$ (伽马)\n• `$\\delta$` → $\\delta$ (德尔塔)\n• `$\\pi$` → $\\pi$ (派)\n• `$\\theta$` → $\\theta$ (西塔)\n• `$\\lambda$` → $\\lambda$ (兰姆达)\n• `$\\mu$` → $\\mu$ (缪)'
      },
      {
        type: 'knowledge',
        content: '• `$\\Gamma$` → $\\Gamma$ (大伽马)\n• `$\\Delta$` → $\\Delta$ (大德尔塔)\n• `$\\Theta$` → $\\Theta$ (大西塔)\n• `$\\Lambda$` → $\\Lambda$ (大兰姆达)\n• `$\\Pi$` → $\\Pi$ (大派)\n• `$\\Sigma$` → $\\Sigma$ (大西格马)\n• `$\\Omega$` → $\\Omega$ (大欧米伽)'
      },
      {
        type: 'knowledge',
        content: '**常用数学符号**\n\n• `$\\infty$` → $\\infty$ (无穷)\n• `$\\pm$` → $\\pm$ (正负)\n• `$\\times$` → $\\times$ (乘号)\n• `$\\div$` → $\\div$ (除号)\n• `$\\neq$` → $\\neq$ (不等于)\n• `$\\leq$` → $\\leq$ (小于等于)\n• `$\\geq$` → $\\geq$ (大于等于)\n• `$\\approx$` → $\\approx$ (约等于)'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示希腊字母：π (圆周率)',
        target_formula: '$\\pi$',
        hints: ['希腊字母 π 的 LaTeX 命令是 \\pi', '需要在数学环境中使用', '完整格式：$\\pi$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：α + β',
        target_formula: '$\\alpha + \\beta$',
        hints: ['α 是 \\alpha，β 是 \\beta', '希腊字母命令都以反斜杠开头', '完整格式：$\\alpha + \\beta$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：x ≠ ∞',
        target_formula: '$x \\neq \\infty$',
        hints: ['不等于符号是 \\neq', '无穷符号是 \\infty', '完整格式：$x \\neq \\infty$'],
        difficulty: 'medium'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：Δx ≈ 0',
        target_formula: '$\\Delta x \\approx 0$',
        hints: ['大德尔塔是 \\Delta', '约等于符号是 \\approx', '完整格式：$\\Delta x \\approx 0$'],
        difficulty: 'medium'
      }
    ]
  },

  // 第4课：函数与三角函数
  {
    sequence: 4,
    title: '第4课：函数与三角函数',
    description: '学习函数表示法、三角函数、对数函数等常用数学函数的LaTeX写法。',
    cards: [
      {
        type: 'knowledge',
        content: '**函数表示法**\n\n• `$f(x)$` → $f(x)$ (函数)\n• `$\\sin x$` → $\\sin x$ (正弦)\n• `$\\cos x$` → $\\cos x$ (余弦)\n• `$\\tan x$` → $\\tan x$ (正切)\n• `$\\log x$` → $\\log x$ (对数)\n• `$\\ln x$` → $\\ln x$ (自然对数)\n• `$\\exp x$` → $\\exp x$ (指数函数)'
      },
      {
        type: 'knowledge',
        content: '**复合函数与反函数**\n\n• `$f(g(x))$` → $f(g(x))$ (复合函数)\n• `$f^{-1}(x)$` → $f^{-1}(x)$ (反函数)\n• `$\\sin^2 x$` → $\\sin^2 x$ (正弦平方)\n• `$\\arcsin x$` → $\\arcsin x$ (反正弦)\n• `$\\arccos x$` → $\\arccos x$ (反余弦)\n• `$\\arctan x$` → $\\arctan x$ (反正切)'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：sin x',
        target_formula: '$\\sin x$',
        hints: ['三角函数使用反斜杠开头', '正弦函数是 \\sin', '完整格式：$\\sin x$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：f(x) = x²',
        target_formula: '$f(x) = x^2$',
        hints: ['函数名直接写，括号内是变量', 'x的平方用 x^2 表示', '完整格式：$f(x) = x^2$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：sin²θ + cos²θ = 1',
        target_formula: '$\\sin^2 \\theta + \\cos^2 \\theta = 1$',
        hints: ['平方写在函数名后面：\\sin^2', 'θ 是希腊字母 \\theta', '完整格式：$\\sin^2 \\theta + \\cos^2 \\theta = 1$'],
        difficulty: 'medium'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：ln(e^x) = x',
        target_formula: '$\\ln(e^x) = x$',
        hints: ['自然对数是 \\ln', 'e 是自然常数，直接写', '完整格式：$\\ln(e^x) = x$'],
        difficulty: 'medium'
      }
    ]
  },

  // 第5课：求和、积分与极限
  {
    sequence: 5,
    title: '第5课：求和、积分与极限',
    description: '学习求和符号、积分符号、极限符号等高级数学记号的LaTeX表示方法。',
    cards: [
      {
        type: 'knowledge',
        content: '**求和符号**\n\n• `$\\sum_{i=1}^{n} x_i$` → $\\sum_{i=1}^{n} x_i$ (有限求和)\n• `$\\sum_{k=0}^{\\infty} \\frac{1}{k!}$` → $\\sum_{k=0}^{\\infty} \\frac{1}{k!}$ (无穷级数)\n• `$\\prod_{i=1}^{n} a_i$` → $\\prod_{i=1}^{n} a_i$ (连乘)'
      },
      {
        type: 'knowledge',
        content: '**积分符号**\n\n• `$\\int f(x) dx$` → $\\int f(x) dx$ (不定积分)\n• `$\\int_0^1 x^2 dx$` → $\\int_0^1 x^2 dx$ (定积分)\n• `$\\iint f(x,y) dx dy$` → $\\iint f(x,y) dx dy$ (二重积分)\n• `$\\oint f(x) dx$` → $\\oint f(x) dx$ (环积分)'
      },
      {
        type: 'knowledge',
        content: '**极限符号**\n\n• `$\\lim_{x \\to 0} f(x)$` → $\\lim_{x \\to 0} f(x)$ (极限)\n• `$\\lim_{n \\to \\infty} a_n$` → $\\lim_{n \\to \\infty} a_n$ (数列极限)\n• `$\\lim_{x \\to a^+} f(x)$` → $\\lim_{x \\to a^+} f(x)$ (右极限)\n• `$\\lim_{x \\to a^-} f(x)$` → $\\lim_{x \\to a^-} f(x)$ (左极限)'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：从 i=1 到 n 的求和',
        target_formula: '$\\sum_{i=1}^{n}$',
        hints: ['求和符号使用 \\sum 命令', '下标用 _ 表示，上标用 ^ 表示', '完整格式：$\\sum_{i=1}^{n}$'],
        difficulty: 'medium'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：从 0 到 1 的定积分',
        target_formula: '$\\int_0^1$',
        hints: ['积分符号使用 \\int 命令', '积分下限和上限分别用下标和上标表示', '完整格式：$\\int_0^1$'],
        difficulty: 'medium'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：当 x 趋向于 0 时 f(x) 的极限',
        target_formula: '$\\lim_{x \\to 0} f(x)$',
        hints: ['极限符号使用 \\lim 命令', '趋向符号是 \\to', '完整格式：$\\lim_{x \\to 0} f(x)$'],
        difficulty: 'medium'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：∫₀¹ x² dx = 1/3',
        target_formula: '$\\int_0^1 x^2 dx = \\frac{1}{3}$',
        hints: ['定积分：\\int_0^1', 'x的平方：x^2', '三分之一：\\frac{1}{3}', '完整格式：$\\int_0^1 x^2 dx = \\frac{1}{3}$'],
        difficulty: 'hard'
      }
    ]
  }
,

  // 第6课：矩阵与向量
  {
    sequence: 6,
    title: '第6课：矩阵与向量',
    description: '学习矩阵、向量、行列式等线性代数符号的LaTeX表示方法。',
    cards: [
      {
        type: 'knowledge',
        content: '**矩阵表示法**\n\n• `$$\\begin{matrix} a & b \\\\ c & d \\end{matrix}$$` → 基础矩阵\n• `$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$` → 圆括号矩阵\n• `$$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$$` → 方括号矩阵\n• `$$\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}$$` → 行列式'
      },
      {
        type: 'knowledge',
        content: '**向量表示法**\n\n• `$\\vec{v}$` → $\\vec{v}$ (向量箭头)\n• `$\\mathbf{v}$` → $\\mathbf{v}$ (粗体向量)\n• `$\\overrightarrow{AB}$` → $\\overrightarrow{AB}$ (有向线段)\n• `$\\hat{i}$` → $\\hat{i}$ (单位向量)\n• `$\\vec{a} \\cdot \\vec{b}$` → $\\vec{a} \\cdot \\vec{b}$ (点积)\n• `$\\vec{a} \\times \\vec{b}$` → $\\vec{a} \\times \\vec{b}$ (叉积)'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示一个 2×2 矩阵（带圆括号）',
        target_formula: '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$',
        hints: ['使用 \\begin{pmatrix}...\\end{pmatrix} 环境', '矩阵元素用 & 分隔，行用 \\\\\\\\ 分隔', '完整格式：$\\begin{pmatrix} a & b \\\\\\\\ c & d \\end{pmatrix}$'],
        difficulty: 'hard'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示向量 v（带箭头）',
        target_formula: '$\\vec{v}$',
        hints: ['向量箭头使用 \\vec{} 命令', '向量名放在花括号内', '完整格式：$\\vec{v}$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示两个向量的点积：a⃗ · b⃗',
        target_formula: '$\\vec{a} \\cdot \\vec{b}$',
        hints: ['向量用 \\vec{} 表示', '点积符号是 \\cdot', '完整格式：$\\vec{a} \\cdot \\vec{b}$'],
        difficulty: 'medium'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示 3×3 单位矩阵',
        target_formula: '$\\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}$',
        hints: ['使用 pmatrix 环境', '三行三列，对角线为1，其余为0', '每行用 \\\\\\\\ 分隔，每列用 & 分隔'],
        difficulty: 'hard'
      }
    ]
  },

  // 第7课：方程组与不等式
  {
    sequence: 7,
    title: '第7课：方程组与不等式',
    description: '学习方程组、不等式组、条件表达式等复杂数学结构的LaTeX表示。',
    cards: [
      {
        type: 'knowledge',
        content: '**方程组表示法**\n\n• `$$\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}$$` → 二元方程组\n• `$$\\begin{align} x + y &= 1 \\\\ 2x - y &= 3 \\end{align}$$` → 对齐方程组\n• `$$\\left\\{\\begin{array}{l} x > 0 \\\\ y > 0 \\end{array}\\right.$$` → 条件组'
      },
      {
        type: 'knowledge',
        content: '**不等式符号**\n\n• `$<$` → $<$ (小于)\n• `$>$` → $>$ (大于)\n• `$\\leq$` → $\\leq$ (小于等于)\n• `$\\geq$` → $\\geq$ (大于等于)\n• `$\\ll$` → $\\ll$ (远小于)\n• `$\\gg$` → $\\gg$ (远大于)\n• `$\\subset$` → $\\subset$ (子集)\n• `$\\supset$` → $\\supset$ (超集)'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示一个简单的二元方程组',
        target_formula: '$\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}$',
        hints: ['使用 \\begin{cases}...\\end{cases} 环境', '方程之间用 \\\\\\\\ 分隔', '完整格式：$\\begin{cases} x + y = 1 \\\\\\\\ x - y = 0 \\end{cases}$'],
        difficulty: 'hard'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：0 ≤ x ≤ 1',
        target_formula: '$0 \\leq x \\leq 1$',
        hints: ['小于等于符号是 \\leq', '可以连续使用不等号', '完整格式：$0 \\leq x \\leq 1$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示分段函数：f(x) = {x² if x≥0; -x² if x<0}',
        target_formula: '$f(x) = \\begin{cases} x^2 & \\text{if } x \\geq 0 \\\\ -x^2 & \\text{if } x < 0 \\end{cases}$',
        hints: ['使用 cases 环境', '条件用 \\text{} 包围', '& 用于对齐', '完整格式：$f(x) = \\begin{cases} x^2 & \\text{if } x \\geq 0 \\\\\\\\ -x^2 & \\text{if } x < 0 \\end{cases}$'],
        difficulty: 'hard'
      }
    ]
  },

  // 第8课：集合论与逻辑符号
  {
    sequence: 8,
    title: '第8课：集合论与逻辑符号',
    description: '学习集合论符号、逻辑运算符、量词等数学逻辑的LaTeX表示方法。',
    cards: [
      {
        type: 'knowledge',
        content: '**集合符号**\n\n• `$\\in$` → $\\in$ (属于)\n• `$\\notin$` → $\\notin$ (不属于)\n• `$\\subset$` → $\\subset$ (子集)\n• `$\\subseteq$` → $\\subseteq$ (子集或等于)\n• `$\\supset$` → $\\supset$ (超集)\n• `$\\cup$` → $\\cup$ (并集)\n• `$\\cap$` → $\\cap$ (交集)\n• `$\\emptyset$` → $\\emptyset$ (空集)'
      },
      {
        type: 'knowledge',
        content: '**逻辑符号**\n\n• `$\\land$` → $\\land$ (逻辑与)\n• `$\\lor$` → $\\lor$ (逻辑或)\n• `$\\neg$` → $\\neg$ (逻辑非)\n• `$\\implies$` → $\\implies$ (蕴含)\n• `$\\iff$` → $\\iff$ (当且仅当)\n• `$\\forall$` → $\\forall$ (全称量词)\n• `$\\exists$` → $\\exists$ (存在量词)\n• `$\\nexists$` → $\\nexists$ (不存在)'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：x 属于 A',
        target_formula: '$x \\in A$',
        hints: ['属于符号是 \\in', '格式：元素 \\in 集合', '完整格式：$x \\in A$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：A ∪ B（A 并 B）',
        target_formula: '$A \\cup B$',
        hints: ['并集符号是 \\cup', '格式：集合 \\cup 集合', '完整格式：$A \\cup B$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：∀x ∈ ℝ（对于所有实数 x）',
        target_formula: '$\\forall x \\in \\mathbb{R}$',
        hints: ['全称量词是 \\forall', '实数集是 \\mathbb{R}', '完整格式：$\\forall x \\in \\mathbb{R}$'],
        difficulty: 'medium'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：A ⊆ B ⇒ A ∩ B = A',
        target_formula: '$A \\subseteq B \\implies A \\cap B = A$',
        hints: ['子集或等于：\\subseteq', '蕴含：\\implies，交集：\\cap', '完整格式：$A \\subseteq B \\implies A \\cap B = A$'],
        difficulty: 'hard'
      }
    ]
  }
,

  // 第9课：数论与特殊运算
  {
    sequence: 9,
    title: '第9课：数论与特殊运算',
    description: '学习数论符号、同余、高德纳箭头、超运算等高级数学运算的LaTeX表示。',
    cards: [
      {
        type: 'knowledge',
        content: '**数论符号**\n\n• `$a \\mid b$` → $a \\mid b$ (a 整除 b)\n• `$a \\nmid b$` → $a \\nmid b$ (a 不整除 b)\n• `$a \\equiv b \\pmod{n}$` → $a \\equiv b \\pmod{n}$ (同余)\n• `$\\gcd(a,b)$` → $\\gcd(a,b)$ (最大公约数)\n• `$\\lcm(a,b)$` → $\\lcm(a,b)$ (最小公倍数)\n• `$\\mathbb{Z}$` → $\\mathbb{Z}$ (整数集)\n• `$\\mathbb{N}$` → $\\mathbb{N}$ (自然数集)'
      },
      {
        type: 'knowledge',
        content: '**高德纳箭头与超运算**\n\n• `$a \\uparrow b = a^b$` → $a \\uparrow b = a^b$ (指数运算，三级运算)\n• `$a \\uparrow\\uparrow b$` → $a \\uparrow\\uparrow b$ (幂塔，四级运算)\n• `$a \\uparrow\\uparrow\\uparrow b$` → $a \\uparrow\\uparrow\\uparrow b$ (五级运算)\n• `${}^n a$` → ${}^n a$ (超幂)\n• `$a^{(n)} b$` → $a^{(n)} b$ (n级运算)\n• `$\\text{Ack}(m,n)$` → $\\text{Ack}(m,n)$ (阿克曼函数)'
      },
      {
        type: 'knowledge',
        content: '**组合数学符号**\n\n• `$\\binom{n}{k}$` → $\\binom{n}{k}$ (二项式系数)\n• `$n!$` → $n!$ (阶乘)\n• `$n!!$` → $n!!$ (双阶乘)\n• `$P(n,k)$` → $P(n,k)$ (排列数)\n• `$C(n,k)$` → $C(n,k)$ (组合数)\n• `$\\Gamma(n)$` → $\\Gamma(n)$ (伽马函数)\n• `$\\zeta(s)$` → $\\zeta(s)$ (黎曼ζ函数)'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：a ≡ b (mod n)（a 与 b 模 n 同余）',
        target_formula: '$a \\equiv b \\pmod{n}$',
        hints: ['同余符号是 \\equiv', '模运算用 \\pmod{n}', '完整格式：$a \\equiv b \\pmod{n}$'],
        difficulty: 'medium'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示高德纳箭头：3↑↑4（3的幂塔4层）',
        target_formula: '$3 \\uparrow\\uparrow 4$',
        hints: ['高德纳箭头用 \\uparrow', '幂塔是两个箭头：\\uparrow\\uparrow', '完整格式：$3 \\uparrow\\uparrow 4$'],
        difficulty: 'hard'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示二项式系数：C(n,k) 或 "n choose k"',
        target_formula: '$\\binom{n}{k}$',
        hints: ['二项式系数用 \\binom{上}{下}', '也叫组合数', '完整格式：$\\binom{n}{k}$'],
        difficulty: 'medium'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示：gcd(a,b) = 1 ⇒ a ⊥ b（互质）',
        target_formula: '$\\gcd(a,b) = 1 \\implies a \\perp b$',
        hints: ['最大公约数：\\gcd(a,b)', '蕴含：\\implies，互质：\\perp', '完整格式：$\\gcd(a,b) = 1 \\implies a \\perp b$'],
        difficulty: 'hard'
      }
    ]
  },

  // 第10课：高级分析与拓扑
  {
    sequence: 10,
    title: '第10课：高级分析与拓扑',
    description: '学习高级数学分析、拓扑学、泛函分析等领域的专业LaTeX符号。',
    cards: [
      {
        type: 'knowledge',
        content: '**高级积分与微分**\n\n• `$\\partial f / \\partial x$` → $\\partial f / \\partial x$ (偏导数)\n• `$\\nabla f$` → $\\nabla f$ (梯度)\n• `$\\Delta f$` → $\\Delta f$ (拉普拉斯算子)\n• `$\\oint_C f(z) dz$` → $\\oint_C f(z) dz$ (复积分)\n• `$\\iint_D f(x,y) dx dy$` → $\\iint_D f(x,y) dx dy$ (二重积分)\n• `$\\iiint_V f(x,y,z) dx dy dz$` → $\\iiint_V f(x,y,z) dx dy dz$ (三重积分)'
      },
      {
        type: 'knowledge',
        content: '**拓扑与几何符号**\n\n• `$\\mathcal{T}$` → $\\mathcal{T}$ (拓扑)\n• `$\\overline{A}$` → $\\overline{A}$ (闭包)\n• `$A^\\circ$` → $A^\\circ$ (内部)\n• `$\\partial A$` → $\\partial A$ (边界)\n• `$\\mathbb{S}^n$` → $\\mathbb{S}^n$ (n维球面)\n• `$\\mathbb{R}^n$` → $\\mathbb{R}^n$ (n维欧几里得空间)\n• `$\\mathbb{C}$` → $\\mathbb{C}$ (复数域)\n• `$\\mathbb{H}$` → $\\mathbb{H}$ (四元数)'
      },
      {
        type: 'knowledge',
        content: '**泛函分析符号**\n\n• `$\\|x\\|$` → $\\|x\\|$ (范数)\n• `$\\langle x, y \\rangle$` → $\\langle x, y \\rangle$ (内积)\n• `$L^p(\\Omega)$` → $L^p(\\Omega)$ (Lp空间)\n• `$C^\\infty(\\mathbb{R})$` → $C^\\infty(\\mathbb{R})$ (无穷可微函数)\n• `$\\mathcal{H}$` → $\\mathcal{H}$ (希尔伯特空间)\n• `$\\mathcal{B}(X,Y)$` → $\\mathcal{B}(X,Y)$ (有界线性算子)\n• `$\\sigma(T)$` → $\\sigma(T)$ (谱)'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示偏导数：∂f/∂x',
        target_formula: '$\\frac{\\partial f}{\\partial x}$',
        hints: ['偏导数符号是 \\partial', '用分数形式：\\frac{\\partial f}{\\partial x}', '完整格式：$\\frac{\\partial f}{\\partial x}$'],
        difficulty: 'medium'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示梯度：∇f',
        target_formula: '$\\nabla f$',
        hints: ['梯度符号是 \\nabla', '也叫倒三角算子', '完整格式：$\\nabla f$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示内积：⟨x, y⟩',
        target_formula: '$\\langle x, y \\rangle$',
        hints: ['内积用尖括号：\\langle 和 \\rangle', '中间用逗号分隔', '完整格式：$\\langle x, y \\rangle$'],
        difficulty: 'medium'
      },
      {
        type: 'practice',
        question: '请输入 LaTeX 代码来表示范数：‖x‖',
        target_formula: '$\\|x\\|$',
        hints: ['范数用双竖线：\\| 和 \\|', '包围要计算范数的对象', '完整格式：$\\|x\\|$'],
        difficulty: 'easy'
      }
    ]
  }
]

// 转换数据并导出
const convertedLessons = convertBackendToFrontend(backendLessonsData)

export const comprehensiveLessonsData = {
  "zh-CN": convertedLessons,
  "en-US": convertedLessons.map(lesson => ({
    ...lesson,
    // 英文版本可以在这里添加翻译
    // 暂时使用中文版本
  }))
}

export default comprehensiveLessonsData

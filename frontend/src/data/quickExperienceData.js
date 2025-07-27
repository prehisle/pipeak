// Quick Experience 数据 - 仅用于登录前的快速体验
// 包含精选的15道练习题，涵盖LaTeX基础语法

export const quickExperienceQuestions = [
  // 基础语法
  {
    id: 'qe_1',
    question: '请输入 LaTeX 代码来表示：x 的平方',
    target_formula: '$x^2$',
    hints: ['使用 ^ 符号表示上标', '上标内容是 2', '完整格式：$x^2$'],
    difficulty: 'easy',
    lessonTitle: '基础语法'
  },
  {
    id: 'qe_2', 
    question: '请输入 LaTeX 代码来表示：a 下标 1',
    target_formula: '$a_1$',
    hints: ['使用 _ 符号表示下标', '下标内容是 1', '完整格式：$a_1$'],
    difficulty: 'easy',
    lessonTitle: '基础语法'
  },
  {
    id: 'qe_3',
    question: '请输入 LaTeX 代码来表示：x 下标 i 的平方',
    target_formula: '$x_i^2$',
    hints: ['先写下标 _i', '再写上标 ^2', '完整格式：$x_i^2$'],
    difficulty: 'medium',
    lessonTitle: '基础语法'
  },

  // 分数
  {
    id: 'qe_4',
    question: '请输入 LaTeX 代码来表示：二分之一',
    target_formula: '$\\frac{1}{2}$',
    hints: ['使用 \\frac{分子}{分母}', '分子是 1，分母是 2', '完整格式：$\\frac{1}{2}$'],
    difficulty: 'easy',
    lessonTitle: '分数与根号'
  },
  {
    id: 'qe_5',
    question: '请输入 LaTeX 代码来表示：根号 2',
    target_formula: '$\\sqrt{2}$',
    hints: ['使用 \\sqrt{} 表示根号', '根号内容是 2', '完整格式：$\\sqrt{2}$'],
    difficulty: 'easy',
    lessonTitle: '分数与根号'
  },
  {
    id: 'qe_6',
    question: '请输入 LaTeX 代码来表示：x 加 y 分之 a 加 b',
    target_formula: '$\\frac{a+b}{x+y}$',
    hints: ['分子是 a+b', '分母是 x+y', '完整格式：$\\frac{a+b}{x+y}$'],
    difficulty: 'medium',
    lessonTitle: '分数与根号'
  },

  // 希腊字母
  {
    id: 'qe_7',
    question: '请输入 LaTeX 代码来表示希腊字母：α (阿尔法)',
    target_formula: '$\\alpha$',
    hints: ['使用 \\alpha', '完整格式：$\\alpha$'],
    difficulty: 'easy',
    lessonTitle: '希腊字母'
  },
  {
    id: 'qe_8',
    question: '请输入 LaTeX 代码来表示希腊字母：β (贝塔)',
    target_formula: '$\\beta$',
    hints: ['使用 \\beta', '完整格式：$\\beta$'],
    difficulty: 'easy',
    lessonTitle: '希腊字母'
  },
  {
    id: 'qe_9',
    question: '请输入 LaTeX 代码来表示希腊字母：π (圆周率)',
    target_formula: '$\\pi$',
    hints: ['使用 \\pi', '完整格式：$\\pi$'],
    difficulty: 'easy',
    lessonTitle: '希腊字母'
  },

  // 运算符
  {
    id: 'qe_10',
    question: '请输入 LaTeX 代码来表示：x ≠ y',
    target_formula: '$x \\neq y$',
    hints: ['使用 \\neq 表示不等于', '完整格式：$x \\neq y$'],
    difficulty: 'medium',
    lessonTitle: '运算符'
  },
  {
    id: 'qe_11',
    question: '请输入 LaTeX 代码来表示：x ≤ y',
    target_formula: '$x \\leq y$',
    hints: ['使用 \\leq 表示小于等于', '完整格式：$x \\leq y$'],
    difficulty: 'medium',
    lessonTitle: '运算符'
  },
  {
    id: 'qe_12',
    question: '请输入 LaTeX 代码来表示：x ≈ y',
    target_formula: '$x \\approx y$',
    hints: ['使用 \\approx 表示约等于', '完整格式：$x \\approx y$'],
    difficulty: 'medium',
    lessonTitle: '运算符'
  },

  // 函数
  {
    id: 'qe_13',
    question: '请输入 LaTeX 代码来表示：sin x',
    target_formula: '$\\sin x$',
    hints: ['使用 \\sin', '完整格式：$\\sin x$'],
    difficulty: 'easy',
    lessonTitle: '函数'
  },
  {
    id: 'qe_14',
    question: '请输入 LaTeX 代码来表示：log x',
    target_formula: '$\\log x$',
    hints: ['使用 \\log', '完整格式：$\\log x$'],
    difficulty: 'easy',
    lessonTitle: '函数'
  },
  {
    id: 'qe_15',
    question: '请输入 LaTeX 代码来表示：lim 下标 x 趋向于 0',
    target_formula: '$\\lim_{x \\to 0}$',
    hints: ['使用 \\lim_{x \\to 0}', '\\to 表示趋向于', '完整格式：$\\lim_{x \\to 0}$'],
    difficulty: 'hard',
    lessonTitle: '函数'
  }
]

// 快速体验的课程信息（用于显示）
export const quickExperienceLessons = [
  {
    id: 'qe_lesson_1',
    title: '基础语法',
    description: '学习上标、下标的基本用法'
  },
  {
    id: 'qe_lesson_2', 
    title: '分数与根号',
    description: '掌握分数和根号的LaTeX表示'
  },
  {
    id: 'qe_lesson_3',
    title: '希腊字母',
    description: '学习常用希腊字母的输入'
  },
  {
    id: 'qe_lesson_4',
    title: '运算符',
    description: '掌握数学运算符的表示'
  },
  {
    id: 'qe_lesson_5',
    title: '函数',
    description: '学习数学函数的LaTeX语法'
  }
]

export default {
  questions: quickExperienceQuestions,
  lessons: quickExperienceLessons
}

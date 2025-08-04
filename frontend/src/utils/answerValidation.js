// 答案验证工具函数
// 用于验证LaTeX答案的等价性

/**
 * 语义等价组列表 - 每个数组内的表达式都被认为是等价的
 * 基于15道离线练习题目的target_formula进行优化
 */
const SEMANTIC_EQUIVALENCE_GROUPS = [
  // 题目1: x^2 - 上标的不同写法
  ['x^2', 'x^{2}'],

  // 题目2: a_1 - 下标的不同写法
  ['a_1', 'a_{1}'],

  // 题目3: x_i^2 - 上下标组合的不同写法
  ['x_i^2', 'x_{i}^2', 'x_i^{2}', 'x_{i}^{2}'],

  // 题目4: \frac{1}{2} - 分数的不同写法
  ['\\frac{1}{2}', '\\frac{ 1 }{ 2 }', '\\frac{1 }{2}', '\\frac{ 1}{2 }'],

  // 题目5: \sqrt{2} - 根号的不同写法
  ['\\sqrt{2}', '\\sqrt{ 2 }', '\\sqrt{2 }', '\\sqrt{ 2 }'],

  // 题目6: \frac{(x+y)^2}{2} - 复杂分数的空格差异
  ['\\frac{(x+y)^2}{2}', '\\frac{(x + y)^2}{2}', '\\frac{(x+y)^{2}}{2}', '\\frac{( x + y )^2}{2}'],

  // 题目7: \sqrt[3]{8} - n次根号的不同写法
  ['\\sqrt[3]{8}', '\\sqrt[3]{ 8 }', '\\sqrt[ 3 ]{8}', '\\sqrt[ 3 ]{ 8 }'],

  // 题目8: \pi - 希腊字母的空格差异
  ['\\pi', '\\pi '],

  // 题目9: \alpha + \beta - 希腊字母组合的空格差异
  ['\\alpha + \\beta', '\\alpha+\\beta', '\\alpha +\\beta', '\\alpha+ \\beta', '\\alpha + \\beta '],

  // 题目10: x \neq \infty - 运算符的空格差异
  ['x \\neq \\infty', 'x\\neq\\infty', 'x \\neq\\infty', 'x\\neq \\infty'],

  // 题目11: \Delta x \approx 0 - 希腊字母和运算符的空格差异
  ['\\Delta x \\approx 0', '\\Delta x\\approx 0', '\\Delta x \\approx0', '\\Delta x\\approx0'],

  // 题目12: \sin x - 函数的空格差异（但不包括括号变体）
  ['\\sin x', '\\sin x ', '\\sin  x'],

  // 题目13: f(x) = x^2 - 函数定义的空格差异
  ['f(x) = x^2', 'f(x)=x^2', 'f(x) =x^2', 'f(x)= x^2', 'f(x) = x^{2}'],

  // 题目14: \sin^2\theta + \cos^2\theta = 1 - 复杂三角函数的空格差异
  ['\\sin^2\\theta + \\cos^2\\theta = 1', '\\sin^{2}\\theta + \\cos^{2}\\theta = 1',
   '\\sin^2 \\theta + \\cos^2 \\theta = 1', '\\sin^2\\theta+\\cos^2\\theta=1'],

  // 题目15: \ln(e^x) = x - 对数函数的空格差异
  ['\\ln(e^x) = x', '\\ln(e^{x}) = x', '\\ln( e^x ) = x', '\\ln(e^x)=x'],

  // 通用的空格差异模式
  ['x + y', 'x+y', 'x +y', 'x+ y'],
  ['x - y', 'x-y', 'x -y', 'x- y'],
  ['x = y', 'x=y', 'x =y', 'x= y'],

  // 通用的括号空格差异
  ['(x)', '( x )', '(x )', '( x)'],
  ['{x}', '{ x }', '{x }', '{ x}'],

  // 通用的上标下标空格差异
  ['a^n', 'a^{n}'],
  ['a_n', 'a_{n}'],

  // 其他希腊字母
  ['\\alpha', '\\alpha '],
  ['\\beta', '\\beta '],
  ['\\gamma', '\\gamma '],
  ['\\delta', '\\delta '],
  ['\\theta', '\\theta '],

  // 其他数学符号
  ['\\neq', '\\neq '],
  ['\\approx', '\\approx '],
  ['\\infty', '\\infty '],

  // 其他函数
  ['\\sin', '\\sin '],
  ['\\cos', '\\cos '],
  ['\\ln', '\\ln '],
]

/**
 * 使用语义等价组检查LaTeX公式的等价性
 * @param {string} latex1 - 第一个LaTeX公式
 * @param {string} latex2 - 第二个LaTeX公式
 * @returns {boolean} - 是否语义等价
 */
export const checkLatexSemanticEquivalence = (latex1, latex2) => {
  // 标准化LaTeX输入
  const normalizeLatex = (latex) => {
    return latex.trim()
      .replace(/^\$+|\$+$/g, '') // 移除美元符号
      .replace(/\s+/g, ' ') // 标准化空格
      .trim()
      .toLowerCase()
  }

  const norm1 = normalizeLatex(latex1)
  const norm2 = normalizeLatex(latex2)

  // 如果标准化后完全相同，直接返回true
  if (norm1 === norm2) {
    return true
  }

  console.log(`语义比较LaTeX: "${norm1}" vs "${norm2}"`)

  // 在等价组中查找
  for (const group of SEMANTIC_EQUIVALENCE_GROUPS) {
    const normalizedGroup = group.map(item => normalizeLatex(item))

    if (normalizedGroup.includes(norm1) && normalizedGroup.includes(norm2)) {
      console.log(`✅ 在等价组中找到匹配: [${group.join(', ')}]`)
      return true
    }
  }

  console.log(`❌ 未在等价组中找到匹配`)
  return false
}

// 删除未使用的Canvas相关函数，专注于语义等价比较

/**
 * 检查用户答案与目标答案是否等价（原有方法）
 * @param {string} userAnswer - 用户输入的答案
 * @param {string} targetAnswer - 目标答案
 * @returns {boolean} - 是否等价
 */
export const checkAnswerEquivalence = (userAnswer, targetAnswer) => {
  // 标准化函数：移除多余空格，统一格式
  const normalize = (str) => {
    return str
      .replace(/\s+/g, '') // 移除所有空格
      .toLowerCase() // 转换为小写
      .replace(/^\$+|\$+$/g, '') // 移除开头和结尾的美元符号
  }

  const normalizedUser = normalize(userAnswer)
  const normalizedTarget = normalize(targetAnswer)

  // 直接比较标准化后的字符串
  if (normalizedUser === normalizedTarget) {
    return true
  }

  // 检查是否只是美元符号的差异
  const userWithDollar = `$${normalizedUser}$`
  const targetWithDollar = `$${normalizedTarget}$`

  return normalize(userWithDollar) === normalize(targetWithDollar)
}

/**
 * 增强的LaTeX答案验证（混合方案：先字符串比较，再语义比较）
 * @param {string} userAnswer - 用户输入的答案
 * @param {string} targetAnswer - 目标答案
 * @param {boolean} useSemanticComparison - 是否启用语义比较
 * @returns {Promise<boolean>} - 是否等价
 */
export const checkAdvancedAnswerEquivalence = async (userAnswer, targetAnswer, useSemanticComparison = true) => {
  // 第一步：基本字符串比较
  if (checkAnswerEquivalence(userAnswer, targetAnswer)) {
    console.log('字符串比较匹配')
    return true
  }

  // 第二步：如果启用语义比较且字符串比较失败，尝试语义比较
  if (useSemanticComparison) {
    console.log('字符串比较失败，尝试语义比较...')
    try {
      const semanticResult = checkLatexSemanticEquivalence(userAnswer, targetAnswer)
      if (semanticResult) {
        console.log('语义比较匹配！')
        return true
      }
    } catch (error) {
      console.error('语义比较出错，回退到字符串比较:', error)
    }
  }

  return false
}

/**
 * 测试函数，用于验证语义比较功能
 * @param {string} latex1 - 第一个LaTeX公式
 * @param {string} latex2 - 第二个LaTeX公式
 * @returns {boolean} - 返回语义比较结果
 */
export const testSemanticComparison = (latex1, latex2) => {
  const stringResult = checkAnswerEquivalence(latex1, latex2)

  try {
    const semanticResult = checkLatexSemanticEquivalence(latex1, latex2)

    if (stringResult !== semanticResult) {
      console.log(`🎯 "${latex1}" vs "${latex2}": 语义比较检测到字符串比较遗漏的等价性`)
    }

    return semanticResult
  } catch (error) {
    console.error('语义比较测试失败:', error)
    return false
  }
}

export default checkAnswerEquivalence

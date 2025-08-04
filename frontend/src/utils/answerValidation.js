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

/**
 * 常见错误模式列表 - 检测用户常见的LaTeX错误并给出专门提示
 */
const COMMON_ERROR_PATTERNS = [
  // 上下标顺序错误
  {
    pattern: /^([a-zA-Z])(\^[^_]*)?(_[^_]*)?(\^[^_]*)?$/,
    checkError: (userAnswer, targetAnswer) => {
      // 检测是否是上下标顺序问题
      const userNorm = userAnswer.replace(/[\s${}]/g, '').toLowerCase()
      const targetNorm = targetAnswer.replace(/[\s${}]/g, '').toLowerCase()

      console.log(`检查上下标顺序: "${userNorm}" vs "${targetNorm}"`)

      // 特殊检查：x^2_1 vs x_1^2
      if ((userNorm === 'x^2_1' && targetNorm === 'x_1^2') ||
          (userNorm === 'x_1^2' && targetNorm === 'x^2_1')) {
        return {
          type: 'subscript_superscript_order',
          message: `注意上下标的顺序：x₁² 表示"x下标1的平方"，而 x²₁ 表示"x的平方，下标1"`
        }
      }

      // 通用检查：检查是否包含相同的字母、上标、下标，但顺序不同
      const userParts = extractScriptParts(userNorm)
      const targetParts = extractScriptParts(targetNorm)

      console.log('用户部分:', userParts)
      console.log('目标部分:', targetParts)

      if (userParts.base === targetParts.base &&
          userParts.superscript === targetParts.superscript &&
          userParts.subscript === targetParts.subscript &&
          userNorm !== targetNorm) {
        return {
          type: 'subscript_superscript_order',
          message: `注意上下标的顺序：${targetParts.base}${targetParts.subscript ? '₍' + targetParts.subscript + '₎' : ''}${targetParts.superscript ? '^' + targetParts.superscript : ''} 表示"${targetParts.base}${targetParts.subscript ? '下标' + targetParts.subscript : ''}${targetParts.superscript ? '的' + targetParts.superscript + '次方' : ''}"`
        }
      }
      return null
    }
  },

  // 函数反斜杠缺失
  {
    pattern: /\b(sin|cos|tan|log|ln|exp|sqrt|lim|sum|int)\b/,
    checkError: (userAnswer, targetAnswer) => {
      const userNorm = userAnswer.replace(/[\s$]/g, '').toLowerCase()
      const targetNorm = targetAnswer.replace(/[\s$]/g, '').toLowerCase()

      const functions = ['sin', 'cos', 'tan', 'log', 'ln', 'exp', 'sqrt', 'lim', 'sum', 'int']

      for (const func of functions) {
        if (userNorm.includes(func) && !userNorm.includes('\\' + func) &&
            targetNorm.includes('\\' + func)) {
          return {
            type: 'missing_backslash',
            message: `数学函数需要使用反斜杠：\\${func} 而不是 ${func}`
          }
        }
      }
      return null
    }
  },

  // 分数格式错误
  {
    pattern: /\d+\/\d+/,
    checkError: (userAnswer, targetAnswer) => {
      const userNorm = userAnswer.replace(/[\s$]/g, '')
      const targetNorm = targetAnswer.replace(/[\s$]/g, '')

      if (userNorm.match(/\d+\/\d+/) && targetNorm.includes('\\frac')) {
        const match = userNorm.match(/(\d+)\/(\d+)/)
        if (match) {
          return {
            type: 'fraction_format',
            message: `分数应该使用 \\frac{${match[1]}}{${match[2]}} 格式，而不是 ${match[1]}/${match[2]}}`
          }
        }
      }
      return null
    }
  },

  // 希腊字母拼写错误
  {
    pattern: /\b(alpha|beta|gamma|delta|theta|pi|sigma|omega)\b/,
    checkError: (userAnswer, targetAnswer) => {
      const userNorm = userAnswer.replace(/[\s$]/g, '').toLowerCase()
      const targetNorm = targetAnswer.replace(/[\s$]/g, '').toLowerCase()

      const greekLetters = ['alpha', 'beta', 'gamma', 'delta', 'theta', 'pi', 'sigma', 'omega']

      for (const letter of greekLetters) {
        if (userNorm.includes(letter) && !userNorm.includes('\\' + letter) &&
            targetNorm.includes('\\' + letter)) {
          return {
            type: 'greek_letter_format',
            message: `希腊字母需要使用反斜杠：\\${letter} 而不是 ${letter}`
          }
        }
      }
      return null
    }
  },

  // 括号缺失或多余
  {
    pattern: /.*/,
    checkError: (userAnswer, targetAnswer) => {
      const userNorm = userAnswer.replace(/[\s$]/g, '')
      const targetNorm = targetAnswer.replace(/[\s$]/g, '')

      // 检查函数括号
      if (userNorm.includes('\\sin') && targetNorm.includes('\\sin')) {
        if (userNorm.includes('\\sin(') && !targetNorm.includes('\\sin(')) {
          return {
            type: 'unnecessary_parentheses',
            message: '正弦函数通常写作 \\sin x，不需要括号'
          }
        }
        if (!userNorm.includes('\\sin(') && targetNorm.includes('\\sin(')) {
          return {
            type: 'missing_parentheses',
            message: '这里的正弦函数需要括号：\\sin(x)'
          }
        }
      }
      return null
    }
  }
]

/**
 * 提取上标下标部分
 */
const extractScriptParts = (latex) => {
  const result = { base: '', superscript: '', subscript: '' }

  // 更精确的解析，处理 x^2_1 和 x_1^2 格式
  const baseMatch = latex.match(/^([a-zA-Z]+)/)
  if (baseMatch) {
    result.base = baseMatch[1]

    // 查找所有上标
    const superscriptMatches = latex.match(/\^([^_^]+)/g)
    if (superscriptMatches) {
      result.superscript = superscriptMatches[0].substring(1) // 移除^符号
    }

    // 查找所有下标
    const subscriptMatches = latex.match(/_([^_^]+)/g)
    if (subscriptMatches) {
      result.subscript = subscriptMatches[0].substring(1) // 移除_符号
    }
  }

  return result
}

/**
 * 检查常见错误并返回专门提示
 * @param {string} userAnswer - 用户答案
 * @param {string} targetAnswer - 正确答案
 * @returns {Object|null} - 错误信息对象或null
 */
export const checkCommonErrors = (userAnswer, targetAnswer) => {
  console.log(`🔍 开始检查常见错误: "${userAnswer}" vs "${targetAnswer}"`)

  for (let i = 0; i < COMMON_ERROR_PATTERNS.length; i++) {
    const errorPattern = COMMON_ERROR_PATTERNS[i]
    try {
      console.log(`检查错误模式 ${i + 1}/${COMMON_ERROR_PATTERNS.length}`)
      const error = errorPattern.checkError(userAnswer, targetAnswer)
      if (error) {
        console.log(`🎯 检测到常见错误: ${error.type} - ${error.message}`)
        return error
      }
    } catch (e) {
      console.warn(`错误模式 ${i + 1} 检测失败:`, e)
    }
  }

  console.log('❌ 未检测到任何常见错误模式')
  return null
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
 * 增强的LaTeX答案验证（混合方案：字符串比较 → 语义比较 → 错误检测）
 * @param {string} userAnswer - 用户输入的答案
 * @param {string} targetAnswer - 目标答案
 * @param {boolean} useSemanticComparison - 是否启用语义比较
 * @returns {Promise<Object>} - 验证结果对象 {isCorrect: boolean, errorInfo?: Object}
 */
export const checkAdvancedAnswerEquivalence = async (userAnswer, targetAnswer, useSemanticComparison = true) => {
  // 第一步：基本字符串比较
  if (checkAnswerEquivalence(userAnswer, targetAnswer)) {
    console.log('字符串比较匹配')
    return { isCorrect: true }
  }

  // 第二步：如果启用语义比较且字符串比较失败，尝试语义比较
  if (useSemanticComparison) {
    console.log('字符串比较失败，尝试语义比较...')
    try {
      const semanticResult = checkLatexSemanticEquivalence(userAnswer, targetAnswer)
      if (semanticResult) {
        console.log('语义比较匹配！')
        return { isCorrect: true }
      }
    } catch (error) {
      console.error('语义比较出错，回退到字符串比较:', error)
    }
  }

  // 第三步：检查常见错误，提供专门提示
  console.log('语义比较失败，检查常见错误...')
  const errorInfo = checkCommonErrors(userAnswer, targetAnswer)

  if (errorInfo) {
    console.log(`发现常见错误: ${errorInfo.message}`)
    return { isCorrect: false, errorInfo }
  }

  // 第四步：通用失败
  return { isCorrect: false }
}

/**
 * 兼容性函数：保持原有的boolean返回值接口
 * @param {string} userAnswer - 用户输入的答案
 * @param {string} targetAnswer - 目标答案
 * @param {boolean} useSemanticComparison - 是否启用语义比较
 * @returns {Promise<boolean>} - 是否等价
 */
export const checkAdvancedAnswerEquivalenceBoolean = async (userAnswer, targetAnswer, useSemanticComparison = true) => {
  const result = await checkAdvancedAnswerEquivalence(userAnswer, targetAnswer, useSemanticComparison)
  return result.isCorrect
}

// 删除测试函数，保持代码简洁

export default checkAnswerEquivalence

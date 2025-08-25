// 答案验证工具函数
// 用于验证LaTeX答案的等价性

/**
 * 命令等价映射表 - 用于处理命令的简写形式
 * 键为标准形式，值为等价的简写形式数组
 */
const COMMAND_EQUIVALENCE = {
  // 不等号
  '\\neq': ['\\ne'],
  '\\ne': ['\\neq'],
  // 小于等于
  '\\leq': ['\\le'],
  '\\le': ['\\leq'],
  // 大于等于
  '\\geq': ['\\ge'],
  '\\ge': ['\\geq'],
  // 小于
  '<': ['\\lt'],
  '\\lt': ['<'],
  // 大于
  '>': ['\\gt'],
  '\\gt': ['>'],
  // 约等于
  '\\approx': ['\\cong'],
  '\\cong': ['\\approx'],
  // 包含于
  '\\subseteq': ['\\subset'],
  '\\subset': ['\\subseteq'],
  // 包含
  '\\supseteq': ['\\supset'],
  '\\supset': ['\\supseteq'],
  // 其他常见等价命令
  '\\rightarrow': ['\\to'],
  '\\to': ['\\rightarrow'],
  '\\Rightarrow': ['\\implies'],
  '\\implies': ['\\Rightarrow'],
  '\\mathbb{R}': ['\\R'],
  '\\R': ['\\mathbb{R}'],
  '\\mathbb{Z}': ['\\Z'],
  '\\Z': ['\\mathbb{Z}'],
  '\\mathbb{N}': ['\\N'],
  '\\N': ['\\mathbb{N}'],
  '\\mathbb{Q}': ['\\Q'],
  '\\Q': ['\\mathbb{Q}'],
  '\\mathbb{C}': ['\\C'],
  '\\C': ['\\mathbb{C}']
};

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
  ['x_i^2', 'x_{i}^2', 'x_i^{2}', 'x_{i}^{2}', 'x^2_i', 'x^{2}_i', 'x^2_{i}', 'x^{2}_{i}'],

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

// 添加常用函数的等价表示
const FUNCTION_EQUIVALENCE_GROUPS = [
  // 三角函数
  ['\\sin(x)', '\\sin x', '\\sin{x}'],
  ['\\cos(x)', '\\cos x', '\\cos{x}'],
  ['\\tan(x)', '\\tan x', '\\tan{x}'],
  ['\\cot(x)', '\\cot x', '\\cot{x}'],
  ['\\sec(x)', '\\sec x', '\\sec{x}'],
  ['\\csc(x)', '\\csc x', '\\csc{x}'],
  
  // 对数函数
  ['\\ln(x)', '\\ln x', '\\ln{x}'],
  ['\\log(x)', '\\log x', '\\log{x}'],
  ['\\log_{10}(x)', '\\log_{10} x', '\\log_{10}{x}'],
  
  // 极限、求和、积分
  ['\\lim_{x \\to 0}', '\\lim_{x\\to0}', '\\lim_{x \\to 0}'],
  ['\\sum_{i=1}^{n}', '\\sum_{i=1}^n', '\\sum_i^n'],
  ['\\int_{a}^{b}', '\\int_a^b', '\\int_{a}^b', '\\int_a^{b}'],
  
  // 其他常用函数
  ['\\min(x,y)', '\\min x,y', '\\min\\{x,y\\}'],
  ['\\max(x,y)', '\\max x,y', '\\max\\{x,y\\}'],
  ['\\arg\\min', '\\argmin'],
  ['\\arg\\max', '\\argmax'],
  
  // 复杂表达式
  ['\\frac{\\sin(x)}{\\cos(x)} = \\tan(x)', '\\frac{\\sin x}{\\cos x} = \\tan x'],
  ['\\int_{0}^{\\pi} \\sin(x) dx = 2', '\\int_0^\\pi \\sin x dx = 2'],
  ['\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}', '\\sum_i^n i^{2} = \\frac{n(n+1)(2n+1)}{6}'],
  ['f(x) = \\left\\{ \\begin{array}{ll} x^2 & \\text{if } x \\ge 0 \\\\ -x^2 & \\text{if } x < 0 \\end{array} \\right.', 
   'f(x) = \\left\\{ \\begin{array}{ll} x^{2} & \\text{if } x \\geq 0 \\\\ -x^{2} & \\text{if } x < 0 \\end{array} \\right.']
];

// 将函数等价组添加到SEMANTIC_EQUIVALENCE_GROUPS
SEMANTIC_EQUIVALENCE_GROUPS.push(...FUNCTION_EQUIVALENCE_GROUPS);

/**
 * 处理括号等价形式
 * @param {string} latex - LaTeX表达式
 * @returns {string} - 标准化后的LaTeX表达式
 */
function normalizeBrackets(latex) {
  // 将各种左右括号标准化为简单括号
  return latex
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\big\(/g, '(')
    .replace(/\\big\)/g, ')')
    .replace(/\\Big\(/g, '(')
    .replace(/\\Big\)/g, ')')
    .replace(/\\bigg\(/g, '(')
    .replace(/\\bigg\)/g, ')')
    .replace(/\\Bigg\(/g, '(')
    .replace(/\\Bigg\)/g, ')')
    // 处理其他类型的括号
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    .replace(/\\left\\{/g, '\\{')
    .replace(/\\right\\}/g, '\\}')
    .replace(/\\big\[/g, '[')
    .replace(/\\big\]/g, ']')
    .replace(/\\Big\[/g, '[')
    .replace(/\\Big\]/g, ']')
    .replace(/\\bigg\[/g, '[')
    .replace(/\\bigg\]/g, ']')
    .replace(/\\Bigg\[/g, '[')
    .replace(/\\Bigg\]/g, ']')
    .replace(/\\big\\{/g, '\\{')
    .replace(/\\big\\}/g, '\\}')
    .replace(/\\Big\\{/g, '\\{')
    .replace(/\\Big\\}/g, '\\}')
    .replace(/\\bigg\\{/g, '\\{')
    .replace(/\\bigg\\}/g, '\\}')
    .replace(/\\Bigg\\{/g, '\\{')
    .replace(/\\Bigg\\}/g, '\\}');
}

/**
 * 处理数学环境等价形式
 * @param {string} latex - LaTeX表达式
 * @returns {string} - 标准化后的LaTeX表达式
 */
function normalizeMathEnvironment(latex) {
  // 移除数学环境标记，只保留内容
  return latex
    .replace(/^\$+|\$+$/g, '') // 移除美元符号
    .replace(/^\\[\(\[]|\\[\)\]]$/g, '') // 移除\(...\)或\[...\]
    .replace(/\\begin\s*{equation}|\\end\s*{equation}/g, '') // 移除equation环境
    .replace(/\\begin\s*{align}|\\end\s*{align}/g, '') // 移除align环境
    .replace(/\\begin\s*{math}|\\end\s*{math}/g, ''); // 移除math环境
}

/**
 * 增强的LaTeX标准化函数
 * @param {string} latex - LaTeX表达式
 * @returns {string} - 标准化后的LaTeX表达式
 */
function enhancedNormalizeLatex(latex) {
  if (!latex) return '';
  
  // 基本清理
  let normalized = latex.trim();
  
  // 应用数学环境标准化
  normalized = normalizeMathEnvironment(normalized);
  
  // 应用括号标准化
  normalized = normalizeBrackets(normalized);
  
  // 标准化空格
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // 应用命令等价替换
  for (const [standard, equivalents] of Object.entries(COMMAND_EQUIVALENCE)) {
    for (const equivalent of equivalents) {
      const regex = new RegExp(equivalent.replace(/\\/g, '\\\\'), 'g');
      normalized = normalized.replace(regex, standard);
    }
  }
  
  // 标准化上下标，确保单字符的上下标也被花括号包裹
  normalized = normalized.replace(/_([a-zA-Z0-9])/g, '_{$1}');
  normalized = normalized.replace(/\^([a-zA-Z0-9])/g, '^{$1}');
  
  // 标准化分数
  normalized = normalized.replace(/\\frac\s*{([^}]*)}\s*{([^}]*)}/g, '\\frac{$1}{$2}');
  
  // 标准化根号
  normalized = normalized.replace(/\\sqrt\s*{([^}]*)}/g, '\\sqrt{$1}');
  normalized = normalized.replace(/\\sqrt\s*\[([^\]]*)\]\s*{([^}]*)}/g, '\\sqrt[$1]{$2}');
  
  return normalized.toLowerCase();
}

/**
 * 使用语义等价组检查LaTeX公式的等价性
 * @param {string} latex1 - 第一个LaTeX公式
 * @param {string} latex2 - 第二个LaTeX公式
 * @returns {boolean} - 是否语义等价
 */
export const checkLatexSemanticEquivalence = (latex1, latex2) => {
  // 特殊情况直接处理
  // 处理命令简写等价
  if ((latex1.includes('\\ne') && latex2.includes('\\neq')) || 
      (latex1.includes('\\neq') && latex2.includes('\\ne'))) {
    console.log(`✅ 命令简写等价匹配: "${latex1}" vs "${latex2}"`);
    return true;
  }
  
  if ((latex1.includes('\\le') && latex2.includes('\\leq')) || 
      (latex1.includes('\\leq') && latex2.includes('\\le'))) {
    console.log(`✅ 命令简写等价匹配: "${latex1}" vs "${latex2}"`);
    return true;
  }
  
  if ((latex1.includes('\\ge') && latex2.includes('\\geq')) || 
      (latex1.includes('\\geq') && latex2.includes('\\ge'))) {
    console.log(`✅ 命令简写等价匹配: "${latex1}" vs "${latex2}"`);
    return true;
  }

  // 处理上下标顺序不同的情况
  const upperLowerPattern1 = /([a-zA-Z])(\^|\^{[^}]*})(_|_{[^}]*})/;
  const lowerUpperPattern1 = /([a-zA-Z])(_|_{[^}]*})(\^|\^{[^}]*})/;
  const upperLowerPattern2 = /([a-zA-Z])(\^|\^{[^}]*})(_|_{[^}]*})/;
  const lowerUpperPattern2 = /([a-zA-Z])(_|_{[^}]*})(\^|\^{[^}]*})/;
  
  if ((upperLowerPattern1.test(latex1) && lowerUpperPattern2.test(latex2)) ||
      (lowerUpperPattern1.test(latex1) && upperLowerPattern2.test(latex2))) {
    console.log(`✅ 上下标顺序等价匹配: "${latex1}" vs "${latex2}"`);
    return true;
  }

  // 使用增强的标准化函数
  const norm1 = enhancedNormalizeLatex(latex1);
  const norm2 = enhancedNormalizeLatex(latex2);

  // 如果标准化后完全相同，直接返回true
  if (norm1 === norm2) {
    console.log(`✅ 增强标准化后完全匹配: "${norm1}" vs "${norm2}"`);
    return true;
  }

  // 移除所有空格后再次比较
  const noSpace1 = norm1.replace(/\s+/g, '');
  const noSpace2 = norm2.replace(/\s+/g, '');
  
  if (noSpace1 === noSpace2) {
    console.log(`✅ 移除空格后匹配: "${noSpace1}" vs "${noSpace2}"`);
    return true;
  }

  console.log(`语义比较LaTeX: "${norm1}" vs "${norm2}"`);

  // 在等价组中查找
  for (const group of SEMANTIC_EQUIVALENCE_GROUPS) {
    const normalizedGroup = group.map(item => enhancedNormalizeLatex(item));

    if (normalizedGroup.includes(norm1) && normalizedGroup.includes(norm2)) {
      console.log(`✅ 在等价组中找到匹配: [${group.join(', ')}]`);
      return true;
    }
  }

  console.log(`❌ 未在等价组中找到匹配`);
  return false;
}

/**
 * 常见错误模式列表 - 检测用户常见的LaTeX错误并给出专门提示
 */
const COMMON_ERROR_PATTERNS = [
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
  // 配置选项，允许控制等价检查的行为
  const EQUIVALENCE_CONFIG = {
    enableCommandShorthands: true,  // 启用命令简写等价
    enableBracketEquivalence: true, // 启用括号等价
    enableMathEnvironmentEquivalence: true, // 启用数学环境等价
    enableFunctionEquivalence: true // 启用函数等价
  };

  // 保留原有验证函数作为备份
  const originalCheckAnswerEquivalence = checkAnswerEquivalence;
  
  // 第一步：基本字符串比较
  if (originalCheckAnswerEquivalence(userAnswer, targetAnswer)) {
    console.log('原始字符串比较匹配');
    return { isCorrect: true };
  }

  // 第二步：如果启用语义比较且字符串比较失败，尝试语义比较
  if (useSemanticComparison) {
    console.log('字符串比较失败，尝试语义比较...');
    try {
      const semanticResult = checkLatexSemanticEquivalence(userAnswer, targetAnswer);
      if (semanticResult) {
        console.log('语义比较匹配！');
        return { isCorrect: true };
      }
    } catch (error) {
      console.error('语义比较出错，回退到字符串比较:', error);
    }
  }

  // 第三步：检查常见错误，提供专门提示
  console.log('语义比较失败，检查常见错误...');
  const errorInfo = checkCommonErrors(userAnswer, targetAnswer);

  if (errorInfo) {
    console.log(`发现常见错误: ${errorInfo.message}`);
    return { isCorrect: false, errorInfo };
  }

  // 第四步：通用失败
  return { isCorrect: false };
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

export default checkAnswerEquivalence
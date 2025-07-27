import { useTranslation } from 'react-i18next'

/**
 * 简化的提示内容翻译工具
 * 使用预定义的翻译映射表，避免复杂的正则表达式匹配
 */

// 常见提示内容的直接翻译映射
const HINT_TRANSLATIONS = {
  // 中文提示 -> 翻译键
  '使用 ^ 符号表示上标': 'practice.hintPatterns.superscript',
  '使用 _ 符号表示下标': 'practice.hintPatterns.subscript',
  '使用 \\frac{分子}{分母} 表示分数': 'practice.hintPatterns.fraction',
  '使用 \\sqrt{内容} 表示根号': 'practice.hintPatterns.sqrt',
  '不等于符号是 \\neq': 'practice.hintPatterns.neq',
  '无穷符号是 \\infty': 'practice.hintPatterns.infty',
  'α 是 \\alpha': 'practice.hintPatterns.alpha',
  'β 是 \\beta': 'practice.hintPatterns.beta',
  '希腊字母 π 的 LaTeX 命令是 \\pi': 'practice.hintPatterns.pi',
  '大德尔塔是 \\Delta': 'practice.hintPatterns.delta',
  '约等于符号是 \\approx': 'practice.hintPatterns.approx',

  // 英文提示也映射到相同的翻译键（保持兼容性）
  'Use ^ symbol for superscript': 'practice.hintPatterns.superscript',
  'Use _ symbol for subscript': 'practice.hintPatterns.subscript',
  'Use \\frac{numerator}{denominator} for fractions': 'practice.hintPatterns.fraction',
  'Use \\sqrt{content} for square root': 'practice.hintPatterns.sqrt',
  'Not equal symbol is \\neq': 'practice.hintPatterns.neq',
  'Infinity symbol is \\infty': 'practice.hintPatterns.infty',
  'α is \\alpha': 'practice.hintPatterns.alpha',
  'β is \\beta': 'practice.hintPatterns.beta',
  'Greek letter π LaTeX command is \\pi': 'practice.hintPatterns.pi',
  'Capital delta is \\Delta': 'practice.hintPatterns.delta',
  'Approximately equal symbol is \\approx': 'practice.hintPatterns.approx'
}

// 动态内容的正则表达式（仅保留必要的）
const DYNAMIC_PATTERNS = {
  superscriptContent: /上标内容是\s*(.+)|Superscript\s*content\s*is\s*(.+)/i,
  subscriptContent: /下标内容是\s*(.+)|Subscript\s*content\s*is\s*(.+)/i,
  completeFormat: /完整格式[：:]\s*(.+)|Complete\s*format[：:]\s*(.+)/i
}

/**
 * 翻译单个提示内容
 * @param {string} hint - 原始提示内容
 * @param {function} t - i18n翻译函数
 * @returns {string} - 翻译后的提示内容
 */
export function translateHint(hint, t) {
  if (!hint || typeof hint !== 'string') {
    return hint
  }

  const trimmedHint = hint.trim()

  // 首先检查直接翻译映射
  const translationKey = HINT_TRANSLATIONS[trimmedHint]
  if (translationKey) {
    return t(translationKey)
  }

  // 检查动态内容模式
  for (const [patternKey, regex] of Object.entries(DYNAMIC_PATTERNS)) {
    const match = trimmedHint.match(regex)
    if (match) {
      if (patternKey === 'completeFormat') {
        // 完整格式需要提取公式部分
        const formula = match[1] || match[2] || ''
        return t('practice.hintPatterns.completeFormat', { formula: formula.trim() })
      } else if (patternKey === 'superscriptContent') {
        // 上标内容
        const content = match[1] || match[2] || ''
        return t('practice.hintPatterns.superscriptContent', { content: content.trim() })
      } else if (patternKey === 'subscriptContent') {
        // 下标内容
        const content = match[1] || match[2] || ''
        return t('practice.hintPatterns.subscriptContent', { content: content.trim() })
      }
    }
  }

  // 如果没有匹配到任何模式，返回原始内容
  return hint
}

/**
 * 翻译提示数组
 * @param {string[]} hints - 原始提示数组
 * @param {function} t - i18n翻译函数
 * @returns {string[]} - 翻译后的提示数组
 */
export function translateHints(hints, t) {
  if (!Array.isArray(hints)) {
    return hints
  }

  return hints.map(hint => translateHint(hint, t))
}

/**
 * 翻译"已显示所有提示"消息
 * @param {string} lastHint - 最后一个提示
 * @param {function} t - i18n翻译函数
 * @returns {string} - 翻译后的完整消息
 */
export function translateAllHintsShown(lastHint, t) {
  const translatedLastHint = translateHint(lastHint, t)
  const allHintsMessage = t('practice.allHintsShown')
  return `${translatedLastHint}\n\n💡 ${allHintsMessage}`
}

/**
 * React Hook：获取翻译后的提示内容
 * @param {string|string[]} hints - 提示内容（单个或数组）
 * @returns {string|string[]} - 翻译后的提示内容
 */
export function useTranslatedHints(hints) {
  const { t } = useTranslation()

  if (Array.isArray(hints)) {
    return translateHints(hints, t)
  } else {
    return translateHint(hints, t)
  }
}

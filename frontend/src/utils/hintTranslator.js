import { useTranslation } from 'react-i18next'

/**
 * 提示内容翻译工具
 * 将中文提示内容翻译为当前语言
 */

// 提示内容模式匹配规则
const HINT_PATTERNS = {
  // 上标相关
  superscript: /使用\s*\^\s*符号表示上标|Use\s*\^\s*symbol\s*for\s*superscript/i,
  superscriptContent: /上标内容是\s*(.+)|Superscript\s*content\s*is\s*(.+)/i,

  // 下标相关
  subscript: /使用\s*_\s*符号表示下标|Use\s*_\s*symbol\s*for\s*subscript/i,
  subscriptContent: /下标内容是\s*(.+)|Subscript\s*content\s*is\s*(.+)/i,
  
  // 分数相关
  fraction: /使用\s*\\frac\{.*?\}\{.*?\}\s*表示分数|Use\s*\\frac\{.*?\}\{.*?\}\s*for\s*fractions/i,
  
  // 根号相关
  sqrt: /使用\s*\\sqrt\{.*?\}\s*表示根号|Use\s*\\sqrt\{.*?\}\s*for\s*square\s*root/i,
  
  // 不等于符号
  neq: /不等于符号是\s*\\neq|Not\s*equal\s*symbol\s*is\s*\\neq/i,
  
  // 无穷符号
  infty: /无穷符号是\s*\\infty|Infinity\s*symbol\s*is\s*\\infty/i,
  
  // 希腊字母 α
  alpha: /α\s*是\s*\\alpha|α\s*is\s*\\alpha/i,
  
  // 希腊字母 β
  beta: /β\s*是\s*\\beta|β\s*is\s*\\beta/i,
  
  // 希腊字母 π
  pi: /希腊字母\s*π\s*的\s*LaTeX\s*命令是\s*\\pi|Greek\s*letter\s*π\s*LaTeX\s*command\s*is\s*\\pi/i,
  
  // 大德尔塔
  delta: /大德尔塔是\s*\\Delta|Capital\s*delta\s*is\s*\\Delta/i,
  
  // 约等于符号
  approx: /约等于符号是\s*\\approx|Approximately\s*equal\s*symbol\s*is\s*\\approx/i,
  
  // 完整格式
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

  // 检查每个模式
  for (const [patternKey, regex] of Object.entries(HINT_PATTERNS)) {
    const match = hint.match(regex)
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
      } else {
        // 其他模式直接翻译
        return t(`practice.hintPatterns.${patternKey}`)
      }
    }
  }

  // 如果没有匹配到模式，返回原始内容
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

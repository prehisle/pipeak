// 答案验证工具函数
// 用于验证LaTeX答案的等价性

/**
 * 检查用户答案与目标答案是否等价
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
 * 更高级的LaTeX答案验证（支持更多等价形式）
 * @param {string} userAnswer - 用户输入的答案
 * @param {string} targetAnswer - 目标答案
 * @returns {boolean} - 是否等价
 */
export const checkAdvancedAnswerEquivalence = (userAnswer, targetAnswer) => {
  // 基本检查
  if (checkAnswerEquivalence(userAnswer, targetAnswer)) {
    return true
  }

  // 更复杂的等价性检查可以在这里添加
  // 例如：处理不同的分数表示形式、括号等

  return false
}

export default checkAnswerEquivalence

/**
 * Quick Experience 多语言数据加载器
 * 根据当前语言动态加载对应的数据文件
 */

// 导入各语言数据文件
import zhCNData from './zh-CN.json'
import enUSData from './en-US.json'

// 支持的语言映射
const LANGUAGE_DATA_MAP = {
  'zh-CN': zhCNData,
  'en-US': enUSData
}

// 默认语言
const DEFAULT_LANGUAGE = 'zh-CN'

/**
 * 根据语言获取Quick Experience数据
 * @param {string} language - 语言代码 (zh-CN, en-US)
 * @returns {Object} 对应语言的数据对象
 */
export function getQuickExperienceData(language = DEFAULT_LANGUAGE) {
  // 如果指定语言不存在，使用默认语言
  const targetLanguage = LANGUAGE_DATA_MAP[language] ? language : DEFAULT_LANGUAGE
  
  const data = LANGUAGE_DATA_MAP[targetLanguage]
  
  if (!data) {
    console.warn(`Quick Experience data not found for language: ${language}, falling back to default`)
    return LANGUAGE_DATA_MAP[DEFAULT_LANGUAGE]
  }
  
  console.log(`Quick Experience loaded ${data.questions.length} questions in ${targetLanguage}`)
  return data
}

/**
 * 获取支持的语言列表
 * @returns {string[]} 支持的语言代码数组
 */
export function getSupportedLanguages() {
  return Object.keys(LANGUAGE_DATA_MAP)
}

/**
 * 检查是否支持指定语言
 * @param {string} language - 语言代码
 * @returns {boolean} 是否支持该语言
 */
export function isLanguageSupported(language) {
  return language in LANGUAGE_DATA_MAP
}

/**
 * 获取默认语言
 * @returns {string} 默认语言代码
 */
export function getDefaultLanguage() {
  return DEFAULT_LANGUAGE
}

// 为了向后兼容，导出默认中文数据
export default getQuickExperienceData('zh-CN')

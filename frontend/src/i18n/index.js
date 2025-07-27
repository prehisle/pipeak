import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入翻译文件
import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'

const resources = {
  'zh-CN': {
    translation: zhCN
  },
  'en-US': {
    translation: enUS
  }
}

// 支持的语言列表
const SUPPORTED_LANGUAGES = ['zh-CN', 'en-US']
const DEFAULT_LANGUAGE = 'en-US'

// 智能语言检测函数
const detectUserLanguage = () => {
  try {
    // 首先检查localStorage中是否有用户手动设置的语言
    const savedLanguage = localStorage.getItem('i18nextLng')
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      return savedLanguage
    }

    // 检查URL参数中是否有测试语言设置
    const urlParams = new URLSearchParams(window.location.search)
    const testLang = urlParams.get('testLang')
    if (testLang) {
      // 标准化测试语言参数
      const normalizedTestLang = testLang.toLowerCase()
      if (normalizedTestLang === 'en' || normalizedTestLang === 'en-us') {
        return 'en-US'
      } else if (normalizedTestLang === 'zh' || normalizedTestLang === 'zh-cn' || normalizedTestLang === 'cn') {
        return 'zh-CN'
      }
    }

    // 获取浏览器语言列表（按优先级排序）
    const browserLanguages = navigator.languages || [navigator.language || navigator.userLanguage]

    // 遍历浏览器语言列表，寻找最佳匹配
    for (const browserLang of browserLanguages) {
      if (!browserLang) continue

      const normalizedLang = browserLang.toLowerCase()

      // 精确匹配
      if (SUPPORTED_LANGUAGES.includes(browserLang)) {
        return browserLang
      }

      // 中文语言检测（更精确的匹配）
      if (normalizedLang.startsWith('zh')) {
        // zh, zh-CN, zh-TW, zh-HK 等都映射到 zh-CN
        return 'zh-CN'
      }

      // 英文语言检测
      if (normalizedLang.startsWith('en')) {
        return 'en-US'
      }
    }

    // 如果没有匹配到任何语言，返回默认语言
    return DEFAULT_LANGUAGE
  } catch (error) {
    console.warn('Language detection failed, using default language:', error)
    return DEFAULT_LANGUAGE
  }
}

i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 传递 i18n 实例给 react-i18next
  .use(initReactI18next)
  // 初始化 i18next
  .init({
    resources,
    lng: detectUserLanguage(), // 使用智能检测的语言
    fallbackLng: 'en-US', // 非中文默认使用英文
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React 已经默认转义了
    },

    detection: {
      // 语言检测选项
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    }
  })

export default i18n

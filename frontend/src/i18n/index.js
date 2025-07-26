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

// 智能语言检测函数
const detectUserLanguage = () => {
  // 首先检查localStorage中是否有用户手动设置的语言
  const savedLanguage = localStorage.getItem('i18nextLng')
  if (savedLanguage && resources[savedLanguage]) {
    return savedLanguage
  }

  // 检查URL参数中是否有测试语言设置
  const urlParams = new URLSearchParams(window.location.search)
  const testLang = urlParams.get('testLang')
  if (testLang) {
    return testLang === 'en' ? 'en-US' : 'zh-CN'
  }

  // 获取浏览器语言
  const browserLanguage = navigator.language || navigator.userLanguage

  // 检查是否为中文相关语言
  const isChineseLanguage = browserLanguage.toLowerCase().includes('zh') ||
                           browserLanguage.toLowerCase().includes('cn') ||
                           browserLanguage.toLowerCase().includes('chinese')

  if (isChineseLanguage) {
    return 'zh-CN'
  } else {
    return 'en-US'
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

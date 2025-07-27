import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * 动态页面标题Hook
 * 根据当前语言自动更新页面标题
 * @param {string} titleKey - 翻译键值
 * @param {object} params - 翻译参数
 */
export const useDocumentTitle = (titleKey, params = {}) => {
  const { t, i18n } = useTranslation()
  
  useEffect(() => {
    try {
      const title = t(titleKey, params)
      if (title && title !== titleKey) {
        document.title = title
      }
    } catch (error) {
      console.warn('Failed to set document title:', error)
    }
  }, [t, titleKey, params, i18n.language])
}

/**
 * 预定义的页面标题常量
 */
export const PAGE_TITLES = {
  HOME: 'pages.home.title',
  DASHBOARD: 'pages.dashboard.title',
  LESSON: 'pages.lesson.title',
  PRACTICE: 'pages.practice.title',
  REVIEW: 'pages.review.title'
}

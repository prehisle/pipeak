import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUserModeStore } from '../stores/userModeStore'
import { Alert, AlertDescription } from './ui/Alert'
import Button from './ui/Button'

const GuestModeNotice = () => {
  const { t } = useTranslation()
  const { 
    isGuestMode, 
    showGuestPrompt, 
    hideGuestPrompt, 
    getLocalDataSummary 
  } = useUserModeStore()

  // 如果不是游客模式或已隐藏提示，不显示
  if (!isGuestMode || !showGuestPrompt) {
    return null
  }

  const dataSummary = getLocalDataSummary()

  return (
    <Alert variant="info" className="mx-4 mt-4 mb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👋</span>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              {t('guest.welcome', '欢迎使用游客模式')}
            </h4>
          </div>
          
          <AlertDescription className="space-y-2">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t('guest.description', '您正在使用游客模式，数据将保存在浏览器本地。注册账户可以：')}
            </p>
            
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-4">
              <li>• {t('guest.benefit1', '跨设备同步学习进度')}</li>
              <li>• {t('guest.benefit2', '永久保存学习记录')}</li>
              <li>• {t('guest.benefit3', '获得个性化学习建议')}</li>
              <li>• {t('guest.benefit4', '参与社区讨论和排行榜')}</li>
            </ul>

            {dataSummary.hasData && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  {t('guest.currentProgress', '当前学习进度：')}
                </p>
                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <div>📚 {t('guest.lessonsCompleted', '已完成课程：{{count}}个', { count: dataSummary.lessonsCompleted })}</div>
                  <div>🏋️ {t('guest.practiceAttempts', '练习次数：{{count}}次', { count: dataSummary.practiceAttempts })}</div>
                  <div>🎯 {t('guest.accuracy', '正确率：{{rate}}%', { rate: dataSummary.accuracy })}</div>
                </div>
              </div>
            )}
          </AlertDescription>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button variant="primary" size="sm" asChild>
            <Link to="/register">
              {t('guest.register', '立即注册')}
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">
              {t('guest.login', '已有账户')}
            </Link>
          </Button>
          
          <button
            onClick={hideGuestPrompt}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
          >
            {t('guest.dismiss', '暂不提醒')}
          </button>
        </div>
      </div>
    </Alert>
  )
}

export default GuestModeNotice

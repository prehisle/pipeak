import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUserModeStore } from '../stores/userModeStore'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import Button from './ui/Button'

const GuestWelcome = () => {
  const { t } = useTranslation()
  const { isGuestMode, switchToGuestMode } = useUserModeStore()

  // 如果不是游客模式，不显示
  if (!isGuestMode) {
    return null
  }

  return (
    <Card variant="elevated" className="max-w-4xl mx-auto mb-8">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-white">🚀</span>
        </div>
        <CardTitle className="text-2xl">
          {t('guestWelcome.title', '欢迎使用 LaTeX 训练器')}
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('guestWelcome.subtitle', '您正在使用游客模式，可以立即开始学习！')}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 功能介绍 */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('guestWelcome.featuresTitle', '您可以体验的功能：')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('guestWelcome.feature1', '完整的 LaTeX 课程学习')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('guestWelcome.feature2', '实时练习和即时反馈')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('guestWelcome.feature3', '学习进度本地保存')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('guestWelcome.feature4', '智能复习系统')}
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('guestWelcome.upgradeTitle', '注册账户获得更多：')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">⭐</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('guestWelcome.upgrade1', '跨设备同步学习进度')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">⭐</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('guestWelcome.upgrade2', '永久保存学习记录')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">⭐</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('guestWelcome.upgrade3', '个性化学习建议')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">⭐</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('guestWelcome.upgrade4', '社区讨论和排行榜')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="primary" size="lg" className="flex-1" asChild>
            <Link to="/learning">
              {t('guestWelcome.startLearning', '🚀 立即开始学习')}
            </Link>
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" size="lg" asChild>
              <Link to="/register">
                {t('guestWelcome.register', '注册账户')}
              </Link>
            </Button>
            
            <Button variant="ghost" size="lg" asChild>
              <Link to="/login">
                {t('guestWelcome.login', '登录')}
              </Link>
            </Button>
          </div>
        </div>

        {/* 数据说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-medium">💾 {t('guestWelcome.dataNote', '数据保存说明：')}</span>
            {' '}
            {t('guestWelcome.dataExplanation', '您的学习进度将保存在浏览器本地。注册账户后可以将数据同步到云端，实现跨设备访问。')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default GuestWelcome

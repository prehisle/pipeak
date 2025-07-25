import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUserModeStore } from '../stores/userModeStore'
import Button from './ui/Button'
import { Alert, AlertDescription } from './ui/Alert'

const DataSyncModal = ({ isOpen, onClose, onSync, onSkip }) => {
  const { t } = useTranslation()
  const { getLocalDataSummary } = useUserModeStore()
  const [isLoading, setIsLoading] = useState(false)
  
  const dataSummary = getLocalDataSummary()

  if (!isOpen) return null

  const handleSync = async () => {
    setIsLoading(true)
    try {
      await onSync()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 标题 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('dataSync.title', '同步本地数据')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('dataSync.subtitle', '发现您有本地学习数据')}
              </p>
            </div>
          </div>

          {/* 数据摘要 */}
          {dataSummary.hasData && (
            <Alert variant="info" className="mb-4">
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {t('dataSync.foundData', '检测到以下本地数据：')}
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>{t('dataSync.lessons', '已完成课程')}</span>
                      <span className="font-medium">{dataSummary.lessonsCompleted} 个</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('dataSync.practices', '练习记录')}</span>
                      <span className="font-medium">{dataSummary.practiceAttempts} 次</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('dataSync.accuracy', '正确率')}</span>
                      <span className="font-medium">{dataSummary.accuracy}%</span>
                    </div>
                    {dataSummary.reviewItems > 0 && (
                      <div className="flex justify-between">
                        <span>{t('dataSync.reviews', '复习项目')}</span>
                        <span className="font-medium">{dataSummary.reviewItems} 个</span>
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 说明文字 */}
          <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-400">
            <p>
              {t('dataSync.explanation', '您可以选择将这些数据同步到您的账户中，这样就不会丢失之前的学习进度。')}
            </p>
            
            <div className="space-y-2">
              <p className="font-medium text-gray-700 dark:text-gray-300">
                {t('dataSync.syncBenefits', '同步后您将获得：')}
              </p>
              <ul className="space-y-1 ml-4">
                <li>• {t('dataSync.benefit1', '保留所有学习进度和成就')}</li>
                <li>• {t('dataSync.benefit2', '跨设备访问学习数据')}</li>
                <li>• {t('dataSync.benefit3', '更准确的个性化推荐')}</li>
                <li>• {t('dataSync.benefit4', '参与排行榜和社区功能')}</li>
              </ul>
            </div>

            <Alert variant="warning" className="mt-4">
              <AlertDescription className="text-xs">
                {t('dataSync.warning', '如果选择跳过，本地数据将保留在浏览器中，但不会同步到您的账户。您随时可以在设置中手动同步。')}
              </AlertDescription>
            </Alert>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              onClick={handleSync}
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              {t('dataSync.syncNow', '立即同步数据')}
            </Button>
            
            <Button
              variant="outline"
              onClick={onSkip}
              disabled={isLoading}
              className="w-full"
            >
              {t('dataSync.skipForNow', '暂时跳过')}
            </Button>
            
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
            >
              {t('dataSync.cancel', '取消')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataSyncModal

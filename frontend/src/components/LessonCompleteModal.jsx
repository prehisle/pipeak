import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LessonCompleteModal = ({
  isOpen,
  onClose,
  lessonTitle,
  onContinue
}) => {
  const { t } = useTranslation()
  // 处理ESC键关闭
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // 防止背景滚动
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* 头部 */}
        <div className="text-center p-8 pb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {t('lessonCompleteModal.title')}
          </h2>

          <p className="text-lg text-gray-600 mb-2">
            《{lessonTitle}》
          </p>

          <p className="text-gray-500">
            {t('lessonCompleteModal.description')}
          </p>
        </div>

        {/* 按钮区域 */}
        <div className="px-8 pb-8">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
            >
              {t('lessonCompleteModal.viewStats')}
            </button>
            <button
              onClick={onContinue}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              {t('lessonCompleteModal.continueNext')}
            </button>
          </div>
          
          <p className="text-center text-sm text-gray-400 mt-4">
            {t('lessonCompleteModal.escHint')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default LessonCompleteModal

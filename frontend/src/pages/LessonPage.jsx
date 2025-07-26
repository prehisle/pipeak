import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useFrontendLessonStore from '../stores/frontendLessonStore'
import LoadingSpinner from '../components/LoadingSpinner'
import MarkdownRenderer from '../components/MarkdownRenderer'
import PracticeCard from '../components/PracticeCard'
import { useToast } from '../components/Toast'
import LessonCompleteModal from '../components/LessonCompleteModal'
import LessonSkeleton from '../components/LessonSkeleton'

const LessonPage = () => {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showLessonCompleteModal, setShowLessonCompleteModal] = useState(false)

  // Toast系统
  const { showSuccess, showError, showWarning, ToastContainer } = useToast()

  // PracticeCard引用，用于自动聚焦
  const practiceCardRef = useRef(null)

  const {
    currentLesson,
    currentKnowledgePointIndex,
    initializeLessons,
    setCurrentLesson,
    setCurrentKnowledgePointIndex,
    completeKnowledgePoint,
    completeLesson,
    isLessonCompleted,
    isKnowledgePointCompleted,
    getLessonProgress
  } = useFrontendLessonStore()

  // 初始化课程数据
  useEffect(() => {
    initializeLessons(i18n.language)
  }, [i18n.language, initializeLessons])

  // 设置当前课程
  useEffect(() => {
    if (lessonId) {
      setCurrentLesson(lessonId)
    }
  }, [lessonId, setCurrentLesson])

  // 键盘导航支持
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!currentLesson) return

      // 检查是否在输入框中，如果是则不处理导航键
      const activeElement = document.activeElement
      const isInInput = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
      )

      // 如果用户正在输入，只处理 Escape 键
      if (isInInput && event.key !== 'Escape') {
        return
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          handlePrevKnowledgePoint()
          break
        case 'ArrowRight':
          event.preventDefault()
          handleNextKnowledgePoint()
          break
        case 'Escape':
          event.preventDefault()
          // 如果在输入框中，先失焦，否则返回课程列表
          if (isInInput) {
            activeElement.blur()
          } else {
            navigate('/dashboard')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentLesson, currentKnowledgePointIndex, navigate])

  const handleNextKnowledgePoint = () => {
    if (currentLesson && currentKnowledgePointIndex < currentLesson.knowledgePoints.length - 1 && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentKnowledgePointIndex(currentKnowledgePointIndex + 1)
        setIsTransitioning(false)
      }, 150)
    }
  }

  const handlePrevKnowledgePoint = () => {
    if (currentKnowledgePointIndex > 0 && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentKnowledgePointIndex(currentKnowledgePointIndex - 1)
        setIsTransitioning(false)
      }, 150)
    }
  }

  const handleKnowledgePointClick = (index) => {
    if (index !== currentKnowledgePointIndex && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentKnowledgePointIndex(index)
        setIsTransitioning(false)
      }, 150)
    }
  }

  const handlePracticeComplete = (isCorrect, immediate = false) => {
    console.log('LessonPage收到练习完成回调:', { isCorrect, immediate })
    if (isCorrect && currentLesson) {
      const currentKnowledgePoint = currentLesson.knowledgePoints[currentKnowledgePointIndex]
      if (currentKnowledgePoint) {
        // 标记知识点为已完成
        completeKnowledgePoint(currentLesson.id, currentKnowledgePoint.id)
        showSuccess(t('lessonPage.knowledgePointCompleted'))
      }

      if (immediate) {
        // 立即进入下一个知识点（用户按Enter键触发）
        console.log('立即进入下一个知识点')
        handleNextKnowledgePoint()
      } else {
        // 延迟进入下一个知识点（自动触发）
        console.log('2秒后自动进入下一个知识点')
        setTimeout(() => {
          handleNextKnowledgePoint()
        }, 2000)
      }
    }
  }



  // 处理课程完成模态框
  const handleLessonCompleteClose = () => {
    setShowLessonCompleteModal(false)
  }

  const handleLessonCompleteContinue = () => {
    setShowLessonCompleteModal(false)
    navigate('/app/dashboard')
  }

  if (!currentLesson) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t('common.courseNotFound')}</p>
          <Link to="/app/dashboard" className="btn btn-primary mt-4">
            {t('lessonPage.backToDashboard')}
          </Link>
        </div>
      </div>
    )
  }

  const currentKnowledgePoint = currentLesson.knowledgePoints[currentKnowledgePointIndex]
  const isLastKnowledgePoint = currentKnowledgePointIndex === currentLesson.knowledgePoints.length - 1

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 课程头部 */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
          <Link
            to="/app/dashboard"
            className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
          >
            {t('lessonPage.backToDashboard')}
          </Link>
          {isLessonCompleted(currentLesson.id) && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {t('dashboard.mastered')}
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {currentLesson.title}
        </h1>
        <p className="text-sm text-gray-600 mb-3">
          {currentLesson.description}
        </p>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${((currentKnowledgePointIndex + 1) / currentLesson.knowledgePoints.length) * 100}%`
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {t('lessonPage.progress', { current: currentKnowledgePointIndex + 1, total: currentLesson.knowledgePoints.length })}
        </p>
      </div>

      {/* 知识点内容卡片 */}
      {currentKnowledgePoint && (
        <div className={`card mb-4 transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="card-body">
            {/* 只对非练习题类型显示蓝色知识点区域 */}
            {!(currentKnowledgePoint.exercises && currentKnowledgePoint.exercises.length > 0) && (
              <div className="prose max-w-none">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">💡</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-blue-900 mb-6">
                        {t('lessonPage.knowledgePoint', { index: currentKnowledgePointIndex + 1 })}
                      </h3>
                      <h4 className="text-lg font-medium text-blue-800 mb-4">
                        {currentKnowledgePoint.title}
                      </h4>
                      <div className="text-blue-800 text-base leading-relaxed overflow-visible">
                        <MarkdownRenderer content={currentKnowledgePoint.content} theme="default" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 练习题部分 - 使用与知识点一致的蓝色风格 */}
            {currentKnowledgePoint.exercises && currentKnowledgePoint.exercises.length > 0 && (
              <div className="prose max-w-none">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">✏️</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-blue-900 mb-6">
                        {t('lessonPage.knowledgePoint', { index: currentKnowledgePointIndex + 1 })}
                      </h3>
                      <h4 className="text-lg font-medium text-blue-800 mb-4">
                        {currentKnowledgePoint.title}
                      </h4>
                      <div className="space-y-4">
                        {currentKnowledgePoint.exercises.map((exercise, index) => (
                          <PracticeCard
                            key={index}
                            ref={practiceCardRef}
                            exercise={exercise}
                            lessonId={currentLesson.id}
                            knowledgePointId={currentKnowledgePoint.id}
                            cardIndex={index}
                            onComplete={handlePracticeComplete}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 导航按钮 */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevKnowledgePoint}
          disabled={currentKnowledgePointIndex === 0 || isTransitioning}
          className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('lessonPage.prevKnowledgePoint')}
        </button>

        <div className="flex space-x-3">
          {currentLesson.knowledgePoints.map((_, index) => (
            <button
              key={index}
              onClick={() => handleKnowledgePointClick(index)}
              disabled={isTransitioning}
              className={`w-4 h-4 rounded-full transition-all duration-200 hover:scale-110 ${
                index === currentKnowledgePointIndex
                  ? 'bg-blue-600 ring-2 ring-blue-200'
                  : index < currentKnowledgePointIndex
                    ? 'bg-green-400 hover:bg-green-500'
                    : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={t('lessonPage.knowledgePoint', { index: index + 1 })}
            />
          ))}
        </div>

        {isLastKnowledgePoint ? (
          <button
            onClick={() => {
              completeLesson(currentLesson.id)
              showSuccess(t('lessonPage.lessonCompleted'))
              setShowLessonCompleteModal(true)
            }}
            disabled={isTransitioning}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('lessonPage.lessonCompleted')} ✓
          </button>
        ) : (
          <button
            onClick={handleNextKnowledgePoint}
            disabled={currentKnowledgePointIndex === currentLesson.knowledgePoints.length - 1 || isTransitioning}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('lessonPage.nextKnowledgePoint')}
          </button>
        )}
      </div>

      {/* 键盘快捷键提示 */}
      <div className="mt-6 text-center text-base text-gray-500">
        <p>💡 使用键盘快捷键：← → 切换卡片，ESC 返回课程列表</p>
      </div>




      {/* 课程完成模态框 */}
      <LessonCompleteModal
        isOpen={showLessonCompleteModal}
        onClose={handleLessonCompleteClose}
        lessonTitle={currentLesson?.title}
        onContinue={handleLessonCompleteContinue}
      />

      {/* Toast容器 */}
      <ToastContainer />
    </div>
  )
}

export default LessonPage

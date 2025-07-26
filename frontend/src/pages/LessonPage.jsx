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
        showSuccess(t('lesson.knowledgePointCompleted'))
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

  const handleCompleteLesson = async () => {
    console.log('点击完成课程按钮');

    try {
      // 直接获取最新的完成状态，不依赖组件状态
      console.log('开始获取完成状态...');
      const response = await learningAPI.getCompletionStatus(lessonId);

      if (!response.data) {
        console.error('获取完成状态失败');
        showError('获取完成状态失败，请重试');
        return;
      }

      const latestStatus = response.data;
      console.log('完成状态获取成功:', latestStatus);

      // 更新组件状态
      setCompletionStatus(latestStatus);

      if (!latestStatus.can_complete) {
        console.log('无法完成课程，显示模态框');
        setShowCompletionModal(true);
        return;
      }

      // 如果可以完成，则提交完成请求
      const result = await completeLesson(lessonId);
      if (result.success) {
        // 显示成功完成模态框
        setShowLessonCompleteModal(true);
      } else {
        showError(result.error || '完成课程失败，请重试');
      }
    } catch (error) {
      console.error('完成课程时出错:', error);
      if (error.response?.status === 401) {
        showError('登录已过期，请重新登录');
        navigate('/login');
      } else {
        showError('完成课程时出错，请重试');
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
            {t('lesson.backToDashboard')}
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
            {t('lesson.backToDashboard')}
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
          {t('lesson.progress', { current: currentKnowledgePointIndex + 1, total: currentLesson.knowledgePoints.length })}
        </p>
      </div>

      {/* 知识点内容卡片 */}
      {currentKnowledgePoint && (
        <div className={`card mb-4 transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="card-body">
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
                      {t('lesson.knowledgePoint', { index: currentKnowledgePointIndex + 1 })}
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
            </div>

            {/* 练习题部分 */}
            {currentKnowledgePoint.exercises && currentKnowledgePoint.exercises.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">练习题</h4>
                {currentKnowledgePoint.exercises.map((exercise, index) => (
                  <PracticeCard
                    key={index}
                    ref={practiceCardRef}
                    exercise={exercise}
                    lessonId={currentLesson.id}
                    knowledgePointId={currentKnowledgePoint.id}
                    onComplete={handlePracticeComplete}
                  />
                ))}
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
          {t('lesson.prevKnowledgePoint')}
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
              title={t('lesson.knowledgePoint', { index: index + 1 })}
            />
          ))}
        </div>

        {isLastKnowledgePoint ? (
          <button
            onClick={() => {
              completeLesson(currentLesson.id)
              showSuccess(t('lesson.lessonCompleted'))
              setShowLessonCompleteModal(true)
            }}
            disabled={isTransitioning}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('lesson.lessonCompleted')} ✓
          </button>
        ) : (
          <button
            onClick={handleNextKnowledgePoint}
            disabled={currentKnowledgePointIndex === currentLesson.knowledgePoints.length - 1 || isTransitioning}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('lesson.nextKnowledgePoint')}
          </button>
        )}
      </div>

      {/* 键盘快捷键提示 */}
      <div className="mt-6 text-center text-base text-gray-500">
        <p>💡 使用键盘快捷键：← → 切换卡片，ESC 返回课程列表</p>
      </div>

      {/* 完成状态模态框 */}
      {showCompletionModal && completionStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                还需要完成练习题
              </h3>

              <p className="text-gray-600 mb-4">
                请先完成所有练习题，确保真正掌握知识点后再完成课程。
              </p>

              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">练习进度：</span>
                  <span className="font-medium text-orange-600">
                    {completionStatus.completed_practices}/{completionStatus.total_practices} 题
                  </span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionStatus.completion_percentage}%` }}
                  ></div>
                </div>
              </div>

              {completionStatus.pending_practice_details.length > 0 && (
                <div className="text-left mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">待完成的练习：</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {completionStatus.pending_practice_details.slice(0, 3).map((practice, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                        第 {practice.index + 1} 题：{practice.title || `练习题 ${practice.index + 1}`}
                      </li>
                    ))}
                    {completionStatus.pending_practice_details.length > 3 && (
                      <li className="text-gray-500">
                        还有 {completionStatus.pending_practice_details.length - 3} 题...
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    // 跳转到第一个未完成的练习题
                    if (completionStatus.pending_practice_details.length > 0) {
                      const firstPendingIndex = completionStatus.pending_practice_details[0].index;
                      setCurrentCardIndex(firstPendingIndex);
                    }
                  }}
                  className="flex-1 px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  继续学习
                </button>
                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    navigate('/dashboard');
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  返回课程列表
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

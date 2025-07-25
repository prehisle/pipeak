import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLessonStore } from '../stores/lessonStore'
import LoadingSpinner from '../components/LoadingSpinner'
import MarkdownRenderer from '../components/MarkdownRenderer'
import api from '../services/api'
import PracticeCard from '../components/PracticeCard'

const LessonPage = () => {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [completionStatus, setCompletionStatus] = useState(null)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  const {
    currentLesson,
    isLoading,
    error,
    fetchLesson,
    completeLesson,
    clearError,
    clearCurrentLesson
  } = useLessonStore()

  useEffect(() => {
    if (lessonId) {
      fetchLesson(lessonId)
      fetchCompletionStatus()
    }

    return () => {
      clearCurrentLesson()
    }
  }, [lessonId, fetchLesson, clearCurrentLesson])

  const fetchCompletionStatus = async () => {
    try {
      console.log('开始获取完成状态...');
      const response = await api.get(`/lessons/${lessonId}/completion-status`);

      if (response.data) {
        setCompletionStatus(response.data);
        console.log('完成状态获取成功:', response.data);
      }
    } catch (error) {
      console.error('获取完成状态失败:', error);
      if (error.response?.status === 401) {
        console.warn('Token可能已过期，请重新登录');
      }
    }
  }

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

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
          handlePrevCard()
          break
        case 'ArrowRight':
          event.preventDefault()
          handleNextCard()
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
  }, [currentLesson, currentCardIndex, navigate])

  const handleNextCard = () => {
    if (currentLesson && currentCardIndex < currentLesson.cards.length - 1 && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex + 1)
        setIsTransitioning(false)
      }, 150)
    }
  }

  const handlePrevCard = () => {
    if (currentCardIndex > 0 && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex - 1)
        setIsTransitioning(false)
      }, 150)
    }
  }

  const handleCardClick = (index) => {
    if (index !== currentCardIndex && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentCardIndex(index)
        setIsTransitioning(false)
      }, 150)
    }
  }

  const handlePracticeComplete = (isCorrect) => {
    if (isCorrect) {
      // 练习完成后自动进入下一个卡片
      setTimeout(() => {
        handleNextCard()
      }, 2000)
    }
  }

  const handleCompleteLesson = async () => {
    console.log('点击完成课程按钮');

    try {
      // 直接获取最新的完成状态，不依赖组件状态
      console.log('开始获取完成状态...');
      const response = await api.get(`/lessons/${lessonId}/completion-status`);

      if (!response.data) {
        console.error('获取完成状态失败');
        alert('获取完成状态失败，请重试');
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
        // 显示成功消息并延迟跳转，让用户看到成功状态
        const successMessage = `🎉 恭喜！《${currentLesson?.title}》已完成！\n\n您已掌握所有知识点，可以继续学习下一课了！`;
        alert(successMessage);

        // 延迟跳转，让用户有时间看到成功状态
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        alert(result.error || '完成课程失败，请重试');
      }
    } catch (error) {
      console.error('完成课程时出错:', error);
      if (error.response?.status === 401) {
        alert('登录已过期，请重新登录');
        navigate('/login');
      } else {
        alert('完成课程时出错，请重试');
      }
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="text-gray-500 mt-4">加载课程中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/dashboard" className="btn btn-primary">
            返回学习面板
          </Link>
        </div>
      </div>
    )
  }

  if (!currentLesson) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">课程不存在</p>
          <Link to="/dashboard" className="btn btn-primary mt-4">
            返回学习面板
          </Link>
        </div>
      </div>
    )
  }

  const currentCard = currentLesson.cards[currentCardIndex]
  const isLastCard = currentCardIndex === currentLesson.cards.length - 1

  return (
    <div className="max-w-4xl mx-auto">
      {/* 课程头部 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            ← 返回学习面板
          </Link>
          {currentLesson.is_completed && (
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
              已完成
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {currentLesson.title}
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          {currentLesson.description}
        </p>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentCardIndex + 1) / currentLesson.cards.length) * 100}%`
            }}
          ></div>
        </div>
        <p className="text-base text-gray-500 mt-2">
          {currentCardIndex + 1} / {currentLesson.cards.length}
        </p>
      </div>

      {/* 课程内容卡片 */}
      {currentCard && (
        <div className={`card mb-8 transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="card-body">
            {currentCard.type === 'knowledge' ? (
              <div className="prose max-w-none">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">💡</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-xl font-semibold text-blue-900 mb-6">
                        知识点 {currentCardIndex + 1}
                      </h3>
                      <div className="text-blue-800 text-lg leading-relaxed">
                        <MarkdownRenderer content={currentCard.content} theme="default" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentCard.type === 'practice' ? (
              <PracticeCard
                card={currentCard}
                lessonId={lessonId}
                cardIndex={currentCardIndex}
                onComplete={handlePracticeComplete}
              />
            ) : (
              <div className="bg-gray-50 border-l-4 border-gray-400 p-6 rounded-r-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-sm">?</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      未知卡片类型
                    </h3>
                    <p className="text-gray-800">
                      卡片类型：{currentCard.type}
                    </p>
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
          onClick={handlePrevCard}
          disabled={currentCardIndex === 0 || isTransitioning}
          className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← 上一个
        </button>

        <div className="flex space-x-3">
          {currentLesson.cards.map((_, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              disabled={isTransitioning}
              className={`w-4 h-4 rounded-full transition-all duration-200 hover:scale-110 ${
                index === currentCardIndex
                  ? 'bg-blue-600 ring-2 ring-blue-200'
                  : index < currentCardIndex
                    ? 'bg-green-400 hover:bg-green-500'
                    : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={`第 ${index + 1} 个知识点`}
            />
          ))}
        </div>

        {isLastCard ? (
          <button
            onClick={handleCompleteLesson}
            disabled={isTransitioning}
            className={`btn disabled:opacity-50 disabled:cursor-not-allowed ${
              completionStatus?.can_complete
                ? 'btn-primary'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {completionStatus?.can_complete ? (
              <>完成课程 ✓</>
            ) : (
              <>检查完成状态 📋</>
            )}
          </button>
        ) : (
          <button
            onClick={handleNextCard}
            disabled={currentCardIndex === currentLesson.cards.length - 1 || isTransitioning}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一个 →
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
    </div>
  )
}

export default LessonPage

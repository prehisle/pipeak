import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLessonStore } from '../stores/lessonStore'
import LoadingSpinner from '../components/LoadingSpinner'
import MarkdownRenderer from '../components/MarkdownRenderer'
import PracticeCard from '../components/PracticeCard'

const LessonPage = () => {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

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
    }

    return () => {
      clearCurrentLesson()
    }
  }, [lessonId, fetchLesson, clearCurrentLesson])

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
    const result = await completeLesson(lessonId)
    if (result.success) {
      // 可以显示成功消息或跳转到下一课程
      navigate('/dashboard')
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
        <p className="text-gray-600 mb-4">
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
        <p className="text-sm text-gray-500 mt-2">
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
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">
                        知识点 {currentCardIndex + 1}
                      </h3>
                      <div className="text-blue-800">
                        <MarkdownRenderer content={currentCard.content} theme="compact" />
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
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            完成课程 ✓
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
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>💡 使用键盘快捷键：← → 切换卡片，ESC 返回课程列表</p>
      </div>
    </div>
  )
}

export default LessonPage

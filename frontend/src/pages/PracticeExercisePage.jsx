import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { practiceAPI, lessonAPI } from '../services/api'
import LaTeXEditor from '../components/LaTeXEditor'
import LaTeXPreview from '../components/LaTeXPreview'
import MarkdownRenderer from '../components/MarkdownRenderer'
import LoadingSpinner from '../components/LoadingSpinner'

const PracticeExercisePage = () => {
  const { lessonId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const cardIndex = parseInt(searchParams.get('card')) || 0
  
  const [lesson, setLesson] = useState(null)
  const [currentCard, setCurrentCard] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadLesson()
  }, [lessonId])

  useEffect(() => {
    if (lesson && lesson.cards && lesson.cards[cardIndex]) {
      const card = lesson.cards[cardIndex]
      if (card.type === 'practice') {
        setCurrentCard(card)
      } else {
        setError('指定的卡片不是练习题')
      }
    }
  }, [lesson, cardIndex])

  const loadLesson = async () => {
    try {
      setIsLoading(true)
      const response = await lessonAPI.getLesson(lessonId)
      setLesson(response.lesson)
      setError(null)
    } catch (error) {
      console.error('加载课程失败:', error)
      setError('加载课程失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      setFeedback({ type: 'error', message: '请输入你的答案' })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await practiceAPI.submitAnswer({
        lesson_id: lessonId,
        card_index: cardIndex,
        user_answer: userAnswer
      })

      setFeedback({
        type: response.is_correct ? 'success' : 'error',
        message: response.feedback,
        isCorrect: response.is_correct,
        targetAnswer: response.target_answer
      })

      // 如果答对了，显示成就反馈
      if (response.is_correct) {
        // 可以在这里添加成就动画或音效
        setTimeout(() => {
          // 3秒后自动清除成功反馈，让用户可以继续练习
        }, 3000)
      }

      if (!response.is_correct && response.hint) {
        setShowHint(true)
      }

    } catch (error) {
      setFeedback({
        type: 'error',
        message: '提交答案时出错，请重试'
      })
      console.error('提交练习答案失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGetHint = async () => {
    try {
      const response = await practiceAPI.getHint({
        lesson_id: lessonId,
        card_index: cardIndex,
        hint_level: hintLevel
      })

      if (response.hint) {
        setShowHint(true)
        setHintLevel(hintLevel + 1)
      }
    } catch (error) {
      console.error('获取提示失败:', error)
    }
  }

  const handleReset = () => {
    setUserAnswer('')
    setFeedback(null)
    setShowHint(false)
    setHintLevel(0)
  }

  const handleBack = () => {
    navigate('/practice')
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">{error}</p>
          </div>
          <button onClick={handleBack} className="btn btn-primary">
            返回练习中心
          </button>
        </div>
      </div>
    )
  }

  if (!currentCard) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">未找到指定的练习题</p>
          <button onClick={handleBack} className="btn btn-primary mt-4">
            返回练习中心
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 页面头部 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            ← 返回练习中心
          </button>
          <span className="text-sm text-gray-500">
            {lesson?.title}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          练习题 {cardIndex + 1}
        </h1>
        <p className="text-gray-600">
          {currentCard.question}
        </p>
      </div>

      {/* 目标效果预览 */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="text-lg font-semibold">目标效果</h3>
        </div>
        <div className="card-body">
          <div className="bg-green-50 border-green-200 border rounded-lg p-4 text-center">
            <MarkdownRenderer content={currentCard.target_formula} />
          </div>
        </div>
      </div>

      {/* 答题区域 */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* 输入区域 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">你的答案</h3>
          </div>
          <div className="card-body">
            <LaTeXEditor
              value={userAnswer}
              onChange={setUserAnswer}
              onSubmit={handleSubmit}
              disabled={isSubmitting}
              placeholder="请输入LaTeX代码..."
            />
          </div>
        </div>

        {/* 预览区域 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">实时预览</h3>
          </div>
          <div className="card-body">
            <LaTeXPreview
              latex={userAnswer}
              className="min-h-[100px] flex items-center justify-center"
            />
          </div>
        </div>
      </div>

      {/* 反馈区域 */}
      {feedback && (
        <div className={`card mb-6 ${
          feedback.type === 'success' ? 'border-green-200' : 'border-red-200'
        }`}>
          <div className="card-body">
            <div className={`flex items-start ${
              feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              <div className="flex-shrink-0 mr-3">
                {feedback.type === 'success' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium mb-2">{feedback.message}</p>
                {feedback.targetAnswer && !feedback.isCorrect && (
                  <div className="text-sm">
                    <p className="mb-2">正确答案：</p>
                    <div className="bg-white border rounded p-2 text-center">
                      <MarkdownRenderer content={feedback.targetAnswer} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 提示区域 */}
      {showHint && currentCard.hints && currentCard.hints.length > 0 && (
        <div className="card mb-6 border-yellow-200">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-yellow-800">💡 提示</h3>
          </div>
          <div className="card-body">
            <div className="text-yellow-800">
              {currentCard.hints[Math.min(hintLevel - 1, currentCard.hints.length - 1)]}
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            重置
          </button>
          {currentCard.hints && currentCard.hints.length > 0 && hintLevel < currentCard.hints.length && (
            <button
              onClick={handleGetHint}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              获取提示
            </button>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !userAnswer.trim()}
          className="btn btn-primary"
        >
          {isSubmitting ? '提交中...' : '提交答案'}
        </button>
      </div>
    </div>
  )
}

export default PracticeExercisePage

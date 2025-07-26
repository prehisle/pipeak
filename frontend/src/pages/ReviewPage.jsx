import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { reviewAPI } from '../services/api'

const ReviewPage = () => {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showStats, setShowStats] = useState(false)
  const navigate = useNavigate()

  // 加载今日复习任务
  useEffect(() => {
    loadTodayReviews()
  }, [])

  const loadTodayReviews = async () => {
    try {
      setLoading(true)
      const response = await reviewAPI.getTodayReviews()
      setReviews(response.reviews)
      setStats(response.stats)

      if (response.reviews.length === 0) {
        // 没有复习任务，加载详细统计
        const statsResponse = await reviewAPI.getStats()
        setStats(statsResponse.stats)
        setShowStats(true)
      }
    } catch (error) {
      console.error('加载复习任务失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!userAnswer.trim()) {
      setFeedback('请输入你的答案')
      return
    }

    const currentReview = reviews[currentReviewIndex]
    if (!currentReview) return

    setIsSubmitting(true)
    try {
      // 简单的答案检查（实际应该更智能）
      const isCorrect = normalizeLatex(userAnswer) === normalizeLatex(currentReview.target_formula)

      const response = await reviewAPI.submitReview({
        review_id: currentReview.review_id,
        user_answer: userAnswer,
        is_correct: isCorrect,
        quality: isCorrect ? 4 : 1
      })

      setFeedback({
        is_correct: response.is_correct,
        message: response.message,
        next_review_friendly: response.next_review_friendly,
        repetitions: response.repetitions,
        target_answer: currentReview.target_formula
      })

      // 2秒后进入下一题
      setTimeout(() => {
        if (currentReviewIndex < reviews.length - 1) {
          setCurrentReviewIndex(currentReviewIndex + 1)
          setUserAnswer('')
          setFeedback(null)
        } else {
          // 所有复习完成
          setShowStats(true)
          loadTodayReviews() // 重新加载以更新统计
        }
      }, 2000)

    } catch (error) {
      setFeedback('提交复习时出错，请重试')
      console.error('提交复习失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const normalizeLatex = (latex) => {
    return latex.replace(/\s+/g, '').toLowerCase()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmitReview()
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载复习任务中...</p>
          </div>
        </div>
      </div>
    )
  }

  // 显示统计页面
  if (showStats || reviews.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            复习统计
          </h1>
          <p className="text-gray-600">
            基于SM-2算法的智能复习系统
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-green-600 text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-semibold text-green-900 mb-2">
                今日复习已完成！
              </h2>
              <p className="text-green-700">
                恭喜你完成了今天的所有复习任务，继续保持学习的好习惯！
              </p>
            </div>
          </div>
        ) : null}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="text-blue-600 text-2xl mb-2">📚</div>
              <div className="text-2xl font-bold text-blue-900">{stats.total_reviews}</div>
              <div className="text-base text-blue-700">总复习题目</div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="text-orange-600 text-2xl mb-2">⏰</div>
              <div className="text-2xl font-bold text-orange-900">{stats.due_today}</div>
              <div className="text-base text-orange-700">今日待复习</div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="text-purple-600 text-2xl mb-2">📈</div>
              <div className="text-2xl font-bold text-purple-900">{stats.accuracy_rate || 0}%</div>
              <div className="text-base text-purple-700">复习正确率</div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-green-600 text-2xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-green-900">{stats.week_completed || 0}</div>
              <div className="text-base text-green-700">本周完成数</div>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回学习面板
          </button>
        </div>
      </div>
    )
  }

  // 显示复习练习
  const currentReview = reviews[currentReviewIndex]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              今日复习
            </h1>
            <p className="text-gray-600">
              基于遗忘曲线的智能复习系统
            </p>
          </div>
          <div className="text-right">
            <div className="text-base text-gray-500">进度</div>
            <div className="text-lg font-semibold text-gray-900">
              {currentReviewIndex + 1} / {reviews.length}
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentReviewIndex + 1) / reviews.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {currentReview && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold text-sm">🔄</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-yellow-900">
                  复习题 {currentReviewIndex + 1}
                </h3>
                <span className="text-sm bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                  {currentReview.lesson_title}
                </span>
                <span className={`text-sm px-2 py-1 rounded ${
                  currentReview.difficulty === 'easy'
                    ? 'bg-green-100 text-green-800'
                    : currentReview.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentReview.difficulty === 'easy' ? '简单' :
                   currentReview.difficulty === 'medium' ? '中等' : '困难'}
                </span>
              </div>

              {/* 题目描述 */}
              <div className="mb-6">
                <p className="text-yellow-800 text-base mb-4">
                  {currentReview.question}
                </p>

                {/* 目标效果预览 */}
                <div className="bg-white p-4 rounded-lg border border-yellow-200 mb-4">
                  <p className="text-base text-gray-600 mb-2">目标效果：</p>
                  <div className="text-center">
                    <MarkdownRenderer content={currentReview.target_formula} />
                  </div>
                </div>
              </div>

              {/* 答案输入区域 */}
              <div className="mb-4">
                <label className="block text-base font-medium text-yellow-800 mb-2">
                  请输入 LaTeX 代码：
                </label>
                <div className="relative">
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="例如：$x^2$"
                    className="w-full px-4 py-4 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none hover:bg-gray-100 transition-all duration-200 font-mono text-base resize-none border-0"
                    rows="3"
                    disabled={feedback?.is_correct}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                    Ctrl+Enter 提交
                  </div>
                </div>
              </div>

              {/* 实时预览 */}
              {userAnswer.trim() && (
                <div className="mb-4">
                  <p className="text-base font-medium text-yellow-800 mb-2">实时预览：</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="text-center">
                      <MarkdownRenderer content={userAnswer} />
                    </div>
                  </div>
                </div>
              )}

              {/* 反馈信息 */}
              {feedback && (
                <div className={`mb-4 p-4 rounded-lg ${
                  feedback.is_correct
                    ? 'bg-green-100 border border-green-300 text-green-800'
                    : 'bg-red-100 border border-red-300 text-red-800'
                }`}>
                  <p className="font-medium mb-2">{feedback.message}</p>
                  {feedback.is_correct ? (
                    <div className="text-base">
                      <p>🎯 重复次数: {feedback.repetitions}</p>
                      <p>⏰ 下次复习: {feedback.next_review_friendly}</p>
                    </div>
                  ) : (
                    <div className="text-base">
                      <p>正确答案: {feedback.target_answer}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || !userAnswer.trim() || feedback?.is_correct}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    feedback?.is_correct
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : isSubmitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                >
                  {isSubmitting ? '提交中...' : feedback?.is_correct ? '已完成 ✓' : '提交答案'}
                </button>
              </div>

              {/* 复习信息 */}
              <div className="mt-4 text-base text-gray-600">
                <p>📊 已重复 {currentReview.repetitions} 次</p>
                <p>🧠 记忆强度: {currentReview.easiness_factor.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewPage

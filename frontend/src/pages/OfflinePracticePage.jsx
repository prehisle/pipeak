import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { learningAPI, lessonAPI } from '../services/api'

const OfflinePracticePage = () => {
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState([])
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  // 从本地课程数据中提取所有练习题
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log('开始加载离线练习题...')
        // 获取所有课程
        const lessonsResponse = await lessonAPI.getLessons()
        console.log('课程数据:', lessonsResponse)

        const allQuestions = []

        // 提取所有练习题
        lessonsResponse.lessons.forEach((lesson, lessonIndex) => {
          console.log(`处理课程 ${lessonIndex + 1}: ${lesson.title}`)
          lesson.cards.forEach((card, cardIndex) => {
            if (card.type === 'practice') {
              console.log(`找到练习题: ${card.question}`)
              allQuestions.push({
                id: `${lesson._id}_${cardIndex}`,
                lessonId: lesson._id,
                cardIndex,
                question: card.question,
                target_formula: card.target_formula,
                hints: card.hints || [],
                lessonTitle: lesson.title
              })
            }
          })
        })

        console.log(`总共加载了 ${allQuestions.length} 道练习题`)
        setQuestions(allQuestions)
      } catch (error) {
        console.error('加载练习题失败:', error)
        console.error('错误详情:', error.stack)
      }
    }

    loadQuestions()
  }, [])

  const currentQuestion = questions[currentQuestionIndex]

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      setFeedback('请输入你的答案')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await learningAPI.submitAnswer({
        lesson_id: currentQuestion.lessonId,
        card_index: currentQuestion.cardIndex,
        user_answer: userAnswer
      })

      setIsCorrect(response.is_correct)
      setFeedback(response.feedback)
      
      if (response.is_correct) {
        setScore(score + 1)
        // 2秒后自动进入下一题
        setTimeout(() => {
          handleNextQuestion()
        }, 2000)
      }
    } catch (error) {
      setFeedback('提交答案时出错，请重试')
      console.error('提交练习答案失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setUserAnswer('')
      setFeedback(null)
      setIsCorrect(false)
    } else {
      // 显示最终结果
      setShowResults(true)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isCorrect) {
      e.preventDefault()
      handleNextQuestion()
    } else if (e.key === 'Enter' && !isCorrect && userAnswer.trim()) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const restartPractice = () => {
    setCurrentQuestionIndex(0)
    setUserAnswer('')
    setFeedback(null)
    setIsCorrect(false)
    setScore(0)
    setShowResults(false)
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载练习题中...</p>
        </div>
      </div>
    )
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">练习完成！</h1>
            <p className="text-gray-600">恭喜你完成了所有练习题</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-gray-600">正确题数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{questions.length}</div>
                <div className="text-sm text-gray-600">总题数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{percentage}%</div>
                <div className="text-sm text-gray-600">正确率</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={restartPractice}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              重新练习
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 头部 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
          >
            ← 返回首页
          </button>
          <div className="text-sm text-gray-600">
            第 {currentQuestionIndex + 1} 题 / 共 {questions.length} 题
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">⚡ 离线练习模式</h1>
        <p className="text-gray-600">当前正确率：{questions.length > 0 ? Math.round((score / (currentQuestionIndex + 1)) * 100) : 0}%</p>
      </div>

      {/* 练习题卡片 */}
      {currentQuestion && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <div className="text-sm text-blue-600 mb-2">来自课程：{currentQuestion.lessonTitle}</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{currentQuestion.question}</h2>
            
            {/* 目标效果预览 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
              <p className="text-sm text-blue-800 mb-2">目标效果：</p>
              <div className="text-center bg-white p-3 rounded border">
                <MarkdownRenderer content={currentQuestion.target_formula} />
              </div>
            </div>
          </div>

          {/* 实时预览 */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">实时预览：</p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[60px] flex items-center justify-center">
              <div className="text-center w-full">
                {userAnswer.trim() ? (
                  <MarkdownRenderer content={userAnswer} />
                ) : (
                  <span className="text-gray-400 text-sm">输入LaTeX代码后将在此显示预览</span>
                )}
              </div>
            </div>
          </div>

          {/* 答案输入 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              请输入 LaTeX 代码：
            </label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="例如：$x^2$"
              className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 font-mono text-sm resize-none border ${
                isCorrect
                  ? 'bg-green-50 text-green-800 border-green-300'
                  : 'bg-white border-gray-300 focus:border-blue-500'
              }`}
              rows="2"
              readOnly={isCorrect}
            />
          </div>

          {/* 反馈信息 */}
          {feedback && (
            <div className={`mb-4 p-3 rounded-lg ${
              isCorrect
                ? 'bg-green-100 border border-green-300 text-green-800'
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <p className="font-medium text-sm">{feedback}</p>
              {isCorrect && (
                <p className="text-xs mt-1">
                  🎉 按 Enter 键或点击"下一题"继续
                </p>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            {!isCorrect ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !userAnswer.trim()}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  isSubmitting || !userAnswer.trim()
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? '提交中...' : '提交答案'}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                {currentQuestionIndex < questions.length - 1 ? '下一题 →' : '查看结果'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OfflinePracticePage

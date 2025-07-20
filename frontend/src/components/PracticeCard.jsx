import { useState, useEffect } from 'react'
import MarkdownRenderer from './MarkdownRenderer'
import { practiceAPI } from '../services/api'

const PracticeCard = ({ 
  card, 
  lessonId, 
  cardIndex, 
  onComplete 
}) => {
  const [userAnswer, setUserAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [currentHint, setCurrentHint] = useState('')
  const [hintLevel, setHintLevel] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)

  // 重置状态当卡片改变时
  useEffect(() => {
    setUserAnswer('')
    setFeedback(null)
    setShowHint(false)
    setCurrentHint('')
    setHintLevel(0)
    setIsCorrect(false)
  }, [cardIndex])

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      setFeedback('请输入你的答案')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await practiceAPI.submitAnswer({
        lesson_id: lessonId,
        card_index: cardIndex,
        user_answer: userAnswer
      })

      setIsCorrect(response.is_correct)
      setFeedback(response.feedback)
      
      if (response.is_correct) {
        // 答案正确，通知父组件
        setTimeout(() => {
          onComplete && onComplete(true)
        }, 2000)
      } else if (response.hint) {
        // 答案错误，显示提示
        setCurrentHint(response.hint)
        setShowHint(true)
      }
    } catch (error) {
      setFeedback('提交答案时出错，请重试')
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

      setCurrentHint(response.hint)
      setShowHint(true)
      setHintLevel(response.hint_level + 1)
    } catch (error) {
      console.error('获取提示失败:', error)
    }
  }

  const handleKeyPress = (e) => {
    // Ctrl+Enter 或 Cmd+Enter 提交答案
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
    // Tab 键获取提示（如果答案错误）
    else if (e.key === 'Tab' && !isCorrect && !e.shiftKey) {
      e.preventDefault()
      handleGetHint()
    }
  }

  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-semibold text-sm">✏️</span>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            练习题 {cardIndex + 1}
          </h3>
          
          {/* 题目描述 */}
          <div className="mb-6">
            <p className="text-green-800 text-base mb-4">
              {card.question}
            </p>
            
            {/* 目标效果预览 */}
            <div className="bg-white p-4 rounded-lg border border-green-200 mb-4">
              <p className="text-sm text-gray-600 mb-2">目标效果：</p>
              <div className="text-center">
                <MarkdownRenderer content={card.target_formula} />
              </div>
            </div>
          </div>

          {/* 答案输入区域 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-green-800 mb-2">
              请输入 LaTeX 代码：
            </label>
            <div className="relative">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="例如：$x^2$"
                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm resize-none"
                rows="3"
                disabled={isCorrect}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                <div>Ctrl+Enter 提交</div>
                {!isCorrect && <div>Tab 获取提示</div>}
              </div>
            </div>
          </div>

          {/* 实时预览 */}
          {userAnswer.trim() && (
            <div className="mb-4">
              <p className="text-sm font-medium text-green-800 mb-2">实时预览：</p>
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
              isCorrect 
                ? 'bg-green-100 border border-green-300 text-green-800' 
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <p className="font-medium">{feedback}</p>
            </div>
          )}

          {/* 提示信息 */}
          {showHint && currentHint && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-yellow-800">
                <span className="font-medium">💡 提示：</span>
                {currentHint}
              </p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !userAnswer.trim() || isCorrect}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isCorrect
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? '提交中...' : isCorrect ? '已完成 ✓' : '提交答案'}
            </button>

            {!isCorrect && (
              <button
                onClick={handleGetHint}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                💡 获取提示
              </button>
            )}
          </div>

          {/* 难度标识 */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">难度：</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              card.difficulty === 'easy' 
                ? 'bg-green-100 text-green-800'
                : card.difficulty === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {card.difficulty === 'easy' ? '简单' : 
               card.difficulty === 'medium' ? '中等' : '困难'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PracticeCard

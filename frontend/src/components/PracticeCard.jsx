import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import MarkdownRenderer from './MarkdownRenderer'
import { learningAPI } from '../services/api'

const PracticeCard = forwardRef(({
  card,
  lessonId,
  cardIndex,
  onComplete
}, ref) => {
  const [userAnswer, setUserAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [currentHint, setCurrentHint] = useState('')
  const [hintLevel, setHintLevel] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const [syntaxSuggestions, setSyntaxSuggestions] = useState([])

  // 输入框引用
  const textareaRef = useRef(null)

  // 暴露聚焦方法给父组件
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }))

  // 组件挂载时自动聚焦到输入框
  useEffect(() => {
    if (textareaRef.current && !isCorrect) {
      // 延迟聚焦，确保DOM完全渲染
      const timer = setTimeout(() => {
        textareaRef.current.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [cardIndex]) // 当卡片索引变化时重新聚焦

  // 检查当前练习是否已完成并加载状态
  useEffect(() => {
    const checkPracticeStatus = async () => {
      try {
        // 获取当前课程的完成状态
        const response = await learningAPI.getCompletionStatus(lessonId)
        if (response.data && response.data.completed_practice_details) {
          // 查找当前练习题的完成状态
          const currentPractice = response.data.completed_practice_details.find(
            practice => practice.index === cardIndex
          )

          if (currentPractice) {
            // 如果已完成，设置为完成状态
            setIsCorrect(true)
            setUserAnswer(card.target_formula || '')
            setFeedback({
              type: 'success',
              message: '🎉 太棒了！答案完全正确！'
            })
          } else {
            // 如果未完成，重置状态
            setUserAnswer('')
            setFeedback(null)
            setIsCorrect(false)
          }
        } else {
          // 如果没有完成状态，重置状态
          setUserAnswer('')
          setFeedback(null)
          setIsCorrect(false)
        }
      } catch (error) {
        console.error('检查练习状态失败:', error)
        // 出错时重置状态
        setUserAnswer('')
        setFeedback(null)
        setIsCorrect(false)
      }

      // 重置其他状态
      setShowHint(false)
      setCurrentHint('')
      setHintLevel(0)
      setSyntaxSuggestions([])
    }

    checkPracticeStatus()
  }, [cardIndex, lessonId, card.target_formula])

  // 智能语法检查和建议
  const checkSyntax = (input) => {
    const suggestions = []

    // 检查常见的函数名错误
    const functionChecks = [
      { pattern: /\bsin\b/g, suggestion: '使用 \\sin 而不是 sin', fix: input => input.replace(/\bsin\b/g, '\\sin') },
      { pattern: /\bcos\b/g, suggestion: '使用 \\cos 而不是 cos', fix: input => input.replace(/\bcos\b/g, '\\cos') },
      { pattern: /\btan\b/g, suggestion: '使用 \\tan 而不是 tan', fix: input => input.replace(/\btan\b/g, '\\tan') },
      { pattern: /\bln\b/g, suggestion: '使用 \\ln 而不是 ln', fix: input => input.replace(/\bln\b/g, '\\ln') },
      { pattern: /\blog\b/g, suggestion: '使用 \\log 而不是 log', fix: input => input.replace(/\blog\b/g, '\\log') },
      { pattern: /\bexp\b/g, suggestion: '使用 \\exp 而不是 exp', fix: input => input.replace(/\bexp\b/g, '\\exp') },
      { pattern: /\bsqrt\b/g, suggestion: '使用 \\sqrt 而不是 sqrt', fix: input => input.replace(/\bsqrt\b/g, '\\sqrt') },
    ]

    functionChecks.forEach(check => {
      if (check.pattern.test(input)) {
        suggestions.push({
          type: 'function',
          message: check.suggestion,
          fix: check.fix(input)
        })
      }
    })

    // 检查空格问题
    if (/[a-zA-Z]=/.test(input) || /=[a-zA-Z]/.test(input)) {
      suggestions.push({
        type: 'spacing',
        message: '等号两边建议加空格，如 a = b',
        fix: input.replace(/([a-zA-Z])=/g, '$1 =').replace(/=([a-zA-Z])/g, '= $1')
      })
    }

    // 检查美元符号
    if (!input.startsWith('$') && !input.endsWith('$') && input.includes('\\')) {
      suggestions.push({
        type: 'dollar',
        message: 'LaTeX数学公式需要用 $ 包围',
        fix: `$${input}$`
      })
    }

    return suggestions
  }

  // 监听用户输入变化，提供实时建议
  useEffect(() => {
    if (userAnswer.trim()) {
      const suggestions = checkSyntax(userAnswer)
      setSyntaxSuggestions(suggestions)
    } else {
      setSyntaxSuggestions([])
    }
  }, [userAnswer])

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      setFeedback('请输入你的答案')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await learningAPI.submitAnswer({
        lesson_id: lessonId,
        card_index: cardIndex,
        user_answer: userAnswer
      })

      setIsCorrect(response.is_correct)
      setFeedback(response.feedback)
      
      if (response.is_correct) {
        // 答案正确，通知父组件（延迟自动进入下一题）
        setTimeout(() => {
          onComplete && onComplete(true, false) // false 表示非立即执行
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
      const response = await learningAPI.getHint({
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
    // 如果答案正确，按回车键进入下一题
    if (e.key === 'Enter' && isCorrect) {
      e.preventDefault()
      // 立即触发完成回调，不等待2秒延迟
      onComplete && onComplete(true, true) // true 表示立即执行
      return
    }

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
    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-semibold text-xs">✏️</span>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-base font-semibold text-green-900 mb-3">
            练习题 {cardIndex + 1}
          </h3>
          
          {/* 题目描述 */}
          <div className="mb-4">
            <p id="practice-question" className="text-green-800 text-sm mb-3">
              {typeof card.question === 'string' ? card.question : '练习题目'}
            </p>

            {/* 目标效果预览 */}
            <div className="bg-white p-3 rounded-lg border border-green-200 mb-3">
              <p className="text-sm text-gray-600 mb-2">目标效果：</p>
              <div className="text-center">
                <MarkdownRenderer content={card.target_formula} />
              </div>
            </div>
          </div>

          {/* 答案输入区域 */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-green-800 mb-2">
              请输入 LaTeX 代码：
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="例如：$x^2$"
                className="w-full px-3 py-2 bg-gray-50 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none hover:bg-gray-100 transition-all duration-200 font-mono text-sm resize-none border-0"
                rows="2"
                disabled={isCorrect}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                aria-label="LaTeX代码输入框"
                aria-describedby="practice-question"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-gray-50 px-1 py-0.5 rounded text-xs">
                <div>Ctrl+Enter 提交</div>
                {!isCorrect && <div>Tab 获取提示</div>}
              </div>
            </div>
          </div>

          {/* 实时预览 */}
          <div className="mb-3">
            <p className="text-sm font-medium text-green-800 mb-2">实时预览：</p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[50px] flex items-center justify-center">
              <div className="text-center w-full">
                {userAnswer.trim() ? (
                  <MarkdownRenderer content={userAnswer} />
                ) : (
                  <span className="text-gray-400 text-xs">输入LaTeX代码后将在此显示预览</span>
                )}
              </div>
            </div>
          </div>

          {/* 反馈信息 */}
          {feedback && (
            <div className={`mb-3 p-3 rounded-lg ${
              isCorrect
                ? 'bg-green-100 border border-green-300 text-green-800'
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <p className="font-medium text-sm">{typeof feedback === 'string' ? feedback : '反馈信息'}</p>
              {isCorrect && (
                <p className="text-xs mt-1 text-green-600">
                  💡 按 <kbd className="px-1 py-0.5 bg-green-200 rounded text-xs font-mono">Enter</kbd> 键进入下一题
                </p>
              )}
            </div>
          )}

          {/* 提示信息 */}
          {showHint && currentHint && (
            <div className="mb-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <span className="font-medium">💡 提示：</span>
                {typeof currentHint === 'string' ? currentHint : '提示信息'}
              </p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !userAnswer.trim() || isCorrect}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
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
                className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
              >
                💡 获取提示
              </button>
            )}
          </div>

          {/* 难度标识 */}
          <div className="mt-3 flex items-center gap-2">
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
})

// 设置displayName以便调试
PracticeCard.displayName = 'PracticeCard'

export default PracticeCard

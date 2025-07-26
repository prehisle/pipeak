import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import MarkdownRenderer from './MarkdownRenderer'
import { learningAPI } from '../services/api'

const PracticeCard = forwardRef(({
  card,
  exercise,
  lessonId,
  knowledgePointId,
  cardIndex,
  onComplete
}, ref) => {
  const { t } = useTranslation()

  // 数据适配器：支持新旧两种数据格式
  const practiceData = exercise || card
  const targetFormula = practiceData?.answer || practiceData?.target_formula || ''
  const questionText = practiceData?.question || ''
  const hintText = practiceData?.hint || practiceData?.hints?.[0] || ''
  const difficulty = practiceData?.difficulty || 'easy'

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
            setUserAnswer(targetFormula)
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
  }, [cardIndex, lessonId, targetFormula])

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

    // 简单的答案比较（去除空格）
    const normalizedUserAnswer = userAnswer.trim()
    const normalizedTargetAnswer = targetFormula.trim()

    const isAnswerCorrect = normalizedUserAnswer === normalizedTargetAnswer

    if (isAnswerCorrect) {
      setIsCorrect(true)
      setFeedback('🎉 太棒了！答案完全正确！')

      // 调用父组件的完成回调
      if (onComplete) {
        setTimeout(() => {
          onComplete(true, false) // false 表示非立即执行
        }, 2000)
      }
    } else {
      setFeedback('答案不正确，请再试一次。提示：检查语法和格式是否正确。')

      // 显示提示
      if (hintText) {
        setCurrentHint(hintText)
        setShowHint(true)
      }
    }

    setIsSubmitting(false)
  }

  const handleGetHint = () => {
    if (hintText) {
      setCurrentHint(hintText)
      setShowHint(true)
    } else {
      setCurrentHint('暂无提示信息')
      setShowHint(true)
    }
  }

  const handleKeyPress = (e) => {
    console.log('PracticeCard键盘事件:', e.key, '答案是否正确:', isCorrect, '用户答案:', userAnswer.trim())

    // 如果答案正确，按回车键进入下一题
    if (e.key === 'Enter' && isCorrect) {
      e.preventDefault()
      console.log('触发Enter键进入下一题')
      // 立即触发完成回调，不等待2秒延迟
      onComplete && onComplete(true, true) // true 表示立即执行
      return
    }

    // 普通 Enter 键提交答案（如果答案未正确且有内容）
    if (e.key === 'Enter' && !isCorrect && userAnswer.trim()) {
      e.preventDefault()
      console.log('触发Enter键提交答案')
      handleSubmit()
      return
    }

    // Ctrl+Enter 或 Cmd+Enter 强制提交答案
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      console.log('触发Ctrl+Enter强制提交')
      handleSubmit()
    }
    // Tab 键获取提示
    else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      console.log('触发Tab键获取提示')
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
            {t('practice.practiceTitle')} {cardIndex + 1}
          </h3>
          
          {/* 题目描述 */}
          <div className="mb-4">
            <p id="practice-question" className="text-green-800 text-sm mb-3">
              {questionText || t('practice.practiceTitle')}
            </p>

            {/* 目标效果预览 */}
            <div className="bg-white p-3 rounded-lg border border-green-200 mb-3">
              <p className="text-sm text-gray-600 mb-2">{t('practice.targetEffect')}</p>
              <div className="text-center">
                <MarkdownRenderer content={targetFormula} />
              </div>
            </div>
          </div>

          {/* 实时预览 */}
          <div className="mb-3">
            <p className="text-sm font-medium text-green-800 mb-2">{t('practice.livePreview')}</p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[50px] flex items-center justify-center">
              <div className="text-center w-full">
                {userAnswer.trim() ? (
                  <MarkdownRenderer content={userAnswer} />
                ) : (
                  <span className="text-gray-400 text-xs">{t('practice.enterLatex')}</span>
                )}
              </div>
            </div>
          </div>

          {/* 答案输入区域 */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-green-800 mb-2">
              {t('practice.enterLatex')}
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('practice.example')}
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 font-mono text-sm resize-none border-0 ${
                  isCorrect
                    ? 'bg-green-50 text-green-800 cursor-default'
                    : 'bg-gray-50 focus:bg-white hover:bg-gray-100'
                }`}
                rows="2"
                readOnly={isCorrect}
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

          {/* 反馈信息 */}
          {feedback && (
            <div className={`mb-3 p-3 rounded-lg ${
              isCorrect
                ? 'bg-green-100 border border-green-300 text-green-800'
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <p className="font-medium text-sm">{typeof feedback === 'string' ? feedback : '反馈信息'}</p>
              {isCorrect && (
                <div className="text-xs mt-2 text-green-600 space-y-1">
                  <p>🎉 恭喜答对了！</p>
                  <p>💡 按 <kbd className="px-1 py-0.5 bg-green-200 rounded text-xs font-mono">Enter</kbd> 键或点击 <strong>"下一题"</strong> 按钮继续</p>
                </div>
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
                disabled={isSubmitting}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
                title="获取解题提示"
              >
                💡 获取提示
              </button>
            )}

            {isCorrect && (
              <button
                onClick={() => onComplete && onComplete(true, true)}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                title="进入下一题"
              >
                下一题 →
              </button>
            )}
          </div>

          {/* 难度标识 */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-600">难度：</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              difficulty === 'easy'
                ? 'bg-green-100 text-green-800'
                : difficulty === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {difficulty === 'easy' ? '简单' :
               difficulty === 'medium' ? '中等' : '困难'}
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

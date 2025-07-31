import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import MarkdownRenderer from './MarkdownRenderer'
import { learningAPI } from '../services/api'
import { translateHint, translateAllHintsShown } from '../utils/hintTranslator'
import EnhancedFeedback from './EnhancedFeedback'

// 练习题翻译映射
const practiceTranslations = {
  '请输入 LaTeX 代码来表示：x 的平方': 'Please enter LaTeX code to represent: x squared',
  '请输入 LaTeX 代码来表示：a 下标 1': 'Please enter LaTeX code to represent: a subscript 1',
  '请输入 LaTeX 代码来表示：x 下标 n 的平方': 'Please enter LaTeX code to represent: x subscript n squared',
  '请输入 LaTeX 代码来表示分数：二分之一': 'Please enter LaTeX code to represent fraction: one half',
  '请输入 LaTeX 代码来表示：根号 2': 'Please enter LaTeX code to represent: square root of 2',
  '请输入 LaTeX 代码来表示：x 加 y 的平方，除以 2': 'Please enter LaTeX code to represent: x plus y squared, divided by 2',
  '请输入 LaTeX 代码来表示：三次根号下 8': 'Please enter LaTeX code to represent: cube root of 8',
  '请输入 LaTeX 代码来表示希腊字母：π (圆周率)': 'Please enter LaTeX code to represent Greek letter: π (pi)',
  '请输入 LaTeX 代码来表示：α + β': 'Please enter LaTeX code to represent: α + β',
  '请输入 LaTeX 代码来表示：x ≠ ∞': 'Please enter LaTeX code to represent: x ≠ ∞',
  '请输入 LaTeX 代码来表示：Δx ≈ 0': 'Please enter LaTeX code to represent: Δx ≈ 0',
  '请输入 LaTeX 代码来表示：sin x': 'Please enter LaTeX code to represent: sin x',
  '请输入 LaTeX 代码来表示：f(x) = x²': 'Please enter LaTeX code to represent: f(x) = x²',
  '请输入 LaTeX 代码来表示：sin²θ + cos²θ = 1': 'Please enter LaTeX code to represent: sin²θ + cos²θ = 1',
  '请输入 LaTeX 代码来表示：ln(e^x) = x': 'Please enter LaTeX code to represent: ln(e^x) = x',
  '请输入 LaTeX 代码来表示：从 i=1 到 n 的求和': 'Please enter LaTeX code to represent: summation from i=1 to n',
  '请输入 LaTeX 代码来表示：从 0 到 1 的定积分': 'Please enter LaTeX code to represent: definite integral from 0 to 1',
  '请输入 LaTeX 代码来表示：当 x 趋向于 0 时 f(x) 的极限': 'Please enter LaTeX code to represent: limit of f(x) as x approaches 0',
  '请输入 LaTeX 代码来表示：∫₀¹ x² dx = 1/3': 'Please enter LaTeX code to represent: ∫₀¹ x² dx = 1/3',
  '请输入 LaTeX 代码来表示一个 2×2 矩阵（带圆括号）': 'Please enter LaTeX code to represent a 2×2 matrix (with parentheses)',
  '请输入 LaTeX 代码来表示向量 v（带箭头）': 'Please enter LaTeX code to represent vector v (with arrow)',
  '请输入 LaTeX 代码来表示两个向量的点积：a⃗ · b⃗': 'Please enter LaTeX code to represent dot product of two vectors: a⃗ · b⃗',
  '请输入 LaTeX 代码来表示 3×3 单位矩阵': 'Please enter LaTeX code to represent 3×3 identity matrix'
}

// 成功提示翻译
const successMessages = {
  '🎉 太棒了！答案完全正确！': '🎉 Excellent! Your answer is completely correct!',
  '🎉 恭喜答对了！': '🎉 Congratulations on getting it right!'
}

const PracticeCard = forwardRef(({
  card,
  exercise,
  lessonId,
  knowledgePointId,
  cardIndex,
  practiceIndex,
  onComplete,
  isReviewMode = false // 新增：是否为复习模式
}, ref) => {
  const { t, i18n } = useTranslation()

  // 数据适配器：支持新旧两种数据格式
  const practiceData = exercise || card
  const targetFormula = practiceData?.answer || practiceData?.target_formula || ''
  const rawQuestionText = practiceData?.question || ''
  const hintText = practiceData?.hint || practiceData?.hints?.[0] || ''
  const hints = practiceData?.hints || [] // 添加 hints 数组定义
  const difficulty = practiceData?.difficulty || 'easy'

  // 翻译练习题描述
  const translateQuestionText = (text) => {
    if (i18n.language === 'en-US' && practiceTranslations[text]) {
      return practiceTranslations[text]
    }
    return text
  }

  // 翻译成功提示
  const translateSuccessMessage = (message) => {
    if (i18n.language === 'en-US' && successMessages[message]) {
      return successMessages[message]
    }
    return message
  }

  const questionText = translateQuestionText(rawQuestionText)

  const [userAnswer, setUserAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [currentHint, setCurrentHint] = useState('')
  const [hintLevel, setHintLevel] = useState(0)
  const [originalHint, setOriginalHint] = useState('') // 存储原始提示内容用于重新翻译
  const [isCorrect, setIsCorrect] = useState(false)
  const [syntaxSuggestions, setSyntaxSuggestions] = useState([])
  const [validationResult, setValidationResult] = useState(null)

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

  // 监听语言变化，重新翻译当前显示的提示
  useEffect(() => {
    if (showHint && originalHint) {
      if (originalHint === 'NO_HINT') {
        // 无提示情况
        setCurrentHint(t('practice.noHint'))
      } else if (originalHint.includes('|||ALL_HINTS_SHOWN')) {
        // 所有提示已显示的情况
        const lastHint = originalHint.replace('|||ALL_HINTS_SHOWN', '')
        const translatedMessage = translateAllHintsShown(lastHint, t)
        setCurrentHint(translatedMessage)
      } else {
        // 普通提示情况
        const translatedHint = translateHint(originalHint, t)
        setCurrentHint(translatedHint)
      }
    }
  }, [t, showHint, originalHint])

  // 检查当前练习是否已完成并加载状态
  useEffect(() => {
    const checkPracticeStatus = async () => {
      // 复习模式下跳过完成状态检查
      if (isReviewMode) {
        // 重置其他状态
        setShowHint(false)
        setCurrentHint('')
        setHintLevel(0)
        setSyntaxSuggestions([])
        return
      }

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
              message: t('practiceCard.correctAnswer')
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
  }, [cardIndex, lessonId, targetFormula, isReviewMode, t])

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

  // 答案等价性检查函数
  const checkAnswerEquivalence = (userAnswer, targetAnswer) => {
    // 标准化函数：移除多余空格，统一格式，处理上下标顺序
    const normalize = (str) => {
      let normalized = str
        .replace(/\s+/g, '') // 移除所有空格
        .toLowerCase() // 转换为小写
        .replace(/^\$+|\$+$/g, '') // 移除开头和结尾的美元符号

      // 标准化上下标顺序：统一为先下标后上标的形式
      // x^2_i -> x_i^2, x^{2}_i -> x_i^{2}
      normalized = normalized.replace(/([a-zA-Z])(\^[^_\s]*)?(_[^_^\s]*)?/g,
        (match, base, sup, sub) => {
          if (sup && sub) {
            return base + sub + sup; // 统一为先下标后上标
          }
          return match;
        }
      );

      return normalized;
    }

    const normalizedUser = normalize(userAnswer)
    const normalizedTarget = normalize(targetAnswer)

    // 直接比较标准化后的字符串
    if (normalizedUser === normalizedTarget) {
      return true
    }

    // 检查是否只是美元符号的差异
    const userWithDollar = `$${normalizedUser}$`
    const targetWithDollar = `$${normalizedTarget}$`

    return normalize(userWithDollar) === normalize(targetWithDollar)
  }

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      setFeedback(t('practice.enterAnswer'))
      return
    }

    setIsSubmitting(true)

    console.log('=== 调试答案验证 ===')
    console.log('用户答案:', userAnswer.trim())
    console.log('目标答案:', targetFormula.trim())
    console.log('练习数据:', practiceData)

    let isAnswerCorrect = false;

    try {
      // 使用后端的增强验证API
      if (!isReviewMode) {
        // 学习模式：提交到后端API并获取增强验证结果
        const response = await learningAPI.submitAnswer({
          lesson_id: lessonId,
          card_index: cardIndex,
          user_answer: userAnswer.trim()
        })

        console.log('后端验证结果:', response)

        // 处理增强验证结果
        isAnswerCorrect = response.is_correct
        const validationResult = response.validation

        // 更新状态
        setValidationResult(validationResult)

        if (isAnswerCorrect) {
          setIsCorrect(true)
          setFeedback(t('practiceCard.correctAnswer'))
        } else {
          setFeedback(t('practiceCard.incorrectAnswer'))
        }

        console.log('答案是否正确:', isAnswerCorrect)
        console.log('验证详情:', validationResult)

      } else {
        // 复习模式：使用前端验证（保持原有逻辑）
        isAnswerCorrect = checkAnswerEquivalence(userAnswer.trim(), targetFormula.trim())

        if (isAnswerCorrect) {
          setIsCorrect(true)
          setFeedback(t('practiceCard.correctAnswer'))
        } else {
          setFeedback(t('practiceCard.incorrectAnswer'))
        }

        console.log('答案是否正确:', isAnswerCorrect)
      }

      // 如果答案正确，调用父组件的完成回调
      if (isAnswerCorrect && onComplete) {
        setTimeout(() => {
          if (isReviewMode) {
            // 复习模式：传递练习数据、用户答案、是否正确
            onComplete(practiceData, userAnswer.trim(), true)
          } else {
            // 学习模式：传递原有参数
            onComplete(true, false) // false 表示非立即执行
          }
        }, 2000)
      }

    } catch (error) {
      console.error('提交答案失败:', error)
      setFeedback(t('practice.submitError', '提交失败，请重试'))
    }

    setIsSubmitting(false)
  }

  // 智能分析用户答案并生成多级提示
  const analyzeAnswerAndGenerateHints = (userAnswer, targetAnswer) => {
    const hints = []

    // 标准化答案进行比较
    const normalizeAnswer = (answer) => {
      return answer.replace(/\s+/g, '').replace(/\$+/g, '').toLowerCase()
    }

    const normalizedUser = normalizeAnswer(userAnswer)
    const normalizedTarget = normalizeAnswer(targetAnswer)

    // 分析具体错误
    if (normalizedUser.includes('\\neq') && normalizedTarget.includes('\\neq')) {
      // 用户知道不等于号，但可能不知道其他符号
      if (normalizedTarget.includes('\\infty') && !normalizedUser.includes('\\infty')) {
        hints.push('提示：无穷大符号的LaTeX代码是 \\infty')
        hints.push('提示：完整答案应该是 x \\neq \\infty')
        hints.push('提示：记住，\\infty 表示无穷大，\\neq 表示不等于')
      }
    } else if (normalizedTarget.includes('\\neq') && !normalizedUser.includes('\\neq')) {
      hints.push('提示：不等于号的LaTeX代码是 \\neq')
      if (normalizedTarget.includes('\\infty')) {
        hints.push('提示：无穷大符号的LaTeX代码是 \\infty')
        hints.push('提示：完整答案是 x \\neq \\infty')
      }
    }

    // 通用提示
    if (hints.length === 0) {
      hints.push('提示：检查你的LaTeX语法和符号')
      hints.push('提示：确保所有的反斜杠和命令都正确')
    }

    return hints
  }

  const handleGetHint = () => {
    // 优先使用传入的hints数组（渐进式提示）
    if (hints && Array.isArray(hints) && hints.length > 0) {
      const nextHintIndex = hintLevel
      if (nextHintIndex < hints.length) {
        const originalHintText = hints[nextHintIndex]
        const translatedHint = translateHint(originalHintText, t)
        setOriginalHint(originalHintText) // 存储原始提示
        setCurrentHint(translatedHint)
        setHintLevel(nextHintIndex + 1)
        setShowHint(true)
        return
      } else {
        // 所有预设提示都用完了，保持显示最后一个提示，并添加提示信息
        const lastHint = hints[hints.length - 1]
        const translatedMessage = translateAllHintsShown(lastHint, t)
        setOriginalHint(`${lastHint}|||ALL_HINTS_SHOWN`) // 特殊标记表示所有提示已显示
        setCurrentHint(translatedMessage)
        setShowHint(true)
        return
      }
    }

    // 如果没有预设提示，生成智能提示
    const smartHints = analyzeAnswerAndGenerateHints(userAnswer, targetFormula)

    // 获取下一个提示
    const nextHintIndex = hintLevel
    if (nextHintIndex < smartHints.length) {
      const smartHint = smartHints[nextHintIndex]
      setOriginalHint(smartHint) // 存储原始提示
      setCurrentHint(smartHint)
      setHintLevel(nextHintIndex + 1)
      setShowHint(true)
    } else if (hintText) {
      // 如果智能提示用完了，使用原始提示
      const translatedHint = translateHint(hintText, t)
      setOriginalHint(hintText) // 存储原始提示
      setCurrentHint(translatedHint)
      setShowHint(true)
    } else {
      const noMoreHints = t('practice.noHint')
      setOriginalHint('NO_HINT') // 特殊标记
      setCurrentHint(noMoreHints)
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
      if (onComplete) {
        if (isReviewMode) {
          onComplete(practiceData, userAnswer.trim(), true)
        } else {
          onComplete(true, true) // true 表示立即执行
        }
      }
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
    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-600 p-4 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
            <span className="text-green-600 dark:text-green-400 font-semibold text-xs">✏️</span>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
            {t('practice.practiceTitle')} {practiceIndex || cardIndex}
          </h3>

          {/* 题目描述 */}
          <div className="mb-4">
            <p id="practice-question" className="text-green-800 dark:text-green-200 text-base mb-3">
              {questionText || t('practice.practiceTitle')}
            </p>

            {/* 目标效果预览 */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-green-700 mb-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('practice.targetEffect')}</p>
              <div className="text-center">
                <MarkdownRenderer content={targetFormula} />
              </div>
            </div>
          </div>

          {/* 实时预览 */}
          <div className="mb-3">
            <p className="text-base font-medium text-green-800 dark:text-green-200 mb-2">{t('practice.livePreview')}</p>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[50px] flex items-center justify-center">
              <div className="text-center w-full">
                {userAnswer.trim() ? (
                  <MarkdownRenderer content={userAnswer} />
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-xs">{t('practice.enterLatex')}</span>
                )}
              </div>
            </div>
          </div>

          {/* 答案输入区域 */}
          <div className="mb-3">
            <label className="block text-base font-medium text-green-800 dark:text-green-200 mb-2">
              {t('practice.enterLatex')}
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('practice.example')}
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 font-mono text-base resize-none border-0 ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 cursor-default'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
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
              <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">
                <div>{t('practiceCard.submitShortcut')}</div>
                {!isCorrect && <div>{t('practiceCard.hintShortcut')}</div>}
              </div>
            </div>
          </div>

          {/* 反馈信息 */}
          {feedback && (
            <div className={`mb-3 p-3 rounded-lg ${
              isCorrect
                ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
            }`}>
              <p className="font-medium text-sm">{typeof feedback === 'string' ? feedback : t('practiceCard.feedback')}</p>
              {isCorrect && (
                <div className="text-xs mt-2 text-green-600 dark:text-green-400 space-y-1">
                  <p>{t('practiceCard.congratulations')}</p>
                  <p>{t('practiceCard.continueHint', {
                    key: t('practiceCard.enterKey'),
                    button: t('practiceCard.nextButton')
                  })}</p>
                </div>
              )}
            </div>
          )}

          {/* 增强反馈信息（小贴士） */}
          {validationResult && (
            <EnhancedFeedback validationResult={validationResult} />
          )}

          {/* 提示信息 */}
          {showHint && currentHint && (
            <div className="mb-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <span className="font-medium">{t('practice.hintPrefix')}</span>
                {typeof currentHint === 'string' ? currentHint : t('practice.noHint')}
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
              {isSubmitting ? t('practiceCard.submitting') : isCorrect ? t('practiceCard.completed') : t('practiceCard.submitAnswer')}
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
                title={t('practiceCard.getHintTooltip')}
              >
                {t('practiceCard.getHint')}
              </button>
            )}

            {isCorrect && (
              <button
                onClick={() => {
                  if (onComplete) {
                    if (isReviewMode) {
                      onComplete(practiceData, userAnswer.trim(), true)
                    } else {
                      onComplete(true, true)
                    }
                  }
                }}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                title={t('practiceCard.nextQuestionTooltip')}
              >
                {t('practiceCard.nextQuestion')}
              </button>
            )}
          </div>

          {/* 难度标识 */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('practiceCard.difficulty')}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              difficulty === 'easy'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : difficulty === 'medium'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            }`}>
              {difficulty === 'easy' ? t('practiceCard.difficultyEasy') :
               difficulty === 'medium' ? t('practiceCard.difficultyMedium') :
               t('practiceCard.difficultyHard')}
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

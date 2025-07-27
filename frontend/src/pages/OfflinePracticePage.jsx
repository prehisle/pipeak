import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle, PAGE_TITLES } from '../hooks/useDocumentTitle'
import MarkdownRenderer from '../components/MarkdownRenderer'
import ThemeSwitcher from '../components/ThemeSwitcher'
import LanguageSwitcher from '../components/LanguageSwitcher'
import useFrontendLessonStore from '../stores/frontendLessonStore'
import { translateHint, translateAllHintsShown } from '../utils/hintTranslator'

const OfflinePracticePage = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { initializeLessons, lessons } = useFrontendLessonStore()

  // 设置动态页面标题
  useDocumentTitle(PAGE_TITLES.PRACTICE)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState([])
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [currentHint, setCurrentHint] = useState('')
  const [hintLevel, setHintLevel] = useState(0)
  const [originalHint, setOriginalHint] = useState('') // 存储原始提示内容用于重新翻译
  const [answeredQuestions, setAnsweredQuestions] = useState(0)

  // 从本地课程数据中提取所有练习题
  useEffect(() => {
    // 初始化课程数据
    initializeLessons(i18n.language)
  }, [i18n.language, initializeLessons])

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
  }, [i18n.language, showHint, originalHint, t])

  useEffect(() => {
    if (!lessons || lessons.length === 0) return

    const loadQuestions = () => {
      try {
        const allQuestions = []

        // 提取所有练习题
        lessons.forEach((lesson) => {
          lesson.knowledgePoints.forEach((kp) => {
            if (kp.exercises) {
              kp.exercises.forEach((exercise, exerciseIndex) => {
                allQuestions.push({
                  id: `${lesson.id}_${kp.id}_${exerciseIndex}`,
                  lessonId: lesson.id,
                  cardIndex: exerciseIndex,
                  question: exercise.question,
                  target_formula: exercise.target_formula || exercise.target || exercise.answer,
                  // 统一处理提示数据：支持hints数组和单个hint字符串
                  hints: exercise.hints || (exercise.hint ? [exercise.hint] : []),
                  lessonTitle: lesson.title
                })
              })
            }
          })
        })

        // 限制为10道题（快速体验）
        const limitedQuestions = allQuestions.slice(0, 10)
        console.log(`总共加载了 ${allQuestions.length} 道练习题，限制为 ${limitedQuestions.length} 道`)
        setQuestions(limitedQuestions)
      } catch (error) {
        console.error('加载练习题失败:', error)
        console.error('错误详情:', error.stack)
      }
    }

    loadQuestions()
  }, [lessons])

  const currentQuestion = questions[currentQuestionIndex]

  // 答案等价性检查函数
  const checkAnswerEquivalence = (userAnswer, targetAnswer) => {
    // 标准化函数：移除多余空格，统一格式
    const normalize = (str) => {
      return str
        .replace(/\s+/g, '') // 移除所有空格
        .toLowerCase() // 转换为小写
        .replace(/^\$+|\$+$/g, '') // 移除开头和结尾的美元符号
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
    try {
      // 离线练习模式：本地验证答案
      if (!currentQuestion.target_formula) {
        console.error('练习题缺少target_formula字段:', currentQuestion)
        setFeedback('练习题数据错误，请刷新页面重试')
        setIsSubmitting(false)
        return
      }

      // 改进答案检查逻辑，支持多种正确格式
      const isAnswerCorrect = checkAnswerEquivalence(userAnswer.trim(), currentQuestion.target_formula.trim())

      setIsCorrect(isAnswerCorrect)
      setAnsweredQuestions(answeredQuestions + 1)

      if (isAnswerCorrect) {
        setScore(score + 1)
        setFeedback(t('lesson.correct'))
        // 答对后不自动跳转，由用户手动控制
      } else {
        setFeedback(t('lesson.incorrect'))
      }
    } catch (error) {
      setFeedback(t('practice.submitError'))
      console.error('验证答案失败:', error)
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
      setShowHint(false)
      setCurrentHint('')
      setOriginalHint('') // 重置原始提示
      setHintLevel(0) // 重置提示级别
    } else {
      // 显示最终结果
      setShowResults(true)
    }
  }

  const handleGetHint = () => {
    const currentQuestion = questions[currentQuestionIndex]
    if (currentQuestion && currentQuestion.hints && currentQuestion.hints.length > 0) {
      // 渐进式提示：每次显示下一个提示
      const nextHintIndex = hintLevel
      if (nextHintIndex < currentQuestion.hints.length) {
        const originalHintText = currentQuestion.hints[nextHintIndex]
        const translatedHint = translateHint(originalHintText, t)
        setOriginalHint(originalHintText) // 存储原始提示
        setCurrentHint(translatedHint)
        setHintLevel(nextHintIndex + 1)
        setShowHint(true)
      } else {
        // 所有提示都用完了，保持显示最后一个提示，并添加提示信息
        const lastHint = currentQuestion.hints[currentQuestion.hints.length - 1]
        const translatedMessage = translateAllHintsShown(lastHint, t)
        setOriginalHint(`${lastHint}|||ALL_HINTS_SHOWN`) // 特殊标记表示所有提示已显示
        setCurrentHint(translatedMessage)
        setShowHint(true)
      }
    } else {
      const noHintMessage = t('practice.noHint')
      setOriginalHint('NO_HINT') // 特殊标记
      setCurrentHint(noHintMessage)
      setShowHint(true)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isCorrect) {
      e.preventDefault()
      handleNextQuestion()
    } else if (e.key === 'Enter' && !isCorrect && userAnswer.trim()) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'F1' && !isCorrect) {
      // 使用F1键作为提示快捷键，不影响Tab导航
      e.preventDefault()
      handleGetHint()
    }
  }

  const restartPractice = () => {
    setCurrentQuestionIndex(0)
    setUserAnswer('')
    setFeedback(null)
    setIsCorrect(false)
    setScore(0)
    setAnsweredQuestions(0)
    setShowResults(false)
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('offlinePractice.loading')}</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('offlinePractice.practiceComplete')}</h1>
            <p className="text-gray-600">{t('offlinePractice.congratulations')}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-gray-600">{t('offlinePractice.correctAnswers')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{questions.length}</div>
                <div className="text-sm text-gray-600">总题数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{percentage}%</div>
                <div className="text-sm text-gray-600">{t('offlinePractice.accuracy')}</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={restartPractice}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('offlinePractice.restartPractice')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t('offlinePractice.backToHomePage')}
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
            onClick={() => navigate('/')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center text-sm"
          >
            {t('offlinePractice.backToHome')}
          </button>

          {/* 主题和语言切换器 */}
          <div className="flex items-center space-x-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('offlinePractice.questionProgress', { current: currentQuestionIndex + 1, total: questions.length })}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('offlinePractice.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('offlinePractice.currentAccuracy', { accuracy: answeredQuestions > 0 ? Math.round((score / answeredQuestions) * 100) : 0 })}</p>
      </div>

      {/* 练习题卡片 */}
      {currentQuestion && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">{t('offlinePractice.fromLesson', { lesson: currentQuestion.lessonTitle })}</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{currentQuestion.question}</h2>

            {/* 目标效果预览 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">{t('offlinePractice.targetEffect')}</p>
              <div className="text-center bg-white dark:bg-gray-700 p-3 rounded border dark:border-gray-600">
                <MarkdownRenderer content={currentQuestion.target_formula} />
              </div>
            </div>
          </div>

          {/* 实时预览 */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('offlinePractice.realTimePreview')}</p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[60px] flex items-center justify-center">
              <div className="text-center w-full">
                {userAnswer.trim() ? (
                  <MarkdownRenderer content={userAnswer} />
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-sm">{t('offlinePractice.previewPlaceholder')}</span>
                )}
              </div>
            </div>
          </div>

          {/* 答案输入 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('offlinePractice.inputPrompt')}
            </label>
            <div className="relative">
              <textarea
                value={userAnswer}
                onChange={(e) => {
                  const value = e.target.value
                  // 限制输入长度为500字符，防止界面变形
                  if (value.length <= 500) {
                    setUserAnswer(value)
                  }
                }}
                onKeyDown={handleKeyPress}
                placeholder={t('offlinePractice.inputPlaceholder')}
                maxLength={500}
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 font-mono text-sm resize-none border ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-600'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:text-gray-100'
                }`}
                rows="2"
                readOnly={isCorrect}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-600 px-1 py-0.5 rounded text-xs">
                <div>{t('practice.keyboardShortcuts')}</div>
                {!isCorrect && <div>{t('practice.hintShortcut')}</div>}
              </div>
            </div>
            {/* 字符计数器 */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {t('practice.characterCount', { count: userAnswer.length, max: 500 })}
            </div>
          </div>

          {/* 反馈信息 */}
          {feedback && (
            <div className={`mb-4 p-3 rounded-lg border transition-all duration-300 ${
              isCorrect
                ? 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-600 text-green-800 dark:text-green-300 shadow-green-100 dark:shadow-green-900/20'
                : 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-600 text-red-800 dark:text-red-300 shadow-red-100 dark:shadow-red-900/20 animate-pulse'
            } shadow-lg`}>
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-0.5">
                  {isCorrect ? (
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{feedback}</p>
                  {isCorrect && (
                    <p className="text-xs mt-1 opacity-80">
                      {t('practice.continueHint')}
                    </p>
                  )}
                  {!isCorrect && (
                    <p className="text-xs mt-1 opacity-80">
                      💡 提示：检查LaTeX语法，或点击"获取提示"按钮
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 提示信息 */}
          {showHint && currentHint && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-600 rounded-lg shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                    <span className="font-medium">{t('practice.hintPrefix')}</span>
                    {currentHint}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            {!isCorrect ? (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !userAnswer.trim()}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    isSubmitting || !userAnswer.trim()
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? t('practice.submitting') : t('offlinePractice.submitAnswer')}
                </button>
                <button
                  onClick={handleGetHint}
                  disabled={isSubmitting}
                  className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                    isSubmitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                  title={t('practice.hintTooltip')}
                >
                  {t('practice.getHint')}
                </button>
              </>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                {currentQuestionIndex < questions.length - 1 ? t('practice.nextQuestion') : t('practice.viewResults')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OfflinePracticePage

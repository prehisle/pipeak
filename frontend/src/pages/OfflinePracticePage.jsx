import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { learningAPI } from '../services/api'
import ThemeSwitcher from '../components/ThemeSwitcher'
import LanguageSwitcher from '../components/LanguageSwitcher'
import useFrontendLessonStore from '../stores/frontendLessonStore'

const OfflinePracticePage = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { initializeLessons, lessons } = useFrontendLessonStore()
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
  const [answeredQuestions, setAnsweredQuestions] = useState(0)

  // 从本地课程数据中提取所有练习题
  useEffect(() => {
    // 初始化课程数据
    initializeLessons(i18n.language)
  }, [i18n.language, initializeLessons])

  useEffect(() => {
    if (!lessons || lessons.length === 0) return

    const loadQuestions = () => {
      try {
        console.log('开始加载离线练习题...')
        console.log('课程数据:', { lessons })

        const allQuestions = []

        // 提取所有练习题
        lessons.forEach((lesson, lessonIndex) => {
          console.log(`处理课程 ${lessonIndex + 1}: ${lesson.title}`)
          lesson.knowledgePoints.forEach((kp) => {
            if (kp.exercises) {
              kp.exercises.forEach((exercise, exerciseIndex) => {
                console.log(`找到练习题: ${exercise.question}`)
                allQuestions.push({
                  id: `${lesson.id}_${kp.id}_${exerciseIndex}`,
                  lessonId: lesson.id,
                  cardIndex: exerciseIndex,
                  question: exercise.question,
                  target_formula: exercise.target,
                  hints: exercise.hints || [],
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

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      setFeedback(t('practice.enterAnswer'))
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
      setAnsweredQuestions(answeredQuestions + 1)

      if (response.is_correct) {
        setScore(score + 1)
        // 答对后不自动跳转，由用户手动控制
      }
    } catch (error) {
      setFeedback(t('practice.submitError'))
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
      setShowHint(false)
      setCurrentHint('')
    } else {
      // 显示最终结果
      setShowResults(true)
    }
  }

  const handleGetHint = () => {
    const currentQuestion = questions[currentQuestionIndex]
    if (currentQuestion && currentQuestion.hints && currentQuestion.hints.length > 0) {
      setCurrentHint(currentQuestion.hints[0])
      setShowHint(true)
    } else {
      setCurrentHint(t('practice.noHint'))
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
    } else if (e.key === 'Tab' && !e.shiftKey && !isCorrect) {
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
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('offlinePractice.inputPlaceholder')}
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 font-mono text-sm resize-none border ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-600'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:text-gray-100'
                }`}
                rows="2"
                readOnly={isCorrect}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-600 px-1 py-0.5 rounded text-xs">
                <div>{t('practice.enterSubmit')}</div>
                {!isCorrect && <div>{t('practice.tabHint')}</div>}
              </div>
            </div>
          </div>

          {/* 反馈信息 */}
          {feedback && (
            <div className={`mb-4 p-3 rounded-lg ${
              isCorrect
                ? 'bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-600 text-green-800 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-300'
            }`}>
              <p className="font-medium text-sm">{feedback}</p>
              {isCorrect && (
                <p className="text-xs mt-1">
                  {t('practice.continueHint')}
                </p>
              )}
            </div>
          )}

          {/* 提示信息 */}
          {showHint && currentHint && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <span className="font-medium">{t('practice.hintPrefix')}</span>
                {currentHint}
              </p>
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

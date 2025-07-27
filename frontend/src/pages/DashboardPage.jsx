import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle, PAGE_TITLES } from '../hooks/useDocumentTitle'
import { useLessonStore } from '../stores/lessonStore'
import useFrontendLessonStore from '../stores/frontendLessonStore'
import { reviewAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
const DashboardPage = () => {
  const { t, i18n } = useTranslation()

  // 设置动态页面标题
  useDocumentTitle(PAGE_TITLES.DASHBOARD)
  const {
    isLoading,
    error,
    clearError,
    initializeStorageListener
  } = useLessonStore()

  const {
    lessons,
    fetchLessons,
    getStats,
    getNextLesson,
    isLessonCompleted,
    setLanguage,
    loadProgressFromAPI,
    isLoading: lessonsLoading,
    error: lessonsError
  } = useFrontendLessonStore()

  const [reviewStats, setReviewStats] = useState(null)

  useEffect(() => {
    // 只有登录用户才获取课程数据
    const initializeData = async () => {
      try {
        // 登录用户：从API获取课程数据
        await fetchLessons()

        // 注册用户从后端API加载进度数据
        await loadProgressFromAPI()
      } catch (error) {
        console.log('用户未登录，跳过课程数据获取:', error.message)
      }
    }

    initializeData()

    // 获取复习数据
    loadReviewStats()

    // 初始化存储监听器
    const cleanupStorageListener = initializeStorageListener()

    return cleanupStorageListener
  }, [initializeStorageListener, fetchLessons, loadProgressFromAPI])

  // 监听语言变化
  useEffect(() => {
    setLanguage(i18n.language || 'zh-CN')
  }, [i18n.language, setLanguage])



  const loadReviewStats = async () => {
    try {
      // 优先使用API获取复习统计，确保与复习中心页面数据一致
      const response = await reviewAPI.getTodayReviews()
      setReviewStats(response.stats)
    } catch (error) {
      console.error('加载复习统计失败:', error)
      // 如果API失败，尝试使用前端数据计算
      try {
        const frontendStats = calculateFrontendReviewStats()
        setReviewStats(frontendStats)
      } catch (frontendError) {
        console.error('前端复习统计计算失败:', frontendError)
        // 设置默认值，避免显示错误
        setReviewStats({
          due_today: 0,
          due_tomorrow: 0,
          total_reviews: 0,
          accuracy_rate: 0,
          week_completed: 0
        })
      }
    }
  }

  // 从前端课程数据计算复习统计
  const calculateFrontendReviewStats = () => {
    const allPractices = []

    // 从所有课程中提取练习题
    lessons.forEach(lesson => {
      lesson.knowledgePoints?.forEach(kp => {
        kp.exercises?.forEach((exercise, index) => {
          allPractices.push({
            id: `${lesson.id}_${kp.id}_${index}`,
            lessonId: lesson.id,
            exercise
          })
        })
      })
    })

    // 从localStorage获取练习记录
    const practiceRecords = JSON.parse(localStorage.getItem('practice_records') || '[]')
    const completedPractices = practiceRecords.filter(record => record.isCorrect)

    // 简单的复习逻辑：完成的练习题在24小时后需要复习
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const needReview = completedPractices.filter(record => {
      const completedDate = new Date(record.timestamp)
      return completedDate < oneDayAgo
    })

    return {
      due_today: needReview.length,
      due_tomorrow: 0,
      total_reviews: completedPractices.length,
      total_practices: allPractices.length,
      accuracy_rate: allPractices.length > 0 ? Math.round((completedPractices.length / allPractices.length) * 100) : 0,
      week_completed: completedPractices.length
    }
  }

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  const stats = getStats()
  const nextLesson = getNextLesson()

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t('dashboard.title')}
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          {t('dashboard.viewProgress')}
        </p>
      </div>

      {/* 离线模式提示 - 只在有错误但有本地数据时显示 */}
      {error && lessons.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">{t('dashboard.offlineMode')}</p>
            </div>
          </div>
        </div>
      )}

      {/* 真正的错误提示 - 只在没有本地数据时显示 */}
      {error && lessons.length === 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}



      {/* 学习进度概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
              {stats.completedLessons}
            </div>
            <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">{t('dashboard.completedCourses')}</div>
            <div className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mt-1">
              {t('dashboard.totalCourses', { total: stats.totalLessons })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
              {stats.progressPercentage}%
            </div>
            <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">{t('dashboard.learningProgress')}</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-2">
              {reviewStats?.due_today || 0}
            </div>
            <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">{t('dashboard.reviewTasks')}</div>
            <div className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mt-1">
              {reviewStats?.due_tomorrow ? t('dashboard.tomorrowTasks', { count: reviewStats.due_tomorrow }) : t('dashboard.basedOnForgettingCurve')}
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* 今日复习 */}
        <div className="card">
          <div className="card-body h-full">
            <div className="flex flex-col h-full text-center">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('dashboard.todayReview')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">
                {reviewStats?.due_today ? t('dashboard.reviewTasksCount', { count: reviewStats.due_today }) : t('dashboard.noReviewTasks')}
              </p>
              <Link
                to="/app/review"
                className={`btn w-full md:w-auto ${reviewStats?.due_today > 0 ? 'btn-primary' : 'btn-secondary'}`}
              >
                {reviewStats?.due_today > 0 ? t('dashboard.startReview') : t('dashboard.reviewRecord')}
              </Link>
            </div>
          </div>
        </div>

        {/* 核心学习路径 */}
        <div className="card">
          <div className="card-body h-full">
            <div className="flex flex-col h-full text-center">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('dashboard.smartLearningPath')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">
                {t('dashboard.smartLearningDesc')}
              </p>
              <Link
                to={nextLesson ? `/app/lesson/${nextLesson.id}` : "/app/dashboard"}
                className="btn btn-primary w-full md:w-auto"
              >
                {nextLesson ? t('dashboard.startLearning') : t('dashboard.viewCourses')}
              </Link>
            </div>
          </div>
        </div>


      </div>

      {/* 课程列表 */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{t('dashboard.courseList')}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('dashboard.courseProgress', { completed: stats.completedLessons, total: stats.totalLessons })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {stats.progressPercentage}%
            </span>
          </div>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" />
              <p className="text-gray-500 mt-4">{t('dashboard.loadingCourses')}</p>
            </div>
          ) : lessons.length > 0 ? (
            <div className="grid gap-4">
              {lessons.map((lesson, index) => {
                const completed = isLessonCompleted(lesson.id)
                const isLocked = !completed && index > 0 && !isLessonCompleted(lessons[index - 1]?.id)

                return (
                  <div
                    key={lesson.id}
                    className={`lesson-card ${
                      completed
                        ? 'lesson-card-completed'
                        : isLocked
                          ? 'lesson-card-locked'
                          : 'lesson-card-pending'
                    }`}
                  >
                  <div className="lesson-card-content">
                    <div className="lesson-number">
                      {completed ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="font-bold">{index + 1}</span>
                      )}
                    </div>

                    <div className="lesson-info">
                      <h3 className="lesson-title">
                        {lesson.title}
                      </h3>
                      <p className="lesson-description">
                        {lesson.description}
                      </p>

                      <div className="lesson-meta">
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{t('dashboard.theoryPractice')}</span>
                          <span>{t('dashboard.duration', { minutes: lesson.duration || 15 })}</span>
                          {completed && (
                            <span className="text-green-600 dark:text-green-400">{t('dashboard.mastered')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="lesson-actions">
                      <Link
                        to={`/app/lesson/${lesson.id}`}
                        className={`lesson-btn ${
                          completed ? 'lesson-btn-review' : 'lesson-btn-learn'
                        }`}
                      >
                        {completed ? (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {t('dashboard.review')}
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('dashboard.startLearning')}
                          </>
                        )}
                      </Link>
                    </div>
                  </div>

                  {isLocked && (
                    <div className="lesson-lock-overlay">
                      <div className="lesson-lock-badge">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs text-orange-600 font-medium ml-1">
                          {t('dashboard.unlockPrevious')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>{t('dashboard.noCourses')}</p>
              <p className="text-sm mt-2">{t('dashboard.tryAgainLater')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

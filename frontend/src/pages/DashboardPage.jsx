import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { useLessonStore } from '../stores/lessonStore'
import useFrontendLessonStore from '../stores/frontendLessonStore'
import { useUserModeStore } from '../stores/userModeStore'
import { reviewAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import SmartText from '../components/SmartText'



const DashboardPage = () => {
  const { user } = useAuthStore()
  const { isGuestMode } = useUserModeStore()
  const { t } = useTranslation()
  const {
    lessons: oldLessons,
    isLoading,
    error,
    fetchLessons,
    getLessonStats,
    getNextLesson: getOldNextLesson,
    getDataSummary,
    clearError,
    initializeStorageListener
  } = useLessonStore()

  const {
    lessons,
    initializeLessons,
    getStats,
    getNextLesson,
    isLessonCompleted,
    setLanguage
  } = useFrontendLessonStore()



  const [reviewStats, setReviewStats] = useState(null)

  useEffect(() => {
    // 初始化前端课程数据
    initializeLessons(t.language || 'zh-CN')

    // 保持原有的API调用用于复习数据
    fetchLessons()
    loadReviewStats()

    // 初始化存储监听器
    const cleanupStorageListener = initializeStorageListener()

    return cleanupStorageListener
  }, [fetchLessons, initializeStorageListener, initializeLessons, t.language])

  // 监听语言变化
  useEffect(() => {
    setLanguage(t.language || 'zh-CN')
  }, [t.language, setLanguage])



  const loadReviewStats = async () => {
    try {
      const response = await reviewAPI.getTodayReviews()
      setReviewStats(response.stats)
    } catch (error) {
      console.error('加载复习统计失败:', error)
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('dashboard.title')}
        </h1>
        <p className="text-gray-600">
          {t('dashboard.viewProgress')}
        </p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}



      {/* 学习进度概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.completedLessons}
            </div>
            <div className="text-base text-gray-600">{t('dashboard.completedCourses')}</div>
            <div className="text-sm text-gray-400 mt-1">
              {t('dashboard.totalCourses', { total: stats.totalLessons })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.progressPercentage}%
            </div>
            <div className="text-base text-gray-600">{t('dashboard.learningProgress')}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {reviewStats?.due_today || 0}
            </div>
            <div className="text-base text-gray-600">{t('dashboard.reviewTasks')}</div>
            <div className="text-sm text-gray-400 mt-1">
              {reviewStats?.due_tomorrow ? t('dashboard.tomorrowTasks', { count: reviewStats.due_tomorrow }) : t('dashboard.basedOnForgettingCurve')}
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* 今日复习 */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {t('dashboard.todayReview')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {reviewStats?.due_today ? t('dashboard.reviewTasksCount', { count: reviewStats.due_today }) : t('dashboard.noReviewTasks')}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link
                  to="/app/review"
                  className={`btn ${reviewStats?.due_today > 0 ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {reviewStats?.due_today > 0 ? t('dashboard.startLearning') : t('dashboard.reviewRecord')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 核心学习路径 */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {t('dashboard.smartLearningPath')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('dashboard.smartLearningDesc')}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link
                  to={nextLesson ? `/app/lesson/${nextLesson._id}` : "/app/dashboard"}
                  className="btn btn-primary"
                >
                  {nextLesson ? t('dashboard.startLearning') : t('dashboard.viewCourses')}
                </Link>
              </div>
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
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {stats.progressPercentage}%
            </span>
          </div>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" />
              <p className="text-gray-500 mt-4">加载课程中...</p>
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
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{t('dashboard.theoryPractice')}</span>
                          <span>{t('dashboard.duration', { minutes: lesson.duration || 15 })}</span>
                          {completed && (
                            <span className="text-green-600">{t('dashboard.mastered')}</span>
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
                            复习
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            开始学习
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
              <p>暂无课程数据</p>
              <p className="text-sm mt-2">课程数量: {lessons.length}</p>
              <p className="text-sm">加载状态: {isLoading ? '加载中' : '已完成'}</p>
              <p className="text-sm">错误信息: {error || '无'}</p>
              <p className="text-sm mt-2">请稍后再试或联系管理员</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

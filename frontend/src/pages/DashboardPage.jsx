import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useLessonStore } from '../stores/lessonStore'
import { reviewAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const DashboardPage = () => {
  const { user } = useAuthStore()
  const {
    lessons,
    isLoading,
    error,
    fetchLessons,
    getLessonStats,
    getNextLesson,
    clearError
  } = useLessonStore()

  const [reviewStats, setReviewStats] = useState(null)

  useEffect(() => {
    console.log('DEBUG: Dashboard useEffect - 开始加载数据')
    console.log('DEBUG: 当前用户:', user)
    console.log('DEBUG: 课程数量:', lessons.length)
    console.log('DEBUG: 加载状态:', isLoading)
    console.log('DEBUG: 错误信息:', error)

    fetchLessons()
    loadReviewStats()
  }, [fetchLessons])



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

  const stats = getLessonStats()
  const nextLesson = getNextLesson()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          学习面板
        </h1>
        <p className="text-gray-600">
          欢迎回来，{user?.email}！继续您的 LaTeX 学习之旅。
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
            <div className="text-base text-gray-600">已完成课程</div>
            <div className="text-sm text-gray-400 mt-1">
              共 {stats.totalLessons} 课
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.progressPercentage}%
            </div>
            <div className="text-base text-gray-600">学习进度</div>
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
            <div className="text-base text-gray-600">待复习题目</div>
            <div className="text-sm text-gray-400 mt-1">
              {reviewStats?.due_tomorrow ? `明日 ${reviewStats.due_tomorrow} 题` : '基于遗忘曲线'}
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* 今日复习 */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  今日复习
                </h3>
                <p className="text-gray-600">
                  {reviewStats?.due_today ? `${reviewStats.due_today} 题待复习` : '暂无复习任务'}
                </p>
              </div>
              <Link
                to="/reviews"
                className={`btn ${reviewStats?.due_today > 0 ? 'btn-primary' : 'btn-secondary'}`}
              >
                {reviewStats?.due_today > 0 ? '开始复习' : '查看统计'}
              </Link>
            </div>
          </div>
        </div>

        {/* LaTeX练习演示 */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  LaTeX 练习演示
                </h3>
                <p className="text-gray-600">
                  体验实时预览和练习功能
                </p>
              </div>
              <Link
                to="/practice-demo"
                className="btn btn-secondary"
              >
                体验演示
              </Link>
            </div>
          </div>
        </div>

        {/* 继续学习 */}
        {nextLesson && (
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    继续学习
                  </h3>
                  <p className="text-gray-600">
                    下一课：{nextLesson.title}
                  </p>
                </div>
                <Link
                  to={`/lesson/${nextLesson._id}`}
                  className="btn btn-primary"
                >
                  开始学习
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 课程列表 */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">课程列表</h2>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" />
              <p className="text-gray-500 mt-4">加载课程中...</p>
            </div>
          ) : lessons.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">找到 {lessons.length} 个课程</p>
              {lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  className={`lesson-item ${
                    lesson.is_completed ? 'lesson-completed' : 'lesson-pending'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 ${
                        lesson.is_completed
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-blue-600 border-blue-300 hover:border-blue-500'
                      }`}>
                        {lesson.is_completed ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className={`font-medium ${
                        lesson.is_completed
                          ? 'text-green-800'
                          : 'text-gray-900'
                      }`}>
                        {lesson.title}
                      </h3>
                      <p className={`text-base ${
                        lesson.is_completed
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}>
                        {lesson.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {lesson.is_completed && (
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        已完成
                      </span>
                    )}

                    <Link
                      to={`/lesson/${lesson._id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      {lesson.is_completed ? '复习' : '学习'}
                    </Link>
                  </div>
                </div>
              ))}
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

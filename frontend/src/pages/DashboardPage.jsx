import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useLessonStore } from '../stores/lessonStore'
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

  useEffect(() => {
    fetchLessons()
  }, [fetchLessons])

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
            <div className="text-sm text-gray-600">已完成课程</div>
            <div className="text-xs text-gray-400 mt-1">
              共 {stats.totalLessons} 课
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.progressPercentage}%
            </div>
            <div className="text-sm text-gray-600">学习进度</div>
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
            <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
            <div className="text-sm text-gray-600">待复习题目</div>
            <div className="text-xs text-gray-400 mt-1">
              复习功能开发中
            </div>
          </div>
        </div>
      </div>

      {/* 功能演示和继续学习 */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
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
              {lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        lesson.is_completed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {lesson.is_completed ? '✓' : lesson.sequence}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {lesson.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {lesson.is_completed && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
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
              <p className="text-sm mt-2">请稍后再试或联系管理员</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

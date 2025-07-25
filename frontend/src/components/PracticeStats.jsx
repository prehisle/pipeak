import { useState, useEffect } from 'react'
import { practiceAPI } from '../services/api'

const PracticeStats = () => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const response = await practiceAPI.getStats()
      setStats(response)
      setError(null)
    } catch (error) {
      console.error('加载练习统计失败:', error)
      setError('加载统计数据失败')
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'hard': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '简单'
      case 'medium': return '中等'
      case 'hard': return '困难'
      default: return difficulty
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-red-600">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
          <button
            onClick={loadStats}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">练习统计</h3>

      {/* 总体统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {stats.total_practices}
          </div>
          <div className="text-sm text-gray-600">练习题数</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {stats.correct_count}
          </div>
          <div className="text-sm text-gray-600">正确次数</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {stats.accuracy_rate}%
          </div>
          <div className="text-sm text-gray-600">正确率</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 mb-1">
            {stats.total_attempts}
          </div>
          <div className="text-sm text-gray-600">总尝试次数</div>
        </div>
      </div>

      {/* 难度统计 */}
      {Object.keys(stats.difficulty_stats).length > 0 && (
        <div className="mb-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4">按难度统计</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.difficulty_stats).map(([difficulty, data]) => (
              <div key={difficulty} className={`rounded-lg p-4 ${getDifficultyColor(difficulty)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{getDifficultyLabel(difficulty)}</span>
                  <span className="text-sm">{data.accuracy.toFixed(1)}%</span>
                </div>
                <div className="text-sm opacity-75">
                  {data.correct}/{data.total} 题正确
                </div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mt-2">
                  <div
                    className="bg-current h-2 rounded-full transition-all duration-300"
                    style={{ width: `${data.accuracy}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 最近活动 */}
      {stats.recent_activity && stats.recent_activity.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4">最近练习</h4>
          <div className="space-y-3">
            {stats.recent_activity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${activity.is_correct ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-900">{activity.lesson_title}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className={`mr-2 ${activity.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {activity.is_correct ? '✓' : '✗'}
                  </span>
                  <span>{formatDate(activity.submitted_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {stats.total_practices === 0 && (
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有练习记录</h3>
          <p className="text-gray-600">开始练习来查看您的学习统计吧！</p>
        </div>
      )}
    </div>
  )
}

export default PracticeStats

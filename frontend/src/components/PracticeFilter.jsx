import { useState, useEffect } from 'react'
import { lessonAPI } from '../services/api'

const PracticeFilter = ({ onFilterChange, currentFilters }) => {
  const [lessons, setLessons] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    try {
      const response = await lessonAPI.getLessons()
      setLessons(response.lessons || [])
    } catch (error) {
      console.error('加载课程列表失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...currentFilters,
      [filterType]: value === 'all' ? '' : value
    }
    onFilterChange(newFilters)
  }

  const clearAllFilters = () => {
    onFilterChange({
      course: '',
      difficulty: '',
      topic: ''
    })
  }

  const difficultyOptions = [
    { value: 'all', label: '全部难度' },
    { value: 'easy', label: '简单' },
    { value: 'medium', label: '中等' },
    { value: 'hard', label: '困难' }
  ]

  const getDifficultyLabel = (difficulty) => {
    const option = difficultyOptions.find(opt => opt.value === difficulty)
    return option ? option.label : difficulty
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'hard': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">筛选练习题</h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          清除筛选
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 课程筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            按课程筛选
          </label>
          <select
            value={currentFilters.course || 'all'}
            onChange={(e) => handleFilterChange('course', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">全部课程</option>
            {lessons.map((lesson) => (
              <option key={lesson._id} value={lesson._id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>

        {/* 难度筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            按难度筛选
          </label>
          <select
            value={currentFilters.difficulty || 'all'}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 状态筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            按状态筛选
          </label>
          <select
            value={currentFilters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">全部状态</option>
            <option value="completed">已完成</option>
            <option value="incomplete">未完成</option>
            <option value="attempted">已尝试</option>
          </select>
        </div>
      </div>

      {/* 当前筛选条件显示 */}
      {(currentFilters.course || currentFilters.difficulty || currentFilters.status) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">当前筛选:</span>
            
            {currentFilters.course && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {lessons.find(l => l._id === currentFilters.course)?.title || '未知课程'}
                <button
                  onClick={() => handleFilterChange('course', 'all')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            )}

            {currentFilters.difficulty && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(currentFilters.difficulty)}`}>
                {getDifficultyLabel(currentFilters.difficulty)}
                <button
                  onClick={() => handleFilterChange('difficulty', 'all')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-opacity-20"
                >
                  ×
                </button>
              </span>
            )}

            {currentFilters.status && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {currentFilters.status === 'completed' ? '已完成' : 
                 currentFilters.status === 'incomplete' ? '未完成' : '已尝试'}
                <button
                  onClick={() => handleFilterChange('status', 'all')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PracticeFilter

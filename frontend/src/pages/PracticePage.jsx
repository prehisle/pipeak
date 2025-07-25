import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { practiceAPI } from '../services/api'
import PracticeFilter from '../components/PracticeFilter'
import PracticeItemCard from '../components/PracticeItemCard'
import PracticeStats from '../components/PracticeStats'
import PracticeRecommendations from '../components/PracticeRecommendations'
import LoadingSpinner from '../components/LoadingSpinner'

const PracticePage = () => {
  const { practiceId } = useParams()
  const navigate = useNavigate()

  const [practices, setPractices] = useState([])
  const [filteredPractices, setFilteredPractices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    course: '',
    difficulty: '',
    status: '',
    search: ''
  })
  const [viewMode, setViewMode] = useState('list') // 'list' or 'stats'

  useEffect(() => {
    loadPractices()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [practices, filters])

  const loadPractices = async () => {
    try {
      setIsLoading(true)
      const response = await practiceAPI.getPracticeList()
      setPractices(response.practices || [])
      setError(null)
    } catch (error) {
      console.error('加载练习题失败:', error)
      setError('加载练习题失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...practices]

    // 按课程筛选
    if (filters.course) {
      filtered = filtered.filter(p => p.lesson_id === filters.course)
    }

    // 按难度筛选
    if (filters.difficulty) {
      filtered = filtered.filter(p => p.difficulty === filters.difficulty)
    }

    // 按状态筛选
    if (filters.status) {
      switch (filters.status) {
        case 'completed':
          filtered = filtered.filter(p => p.completed)
          break
        case 'incomplete':
          filtered = filtered.filter(p => !p.completed)
          break
        case 'attempted':
          filtered = filtered.filter(p => p.attempts > 0 && !p.completed)
          break
      }
    }

    // 按搜索词筛选
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(p =>
        p.question.toLowerCase().includes(searchLower) ||
        p.lesson_title.toLowerCase().includes(searchLower) ||
        p.target_formula.toLowerCase().includes(searchLower)
      )
    }

    setFilteredPractices(filtered)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleStartPractice = (practice) => {
    // 导航到专门的练习执行页面
    navigate(`/practice-exercise/${practice.lesson_id}?card=${practice.card_index}`)
  }

  const getStatsOverview = () => {
    const total = practices.length
    const completed = practices.filter(p => p.completed).length
    const attempted = practices.filter(p => p.attempts > 0).length
    const accuracy = attempted > 0 ? Math.round((completed / attempted) * 100) : 0

    return { total, completed, attempted, accuracy }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">{error}</p>
          </div>
          <button
            onClick={loadPractices}
            className="btn btn-primary"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  const statsOverview = getStatsOverview()

  return (
    <div className="max-w-6xl mx-auto">
      {/* 页面头部 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              练习中心
            </h1>
            <p className="text-gray-600">
              通过练习巩固LaTeX知识，提升数学公式输入技能
            </p>
          </div>

          {/* 视图切换 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              练习列表
            </button>
            <button
              onClick={() => setViewMode('stats')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'stats'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              统计分析
            </button>
          </div>
        </div>

        {/* 快速统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{statsOverview.total}</div>
            <div className="text-sm text-gray-600">总练习题</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{statsOverview.completed}</div>
            <div className="text-sm text-gray-600">已完成</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{statsOverview.attempted}</div>
            <div className="text-sm text-gray-600">已尝试</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{statsOverview.accuracy}%</div>
            <div className="text-sm text-gray-600">正确率</div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      {viewMode === 'stats' ? (
        <PracticeStats />
      ) : (
        <>
          {/* 练习建议 */}
          <PracticeRecommendations practices={practices} />

          {/* 筛选器 */}
          <PracticeFilter
            onFilterChange={handleFilterChange}
            currentFilters={filters}
          />

          {/* 练习题列表 */}
          {filteredPractices.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到练习题</h3>
              <p className="text-gray-600 mb-4">
                {Object.values(filters).some(f => f) ? '请尝试调整筛选条件' : '暂无可用的练习题'}
              </p>
              {Object.values(filters).some(f => f) && (
                <button
                  onClick={() => setFilters({ course: '', difficulty: '', status: '' })}
                  className="btn btn-secondary"
                >
                  清除筛选条件
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  显示 {filteredPractices.length} 个练习题
                  {practices.length !== filteredPractices.length && ` (共 ${practices.length} 个)`}
                </p>
              </div>

              <div className="grid gap-4">
                {filteredPractices.map((practice) => (
                  <PracticeItemCard
                    key={practice.id}
                    practice={practice}
                    onStartPractice={handleStartPractice}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PracticePage

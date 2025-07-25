import { Link } from 'react-router-dom'
import MarkdownRenderer from './MarkdownRenderer'

const PracticeItemCard = ({ practice, onStartPractice }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'hard': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
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

  const getStatusColor = (completed, attempts) => {
    if (completed) return 'text-green-600 bg-green-50'
    if (attempts > 0) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getStatusText = (completed, attempts) => {
    if (completed) return '已完成'
    if (attempts > 0) return `已尝试 ${attempts} 次`
    return '未开始'
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* 头部信息 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">
                {practice.lesson_title}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(practice.difficulty)}`}>
                {getDifficultyLabel(practice.difficulty)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {practice.question}
            </h3>
          </div>
          
          {/* 状态标识 */}
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(practice.completed, practice.attempts)}`}>
            {practice.completed && (
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {getStatusText(practice.completed, practice.attempts)}
          </div>
        </div>

        {/* 目标公式预览 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-2">目标效果：</p>
          <div className="text-center">
            <MarkdownRenderer content={practice.target_formula} />
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <span>尝试次数: {practice.attempts}</span>
            {practice.last_attempt && (
              <span>最后练习: {formatDate(practice.last_attempt)}</span>
            )}
          </div>
          {practice.hints && practice.hints.length > 0 && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {practice.hints.length} 个提示
            </span>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <Link
            to={`/lesson/${practice.lesson_id}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            查看课程 →
          </Link>
          
          <div className="flex gap-2">
            {practice.completed && (
              <Link
                to={`/practice-exercise/${practice.lesson_id}?card=${practice.card_index}`}
                className="btn btn-secondary btn-sm"
              >
                重新练习
              </Link>
            )}
            <Link
              to={`/practice-exercise/${practice.lesson_id}?card=${practice.card_index}`}
              className={`btn btn-sm ${practice.completed ? 'btn-secondary' : 'btn-primary'}`}
            >
              {practice.completed ? '再次练习' : practice.attempts > 0 ? '继续练习' : '开始练习'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PracticeItemCard

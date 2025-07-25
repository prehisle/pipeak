import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { practiceAPI } from '../services/api'
import MarkdownRenderer from './MarkdownRenderer'

const PracticeRecommendations = ({ practices }) => {
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    generateRecommendations()
  }, [practices])

  const generateRecommendations = () => {
    if (!practices || practices.length === 0) return

    const recs = []

    // 推荐未完成的练习题
    const incomplete = practices.filter(p => !p.completed)
    if (incomplete.length > 0) {
      // 按难度排序，推荐简单的开始
      const sortedByDifficulty = incomplete.sort((a, b) => {
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      })

      recs.push({
        type: 'start_easy',
        title: '从简单开始',
        description: '建议从简单的练习题开始，逐步提升难度',
        practice: sortedByDifficulty[0],
        icon: '🎯'
      })
    }

    // 推荐重做错题
    const attempted = practices.filter(p => p.attempts > 0 && !p.completed)
    if (attempted.length > 0) {
      recs.push({
        type: 'retry_failed',
        title: '重做错题',
        description: '复习之前做错的题目，巩固知识点',
        practice: attempted[0],
        icon: '🔄'
      })
    }

    // 推荐挑战困难题目
    const completed = practices.filter(p => p.completed)
    const hard = practices.filter(p => p.difficulty === 'hard' && !p.completed)
    if (completed.length >= 3 && hard.length > 0) {
      recs.push({
        type: 'challenge',
        title: '挑战困难题',
        description: '你已经掌握了基础知识，可以尝试更有挑战性的题目',
        practice: hard[0],
        icon: '🚀'
      })
    }

    // 推荐复习已完成的题目
    if (completed.length > 0) {
      const oldestCompleted = completed.sort((a, b) => 
        new Date(a.last_attempt) - new Date(b.last_attempt)
      )[0]
      
      recs.push({
        type: 'review',
        title: '复习巩固',
        description: '定期复习已完成的题目，保持知识的新鲜度',
        practice: oldestCompleted,
        icon: '📚'
      })
    }

    setRecommendations(recs.slice(0, 3)) // 最多显示3个推荐
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        💡 练习建议
      </h3>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-2xl mr-3 mt-1">
              {rec.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 mb-1">
                {rec.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {rec.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{rec.practice.lesson_title}</span>
                  <span className="mx-2">•</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    rec.practice.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    rec.practice.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {rec.practice.difficulty === 'easy' ? '简单' :
                     rec.practice.difficulty === 'medium' ? '中等' : '困难'}
                  </span>
                </div>
                
                <Link
                  to={`/practice-exercise/${rec.practice.lesson_id}?card=${rec.practice.card_index}`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  开始练习 →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PracticeRecommendations

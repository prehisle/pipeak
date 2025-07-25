import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLessonStore } from '../stores/lessonStore'
import { learningAPI, reviewAPI } from '../services/api'
import { getLearningRecommendation, needsReview } from '../utils/forgettingCurve'
import LoadingSpinner from '../components/LoadingSpinner'
import PracticeCard from '../components/PracticeCard'

const LearningPage = () => {
  const navigate = useNavigate()
  const { lessons, fetchLessons } = useLessonStore()
  const [currentTask, setCurrentTask] = useState(null)
  const [taskType, setTaskType] = useState(null) // 'review' | 'learn'
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reviewItems, setReviewItems] = useState([])
  const [recommendation, setRecommendation] = useState(null)

  useEffect(() => {
    initializeLearning()
  }, [])

  const initializeLearning = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 1. 获取课程列表
      await fetchLessons()

      // 2. 获取所有复习项目
      const allReviewItems = await reviewAPI.getAllReviewItems()
      setReviewItems(allReviewItems)

      // 3. 使用遗忘曲线算法获取学习建议
      const learningRec = getLearningRecommendation(allReviewItems)
      setRecommendation(learningRec)

      // 4. 根据建议决定当前任务
      if (learningRec.recommendation === 'review' && learningRec.dueItems > 0) {
        // 有复习任务，优先复习
        const dueItems = allReviewItems.filter(item => needsReview(item.nextReviewDate))
        setCurrentTask(dueItems[0])
        setTaskType('review')
      } else {
        // 无复习任务，继续学习新内容
        const nextLesson = await findNextLesson()
        if (nextLesson) {
          setCurrentTask(nextLesson)
          setTaskType('learn')
        } else {
          // 所有课程都已完成
          setCurrentTask(null)
          setTaskType('completed')
        }
      }
    } catch (err) {
      console.error('初始化学习失败:', err)
      setError('加载学习内容失败，请刷新重试')
    } finally {
      setIsLoading(false)
    }
  }

  const findNextLesson = async () => {
    if (!lessons || lessons.length === 0) return null

    // 找到第一个未完成的课程
    for (const lesson of lessons) {
      try {
        const status = await learningAPI.getCompletionStatus(lesson._id)
        if (!status.data || !status.data.can_complete) {
          return lesson
        }
      } catch (err) {
        console.error('检查课程状态失败:', err)
        // 如果检查失败，返回第一个课程
        return lessons[0]
      }
    }
    
    return null // 所有课程都已完成
  }

  const handleTaskComplete = async () => {
    // 任务完成后重新初始化
    await initializeLearning()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <button 
            onClick={initializeLearning}
            className="btn btn-primary"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  if (taskType === 'completed') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            恭喜完成所有课程！
          </h1>
          <p className="text-gray-600 mb-8">
            您已经掌握了所有LaTeX知识点，继续保持练习吧！
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            返回面板
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 任务类型指示 */}
      <div className="mb-6">
        {taskType === 'review' ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🔄</div>
              <div>
                <h2 className="text-lg font-semibold text-yellow-800">
                  今日复习
                </h2>
                <p className="text-yellow-700 text-sm">
                  基于遗忘曲线的智能复习，巩固已学知识
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📚</div>
              <div>
                <h2 className="text-lg font-semibold text-blue-800">
                  新课程学习
                </h2>
                <p className="text-blue-700 text-sm">
                  循序渐进的学习路径，掌握新的LaTeX知识
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 当前任务 */}
      {currentTask && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentTask.title}
            </h1>
            <p className="text-gray-600 mt-2">
              {currentTask.description}
            </p>
          </div>

          {/* 这里将显示当前的学习内容 */}
          <div className="text-center py-8 text-gray-500">
            学习内容组件将在下一步实现...
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between mt-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              返回面板
            </button>
            <button 
              onClick={handleTaskComplete}
              className="btn btn-primary"
            >
              完成任务
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LearningPage

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

      // 2. 获取所有复习项目（如果API不可用，使用空数组）
      let allReviewItems = []
      try {
        const reviewItemsResponse = await reviewAPI.getAllReviewItems()
        allReviewItems = reviewItemsResponse.items || []
      } catch (err) {
        console.warn('复习API不可用，使用降级方案:', err)
        // 降级方案：从今日复习API获取数据
        try {
          const todayReviews = await reviewAPI.getTodayReviews()
          allReviewItems = todayReviews.reviews || []
        } catch (err2) {
          console.warn('今日复习API也不可用，继续使用空数组')
        }
      }
      setReviewItems(allReviewItems)

      // 3. 使用遗忘曲线算法获取学习建议
      const learningRec = getLearningRecommendation(allReviewItems)
      setRecommendation(learningRec)

      // 4. 根据建议决定当前任务
      if (learningRec.recommendation === 'review' && learningRec.dueItems > 0) {
        // 有复习任务，优先复习
        const dueItems = allReviewItems.filter(item => needsReview(item.nextReviewDate))
        if (dueItems.length > 0) {
          setCurrentTask(dueItems[0])
          setTaskType('review')
        } else {
          // 降级到学习新内容
          const nextLesson = await findNextLesson()
          if (nextLesson) {
            setCurrentTask(nextLesson)
            setTaskType('learn')
          } else {
            setCurrentTask(null)
            setTaskType('completed')
          }
        }
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
      const errorMessage = typeof err === 'string' ? err :
                          err?.message || '加载学习内容失败，请刷新重试'
      setError(errorMessage)
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

        // 检查课程是否已经完成（用户已标记完成）
        if (!status.data || !status.data.is_already_completed) {
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
          <div className="text-red-600 mb-4">❌ {typeof error === 'string' ? error : '加载失败，请重试'}</div>
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
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              恭喜完成所有课程！
            </h1>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              您已经掌握了所有LaTeX知识点，可以开始复习巩固或查看学习统计。
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/review')}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                开始复习
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                查看统计
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 学习任务卡片 */}
      {currentTask && typeof currentTask === 'object' && (
        <div className="max-w-2xl mx-auto">
          {/* 任务类型指示 */}
          <div className="text-center mb-6">
            {taskType === 'review' ? (
              <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                <span className="text-lg mr-2">🔄</span>
                今日复习 · 基于遗忘曲线的智能复习
              </div>
            ) : (
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <span className="text-lg mr-2">📚</span>
                新课程学习 · 循序渐进掌握LaTeX
              </div>
            )}
          </div>

          {/* 主要内容卡片 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* 课程信息 */}
            <div className="p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {taskType === 'review' ?
                  (typeof currentTask.lesson_title === 'string' ? currentTask.lesson_title :
                   typeof currentTask.title === 'string' ? currentTask.title : '复习课程') :
                  (typeof currentTask.title === 'string' ? currentTask.title : '学习课程')
                }
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {taskType === 'review' ?
                  `复习练习：${typeof currentTask.question === 'string' ? currentTask.question : '巩固已学知识'}` :
                  (typeof currentTask.description === 'string' ? currentTask.description : '开始学习新课程')
                }
              </p>

              {/* 学习进度指示 */}
              {taskType === 'learn' && (
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    当前学习任务
                    <span className="mx-2">·</span>
                    预计15分钟
                  </div>
                </div>
              )}

              {/* 主要操作按钮 */}
              <button
                onClick={() => navigate(taskType === 'review' ?
                  `/lesson/${currentTask.lesson_id}` :
                  `/lesson/${currentTask._id}`
                )}
                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
              >
                {taskType === 'review' ? '开始复习' : '开始学习'}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* 底部操作区 */}
            <div className="bg-gray-50 px-8 py-4 flex justify-between items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                ← 返回统计
              </button>

              <div className="text-sm text-gray-500">
                智能学习路径 · 零选择困难
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LearningPage

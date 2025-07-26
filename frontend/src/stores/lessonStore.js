import { create } from 'zustand'
import { lessonAPI } from '../services/api'
import i18n from '../i18n'
import { calculateLessonStats, getNextLesson, isLessonCompleted } from '../utils/progressCalculator'
import localStorageManager from '../utils/localStorage'

const useLessonStore = create((set, get) => ({
  // 状态
  lessons: [],
  currentLesson: null,
  isLoading: false,
  error: null,

  // 动作
  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  // 初始化存储事件监听
  initializeStorageListener: () => {
    const handleStorageChange = () => {
      // 当 localStorage 发生变化时，重新获取课程数据
      const { fetchLessons } = get()
      fetchLessons()
    }

    // 监听存储变化事件
    window.addEventListener('storage', handleStorageChange)

    // 返回清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  },

  // 获取课程列表
  fetchLessons: async () => {
    set({ isLoading: true, error: null })
    console.log('DEBUG: fetchLessons 开始')

    try {
      const result = await lessonAPI.getLessons()
      console.log('DEBUG: lessonAPI.getLessons 结果:', result)

      console.log('DEBUG: 课程数据:', result)
      console.log('DEBUG: 课程数量:', result.lessons?.length || 0)
      set({
        lessons: result.lessons || [],
        isLoading: false,
        error: null
      })
      return { success: true }
    } catch (error) {
      const errorMessage = i18n.t('dashboard.apiError')
      set({
        isLoading: false,
        error: errorMessage,
        lessons: []
      })
      return { success: false, error: errorMessage }
    }
  },

  // 获取特定课程详情
  fetchLesson: async (lessonId) => {
    set({ isLoading: true, error: null })
    
    try {
      const result = await lessonAPI.getLesson(lessonId)

      set({
        currentLesson: result.lesson,
        isLoading: false,
        error: null
      })
      return { success: true, lesson: result.lesson }
    } catch (error) {
      const errorMessage = '获取课程详情失败'
      set({
        isLoading: false,
        error: errorMessage,
        currentLesson: null
      })
      return { success: false, error: errorMessage }
    }
  },

  // 标记课程完成
  completeLesson: async (lessonId) => {
    try {
      const result = await lessonAPI.completeLesson(lessonId)

      // 更新本地状态
      const { lessons, currentLesson } = get()

      // 更新课程列表中的完成状态
      const updatedLessons = lessons.map(lesson =>
        lesson._id === lessonId
          ? { ...lesson, is_completed: true }
          : lesson
      )

      // 更新当前课程的完成状态
      const updatedCurrentLesson = currentLesson && currentLesson._id === lessonId
        ? { ...currentLesson, is_completed: true }
        : currentLesson

      set({
        lessons: updatedLessons,
        currentLesson: updatedCurrentLesson
      })

      return { success: true }
    } catch (error) {
      const errorMessage = '标记课程完成失败'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  // 清除当前课程
  clearCurrentLesson: () => set({ currentLesson: null }),

  // 获取课程统计信息（使用统一的计算工具）
  getLessonStats: () => {
    const { lessons } = get()
    return calculateLessonStats(lessons)
  },

  // 获取下一个未完成的课程（使用统一的计算工具）
  getNextLesson: () => {
    const { lessons } = get()
    return getNextLesson(lessons)
  },

  // 检查课程是否已完成（使用统一的计算工具）
  isLessonCompleted: (lessonId) => {
    const { lessons } = get()
    return isLessonCompleted(lessonId, lessons)
  },

  // 获取综合数据摘要（统一的数据源）
  getDataSummary: () => {
    const { lessons } = get()
    const practiceRecords = localStorageManager.getPracticeRecords()
    const reviewData = localStorageManager.getReviewData()

    const lessonStats = calculateLessonStats(lessons)
    const practiceStats = localStorageManager.getPracticeStats()

    return {
      // 课程相关
      lessonsCompleted: lessonStats.completedLessons,
      totalLessons: lessonStats.totalLessons,
      progressPercentage: lessonStats.progressPercentage,

      // 练习相关
      practiceAttempts: practiceRecords.length,
      correctAttempts: practiceStats.correct,
      accuracy: practiceStats.accuracy,

      // 复习相关
      reviewItems: Object.keys(reviewData).length,

      // 数据存在性
      hasData: lessons.length > 0 || practiceRecords.length > 0 || Object.keys(reviewData).length > 0
    }
  }
}))

export { useLessonStore }

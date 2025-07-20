import { create } from 'zustand'
import lessonService from '../services/lessonService'

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

  // 获取课程列表
  fetchLessons: async () => {
    set({ isLoading: true, error: null })
    console.log('DEBUG: fetchLessons 开始')

    try {
      const result = await lessonService.getLessons()
      console.log('DEBUG: lessonService.getLessons 结果:', result)

      if (result.success) {
        console.log('DEBUG: 课程数据:', result.data)
        console.log('DEBUG: 课程数量:', result.data.lessons?.length || 0)
        set({
          lessons: result.data.lessons || [],
          isLoading: false,
          error: null
        })
        return { success: true }
      } else {
        console.log('DEBUG: 获取课程失败:', result.error)
        set({
          isLoading: false,
          error: result.error,
          lessons: []
        })
        return { success: false, error: result.error }
      }
    } catch (error) {
      const errorMessage = '获取课程列表失败'
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
      const result = await lessonService.getLesson(lessonId)
      
      if (result.success) {
        set({
          currentLesson: result.data.lesson,
          isLoading: false,
          error: null
        })
        return { success: true, lesson: result.data.lesson }
      } else {
        set({
          isLoading: false,
          error: result.error,
          currentLesson: null
        })
        return { success: false, error: result.error }
      }
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
      const result = await lessonService.completeLesson(lessonId)
      
      if (result.success) {
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
      } else {
        set({ error: result.error })
        return { success: false, error: result.error }
      }
    } catch (error) {
      const errorMessage = '标记课程完成失败'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  // 清除当前课程
  clearCurrentLesson: () => set({ currentLesson: null }),

  // 获取课程统计信息
  getLessonStats: () => {
    const { lessons } = get()
    const totalLessons = lessons.length
    const completedLessons = lessons.filter(lesson => lesson.is_completed).length
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    
    return {
      totalLessons,
      completedLessons,
      progressPercentage
    }
  },

  // 获取下一个未完成的课程
  getNextLesson: () => {
    const { lessons } = get()
    return lessons.find(lesson => !lesson.is_completed) || null
  }
}))

export { useLessonStore }

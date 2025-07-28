import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '../i18n'
import { lessonAPI } from '../services/api'

// 获取当前用户ID用于数据隔离
const getCurrentUserId = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const authData = JSON.parse(authStorage)
      return authData.state?.user?.email || 'anonymous'
    }
  } catch (error) {
    console.warn('获取用户ID失败:', error)
  }
  return 'anonymous'
}

// 检查是否为注册用户
const isRegisteredUser = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (!authStorage) return false

    const authData = JSON.parse(authStorage)
    return !!(authData.state?.accessToken && authData.state?.user)
  } catch (e) {
    return false
  }
}

// 课程进度存储 - 仅管理学习进度，课程数据从API获取
const useFrontendLessonStore = create(
  persist(
    (set, get) => ({
      // 状态
      currentLanguage: 'zh-CN',
      lessons: [], // 从API获取的课程数据
      currentLesson: null,
      currentKnowledgePointIndex: 0,
      isLoading: false,
      error: null,

      // 学习进度 - 存储在本地
      progress: {
        completedLessons: [], // 已完成的课程ID列表
        completedKnowledgePoints: [], // 已完成的知识点ID列表
        lessonProgress: {}, // 每个课程的详细进度 { lessonId: { completed: boolean, knowledgePoints: [...] } }
      },

      // 动作
      // 从API获取课程数据
      fetchLessons: async () => {
        if (!isRegisteredUser()) {
          console.log('未登录用户，跳过课程数据获取')
          set({ lessons: [], error: null, isLoading: false })
          return
        }

        set({ isLoading: true, error: null })
        try {
          const response = await lessonAPI.getLessons()
          const lessons = response.lessons || []
          set({ lessons, isLoading: false, error: null })
          console.log(`从后端API获取了 ${lessons.length} 个课程`)
        } catch (error) {
          console.error('获取课程数据失败:', error)
          const errorMessage = error.message || '网络连接失败，请检查网络设置或稍后重试'
          set({
            lessons: [],
            error: errorMessage,
            isLoading: false
          })
        }
      },

      // 设置语言
      setLanguage: (language) => {
        set({ currentLanguage: language })
        // 如果是注册用户，重新获取课程数据
        if (isRegisteredUser()) {
          get().fetchLessons()
        }
      },

      // 设置当前课程
      setCurrentLesson: (lessonId) => {
        const { lessons } = get()
        const lesson = lessons ? lessons.find(l => l.id === lessonId) : null
        set({
          currentLesson: lesson,
          currentKnowledgePointIndex: 0
        })
      },

      // 设置当前知识点索引
      setCurrentKnowledgePointIndex: (index) => {
        set({ currentKnowledgePointIndex: index })
      },

      // 标记知识点为已完成
      completeKnowledgePoint: (lessonId, knowledgePointId) => {
        set((state) => {
          // 确保 progress 对象和其属性存在
          const progress = state.progress || {}
          const completedKnowledgePoints = progress.completedKnowledgePoints || []
          const lessonProgress = progress.lessonProgress || {}

          const newCompletedKnowledgePoints = [...completedKnowledgePoints]
          if (!newCompletedKnowledgePoints.includes(knowledgePointId)) {
            newCompletedKnowledgePoints.push(knowledgePointId)
          }

          // 更新课程进度
          const newLessonProgress = { ...lessonProgress }
          if (!newLessonProgress[lessonId]) {
            newLessonProgress[lessonId] = { completed: false, knowledgePoints: [] }
          }

          // 确保 knowledgePoints 数组存在
          if (!newLessonProgress[lessonId].knowledgePoints) {
            newLessonProgress[lessonId].knowledgePoints = []
          }

          if (!newLessonProgress[lessonId].knowledgePoints.includes(knowledgePointId)) {
            newLessonProgress[lessonId].knowledgePoints.push(knowledgePointId)
          }

          return {
            progress: {
              ...state.progress,
              completedKnowledgePoints: newCompletedKnowledgePoints,
              lessonProgress: newLessonProgress
            }
          }
        })
      },

      // 标记课程为已完成
      completeLesson: async (lessonId) => {
        // 先更新本地状态
        set((state) => {
          const newCompletedLessons = [...state.progress.completedLessons]
          if (!newCompletedLessons.includes(lessonId)) {
            newCompletedLessons.push(lessonId)
          }

          // 更新课程进度
          const newLessonProgress = { ...state.progress.lessonProgress }
          if (!newLessonProgress[lessonId]) {
            newLessonProgress[lessonId] = { completed: true, knowledgePoints: [] }
          } else {
            newLessonProgress[lessonId].completed = true
          }

          return {
            progress: {
              ...state.progress,
              completedLessons: newCompletedLessons,
              lessonProgress: newLessonProgress
            }
          }
        })

        // 注册用户同步到后端API
        if (isRegisteredUser()) {
          try {
            console.log('同步课程完成状态到后端:', lessonId)
            await lessonAPI.completeLesson(lessonId)
            console.log('课程完成状态同步成功')
          } catch (error) {
            console.error('同步课程完成状态到后端失败:', error)
            // 可以考虑显示错误提示或重试机制
          }
        }
      },

      // 获取学习统计
      getStats: () => {
        const { lessons, progress } = get()
        const totalLessons = lessons ? lessons.length : 0
        const completedLessons = progress.completedLessons.length
        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

        return {
          totalLessons,
          completedLessons,
          progressPercentage
        }
      },

      // 获取下一个未完成的课程
      getNextLesson: () => {
        const { lessons, progress } = get()
        if (!lessons || lessons.length === 0) return null
        return lessons.find(lesson => !progress.completedLessons.includes(lesson.id)) || null
      },

      // 检查课程是否已完成
      isLessonCompleted: (lessonId) => {
        const { progress } = get()
        return progress.completedLessons.includes(lessonId)
      },

      // 检查知识点是否已完成
      isKnowledgePointCompleted: (knowledgePointId) => {
        const { progress } = get()
        return progress.completedKnowledgePoints.includes(knowledgePointId)
      },

      // 获取课程的知识点完成情况
      getLessonProgress: (lessonId) => {
        const { progress, lessons } = get()
        const lesson = lessons ? lessons.find(l => l.id === lessonId) : null
        if (!lesson) return { completed: 0, total: 0, percentage: 0 }

        const total = lesson.knowledgePoints.length
        const completed = lesson.knowledgePoints.filter(kp => 
          progress.completedKnowledgePoints.includes(kp.id)
        ).length
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

        return { completed, total, percentage }
      },

      // 重置所有进度（用于测试）
      resetProgress: () => {
        set({
          progress: {
            completedLessons: [],
            completedKnowledgePoints: [],
            lessonProgress: {}
          }
        })
      },

      // 清理用户数据（用户登出时调用）
      clearUserData: () => {
        set({
          progress: {
            completedLessons: [],
            completedKnowledgePoints: [],
            lessonProgress: {},
          }
        })
      },

      // 从后端API加载进度数据（注册用户）
      loadProgressFromAPI: async () => {
        if (!isRegisteredUser()) {
          console.log('非注册用户，跳过API加载')
          return
        }

        try {
          console.log('正在从后端API加载进度数据...')
          const response = await lessonAPI.getLessons()
          const lessons = response.lessons || []

          // 提取已完成的课程ID - 使用后端真实ID
          const completedLessons = lessons
            .filter(lesson => lesson.is_completed)
            .map(lesson => lesson._id)

          // 构建课程进度对象 - 使用后端真实ID作为键
          const lessonProgress = {}
          lessons.forEach(lesson => {
            lessonProgress[lesson._id] = {
              completed: lesson.is_completed || false,
              completedAt: lesson.completedAt || null,
              practiceProgress: lesson.practiceProgress || {},
              sequence: lesson.sequence // 保存序号用于排序
            }
          })

          // 更新store状态
          set(state => ({
            ...state,
            progress: {
              ...state.progress,
              completedLessons,
              lessonProgress
            }
          }))

          console.log('后端进度数据加载完成:', { completedLessons, lessonProgress })
        } catch (error) {
          console.error('从后端API加载进度失败:', error)
        }
      }
    }),
    {
      name: 'frontend-lesson-storage',
      partialize: (state) => {
        // 注册用户不持久化progress到localStorage，只持久化语言设置
        if (isRegisteredUser()) {
          return {
            currentLanguage: state.currentLanguage
          }
        }
        // 游客用户持久化所有数据到localStorage
        return {
          progress: state.progress,
          currentLanguage: state.currentLanguage
        }
      },
      // 自定义存储，支持用户隔离
      storage: {
        getItem: (name) => {
          const userId = getCurrentUserId()
          const key = `${name}-${userId}`
          const item = localStorage.getItem(key)
          return item
        },
        setItem: (name, value) => {
          const userId = getCurrentUserId()
          const key = `${name}-${userId}`
          // value已经是JSON字符串，直接存储
          localStorage.setItem(key, value)
        },
        removeItem: (name) => {
          const userId = getCurrentUserId()
          const key = `${name}-${userId}`
          localStorage.removeItem(key)
        }
      }
    }
  )
)

export default useFrontendLessonStore

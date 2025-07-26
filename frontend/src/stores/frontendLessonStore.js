import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { comprehensiveLessonsData } from '../data/comprehensiveLessons'
import { lessonsDataEN } from '../data/lessons-en'
import i18n from '../i18n'

// 前端课程存储 - 管理课程数据和学习进度
const useFrontendLessonStore = create(
  persist(
    (set, get) => ({
      // 状态
      currentLanguage: 'zh-CN',
      lessons: [],
      currentLesson: null,
      currentKnowledgePointIndex: 0,
      
      // 学习进度 - 存储在本地
      progress: {
        completedLessons: [], // 已完成的课程ID列表
        completedKnowledgePoints: [], // 已完成的知识点ID列表
        lessonProgress: {}, // 每个课程的详细进度 { lessonId: { completed: boolean, knowledgePoints: [...] } }
      },

      // 动作
      // 获取课程数据的辅助函数
      getLessonsData: (language) => {
        if (language === 'en-US') {
          return lessonsDataEN
        }
        return comprehensiveLessonsData[language] || comprehensiveLessonsData['zh-CN']
      },

      // 设置语言并重新加载课程数据
      setLanguage: (language) => {
        const { getLessonsData } = get()
        const lessons = getLessonsData(language)
        const state = get()
        const currentLessonId = state.currentLesson?.id
        set({
          currentLanguage: language,
          lessons: lessons,
          currentLesson: currentLessonId ? lessons.find(l => l.id === currentLessonId) : null
        })
      },

      // 初始化课程数据
      initializeLessons: (language) => {
        const { getLessonsData } = get()
        // 如果没有指定语言，使用i18n的当前语言
        const currentLang = language || i18n.language || 'zh-CN'
        const lessons = getLessonsData(currentLang)
        console.log('初始化课程数据，语言:', currentLang, '课程数量:', lessons.length)
        set({
          currentLanguage: currentLang,
          lessons: lessons
        })
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
          const newCompletedKnowledgePoints = [...state.progress.completedKnowledgePoints]
          if (!newCompletedKnowledgePoints.includes(knowledgePointId)) {
            newCompletedKnowledgePoints.push(knowledgePointId)
          }

          // 更新课程进度
          const newLessonProgress = { ...state.progress.lessonProgress }
          if (!newLessonProgress[lessonId]) {
            newLessonProgress[lessonId] = { completed: false, knowledgePoints: [] }
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
      completeLesson: (lessonId) => {
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
      }
    }),
    {
      name: 'frontend-lesson-storage',
      partialize: (state) => ({ 
        progress: state.progress,
        currentLanguage: state.currentLanguage 
      })
    }
  )
)

export default useFrontendLessonStore

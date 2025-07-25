import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import localStorageManager from '../utils/localStorage'

/**
 * 用户模式状态管理
 * 管理游客模式和注册用户模式的切换
 */
const useUserModeStore = create(
  persist(
    (set, get) => ({
      // 状态
      isGuestMode: true,
      guestProfile: null,
      showGuestPrompt: true,
      
      // 动作
      
      /**
       * 初始化用户模式
       */
      initializeUserMode: () => {
        const isGuest = localStorageManager.isGuestMode()
        const guestProfile = isGuest ? localStorageManager.getGuestProfile() : null
        
        set({
          isGuestMode: isGuest,
          guestProfile,
          showGuestPrompt: isGuest
        })
      },

      /**
       * 切换到游客模式
       */
      switchToGuestMode: () => {
        const guestProfile = localStorageManager.getGuestProfile()
        localStorageManager.setGuestMode(true)
        
        set({
          isGuestMode: true,
          guestProfile,
          showGuestPrompt: true
        })
      },

      /**
       * 切换到注册用户模式
       */
      switchToUserMode: (user) => {
        localStorageManager.setGuestMode(false)
        
        set({
          isGuestMode: false,
          guestProfile: null,
          showGuestPrompt: false
        })
      },

      /**
       * 更新游客资料
       */
      updateGuestProfile: (updates) => {
        const { guestProfile } = get()
        const updatedProfile = { ...guestProfile, ...updates }
        
        localStorageManager.setGuestProfile(updatedProfile)
        set({ guestProfile: updatedProfile })
      },

      /**
       * 隐藏游客提示
       */
      hideGuestPrompt: () => {
        set({ showGuestPrompt: false })
      },

      /**
       * 显示游客提示
       */
      showGuestPromptAgain: () => {
        set({ showGuestPrompt: true })
      },

      /**
       * 获取当前用户信息
       */
      getCurrentUser: () => {
        const { isGuestMode, guestProfile } = get()
        
        if (isGuestMode) {
          return guestProfile
        }
        
        // 如果是注册用户，从authStore获取
        return null
      },

      /**
       * 检查是否有本地数据
       */
      hasLocalData: () => {
        const lessonProgress = localStorageManager.getLessonProgress()
        const practiceRecords = localStorageManager.getPracticeRecords()
        const reviewData = localStorageManager.getReviewData()
        
        return (
          Object.keys(lessonProgress).length > 0 ||
          practiceRecords.length > 0 ||
          Object.keys(reviewData).length > 0
        )
      },

      /**
       * 获取本地数据摘要
       */
      getLocalDataSummary: () => {
        const lessonProgress = localStorageManager.getLessonProgress()
        const practiceRecords = localStorageManager.getPracticeRecords()
        const reviewData = localStorageManager.getReviewData()
        const stats = localStorageManager.getPracticeStats()
        
        // 计算真正完成的课程数量（与 lessonStore 保持一致）
        const completedLessons = Object.values(lessonProgress).filter(progress => progress.isCompleted).length

        return {
          lessonsCompleted: completedLessons,
          practiceAttempts: practiceRecords.length,
          reviewItems: Object.keys(reviewData).length,
          accuracy: stats.accuracy,
          hasData: Object.keys(lessonProgress).length > 0 || practiceRecords.length > 0
        }
      },

      /**
       * 导出本地数据
       */
      exportLocalData: () => {
        return localStorageManager.exportAllData()
      },

      /**
       * 清除本地数据
       */
      clearLocalData: () => {
        return localStorageManager.clearAll()
      },

      /**
       * 获取存储信息
       */
      getStorageInfo: () => {
        return localStorageManager.getStorageInfo()
      }
    }),
    {
      name: 'user-mode-storage',
      partialize: (state) => ({
        showGuestPrompt: state.showGuestPrompt
      })
    }
  )
)

export { useUserModeStore }

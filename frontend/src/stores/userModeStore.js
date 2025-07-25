import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import localStorageManager from '../utils/localStorage'

/**
 * 用户模式状态管理
 * 管理注册用户的状态（移除游客模式）
 */
const useUserModeStore = create(
  persist(
    (set, get) => ({
      // 状态
      isGuestMode: false, // 移除游客模式
      guestProfile: null,
      showGuestPrompt: false,
      
      // 动作
      
      /**
       * 初始化用户模式（移除游客模式）
       */
      initializeUserMode: () => {
        // 不再支持游客模式，始终设置为注册用户模式
        set({
          isGuestMode: false,
          guestProfile: null,
          showGuestPrompt: false
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
       * 获取本地数据摘要（已弃用，请使用 lessonStore.getDataSummary）
       * @deprecated 使用 lessonStore.getDataSummary() 替代
       */
      getLocalDataSummary: () => {
        console.warn('userModeStore.getLocalDataSummary() 已弃用，请使用 lessonStore.getDataSummary()')

        // 为了向后兼容，暂时保留此方法，但建议使用 lessonStore
        const lessonProgress = localStorageManager.getLessonProgress()
        const practiceRecords = localStorageManager.getPracticeRecords()
        const reviewData = localStorageManager.getReviewData()
        const stats = localStorageManager.getPracticeStats()

        // 注意：这里的计算可能与 lessonStore 不一致，建议迁移到 lessonStore.getDataSummary()
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

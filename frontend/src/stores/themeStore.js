import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set, get) => ({
      // 状态
      theme: 'light', // 'light' | 'dark'
      
      // 动作
      setTheme: (theme) => {
        set({ theme })
        // 更新HTML根元素的class
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      toggleTheme: () => {
        const { theme, setTheme } = get()
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
      },
      
      // 初始化主题
      initializeTheme: () => {
        const { theme } = get()
        
        // 检查系统偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        
        // 如果没有保存的主题偏好，使用系统偏好
        if (!localStorage.getItem('theme-storage')) {
          const systemTheme = prefersDark ? 'dark' : 'light'
          get().setTheme(systemTheme)
        } else {
          // 应用保存的主题
          get().setTheme(theme)
        }
        
        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          // 只有在用户没有手动设置主题时才跟随系统
          const hasManualTheme = localStorage.getItem('theme-storage')
          if (!hasManualTheme) {
            const systemTheme = e.matches ? 'dark' : 'light'
            get().setTheme(systemTheme)
          }
        })
      }
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme })
    }
  )
)

export { useThemeStore }

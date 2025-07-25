import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'
import { demoAPI, isDemoMode } from '../services/demoApi'
import { useUserModeStore } from './userModeStore'
import localStorageManager from '../utils/localStorage'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // 状态
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      // 动作
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      // 获取当前用户（包括游客用户）
      getCurrentUser: () => {
        const { user } = get()

        // 如果有注册用户，返回注册用户
        if (user) return user

        // 检查是否为游客模式
        try {
          const userModeStore = useUserModeStore.getState()
          if (userModeStore.isGuestMode) {
            return userModeStore.guestProfile || localStorageManager.getGuestProfile()
          }
        } catch (e) {
          // 如果userModeStore未初始化，直接检查localStorage
          if (localStorageManager.isGuestMode()) {
            return localStorageManager.getGuestProfile()
          }
        }

        return null
      },

      // 检查是否已认证（包括游客模式）
      isAuthenticated: () => {
        const { user } = get()
        if (user) return true

        // 游客模式也算已认证
        try {
          const userModeStore = useUserModeStore.getState()
          return userModeStore.isGuestMode
        } catch (e) {
          return localStorageManager.isGuestMode()
        }
      },

      // 初始化认证头
      initializeAuth: () => {
        const { accessToken } = get()
        if (accessToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        }
      },

      // 登录
      login: async (email, password) => {
        set({ isLoading: true, error: null })

        try {
          let response

          if (isDemoMode()) {
            // 演示模式：使用demoAPI
            response = await demoAPI.auth.login({ email, password })
          } else {
            // 正常模式：使用真实API
            const apiResponse = await api.post('/auth/login', { email, password })
            response = apiResponse.data
          }

          const { user, access_token, refresh_token } = response

          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isLoading: false,
            error: null
          })

          // 设置API默认认证头（仅在非演示模式下）
          if (!isDemoMode()) {
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          }

          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || '登录失败'
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            accessToken: null,
            refreshToken: null
          })
          return { success: false, error: errorMessage }
        }
      },

      // 注册
      register: async (email, password) => {
        set({ isLoading: true, error: null })

        try {
          let response

          if (isDemoMode()) {
            // 演示模式：使用demoAPI
            response = await demoAPI.auth.register({ email, password })
          } else {
            // 正常模式：使用真实API
            const apiResponse = await api.post('/auth/register', { email, password })
            response = apiResponse.data
          }

          const { user, access_token, refresh_token } = response

          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isLoading: false,
            error: null
          })

          // 设置API默认认证头（仅在非演示模式下）
          if (!isDemoMode()) {
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          }

          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || '注册失败'
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            accessToken: null,
            refreshToken: null
          })
          return { success: false, error: errorMessage }
        }
      },

      // 登出
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null
        })
        
        // 清除API认证头
        delete api.defaults.headers.common['Authorization']
      },

      // 检查认证状态
      checkAuth: async () => {
        // 演示模式下跳过认证检查
        if (isDemoMode()) {
          set({ isLoading: false })
          return
        }

        const { accessToken } = get()

        if (!accessToken) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true })

        try {
          // 设置认证头
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

          // 验证token并获取用户信息
          const response = await api.get('/auth/me')
          const { user } = response.data

          set({
            user,
            isLoading: false,
            error: null
          })
        } catch (error) {
          // Token无效，清除认证信息
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: null
          })

          delete api.defaults.headers.common['Authorization']
        }
      },

      // 刷新token
      refreshAccessToken: async () => {
        const { refreshToken } = get()
        
        if (!refreshToken) {
          return false
        }
        
        try {
          const response = await api.post('/auth/refresh', {}, {
            headers: {
              'Authorization': `Bearer ${refreshToken}`
            }
          })
          
          const { access_token } = response.data
          
          set({ accessToken: access_token })
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          
          return true
        } catch (error) {
          // 刷新失败，清除所有认证信息
          get().logout()
          return false
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      })
    }
  )
)

export { useAuthStore }

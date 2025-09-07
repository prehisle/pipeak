import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'
import { useUserModeStore } from './userModeStore'
import localStorageManager from '../utils/localStorage'
import i18n from '../i18n'
import axios from 'axios'

// 错误信息国际化映射
const getLocalizedErrorMessage = (errorMessage) => {
  // 常见错误信息映射
  const errorMap = {
    '该邮箱已被注册': 'auth.emailAlreadyExists',
    '邮箱或密码错误': 'auth.invalidCredentials',
    '登录失败': 'auth.loginFailed',
    '注册失败': 'auth.registerFailed',
    'Email already exists': 'auth.emailAlreadyExists',
    'Invalid credentials': 'auth.invalidCredentials',
    'Login failed': 'auth.loginFailed',
    'Registration failed': 'auth.registerFailed'
  }

  // 如果找到映射，返回翻译后的文本
  if (errorMap[errorMessage]) {
    return i18n.t(errorMap[errorMessage])
  }

  // 如果是网络错误
  if (errorMessage.includes('Network') || errorMessage.includes('网络')) {
    return i18n.t('auth.networkError')
  }

  // 默认返回原始错误信息
  return errorMessage
}

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

      // 获取当前用户（仅注册用户）
      getCurrentUser: () => {
        const { user } = get()
        return user || null
      },

      // 检查是否已认证（仅注册用户）
      isAuthenticated: () => {
        const { user } = get()
        return !!user
      },

      // 检查是否已认证（移除游客模式支持）
      isAuthenticatedOrGuest: () => {
        const { user } = get()
        return !!user
      },

      // 初始化认证状态
      initializeAuth: () => {
        try {
          // 检查Zustand persist存储的认证数据
          const authStorage = localStorage.getItem('auth-storage')
          if (!authStorage) {
            // 清理可能存在的旧版本数据
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_data')
            return
          }

          const authData = JSON.parse(authStorage)
          const { user, accessToken } = authData.state || {}

          if (accessToken && user) {
            // 验证用户数据的完整性
            if (user.email && typeof user.email === 'string') {
              set({
                user,
                accessToken,
                isLoading: false,
                error: null
              })

              // 设置API认证头
              api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
              console.log('从localStorage恢复用户状态:', user.email)
            } else {
              throw new Error('用户数据不完整')
            }
          }
        } catch (error) {
          console.error('恢复用户状态失败:', error)
          // 清理无效数据
          localStorage.removeItem('auth-storage')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')

          // 重置状态
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: null
          })
        }
      },

      // 登录
      login: async (email, password) => {
        set({ isLoading: true, error: null })

        try {
          // 使用真实API进行登录
          const apiResponse = await api.post('/auth/login', { email, password })
          const { user, access_token, refresh_token } = apiResponse.data

          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isLoading: false,
            error: null
          })

          // 设置API默认认证头
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

          return { success: true }
        } catch (error) {
          const rawErrorMessage = error.response?.data?.message || error.message || '登录失败'
          const localizedErrorMessage = getLocalizedErrorMessage(rawErrorMessage)
          set({
            isLoading: false,
            error: localizedErrorMessage,
            user: null,
            accessToken: null,
            refreshToken: null
          })
          return { success: false, error: localizedErrorMessage }
        }
      },

      // OAuth登录 - 直接使用OAuth响应的token和用户信息
      loginWithOAuth: async (access_token, user, refresh_token = null) => {
        set({ isLoading: true, error: null })

        try {
          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isLoading: false,
            error: null
          })

          // 设置API默认认证头
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

          return { success: true }
        } catch (error) {
          set({
            isLoading: false,
            error: 'OAuth登录失败',
            user: null,
            accessToken: null,
            refreshToken: null
          })
          return { success: false, error: 'OAuth登录失败' }
        }
      },

      // 注册
      register: async (email, password) => {
        set({ isLoading: true, error: null })

        try {
          // 使用真实API进行注册
          const apiResponse = await api.post('/auth/register', { email, password })
          const { user, access_token, refresh_token } = apiResponse.data

          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isLoading: false,
            error: null
          })

          // 设置API默认认证头
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

          return { success: true }
        } catch (error) {
          const rawErrorMessage = error.response?.data?.message || error.message || '注册失败'
          const localizedErrorMessage = getLocalizedErrorMessage(rawErrorMessage)
          set({
            isLoading: false,
            error: localizedErrorMessage,
            user: null,
            accessToken: null,
            refreshToken: null
          })
          return { success: false, error: localizedErrorMessage }
        }
      },

      // 登出
      logout: () => {
        // 获取当前用户ID用于清理数据
        const currentUserId = get().user?.email || 'anonymous'

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null
        })

        // 清除API认证头
        delete api.defaults.headers.common['Authorization']

        // 清理所有认证相关的localStorage数据
        localStorage.removeItem('auth-storage')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')

        // 清理用户特定的lesson数据
        localStorage.removeItem(`frontend-lesson-storage-${currentUserId}`)

        // 清理旧的存储键（如果存在）
        localStorage.removeItem('frontend-lesson-storage')
        localStorage.removeItem('() => `frontend-lesson-storage-${getCurrentUserId()}`')
      },

      // 清理测试数据（开发用）
      clearTestData: () => {
        console.log('清理测试数据...')

        // 清理认证数据
        localStorage.removeItem('auth-storage')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')

        // 重置状态
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false,
          error: null
        })

        // 清除API认证头
        delete api.defaults.headers.common['Authorization']

        console.log('测试数据已清理')
      },

      // 检查认证状态
      checkAuth: async () => {
        const { accessToken, user } = get()

        if (!accessToken) {
          set({ isLoading: false })
          return
        }

        // 如果已经有用户数据，跳过API验证（避免在测试或离线模式下出错）
        if (user) {
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
          console.warn('Token验证失败，可能是API服务器未运行:', error.message)

          // 如果是网络错误且有token，保持当前状态（可能是离线模式）
          if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
            set({ isLoading: false })
            return
          }

          // 其他错误，清除认证信息
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
          console.log('No refresh token available')
          return false
        }
        
        try {
          // 创建独立的axios实例，避免被拦截器处理
          const refreshApi = axios.create({
            baseURL: api.defaults.baseURL,
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json',
            }
          })
          
          console.log('Attempting to refresh token...')
          const response = await refreshApi.post('/auth/refresh', {}, {
            headers: {
              'Authorization': `Bearer ${refreshToken}`
            }
          })
          
          const { access_token } = response.data
          
          set({ accessToken: access_token })
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          
          console.log('Token refreshed successfully')
          return true
        } catch (error) {
          console.error('Token refresh failed:', error.response?.data?.message || error.message)
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

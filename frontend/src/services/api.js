import axios from 'axios'
import { demoAPI, isDemoMode } from './demoApi'

// 动态获取API基础URL
const getApiBaseUrl = () => {
  // 如果是演示模式，返回空字符串（使用demoAPI）
  if (isDemoMode()) {
    return ''
  }

  // 生产环境使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  // 如果是开发环境，尝试使用当前主机的IP
  if (import.meta.env.DEV) {
    const currentHost = window.location.hostname
    // 如果访问的是IP地址，使用相同的IP访问后端
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      return `http://${currentHost}:5000/api`
    }
  }
  // 默认使用localhost
  return 'http://localhost:5000/api'
}

// 创建axios实例
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 自动添加认证头 - 从localStorage获取zustand persist的数据
    const authStorage = localStorage.getItem('auth-storage')
    console.log('DEBUG: authStorage from localStorage:', authStorage ? 'exists' : 'not found')

    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage)
        console.log('DEBUG: parsed authData:', authData)
        const accessToken = authData.state?.accessToken
        console.log('DEBUG: accessToken:', accessToken ? 'exists' : 'not found')

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
          console.log('DEBUG: Authorization header set:', `Bearer ${accessToken.substring(0, 20)}...`)
        }
      } catch (error) {
        console.error('Failed to parse auth token:', error)
      }
    }

    console.log('DEBUG: Final Authorization header:', config.headers.Authorization)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    console.log('DEBUG: API error response:', error.response?.status, error.config?.url)

    const originalRequest = error.config

    // 如果是401错误，记录详细信息但不立即跳转
    if (error.response?.status === 401) {
      console.log('DEBUG: 401 Unauthorized error')
      console.log('DEBUG: Request URL:', originalRequest?.url)
      console.log('DEBUG: Request headers:', originalRequest?.headers)

      // 暂时不自动跳转，让应用自己处理401错误
      // TODO: 实现token刷新逻辑
    }

    return Promise.reject(error)
  }
)

// 课程相关的 API
export const lessonAPI = {
  // 获取课程列表
  getLessons: async () => {
    if (isDemoMode()) {
      return await demoAPI.lessons.getLessons()
    }
    const response = await api.get('/lessons')
    return response.data
  },

  // 获取特定课程详情
  getLesson: async (lessonId) => {
    if (isDemoMode()) {
      return await demoAPI.lessons.getLesson(lessonId)
    }
    const response = await api.get(`/lessons/${lessonId}`)
    return response.data
  },

  // 完成课程
  completeLesson: async (lessonId) => {
    const response = await api.post(`/lessons/${lessonId}/complete`)
    return response.data
  },

  // 获取课程完成状态
  getCompletionStatus: async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}/completion-status`)
    return response.data
  }
}

// 核心学习路径 API - 保留课程完成状态检查
export const learningAPI = {
  // 提交练习答案（课程内练习）
  submitAnswer: async (data) => {
    if (isDemoMode()) {
      return await demoAPI.practice.submitAnswer(data)
    }
    const response = await api.post('/practice/submit', data)
    return response.data
  },

  // 获取提示（课程内练习）
  getHint: async (data) => {
    if (isDemoMode()) {
      return { hint: '这是一个演示提示' }
    }
    const response = await api.post('/practice/hint', data)
    return response.data
  },

  // 获取课程完成状态
  getCompletionStatus: async (lessonId) => {
    if (isDemoMode()) {
      return { data: { completed_practice_details: [] } }
    }
    const response = await api.get(`/lessons/${lessonId}/completion-status`)
    return { data: response.data }
  }
}

// 复习相关的 API - 基于遗忘曲线
export const reviewAPI = {
  // 获取今日复习任务
  getTodayReviews: async () => {
    if (isDemoMode()) {
      return []
    }
    const response = await api.get('/reviews/today')
    return response.data
  },

  // 提交复习答案（包含遗忘曲线计算）
  submitReview: async (data) => {
    if (isDemoMode()) {
      return { success: true }
    }
    const response = await api.post('/reviews/submit', data)
    return response.data
  },

  // 获取复习统计
  getStats: async () => {
    if (isDemoMode()) {
      return { totalItems: 0, dueItems: 0, masteredItems: 0 }
    }
    const response = await api.get('/reviews/stats')
    return response.data
  },

  // 获取用户的所有复习项目
  getAllReviewItems: async () => {
    if (isDemoMode()) {
      return []
    }
    const response = await api.get('/reviews/items')
    return response.data
  },

  // 更新复习项目数据
  updateReviewItem: async (itemId, reviewData) => {
    if (isDemoMode()) {
      return { success: true }
    }
    const response = await api.put(`/reviews/items/${itemId}`, reviewData)
    return response.data
  }
}

export default api

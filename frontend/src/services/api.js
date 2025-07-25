import axios from 'axios'
import localDataAdapter from './localDataAdapter'
import { useUserModeStore } from '../stores/userModeStore'

// 动态获取API基础URL
const getApiBaseUrl = () => {
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

// 检查是否为游客模式
const isGuestMode = () => {
  try {
    const userModeStore = useUserModeStore.getState()
    return userModeStore.isGuestMode
  } catch (e) {
    // 如果store还未初始化，检查localStorage
    return localStorage.getItem('latex_trainer_guest_mode') !== 'false'
  }
}

// 获取合适的API适配器
const getApiAdapter = () => {
  if (isGuestMode()) {
    return localDataAdapter
  } else {
    return api // 真实API
  }
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
    const adapter = getApiAdapter()
    return adapter.getLessons()
  },

  // 获取特定课程详情
  getLesson: async (lessonId) => {
    const adapter = getApiAdapter()
    return adapter.getLesson(lessonId)
  },

  // 完成课程
  completeLesson: async (lessonId) => {
    const adapter = getApiAdapter()
    return adapter.completeLesson(lessonId)
  },

  // 获取课程完成状态
  getCompletionStatus: async (lessonId) => {
    const adapter = getApiAdapter()
    if (adapter.getCompletionStatus) {
      return adapter.getCompletionStatus(lessonId)
    }
    // 对于不支持此方法的适配器，返回默认值
    return { isCompleted: false }
  }
}

// 核心学习路径 API - 保留课程完成状态检查
export const learningAPI = {
  // 提交练习答案（课程内练习）
  submitAnswer: async (data) => {
    const adapter = getApiAdapter()

    // 检查是否为课程内练习（有lesson_id和card_index）
    if (data.lesson_id && data.card_index !== undefined) {
      // 课程内练习
      if (adapter.submitLessonPractice) {
        return adapter.submitLessonPractice(data.lesson_id, data.card_index, data.user_answer)
      }
    }

    // 独立练习题（向后兼容）
    return adapter.submitPractice(data.practice_id, data.answer)
  },

  // 获取提示（课程内练习）
  getHint: async (data) => {
    // 返回简单提示
    return { hint: '这是一个提示' }
  },

  // 获取课程完成状态
  getCompletionStatus: async (lessonId) => {
    const adapter = getApiAdapter()
    if (adapter.getCompletionStatus) {
      const result = await adapter.getCompletionStatus(lessonId)
      return { data: result }
    }
    return { data: { completed_practice_details: [], pending_practice_details: [] } }
  }
}

// 练习相关的 API
export const practiceAPI = {
  // 获取练习题列表
  getPractices: async (filters = {}) => {
    const adapter = getApiAdapter()
    return adapter.getPractices(filters)
  },

  // 提交练习答案
  submitPractice: async (practiceId, answer) => {
    const adapter = getApiAdapter()
    return adapter.submitPractice(practiceId, answer)
  },

  // 获取练习统计
  getStats: async () => {
    const adapter = getApiAdapter()
    return adapter.getPracticeStats()
  }
}

// 复习相关的 API - 基于遗忘曲线
export const reviewAPI = {
  // 获取今日复习任务
  getTodayReviews: async () => {
    const adapter = getApiAdapter()
    return adapter.getTodayReviews()
  },

  // 提交复习答案（包含遗忘曲线计算）
  submitReview: async (data) => {
    const adapter = getApiAdapter()
    return adapter.submitReview(data.practice_id, data.answer, data.quality || 3)
  },

  // 获取复习统计
  getStats: async () => {
    const adapter = getApiAdapter()
    if (adapter.getReviewStats) {
      return adapter.getReviewStats()
    }
    return { totalItems: 0, dueItems: 0, masteredItems: 0 }
  },

  // 获取用户的所有复习项目
  getAllReviewItems: async () => {
    const adapter = getApiAdapter()
    if (adapter.getAllReviewItems) {
      return adapter.getAllReviewItems()
    }
    return []
  },

  // 更新复习项目数据
  updateReviewItem: async (itemId, reviewData) => {
    const adapter = getApiAdapter()
    if (adapter.updateReviewItem) {
      return adapter.updateReviewItem(itemId, reviewData)
    }
    return { success: true }
  }
}

export default api

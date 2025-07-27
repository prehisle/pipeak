import axios from 'axios'
import realApiAdapter from './realApiAdapter'
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

// 检查是否为注册用户
const isRegisteredUser = () => {
  try {
    // 检查Zustand persist存储的认证数据
    const authStorage = localStorage.getItem('auth-storage')
    if (!authStorage) return false

    const authData = JSON.parse(authStorage)
    return !!(authData.state?.accessToken && authData.state?.user)
  } catch (e) {
    return false
  }
}

// 获取合适的API适配器
const getApiAdapter = () => {
  if (isRegisteredUser()) {
    // 注册用户使用真实API适配器（后端已启动）
    return realApiAdapter // 真实API适配器
  } else {
    // 未登录用户不应该访问课程API，只能使用Quick Experience
    throw new Error('未登录用户无法访问课程数据，请先登录或使用Quick Experience')
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

    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage)
        const accessToken = authData.state?.accessToken

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
      } catch (error) {
        console.error('Failed to parse auth token:', error)
      }
    }

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
    const originalRequest = error.config

    // 如果是401错误，让应用自己处理401错误
    if (error.response?.status === 401) {
      // 可以在这里实现token刷新逻辑
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
    const adapter = getApiAdapter()

    // 检查是否为课程内练习（有lesson_id和card_index）
    if (data.lesson_id && data.card_index !== undefined) {
      // 课程内练习
      if (adapter.getLessonHint) {
        return adapter.getLessonHint(data.lesson_id, data.card_index, data.hint_level || 0)
      }
    }

    // 独立练习题或降级方案
    return { hint: '提示：检查你的语法和格式', hint_level: 0 }
  },

  // 获取课程完成状态
  getCompletionStatus: async (lessonId) => {
    const adapter = getApiAdapter()
    if (adapter.getCompletionStatus) {
      const result = await adapter.getCompletionStatus(lessonId)
      return { data: result }
    }
    return { data: { completed_practice_details: [], pending_practice_details: [] } }
  },

  // 完成课程
  completeLesson: async (lessonId) => {
    const adapter = getApiAdapter()
    if (adapter.completeLesson) {
      return adapter.completeLesson(lessonId)
    }
    // 降级方案：如果适配器不支持，返回成功状态
    return { message: '课程已完成（前端状态）', completed: true }
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
    // 支持新的对象参数格式
    return adapter.submitReview(data)
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

/**
 * 真实API适配器 - 连接后端API服务器
 * 为注册用户提供完整的后端功能
 */

import axios from 'axios'
import i18n from '../i18n'

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

class RealApiAdapter {
  constructor() {
    this.name = 'RealApiAdapter'

    // 创建专用的axios实例
    this.api = axios.create({
      baseURL: getApiBaseUrl(),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // 请求拦截器 - 自动添加认证头
    this.api.interceptors.request.use(
      (config) => {
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
  }

  // 课程相关方法
  async getLessons() {
    try {
      const response = await this.api.get('/lessons')
      return {
        lessons: response.data.lessons || [],
        total_count: response.data.total_count || 0
      }
    } catch (error) {
      console.error('获取课程列表失败:', error)
      throw new Error(i18n.t('dashboard.apiError'))
    }
  }

  async getLesson(lessonId) {
    try {
      const response = await this.api.get(`/lessons/${lessonId}`)
      return { lesson: response.data.lesson }
    } catch (error) {
      console.error('获取课程详情失败:', error)
      throw new Error(i18n.t('common.error'))
    }
  }

  async completeLesson(lessonId) {
    try {
      const response = await this.api.post(`/lessons/${lessonId}/complete`)
      return response.data
    } catch (error) {
      console.error('完成课程失败:', error)
      throw new Error('完成课程失败')
    }
  }

  async getLessonCompletionStatus(lessonId) {
    try {
      const response = await this.api.get(`/lessons/${lessonId}/completion-status`)
      return response.data
    } catch (error) {
      console.error('获取课程完成状态失败:', error)
      throw new Error('获取课程完成状态失败')
    }
  }

  // learningAPI需要的方法
  async getCompletionStatus(lessonId) {
    return this.getLessonCompletionStatus(lessonId)
  }

  // 练习相关方法
  async getPractices(filters = {}) {
    try {
      const response = await this.api.get('/practices', { params: filters })
      return response.data
    } catch (error) {
      console.error('获取练习列表失败:', error)
      throw new Error('获取练习列表失败')
    }
  }

  async submitPractice(practiceId, answer) {
    try {
      const response = await this.api.post(`/practices/${practiceId}/submit`, { answer })
      return response.data
    } catch (error) {
      console.error('提交练习答案失败:', error)
      throw new Error('提交练习答案失败')
    }
  }

  // 课程内练习提交
  async submitLessonPractice(lessonId, cardIndex, userAnswer) {
    try {
      const response = await this.api.post('/practice/submit', {
        lesson_id: lessonId,
        card_index: cardIndex,
        user_answer: userAnswer
      })
      return response.data
    } catch (error) {
      console.error('提交课程练习失败:', error)
      throw new Error('提交课程练习失败')
    }
  }

  async getPracticeStats() {
    try {
      const response = await this.api.get('/practices/stats')
      return response.data
    } catch (error) {
      console.error('获取练习统计失败:', error)
      return { totalAttempts: 0, correctAttempts: 0, accuracy: 0 }
    }
  }

  // 复习相关方法
  async getTodayReviews() {
    try {
      const response = await this.api.get('/reviews/today')
      return response.data
    } catch (error) {
      console.error('获取今日复习失败:', error)
      return { reviews: [], total_count: 0 }
    }
  }

  async submitReview(practiceId, answer, quality = 3) {
    try {
      const response = await this.api.post(`/reviews/${practiceId}/submit`, {
        answer,
        quality
      })
      return response.data
    } catch (error) {
      console.error('提交复习答案失败:', error)
      throw new Error('提交复习答案失败')
    }
  }

  async getReviewStats() {
    try {
      const response = await this.api.get('/reviews/stats')
      return response.data
    } catch (error) {
      console.error('获取复习统计失败:', error)
      return { totalItems: 0, dueItems: 0, masteredItems: 0 }
    }
  }

  async getAllReviewItems() {
    try {
      const response = await this.api.get('/reviews/items')
      return response.data.items || []
    } catch (error) {
      console.error('获取复习项目失败:', error)
      return []
    }
  }

  async updateReviewItem(itemId, reviewData) {
    try {
      const response = await this.api.put(`/reviews/items/${itemId}`, reviewData)
      return response.data
    } catch (error) {
      console.error('更新复习项目失败:', error)
      return { success: false }
    }
  }

  // 用户相关方法
  async getUserProfile() {
    try {
      const response = await this.api.get('/user/profile')
      return response.data
    } catch (error) {
      console.error('获取用户资料失败:', error)
      throw new Error('获取用户资料失败')
    }
  }

  async updateUserProfile(profileData) {
    try {
      const response = await this.api.put('/user/profile', profileData)
      return response.data
    } catch (error) {
      console.error('更新用户资料失败:', error)
      throw new Error('更新用户资料失败')
    }
  }

  // 工具方法
  isInitialized() {
    return true
  }

  getName() {
    return this.name
  }
}

// 创建单例实例
const realApiAdapter = new RealApiAdapter()

export default realApiAdapter

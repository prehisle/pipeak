import axios from 'axios'

// 动态获取API基础URL
const getApiBaseUrl = () => {
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

// 练习相关的 API
export const practiceAPI = {
  // 提交练习答案
  submitAnswer: async (data) => {
    const response = await api.post('/practice/submit', data)
    return response.data
  },

  // 获取提示
  getHint: async (data) => {
    const response = await api.post('/practice/hint', data)
    return response.data
  },

  // 获取练习进度
  getProgress: async (lessonId) => {
    const response = await api.get(`/practice/progress/${lessonId}`)
    return response.data
  }
}

export default api

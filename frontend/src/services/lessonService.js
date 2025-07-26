import api from './api'
import i18n from '../i18n'

/**
 * 课程相关的API服务
 */
export const lessonService = {
  /**
   * 获取所有课程列表
   */
  async getLessons() {
    try {
      const response = await api.get('/lessons')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || i18n.t('dashboard.apiError')
      }
    }
  },

  /**
   * 获取特定课程详情
   * @param {string} lessonId - 课程ID
   */
  async getLesson(lessonId) {
    try {
      const response = await api.get(`/lessons/${lessonId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || i18n.t('common.error')
      }
    }
  },

  /**
   * 标记课程为已完成
   * @param {string} lessonId - 课程ID
   */
  async completeLesson(lessonId) {
    try {
      const response = await api.post(`/lessons/${lessonId}/complete`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || '标记课程完成失败'
      }
    }
  }
}

export default lessonService

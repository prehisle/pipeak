/**
 * 数据同步服务
 * 处理游客模式到注册用户的数据迁移
 */

import localStorageManager from '../utils/localStorage'
import { lessonAPI, practiceAPI, reviewAPI } from './api'

class DataSyncService {
  constructor() {
    this.isSupported = localStorageManager.isSupported
  }

  /**
   * 检查是否有本地数据需要同步
   */
  hasDataToSync() {
    if (!this.isSupported) return false
    
    const lessonProgress = localStorageManager.getLessonProgress()
    const practiceRecords = localStorageManager.getPracticeRecords()
    const reviewData = localStorageManager.getReviewData()
    
    return (
      Object.keys(lessonProgress).length > 0 ||
      practiceRecords.length > 0 ||
      Object.keys(reviewData).length > 0
    )
  }

  /**
   * 获取本地数据摘要
   */
  getLocalDataSummary() {
    if (!this.isSupported) return null
    
    const lessonProgress = localStorageManager.getLessonProgress()
    const practiceRecords = localStorageManager.getPracticeRecords()
    const reviewData = localStorageManager.getReviewData()
    const stats = localStorageManager.getPracticeStats()
    
    return {
      lessonsCompleted: Object.values(lessonProgress).filter(p => p.isCompleted).length,
      totalLessons: Object.keys(lessonProgress).length,
      practiceAttempts: practiceRecords.length,
      correctAttempts: stats.correct,
      accuracy: stats.accuracy,
      reviewItems: Object.keys(reviewData).length,
      hasData: this.hasDataToSync()
    }
  }

  /**
   * 同步课程进度到服务器
   */
  async syncLessonProgress() {
    const lessonProgress = localStorageManager.getLessonProgress()
    const results = []
    
    for (const [lessonId, progress] of Object.entries(lessonProgress)) {
      try {
        if (progress.isCompleted) {
          // 标记课程为完成状态
          await lessonAPI.completeLesson(lessonId)
          results.push({ type: 'lesson', id: lessonId, status: 'success' })
        }
      } catch (error) {
        console.error(`Failed to sync lesson ${lessonId}:`, error)
        results.push({ type: 'lesson', id: lessonId, status: 'error', error })
      }
    }
    
    return results
  }

  /**
   * 同步练习记录到服务器
   */
  async syncPracticeRecords() {
    const practiceRecords = localStorageManager.getPracticeRecords()
    const results = []
    
    // 按练习题分组，只同步最后一次正确的答案
    const practiceMap = new Map()
    
    practiceRecords.forEach(record => {
      const key = record.practiceId
      if (!practiceMap.has(key) || record.isCorrect) {
        practiceMap.set(key, record)
      }
    })
    
    for (const record of practiceMap.values()) {
      try {
        if (record.isCorrect) {
          // 只同步正确的答案
          await practiceAPI.submitPractice(record.practiceId, record.answer)
          results.push({ type: 'practice', id: record.practiceId, status: 'success' })
        }
      } catch (error) {
        console.error(`Failed to sync practice ${record.practiceId}:`, error)
        results.push({ type: 'practice', id: record.practiceId, status: 'error', error })
      }
    }
    
    return results
  }

  /**
   * 同步复习数据到服务器
   */
  async syncReviewData() {
    const reviewData = localStorageManager.getReviewData()
    const results = []
    
    for (const [practiceId, data] of Object.entries(reviewData)) {
      try {
        // 创建复习项目（如果服务器支持）
        if (reviewAPI.createReviewItem) {
          await reviewAPI.createReviewItem({
            practiceId,
            easeFactor: data.easeFactor,
            repetitions: data.repetitions,
            interval: data.interval,
            nextReviewDate: data.nextReviewDate
          })
        }
        results.push({ type: 'review', id: practiceId, status: 'success' })
      } catch (error) {
        console.error(`Failed to sync review data ${practiceId}:`, error)
        results.push({ type: 'review', id: practiceId, status: 'error', error })
      }
    }
    
    return results
  }

  /**
   * 执行完整的数据同步
   */
  async syncAllData(onProgress = null) {
    if (!this.hasDataToSync()) {
      return { success: true, message: '没有数据需要同步' }
    }

    const results = {
      lessons: [],
      practices: [],
      reviews: [],
      errors: []
    }

    try {
      // 同步课程进度
      if (onProgress) onProgress({ step: 'lessons', progress: 0 })
      results.lessons = await this.syncLessonProgress()
      
      // 同步练习记录
      if (onProgress) onProgress({ step: 'practices', progress: 33 })
      results.practices = await this.syncPracticeRecords()
      
      // 同步复习数据
      if (onProgress) onProgress({ step: 'reviews', progress: 66 })
      results.reviews = await this.syncReviewData()
      
      if (onProgress) onProgress({ step: 'complete', progress: 100 })

      // 统计结果
      const totalSynced = results.lessons.length + results.practices.length + results.reviews.length
      const totalErrors = results.lessons.filter(r => r.status === 'error').length +
                         results.practices.filter(r => r.status === 'error').length +
                         results.reviews.filter(r => r.status === 'error').length

      return {
        success: totalErrors === 0,
        totalSynced,
        totalErrors,
        results,
        message: totalErrors === 0 
          ? `成功同步 ${totalSynced} 项数据`
          : `同步完成，${totalSynced - totalErrors} 项成功，${totalErrors} 项失败`
      }

    } catch (error) {
      console.error('Data sync failed:', error)
      return {
        success: false,
        error: error.message,
        message: '数据同步失败，请稍后重试'
      }
    }
  }

  /**
   * 清除本地数据（同步成功后）
   */
  async clearLocalData() {
    if (!this.isSupported) return false
    
    try {
      return localStorageManager.clearAll()
    } catch (error) {
      console.error('Failed to clear local data:', error)
      return false
    }
  }

  /**
   * 备份本地数据
   */
  backupLocalData() {
    if (!this.isSupported) return null
    
    try {
      const data = localStorageManager.exportAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `latex-trainer-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('Failed to backup data:', error)
      return false
    }
  }

  /**
   * 恢复本地数据
   */
  async restoreLocalData(file) {
    if (!this.isSupported) return false
    
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      return localStorageManager.importData(data)
    } catch (error) {
      console.error('Failed to restore data:', error)
      return false
    }
  }
}

// 创建单例实例
const dataSyncService = new DataSyncService()

export default dataSyncService

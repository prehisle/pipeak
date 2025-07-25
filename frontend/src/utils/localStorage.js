/**
 * 本地存储管理器
 * 用于游客模式下的数据存储和管理
 */

const STORAGE_KEYS = {
  USER_PROFILE: 'latex_trainer_guest_profile',
  LESSON_PROGRESS: 'latex_trainer_lesson_progress',
  PRACTICE_RECORDS: 'latex_trainer_practice_records',
  REVIEW_DATA: 'latex_trainer_review_data',
  SETTINGS: 'latex_trainer_settings',
  GUEST_MODE: 'latex_trainer_guest_mode'
}

class LocalStorageManager {
  constructor() {
    this.isSupported = this.checkSupport()
  }

  /**
   * 检查浏览器是否支持localStorage
   */
  checkSupport() {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      console.warn('localStorage not supported:', e)
      return false
    }
  }

  /**
   * 安全地获取数据
   */
  getItem(key, defaultValue = null) {
    if (!this.isSupported) return defaultValue
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (e) {
      console.error(`Error getting item ${key}:`, e)
      return defaultValue
    }
  }

  /**
   * 安全地设置数据
   */
  setItem(key, value) {
    if (!this.isSupported) return false
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      console.error(`Error setting item ${key}:`, e)
      return false
    }
  }

  /**
   * 删除数据
   */
  removeItem(key) {
    if (!this.isSupported) return false
    
    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      console.error(`Error removing item ${key}:`, e)
      return false
    }
  }

  /**
   * 清除所有应用数据
   */
  clearAll() {
    if (!this.isSupported) return false
    
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      return true
    } catch (e) {
      console.error('Error clearing all data:', e)
      return false
    }
  }

  // === 游客用户资料管理 ===
  
  /**
   * 获取游客用户资料
   */
  getGuestProfile() {
    return this.getItem(STORAGE_KEYS.USER_PROFILE, {
      id: this.generateGuestId(),
      email: 'guest@local',
      name: '游客用户',
      isGuest: true,
      createdAt: new Date().toISOString()
    })
  }

  /**
   * 设置游客用户资料
   */
  setGuestProfile(profile) {
    return this.setItem(STORAGE_KEYS.USER_PROFILE, {
      ...profile,
      isGuest: true,
      updatedAt: new Date().toISOString()
    })
  }

  /**
   * 生成游客ID
   */
  generateGuestId() {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // === 课程进度管理 ===
  
  /**
   * 获取课程进度
   */
  getLessonProgress() {
    return this.getItem(STORAGE_KEYS.LESSON_PROGRESS, {})
  }

  /**
   * 设置课程进度
   */
  setLessonProgress(lessonId, progress) {
    const allProgress = this.getLessonProgress()
    allProgress[lessonId] = {
      ...progress,
      updatedAt: new Date().toISOString()
    }
    return this.setItem(STORAGE_KEYS.LESSON_PROGRESS, allProgress)
  }

  /**
   * 获取单个课程进度
   */
  getSingleLessonProgress(lessonId) {
    const allProgress = this.getLessonProgress()
    return allProgress[lessonId] || null
  }

  // === 练习记录管理 ===
  
  /**
   * 获取练习记录
   */
  getPracticeRecords() {
    return this.getItem(STORAGE_KEYS.PRACTICE_RECORDS, [])
  }

  /**
   * 添加练习记录
   */
  addPracticeRecord(record) {
    const records = this.getPracticeRecords()
    const newRecord = {
      ...record,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    }
    records.push(newRecord)
    
    // 保持最近1000条记录
    if (records.length > 1000) {
      records.splice(0, records.length - 1000)
    }
    
    return this.setItem(STORAGE_KEYS.PRACTICE_RECORDS, records)
  }

  /**
   * 获取练习统计
   */
  getPracticeStats() {
    const records = this.getPracticeRecords()
    const total = records.length
    const correct = records.filter(r => r.isCorrect).length
    
    return {
      total,
      correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      recentRecords: records.slice(-10)
    }
  }

  // === 复习数据管理 ===
  
  /**
   * 获取复习数据
   */
  getReviewData() {
    return this.getItem(STORAGE_KEYS.REVIEW_DATA, {})
  }

  /**
   * 设置复习数据
   */
  setReviewData(practiceId, reviewData) {
    const allReviewData = this.getReviewData()
    allReviewData[practiceId] = {
      ...reviewData,
      updatedAt: new Date().toISOString()
    }
    return this.setItem(STORAGE_KEYS.REVIEW_DATA, allReviewData)
  }

  // === 设置管理 ===
  
  /**
   * 获取用户设置
   */
  getSettings() {
    return this.getItem(STORAGE_KEYS.SETTINGS, {
      theme: 'light',
      language: 'zh-CN',
      notifications: true
    })
  }

  /**
   * 设置用户设置
   */
  setSettings(settings) {
    const currentSettings = this.getSettings()
    return this.setItem(STORAGE_KEYS.SETTINGS, {
      ...currentSettings,
      ...settings,
      updatedAt: new Date().toISOString()
    })
  }

  // === 游客模式管理 ===
  
  /**
   * 检查是否为游客模式
   */
  isGuestMode() {
    return this.getItem(STORAGE_KEYS.GUEST_MODE, true)
  }

  /**
   * 设置游客模式
   */
  setGuestMode(isGuest) {
    return this.setItem(STORAGE_KEYS.GUEST_MODE, isGuest)
  }

  // === 数据导出/导入 ===
  
  /**
   * 导出所有本地数据
   */
  exportAllData() {
    const data = {}
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      data[key] = this.getItem(storageKey)
    })
    return {
      ...data,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
  }

  /**
   * 导入数据
   */
  importData(data) {
    try {
      Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        if (data[key] !== undefined) {
          this.setItem(storageKey, data[key])
        }
      })
      return true
    } catch (e) {
      console.error('Error importing data:', e)
      return false
    }
  }

  /**
   * 生成唯一ID
   */
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取存储使用情况
   */
  getStorageInfo() {
    if (!this.isSupported) return null
    
    let totalSize = 0
    const details = {}
    
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const item = localStorage.getItem(storageKey)
      const size = item ? new Blob([item]).size : 0
      details[key] = size
      totalSize += size
    })
    
    return {
      totalSize,
      details,
      quota: this.getStorageQuota()
    }
  }

  /**
   * 获取存储配额（估算）
   */
  getStorageQuota() {
    // 大多数浏览器的localStorage限制在5-10MB
    return 5 * 1024 * 1024 // 5MB
  }
}

// 创建单例实例
const localStorageManager = new LocalStorageManager()

export default localStorageManager
export { STORAGE_KEYS }

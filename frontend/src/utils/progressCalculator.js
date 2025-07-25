/**
 * 统一的进度计算工具
 * 用于确保游客模式和登录模式的进度计算完全一致
 */

/**
 * 计算课程学习统计信息
 * @param {Array} lessons - 课程列表，每个课程包含 is_completed 字段
 * @returns {Object} 统计信息
 */
export function calculateLessonStats(lessons = []) {
  const totalLessons = lessons.length
  const completedLessons = lessons.filter(lesson => lesson.is_completed).length
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  
  return {
    totalLessons,
    completedLessons,
    progressPercentage
  }
}

/**
 * 计算练习统计信息
 * @param {Array} practiceRecords - 练习记录列表
 * @returns {Object} 练习统计
 */
export function calculatePracticeStats(practiceRecords = []) {
  const total = practiceRecords.length
  const correct = practiceRecords.filter(r => r.isCorrect).length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  
  return {
    total,
    correct,
    accuracy,
    recentRecords: practiceRecords.slice(-10)
  }
}

/**
 * 计算综合学习数据摘要
 * @param {Array} lessons - 课程列表
 * @param {Array} practiceRecords - 练习记录
 * @param {Object} reviewData - 复习数据
 * @returns {Object} 数据摘要
 */
export function calculateDataSummary(lessons = [], practiceRecords = [], reviewData = {}) {
  const lessonStats = calculateLessonStats(lessons)
  const practiceStats = calculatePracticeStats(practiceRecords)
  
  return {
    // 课程相关
    lessonsCompleted: lessonStats.completedLessons,
    totalLessons: lessonStats.totalLessons,
    progressPercentage: lessonStats.progressPercentage,
    
    // 练习相关
    practiceAttempts: practiceStats.total,
    correctAttempts: practiceStats.correct,
    accuracy: practiceStats.accuracy,
    
    // 复习相关
    reviewItems: Object.keys(reviewData).length,
    
    // 数据存在性
    hasData: lessons.length > 0 || practiceRecords.length > 0 || Object.keys(reviewData).length > 0
  }
}

/**
 * 检查课程是否已完成
 * @param {string} lessonId - 课程ID
 * @param {Array} lessons - 课程列表
 * @returns {boolean} 是否已完成
 */
export function isLessonCompleted(lessonId, lessons = []) {
  const lesson = lessons.find(l => l._id === lessonId)
  return lesson ? lesson.is_completed : false
}

/**
 * 获取下一个未完成的课程
 * @param {Array} lessons - 课程列表
 * @returns {Object|null} 下一个未完成的课程
 */
export function getNextLesson(lessons = []) {
  return lessons.find(lesson => !lesson.is_completed) || null
}

/**
 * 验证进度数据的一致性
 * @param {Object} lessonStoreStats - lessonStore 的统计数据
 * @param {Object} localDataSummary - 本地数据摘要
 * @returns {Object} 验证结果
 */
export function validateProgressConsistency(lessonStoreStats, localDataSummary) {
  const inconsistencies = []
  
  if (lessonStoreStats.completedLessons !== localDataSummary.lessonsCompleted) {
    inconsistencies.push({
      field: 'completedLessons',
      lessonStore: lessonStoreStats.completedLessons,
      localData: localDataSummary.lessonsCompleted
    })
  }
  
  if (lessonStoreStats.totalLessons !== localDataSummary.totalLessons) {
    inconsistencies.push({
      field: 'totalLessons',
      lessonStore: lessonStoreStats.totalLessons,
      localData: localDataSummary.totalLessons
    })
  }
  
  if (lessonStoreStats.progressPercentage !== localDataSummary.progressPercentage) {
    inconsistencies.push({
      field: 'progressPercentage',
      lessonStore: lessonStoreStats.progressPercentage,
      localData: localDataSummary.progressPercentage
    })
  }
  
  return {
    isConsistent: inconsistencies.length === 0,
    inconsistencies
  }
}

export default {
  calculateLessonStats,
  calculatePracticeStats,
  calculateDataSummary,
  isLessonCompleted,
  getNextLesson,
  validateProgressConsistency
}

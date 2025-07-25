/**
 * 遗忘曲线算法实现
 * 基于艾宾浩斯遗忘曲线和SM-2算法的改进版本
 */

// 遗忘曲线的基础间隔（天）
const BASE_INTERVALS = [1, 3, 7, 15, 30, 60, 120, 240]

// 难度因子范围
const MIN_EASE_FACTOR = 1.3
const MAX_EASE_FACTOR = 2.5
const DEFAULT_EASE_FACTOR = 2.5

/**
 * 计算下次复习时间
 * @param {Object} reviewData - 复习数据
 * @param {number} reviewData.interval - 当前间隔（天）
 * @param {number} reviewData.easeFactor - 难度因子
 * @param {number} reviewData.repetitions - 重复次数
 * @param {number} quality - 回答质量 (0-5)
 * @returns {Object} 新的复习数据
 */
export const calculateNextReview = (reviewData, quality) => {
  const { interval = 0, easeFactor = DEFAULT_EASE_FACTOR, repetitions = 0 } = reviewData

  let newInterval
  let newEaseFactor = easeFactor
  let newRepetitions = repetitions

  // 根据回答质量调整难度因子
  if (quality >= 3) {
    // 回答正确
    newRepetitions += 1
    
    // 计算新的间隔
    if (newRepetitions === 1) {
      newInterval = 1
    } else if (newRepetitions === 2) {
      newInterval = 3
    } else {
      newInterval = Math.round(interval * newEaseFactor)
    }

    // 调整难度因子（回答越好，下次间隔越长）
    newEaseFactor = Math.max(
      MIN_EASE_FACTOR,
      newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    )
  } else {
    // 回答错误，重新开始
    newRepetitions = 0
    newInterval = 1
    newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor - 0.2)
  }

  // 限制难度因子范围
  newEaseFactor = Math.min(MAX_EASE_FACTOR, Math.max(MIN_EASE_FACTOR, newEaseFactor))

  // 计算下次复习日期
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: newRepetitions,
    nextReviewDate: nextReviewDate.toISOString(),
    lastReviewDate: new Date().toISOString()
  }
}

/**
 * 判断是否需要复习
 * @param {string} nextReviewDate - 下次复习日期
 * @returns {boolean} 是否需要复习
 */
export const needsReview = (nextReviewDate) => {
  if (!nextReviewDate) return true
  
  const now = new Date()
  const reviewDate = new Date(nextReviewDate)
  
  return now >= reviewDate
}

/**
 * 获取复习优先级
 * @param {string} nextReviewDate - 下次复习日期
 * @returns {number} 优先级分数（越高越优先）
 */
export const getReviewPriority = (nextReviewDate) => {
  if (!nextReviewDate) return 100 // 从未复习过，最高优先级
  
  const now = new Date()
  const reviewDate = new Date(nextReviewDate)
  const overdueDays = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24))
  
  if (overdueDays <= 0) return 0 // 还没到复习时间
  
  // 逾期天数越多，优先级越高
  return Math.min(100, overdueDays * 10)
}

/**
 * 根据回答质量获取质量分数
 * @param {boolean} isCorrect - 是否正确
 * @param {number} hintsUsed - 使用的提示次数
 * @param {number} timeSpent - 花费时间（秒）
 * @returns {number} 质量分数 (0-5)
 */
export const getQualityScore = (isCorrect, hintsUsed = 0, timeSpent = 0) => {
  if (!isCorrect) return 0

  let score = 5

  // 根据提示次数降分
  if (hintsUsed > 0) {
    score -= hintsUsed * 0.5
  }

  // 根据时间降分（超过5分钟开始降分）
  if (timeSpent > 300) {
    score -= Math.min(2, (timeSpent - 300) / 300)
  }

  return Math.max(1, Math.min(5, Math.round(score)))
}

/**
 * 初始化学习项目的复习数据
 * @returns {Object} 初始复习数据
 */
export const initializeReviewData = () => {
  return {
    interval: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    repetitions: 0,
    nextReviewDate: null,
    lastReviewDate: null
  }
}

/**
 * 获取学习建议
 * @param {Array} reviewItems - 复习项目列表
 * @returns {Object} 学习建议
 */
export const getLearningRecommendation = (reviewItems) => {
  const now = new Date()
  const dueItems = reviewItems.filter(item => needsReview(item.nextReviewDate))
  const overdueItems = dueItems.filter(item => {
    if (!item.nextReviewDate) return false
    return new Date(item.nextReviewDate) < now
  })

  return {
    totalItems: reviewItems.length,
    dueItems: dueItems.length,
    overdueItems: overdueItems.length,
    recommendation: dueItems.length > 0 ? 'review' : 'learn',
    message: dueItems.length > 0 
      ? `您有 ${dueItems.length} 个项目需要复习${overdueItems.length > 0 ? `，其中 ${overdueItems.length} 个已逾期` : ''}`
      : '暂无复习任务，可以学习新内容'
  }
}

/**
 * 计算学习统计
 * @param {Array} reviewItems - 复习项目列表
 * @returns {Object} 学习统计
 */
export const calculateLearningStats = (reviewItems) => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const masteredItems = reviewItems.filter(item => 
    item.repetitions >= 3 && item.easeFactor >= 2.0
  )
  
  const tomorrowItems = reviewItems.filter(item => {
    if (!item.nextReviewDate) return false
    const reviewDate = new Date(item.nextReviewDate)
    return reviewDate >= now && reviewDate < tomorrow
  })

  return {
    totalItems: reviewItems.length,
    masteredItems: masteredItems.length,
    tomorrowReviews: tomorrowItems.length,
    masteryRate: reviewItems.length > 0 ? Math.round((masteredItems.length / reviewItems.length) * 100) : 0
  }
}

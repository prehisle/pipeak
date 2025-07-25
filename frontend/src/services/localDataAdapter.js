/**
 * 本地数据适配器
 * 在游客模式下模拟API调用，使用本地存储
 */

import localStorageManager from '../utils/localStorage'

// 本地模拟课程数据
const mockLessons = [
  {
    _id: '1',
    title: '数学环境与基础语法',
    description: '学习LaTeX数学环境的基础语法，包括上标、下标等',
    sequence: 1,
    cards: [
      {
        type: 'knowledge',
        title: '数学环境',
        content: '在LaTeX中，数学公式需要在特殊的数学环境中编写。行内公式使用 $...$ 包围，行间公式使用 $$...$$ 或 \\[...\\] 包围。'
      },
      {
        type: 'practice',
        question: '请输入 x 的平方',
        target_formula: 'x^2',
        hints: ['使用上标符号 ^', '记住使用花括号 {}']
      }
    ]
  },
  {
    _id: '2',
    title: '分数与根号',
    description: '学习如何输入分数和根号表达式',
    sequence: 2,
    cards: [
      {
        type: 'knowledge',
        title: '分数表示',
        content: '使用 \\frac{分子}{分母} 来表示分数。例如：\\frac{1}{2} 表示二分之一。'
      },
      {
        type: 'practice',
        question: '请输入二分之一',
        target_formula: '\\frac{1}{2}',
        hints: ['使用 \\frac 命令', '分子和分母都要用花括号包围']
      }
    ]
  }
]

// 本地模拟练习数据
const mockPractices = [
  {
    _id: 'practice_1',
    lesson_id: '1',
    question: '请输入 x 的平方',
    target_formula: 'x^2',
    difficulty: 'easy',
    explanation: '上标使用 ^ 符号'
  },
  {
    _id: 'practice_2',
    lesson_id: '1',
    question: '请输入 y 的三次方',
    target_formula: 'y^3',
    difficulty: 'easy',
    explanation: '上标使用 ^ 符号'
  },
  {
    _id: 'practice_3',
    lesson_id: '2',
    question: '请输入二分之一',
    target_formula: '\\frac{1}{2}',
    difficulty: 'medium',
    explanation: '分数使用 \\frac{分子}{分母} 格式'
  }
]

// 模拟网络延迟
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

class LocalDataAdapter {
  constructor() {
    this.isInitialized = false
  }

  /**
   * 初始化本地数据
   */
  async initialize() {
    if (this.isInitialized) return
    
    // 确保有基础的课程数据
    const lessonProgress = localStorageManager.getLessonProgress()
    if (Object.keys(lessonProgress).length === 0) {
      // 初始化课程进度
      mockLessons.forEach(lesson => {
        localStorageManager.setLessonProgress(lesson._id, {
          lessonId: lesson._id,
          isCompleted: false,
          completedAt: null,
          practiceProgress: {}
        })
      })
    }
    
    this.isInitialized = true
  }

  // === 用户相关 ===
  
  async getCurrentUser() {
    await delay()
    return localStorageManager.getGuestProfile()
  }

  async updateProfile(updates) {
    await delay()
    const profile = localStorageManager.getGuestProfile()
    const updatedProfile = { ...profile, ...updates }
    localStorageManager.setGuestProfile(updatedProfile)
    return updatedProfile
  }

  // === 课程相关 ===
  
  async getLessons() {
    await this.initialize()
    await delay()
    
    const lessonProgress = localStorageManager.getLessonProgress()
    
    // 合并课程数据和进度
    const lessonsWithProgress = mockLessons.map(lesson => {
      const progress = lessonProgress[lesson._id]
      return {
        ...lesson,
        isCompleted: progress?.isCompleted || false,
        completedAt: progress?.completedAt,
        practiceProgress: progress?.practiceProgress || {}
      }
    })
    
    return lessonsWithProgress
  }

  async getLesson(lessonId) {
    await this.initialize()
    await delay()
    
    const lesson = mockLessons.find(l => l._id === lessonId)
    if (!lesson) throw new Error('课程不存在')
    
    const progress = localStorageManager.getSingleLessonProgress(lessonId)
    
    return {
      ...lesson,
      isCompleted: progress?.isCompleted || false,
      completedAt: progress?.completedAt,
      practiceProgress: progress?.practiceProgress || {}
    }
  }

  async completeLesson(lessonId) {
    await delay()
    
    const progress = localStorageManager.getSingleLessonProgress(lessonId) || {}
    const updatedProgress = {
      ...progress,
      isCompleted: true,
      completedAt: new Date().toISOString()
    }
    
    localStorageManager.setLessonProgress(lessonId, updatedProgress)
    return updatedProgress
  }

  // === 练习相关 ===
  
  async getPractices(filters = {}) {
    await this.initialize()
    await delay()
    
    let practices = [...mockPractices]
    
    // 应用筛选
    if (filters.lesson_id) {
      practices = practices.filter(p => p.lesson_id === filters.lesson_id)
    }
    
    if (filters.difficulty) {
      practices = practices.filter(p => p.difficulty === filters.difficulty)
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      practices = practices.filter(p => 
        p.question.toLowerCase().includes(searchLower) ||
        p.target_formula.toLowerCase().includes(searchLower)
      )
    }
    
    // 添加用户完成状态
    const practiceRecords = localStorageManager.getPracticeRecords()
    practices = practices.map(practice => {
      const userRecords = practiceRecords.filter(r => r.practiceId === practice._id)
      const isCompleted = userRecords.some(r => r.isCorrect)
      const attempts = userRecords.length
      const lastAttempt = userRecords.length > 0 ? userRecords[userRecords.length - 1] : null
      
      return {
        ...practice,
        isCompleted,
        attempts,
        lastAttempt: lastAttempt?.timestamp,
        userStatus: isCompleted ? 'completed' : attempts > 0 ? 'attempted' : 'not_started'
      }
    })
    
    return {
      practices,
      total: practices.length
    }
  }

  async submitPractice(practiceId, answer) {
    await delay()
    
    const practice = mockPractices.find(p => p._id === practiceId)
    if (!practice) throw new Error('练习题不存在')
    
    // 简单的答案检查（实际应用中会更复杂）
    const isCorrect = answer.trim().toLowerCase() === practice.target_formula.toLowerCase()
    
    // 记录练习结果
    const record = {
      practiceId,
      lessonId: practice.lesson_id,
      answer: answer.trim(),
      targetFormula: practice.target_formula,
      isCorrect,
      difficulty: practice.difficulty
    }
    
    localStorageManager.addPracticeRecord(record)
    
    // 更新课程进度
    const lessonProgress = localStorageManager.getSingleLessonProgress(practice.lesson_id) || {}
    const practiceProgress = lessonProgress.practiceProgress || {}
    
    practiceProgress[practiceId] = {
      isCompleted: isCorrect,
      attempts: (practiceProgress[practiceId]?.attempts || 0) + 1,
      lastAttempt: new Date().toISOString()
    }
    
    localStorageManager.setLessonProgress(practice.lesson_id, {
      ...lessonProgress,
      practiceProgress
    })
    
    return {
      isCorrect,
      message: isCorrect ? '答案正确！' : '答案不正确，请重试',
      targetFormula: practice.target_formula,
      explanation: practice.explanation
    }
  }

  async getPracticeStats() {
    await delay()
    
    const stats = localStorageManager.getPracticeStats()
    const practiceRecords = localStorageManager.getPracticeRecords()
    
    // 按难度统计
    const difficultyStats = {}
    practiceRecords.forEach(record => {
      const difficulty = record.difficulty || 'medium'
      if (!difficultyStats[difficulty]) {
        difficultyStats[difficulty] = { total: 0, correct: 0, accuracy: 0 }
      }
      difficultyStats[difficulty].total++
      if (record.isCorrect) {
        difficultyStats[difficulty].correct++
      }
    })
    
    // 计算准确率
    Object.keys(difficultyStats).forEach(difficulty => {
      const stat = difficultyStats[difficulty]
      stat.accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
    })
    
    return {
      total_practices: mockPractices.length,
      completed_practices: new Set(practiceRecords.filter(r => r.isCorrect).map(r => r.practiceId)).size,
      correct_count: stats.correct,
      accuracy_rate: stats.accuracy,
      total_attempts: stats.total,
      difficulty_stats: difficultyStats,
      recent_activity: stats.recentRecords.map(record => ({
        practice_id: record.practiceId,
        lesson_id: record.lessonId,
        is_correct: record.isCorrect,
        submitted_at: record.timestamp
      }))
    }
  }

  // === 复习相关 ===
  
  async getTodayReviews() {
    await delay()
    
    const reviewData = localStorageManager.getReviewData()
    const now = new Date()
    
    // 筛选今日需要复习的项目
    const todayReviews = Object.entries(reviewData)
      .filter(([practiceId, data]) => {
        if (!data.nextReviewDate) return false
        const reviewDate = new Date(data.nextReviewDate)
        return reviewDate <= now
      })
      .map(([practiceId, data]) => {
        const practice = mockPractices.find(p => p._id === practiceId)
        return {
          ...practice,
          reviewData: data
        }
      })
      .filter(Boolean)
    
    // 统计信息
    const stats = {
      due_today: todayReviews.length,
      due_tomorrow: 0, // 简化实现
      total_reviews: Object.keys(reviewData).length,
      accuracy_rate: 85, // 简化实现
      week_completed: 0 // 简化实现
    }
    
    return {
      reviews: todayReviews,
      stats
    }
  }

  async submitReview(practiceId, answer, quality) {
    await delay()
    
    const practice = mockPractices.find(p => p._id === practiceId)
    if (!practice) throw new Error('练习题不存在')
    
    const isCorrect = answer.trim().toLowerCase() === practice.target_formula.toLowerCase()
    
    // 更新复习数据（简化的SM-2算法）
    const reviewData = localStorageManager.getReviewData()
    const currentData = reviewData[practiceId] || {
      easeFactor: 2.5,
      repetitions: 0,
      interval: 1
    }
    
    let newInterval = currentData.interval
    let newEaseFactor = currentData.easeFactor
    let newRepetitions = currentData.repetitions
    
    if (isCorrect) {
      newRepetitions++
      if (newRepetitions === 1) {
        newInterval = 1
      } else if (newRepetitions === 2) {
        newInterval = 6
      } else {
        newInterval = Math.round(currentData.interval * currentData.easeFactor)
      }
      
      newEaseFactor = Math.max(1.3, newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
    } else {
      newRepetitions = 0
      newInterval = 1
    }
    
    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)
    
    const updatedReviewData = {
      easeFactor: newEaseFactor,
      repetitions: newRepetitions,
      interval: newInterval,
      nextReviewDate: nextReviewDate.toISOString(),
      lastReviewed: new Date().toISOString()
    }
    
    localStorageManager.setReviewData(practiceId, updatedReviewData)
    
    return {
      isCorrect,
      message: isCorrect ? '复习完成！' : '需要继续练习',
      nextReviewDate: nextReviewDate.toISOString()
    }
  }

  // === 数据管理 ===
  
  async exportData() {
    await delay()
    return localStorageManager.exportAllData()
  }

  async importData(data) {
    await delay()
    return localStorageManager.importData(data)
  }

  async clearAllData() {
    await delay()
    return localStorageManager.clearAll()
  }
}

// 创建单例实例
const localDataAdapter = new LocalDataAdapter()

export default localDataAdapter

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
        target_formula: '$x^2$',
        hints: ['使用上标符号 ^', '记住使用花括号 {}']
      },
      {
        type: 'practice',
        question: '请输入 y 的三次方',
        target_formula: '$y^3$',
        hints: ['使用上标符号 ^', '数字可以直接写在^后面']
      },
      {
        type: 'practice',
        question: '请输入 a 的 n 次方',
        target_formula: '$a^n$',
        hints: ['使用上标符号 ^', '字母可以直接作为指数']
      },
      {
        type: 'practice',
        question: '请输入 x 的下标 1',
        target_formula: '$x_1$',
        hints: ['使用下标符号 _', '数字可以直接写在_后面']
      },
      {
        type: 'practice',
        question: '请输入 x 的 2n+1 次方',
        target_formula: '$x^{2n+1}$',
        hints: ['复杂的上标需要用花括号包围', '使用 x^{2n+1} 的格式']
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
        content: '使用 \\frac{分子}{分母} 来表示分数。例如：\\frac{1}{2} 表示二分之一。根号使用 \\sqrt{内容} 表示。'
      },
      {
        type: 'practice',
        question: '请输入二分之一',
        target_formula: '$\\frac{1}{2}$',
        hints: ['使用 \\frac 命令', '分子和分母都要用花括号包围']
      },
      {
        type: 'practice',
        question: '请输入三分之二',
        target_formula: '$\\frac{2}{3}$',
        hints: ['使用 \\frac{2}{3} 的格式', '分子是2，分母是3']
      },
      {
        type: 'practice',
        question: '请输入根号2',
        target_formula: '$\\sqrt{2}$',
        hints: ['使用 \\sqrt 命令', '被开方数用花括号包围']
      },
      {
        type: 'practice',
        question: '请输入三次根号8',
        target_formula: '$\\sqrt[3]{8}$',
        hints: ['使用 \\sqrt[n]{x} 表示n次根号', '方括号内是根号的次数']
      },
      {
        type: 'practice',
        question: '请输入复杂分数：x加1分之x减1',
        target_formula: '$\\frac{x-1}{x+1}$',
        hints: ['分子是 x-1，分母是 x+1', '使用 \\frac{x-1}{x+1} 的格式']
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

    // 返回与API相同的格式
    return { lessons: lessonsWithProgress }
  }

  async getLesson(lessonId) {
    await this.initialize()
    await delay()

    const lesson = mockLessons.find(l => l._id === lessonId)
    if (!lesson) throw new Error('课程不存在')

    const progress = localStorageManager.getSingleLessonProgress(lessonId)

    const lessonWithProgress = {
      ...lesson,
      isCompleted: progress?.isCompleted || false,
      completedAt: progress?.completedAt,
      practiceProgress: progress?.practiceProgress || {}
    }

    // 返回与API相同的格式
    return { lesson: lessonWithProgress }
  }

  async completeLesson(lessonId) {
    await delay()

    const progress = localStorageManager.getSingleLessonProgress(lessonId) || {}
    const updatedProgress = {
      ...progress,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    localStorageManager.setLessonProgress(lessonId, updatedProgress)

    // 触发存储事件，通知其他组件数据已更新
    window.dispatchEvent(new Event('storage'))

    return updatedProgress
  }

  async getCompletionStatus(lessonId) {
    await this.initialize()
    await delay()

    const lesson = mockLessons.find(l => l._id === lessonId)
    if (!lesson) throw new Error('课程不存在')

    const progress = localStorageManager.getSingleLessonProgress(lessonId) || {}
    const practiceRecords = localStorageManager.getPracticeRecords()

    // 获取课程中的所有练习题
    const practiceCards = []
    lesson.cards.forEach((card, index) => {
      if (card.type === 'practice') {
        practiceCards.push({
          index,
          title: card.title || `练习题 ${index + 1}`,
          target_formula: card.target_formula || '',
          question: card.question || ''
        })
      }
    })

    // 检查每个练习题的完成状态
    const completedPractices = []
    const pendingPractices = []

    practiceCards.forEach(practice => {
      // 检查课程进度中的练习完成状态
      const practiceKey = `card_${practice.index}`
      const practiceProgress = progress.practiceProgress || {}
      const isCompleted = practiceProgress[practiceKey]?.isCompleted || false

      if (isCompleted) {
        completedPractices.push({
          ...practice,
          completed_at: practiceProgress[practiceKey]?.lastAttempt || new Date().toISOString()
        })
      } else {
        pendingPractices.push(practice)
      }
    })

    const totalPractices = practiceCards.length
    const completedCount = completedPractices.length
    const canComplete = completedCount === totalPractices && totalPractices > 0
    const isAlreadyCompleted = progress.isCompleted || false

    return {
      lesson_id: lessonId,
      lesson_title: lesson.title,
      total_practices: totalPractices,
      completed_practices: completedCount,
      can_complete: canComplete,
      is_already_completed: isAlreadyCompleted,
      completion_percentage: totalPractices > 0 ? Math.round((completedCount / totalPractices) * 100) : 100,
      completed_practice_details: completedPractices,
      pending_practice_details: pendingPractices
    }
  }

  async submitLessonPractice(lessonId, cardIndex, answer) {
    await delay()

    const lesson = mockLessons.find(l => l._id === lessonId)
    if (!lesson) throw new Error('课程不存在')

    const card = lesson.cards[cardIndex]
    if (!card || card.type !== 'practice') throw new Error('练习题不存在')

    // 智能答案检查 - 支持多种格式
    const isCorrect = this.checkLatexAnswer(answer.trim(), card.target_formula)

    // 更新课程进度
    const lessonProgress = localStorageManager.getSingleLessonProgress(lessonId) || {}
    const practiceProgress = lessonProgress.practiceProgress || {}

    const practiceKey = `card_${cardIndex}`
    practiceProgress[practiceKey] = {
      isCompleted: isCorrect,
      attempts: (practiceProgress[practiceKey]?.attempts || 0) + 1,
      lastAttempt: new Date().toISOString()
    }

    // 检查是否所有练习都已完成，如果是则标记课程为完成
    const practiceCards = lesson.cards.filter(card => card.type === 'practice')
    const allPracticesCompleted = practiceCards.every((card, index) => {
      return practiceProgress[`card_${index}`]?.isCompleted
    })

    const updatedProgress = {
      ...lessonProgress,
      practiceProgress,
      isCompleted: allPracticesCompleted,
      updatedAt: new Date().toISOString()
    }

    // 如果课程刚刚完成，记录完成时间
    if (allPracticesCompleted && !lessonProgress.isCompleted) {
      updatedProgress.completedAt = new Date().toISOString()
    }

    localStorageManager.setLessonProgress(lessonId, updatedProgress)

    // 触发存储事件，通知其他组件数据已更新
    window.dispatchEvent(new Event('storage'))

    return {
      is_correct: isCorrect,
      feedback: isCorrect ? '🎉 太棒了！答案完全正确！' : '答案不正确，请重试',
      target_answer: card.target_formula,
      hint: !isCorrect ? (card.hints?.[0] || '提示：检查你的语法和格式') : undefined
    }
  }

  async getLessonHint(lessonId, cardIndex, hintLevel = 0) {
    await delay()

    const lesson = mockLessons.find(l => l._id === lessonId)
    if (!lesson) throw new Error('课程不存在')

    const card = lesson.cards[cardIndex]
    if (!card || card.type !== 'practice') throw new Error('练习题不存在')

    const hints = card.hints || ['提示：检查你的语法和格式']
    const currentHintIndex = Math.min(hintLevel, hints.length - 1)

    return {
      hint: hints[currentHintIndex],
      hint_level: currentHintIndex,
      has_more_hints: currentHintIndex < hints.length - 1
    }
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
    
    // 智能答案检查
    const isCorrect = this.checkLatexAnswer(answer.trim(), practice.target_formula)
    
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

  /**
   * LaTeX答案检查 - 与后端完全一致的标准化逻辑
   * 移植自后端 normalize_latex 函数
   */
  checkLatexAnswer(userAnswer, targetAnswer) {
    const normalizeLatex = (latexStr) => {
      if (!latexStr) return ""

      try {
        // 移除首尾空格
        latexStr = latexStr.trim()

        // 移除美元符号（如果存在）
        latexStr = latexStr.replace(/^\$+|\$+$/g, '')

        // 标准化上标和下标的花括号
        // x^2 -> x^{2}, x_1 -> x_{1}
        latexStr = latexStr.replace(/\^([a-zA-Z0-9])/g, '^{$1}')
        latexStr = latexStr.replace(/_([a-zA-Z0-9])/g, '_{$1}')

        // 标准化分数形式
        latexStr = latexStr.replace(/\\frac\s*\{\s*([^}]+)\s*\}\s*\{\s*([^}]+)\s*\}/g, '\\frac{$1}{$2}')

        // 标准化根号形式
        latexStr = latexStr.replace(/\\sqrt\s*\{\s*([^}]+)\s*\}/g, '\\sqrt{$1}')

        // 标准化数学函数名
        const functionMappings = {
          ' sin ': ' \\sin ',
          ' cos ': ' \\cos ',
          ' tan ': ' \\tan ',
          ' cot ': ' \\cot ',
          ' sec ': ' \\sec ',
          ' csc ': ' \\csc ',
          ' ln ': ' \\ln ',
          ' log ': ' \\log ',
          ' exp ': ' \\exp ',
          ' sqrt ': ' \\sqrt ',
          // 处理开头和结尾的情况
          'sin(': '\\sin(',
          'cos(': '\\cos(',
          'tan(': '\\tan(',
          'ln(': '\\ln(',
          'log(': '\\log(',
          'exp(': '\\exp(',
          'sqrt(': '\\sqrt('
        }

        // 添加空格以便匹配
        latexStr = ' ' + latexStr + ' '

        // 应用函数名映射
        for (const [old, newVal] of Object.entries(functionMappings)) {
          latexStr = latexStr.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newVal)
        }

        // 移除添加的空格
        latexStr = latexStr.trim()

        // 标准化运算符
        const operatorMappings = {
          '\\cdot': '*',
          '\\times': '*',
          '\\div': '/',
          '\\neq': '!=',
          '\\leq': '<=',
          '\\geq': '>='
        }

        for (const [old, newVal] of Object.entries(operatorMappings)) {
          latexStr = latexStr.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newVal)
        }

        // 标准化希腊字母和特殊符号的空格
        latexStr = latexStr.replace(/\\([a-zA-Z]+)\s+/g, '\\$1 ')

        // 标准化求和、积分等大型运算符
        latexStr = latexStr.replace(/\\sum\s*_\s*\{\s*([^}]+)\s*\}\s*\^\s*\{\s*([^}]+)\s*\}/g, '\\sum_{$1}^{$2}')
        latexStr = latexStr.replace(/\\int\s*_\s*\{\s*([^}]+)\s*\}\s*\^\s*\{\s*([^}]+)\s*\}/g, '\\int_{$1}^{$2}')
        latexStr = latexStr.replace(/\\lim\s*_\s*\{\s*([^}]+)\s*\}/g, '\\lim_{$1}')

        // 标准化矩阵和方程组环境
        latexStr = latexStr.replace(/\\begin\s*\{\s*([^}]+)\s*\}/g, '\\begin{$1}')
        latexStr = latexStr.replace(/\\end\s*\{\s*([^}]+)\s*\}/g, '\\end{$1}')

        // 处理常见的等价形式
        const equivalenceMappings = {
          // 分数的不同写法
          '1/2': '\\frac{1}{2}',
          '(1)/(2)': '\\frac{1}{2}',
          // 平方根的不同写法
          'sqrt(x)': '\\sqrt{x}',
          'sqrt x': '\\sqrt{x}',
          // 指数的不同写法
          'e^x': '\\exp(x)',
          'exp(x)': '\\exp(x)'
        }

        for (const [old, newVal] of Object.entries(equivalenceMappings)) {
          latexStr = latexStr.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newVal)
        }

        // 最终标准化：移除多余空格但保留必要结构
        latexStr = latexStr.replace(/\s+/g, ' ')
        latexStr = latexStr.trim()

        // 对于最终比较，移除所有空格
        latexStr = latexStr.replace(/\s+/g, '')

        return latexStr.toLowerCase()

      } catch (e) {
        console.error('ERROR in normalizeLatex:', e)
        // 如果出错，回退到简单处理
        return latexStr.trim().toLowerCase().replace(/\s+/g, '')
      }
    }

    try {
      const userNormalized = normalizeLatex(userAnswer)
      const targetNormalized = normalizeLatex(targetAnswer)

      console.log(`DEBUG: 用户答案: '${userAnswer}' -> 标准化: '${userNormalized}'`)
      console.log(`DEBUG: 目标答案: '${targetAnswer}' -> 标准化: '${targetNormalized}'`)

      // 直接比较标准化后的结果
      const result = userNormalized === targetNormalized
      console.log(`DEBUG: 答案比较结果: ${result}`)

      return result

    } catch (e) {
      console.error('ERROR: 答案检查出错:', e)
      // 出错时回退到简单比较
      try {
        const simpleUser = userAnswer.trim().toLowerCase().replace(/\s+/g, '')
        const simpleTarget = targetAnswer.trim().toLowerCase().replace(/\s+/g, '')
        return simpleUser === simpleTarget
      } catch {
        return false
      }
    }
  }
}

// 创建单例实例
const localDataAdapter = new LocalDataAdapter()

export default localDataAdapter

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
        content: '在LaTeX中，数学公式需要在特殊的数学环境中编写。\n\n**行内公式**使用 `$...$` 包围，例如：$x^2 + y^2 = z^2$\n\n**行间公式**使用 `$$...$$` 或 `\\[...\\]` 包围，例如：\n\n$$\\frac{a}{b} = \\frac{c}{d}$$\n\n这样可以让数学公式在文档中正确显示。'
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
        title: '分数与根号',
        content: '在LaTeX中，我们可以使用特殊命令来表示分数和根号。\n\n**分数表示**\n使用 `\\frac{分子}{分母}` 来表示分数：\n- $\\frac{1}{2}$ 表示二分之一\n- $\\frac{a+b}{c-d}$ 表示复杂分数\n\n**根号表示**\n使用 `\\sqrt{内容}` 表示平方根：\n- $\\sqrt{2}$ 表示根号2\n- $\\sqrt{x^2 + y^2}$ 表示复杂根式\n\n使用 `\\sqrt[n]{内容}` 表示n次根号：\n- $\\sqrt[3]{8}$ 表示三次根号8'
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
  },
  {
    _id: '3',
    title: '求和与积分符号',
    description: '学习求和、积分等数学符号的输入方法',
    sequence: 3,
    cards: [
      {
        type: 'knowledge',
        title: '求和与积分',
        content: '**求和符号**：\\sum 表示求和\n\n**积分符号**：\\int 表示积分\n\n**带上下限的求和**：\\sum_{i=1}^{n}\n\n**带上下限的积分**：\\int_{a}^{b}'
      },
      {
        type: 'practice',
        question: '请输入求和符号',
        target_formula: '$\\sum$',
        hints: ['使用 \\sum 命令']
      },
      {
        type: 'practice',
        question: '请输入从1到n的求和',
        target_formula: '$\\sum_{i=1}^{n}$',
        hints: ['使用 \\sum_{下限}^{上限} 格式']
      }
    ]
  },
  {
    _id: '4',
    title: '希腊字母',
    description: '学习常用希腊字母的LaTeX输入方法',
    sequence: 4,
    cards: [
      {
        type: 'knowledge',
        title: '希腊字母',
        content: '**小写希腊字母**：\\alpha, \\beta, \\gamma, \\delta\n\n**大写希腊字母**：\\Alpha, \\Beta, \\Gamma, \\Delta\n\n**常用字母**：\\pi, \\theta, \\lambda, \\mu'
      },
      {
        type: 'practice',
        question: '请输入希腊字母 α (alpha)',
        target_formula: '$\\alpha$',
        hints: ['使用 \\alpha 命令']
      },
      {
        type: 'practice',
        question: '请输入希腊字母 π (pi)',
        target_formula: '$\\pi$',
        hints: ['使用 \\pi 命令']
      }
    ]
  },
  {
    _id: '5',
    title: '矩阵与向量',
    description: '学习矩阵和向量的表示方法',
    sequence: 5,
    cards: [
      {
        type: 'knowledge',
        title: '矩阵与向量',
        content: '**矩阵**：使用 \\begin{matrix}...\\end{matrix}\n\n**带括号的矩阵**：\\begin{pmatrix}...\\end{pmatrix}\n\n**向量**：\\vec{v} 或 \\mathbf{v}'
      },
      {
        type: 'practice',
        question: '请输入向量 v',
        target_formula: '$\\vec{v}$',
        hints: ['使用 \\vec{} 命令']
      }
    ]
  },
  {
    _id: '6',
    title: '三角函数',
    description: '学习三角函数的LaTeX表示',
    sequence: 6,
    cards: [
      {
        type: 'knowledge',
        title: '三角函数',
        content: '**基本三角函数**：\\sin, \\cos, \\tan\n\n**反三角函数**：\\arcsin, \\arccos, \\arctan\n\n**双曲函数**：\\sinh, \\cosh, \\tanh'
      },
      {
        type: 'practice',
        question: '请输入 sin(x)',
        target_formula: '$\\sin(x)$',
        hints: ['使用 \\sin 命令']
      },
      {
        type: 'practice',
        question: '请输入 cos(θ)',
        target_formula: '$\\cos(\\theta)$',
        hints: ['使用 \\cos 和 \\theta 命令']
      }
    ]
  },
  {
    _id: '7',
    title: '极限与导数',
    description: '学习极限和导数符号的输入',
    sequence: 7,
    cards: [
      {
        type: 'knowledge',
        title: '极限与导数',
        content: '**极限**：\\lim_{x \\to a}\n\n**导数**：\\frac{d}{dx} 或 f\'(x)\n\n**偏导数**：\\frac{\\partial}{\\partial x}'
      },
      {
        type: 'practice',
        question: '请输入 x 趋向于 0 的极限',
        target_formula: '$\\lim_{x \\to 0}$',
        hints: ['使用 \\lim_{x \\to 0} 格式']
      },
      {
        type: 'practice',
        question: '请输入 f 对 x 的导数',
        target_formula: '$\\frac{df}{dx}$',
        hints: ['使用 \\frac{df}{dx} 格式']
      }
    ]
  },
  {
    _id: '8',
    title: '集合与逻辑',
    description: '学习集合论和逻辑符号',
    sequence: 8,
    cards: [
      {
        type: 'knowledge',
        title: '集合与逻辑',
        content: '**集合符号**：\\in, \\notin, \\subset, \\supset\n\n**逻辑符号**：\\land, \\lor, \\neg, \\implies\n\n**量词**：\\forall, \\exists'
      },
      {
        type: 'practice',
        question: '请输入 x 属于 A',
        target_formula: '$x \\in A$',
        hints: ['使用 \\in 命令表示属于']
      },
      {
        type: 'practice',
        question: '请输入全称量词',
        target_formula: '$\\forall$',
        hints: ['使用 \\forall 命令']
      }
    ]
  },
  {
    _id: '9',
    title: '复数与指数',
    description: '学习复数和指数函数的表示',
    sequence: 9,
    cards: [
      {
        type: 'knowledge',
        title: '复数与指数',
        content: '**复数单位**：i 或 \\imath\n\n**指数函数**：e^x 或 \\exp(x)\n\n**自然对数**：\\ln(x) 或 \\log(x)'
      },
      {
        type: 'practice',
        question: '请输入 e 的 x 次方',
        target_formula: '$e^x$',
        hints: ['直接使用 e^x 格式']
      },
      {
        type: 'practice',
        question: '请输入自然对数 ln(x)',
        target_formula: '$\\ln(x)$',
        hints: ['使用 \\ln 命令']
      }
    ]
  },
  {
    _id: '10',
    title: '高级数学符号',
    description: '学习更复杂的数学符号和公式',
    sequence: 10,
    cards: [
      {
        type: 'knowledge',
        title: '高级符号',
        content: '**无穷大**：\\infty\n\n**约等于**：\\approx\n\n**不等号**：\\leq, \\geq, \\neq\n\n**省略号**：\\ldots, \\cdots'
      },
      {
        type: 'practice',
        question: '请输入无穷大符号',
        target_formula: '$\\infty$',
        hints: ['使用 \\infty 命令']
      },
      {
        type: 'practice',
        question: '请输入 x 约等于 y',
        target_formula: '$x \\approx y$',
        hints: ['使用 \\approx 命令表示约等于']
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

      // 直接比较标准化后的结果
      const result = userNormalized === targetNormalized
      return result

    } catch (e) {
      console.error('答案检查出错:', e)
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

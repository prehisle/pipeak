// 演示版本的API - 使用本地数据模拟后端响应
// 用于GitHub Pages演示，无需真实后端

// 模拟用户数据
const mockUser = {
  id: 'demo-user',
  username: 'demo',
  email: 'demo@example.com'
}

// 模拟课程数据
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
        content: '在LaTeX中，数学公式需要在特殊的数学环境中编写...'
      },
      {
        type: 'practice',
        question: '请输入 x 的平方',
        target_formula: '$x^2$',
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
        content: '使用 \\frac{分子}{分母} 来表示分数...'
      },
      {
        type: 'practice',
        question: '请输入二分之一',
        target_formula: '$\\frac{1}{2}$',
        hints: ['使用 \\frac 命令', '分子和分母都要用花括号包围']
      }
    ]
  }
]

// 模拟练习记录
let mockPracticeRecords = []

// 模拟API响应延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 演示版API
export const demoAPI = {
  // 认证相关
  auth: {
    login: async (credentials) => {
      await delay(500)
      localStorage.setItem('demo_token', 'demo-jwt-token')
      localStorage.setItem('demo_user', JSON.stringify(mockUser))
      return {
        access_token: 'demo-jwt-token',
        refresh_token: 'demo-refresh-token',
        user: mockUser
      }
    },

    register: async (userData) => {
      await delay(500)
      localStorage.setItem('demo_token', 'demo-jwt-token')
      localStorage.setItem('demo_user', JSON.stringify(mockUser))
      return {
        access_token: 'demo-jwt-token',
        refresh_token: 'demo-refresh-token',
        user: mockUser
      }
    },

    getCurrentUser: async () => {
      await delay(200)
      const user = localStorage.getItem('demo_user')
      return user ? JSON.parse(user) : null
    }
  },

  // 课程相关
  lessons: {
    getLessons: async () => {
      await delay(300)
      return { lessons: mockLessons }
    },

    getLesson: async (lessonId) => {
      await delay(300)
      const lesson = mockLessons.find(l => l._id === lessonId)
      return { lesson }
    }
  },

  // 练习相关
  practice: {
    submitAnswer: async (data) => {
      await delay(500)
      
      // 简单的答案验证逻辑
      const isCorrect = data.user_answer.trim().toLowerCase().includes(
        data.target_formula ? data.target_formula.replace(/[$\\{}]/g, '').toLowerCase() : 'x'
      )

      const record = {
        id: Date.now(),
        lesson_id: data.lesson_id,
        card_index: data.card_index,
        user_answer: data.user_answer,
        is_correct: isCorrect,
        submitted_at: new Date()
      }

      mockPracticeRecords.push(record)

      return {
        is_correct: isCorrect,
        feedback: isCorrect ? '答案正确！' : '答案不正确，请再试一次。',
        target_answer: data.target_formula || '$x^2$'
      }
    },

    getPracticeList: async () => {
      await delay(300)
      
      // 生成练习题列表
      const practices = []
      mockLessons.forEach((lesson, lessonIndex) => {
        lesson.cards.forEach((card, cardIndex) => {
          if (card.type === 'practice') {
            const attempts = mockPracticeRecords.filter(
              r => r.lesson_id === lesson._id && r.card_index === cardIndex
            ).length

            const completed = mockPracticeRecords.some(
              r => r.lesson_id === lesson._id && r.card_index === cardIndex && r.is_correct
            )

            practices.push({
              id: `${lesson._id}_${cardIndex}`,
              lesson_id: lesson._id,
              lesson_title: lesson.title,
              card_index: cardIndex,
              question: card.question,
              target_formula: card.target_formula,
              difficulty: 'medium',
              hints: card.hints || [],
              completed,
              attempts,
              last_attempt: attempts > 0 ? new Date() : null
            })
          }
        })
      })

      return { practices, total: practices.length }
    },

    getStats: async () => {
      await delay(300)
      
      const totalAttempts = mockPracticeRecords.length
      const correctCount = mockPracticeRecords.filter(r => r.is_correct).length
      const accuracyRate = totalAttempts > 0 ? (correctCount / totalAttempts * 100) : 0

      return {
        total_practices: 2, // 演示版只有2个练习题
        correct_count: correctCount,
        accuracy_rate: Math.round(accuracyRate),
        total_attempts: totalAttempts,
        difficulty_stats: {
          medium: {
            total: totalAttempts,
            correct: correctCount,
            accuracy: accuracyRate
          }
        },
        recent_activity: mockPracticeRecords.slice(-5).map(r => ({
          lesson_title: mockLessons.find(l => l._id === r.lesson_id)?.title || '未知课程',
          is_correct: r.is_correct,
          submitted_at: r.submitted_at.toISOString()
        }))
      }
    }
  }
}

// 检测是否为演示模式
export const isDemoMode = () => {
  return window.location.hostname.includes('github.io') || 
         window.location.hostname === 'localhost' && window.location.search.includes('demo=true')
}

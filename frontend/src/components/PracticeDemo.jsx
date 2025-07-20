import { useState } from 'react'
import LaTeXEditor from './LaTeXEditor'
import LaTeXPreview from './LaTeXPreview'

const PracticeDemo = () => {
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 示例练习题
  const samplePractice = {
    prompt: "请写出 x 的平方的LaTeX代码：",
    expectedAnswer: "x^2",
    expectedRendered: "$x^2$", // 用于渲染预览的版本
    hints: [
      "提示：上标使用 ^ 符号",
      "提示：如果上标包含多个字符，需要用花括号 {} 包围"
    ]
  }

  const handleSubmit = async (answer) => {
    setIsSubmitting(true)
    setFeedback(null)

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 简单的答案检查逻辑（实际应该调用后端API）
    const normalizedAnswer = answer.trim().replace(/\s+/g, '')
    const normalizedExpected = samplePractice.expectedAnswer.replace(/\s+/g, '')
    
    if (normalizedAnswer === normalizedExpected || 
        normalizedAnswer === `$${normalizedExpected}$` ||
        normalizedAnswer === `x^{2}`) {
      setFeedback({
        isCorrect: true,
        message: "回答正确！很好地掌握了上标的使用方法。"
      })
    } else {
      setFeedback({
        isCorrect: false,
        message: "回答不正确。" + (samplePractice.hints[0] || "请再试一次。")
      })
    }

    setIsSubmitting(false)
  }

  const handleReset = () => {
    setUserAnswer('')
    setFeedback(null)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          LaTeX 练习演示
        </h2>
        <p className="text-gray-600">
          体验实时LaTeX预览和练习功能
        </p>
      </div>

      {/* 练习题目 */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="text-lg font-semibold">练习题</h3>
        </div>
        <div className="card-body">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-4">
            <p className="text-blue-800 font-medium">
              {samplePractice.prompt}
            </p>
          </div>
          
          {/* 期望结果预览 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              期望的渲染效果：
            </label>
            <LaTeXPreview
              latex={samplePractice.expectedRendered}
              className="bg-green-50 border-green-200"
            />
          </div>
        </div>
      </div>

      {/* LaTeX编辑器 */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="text-lg font-semibold">您的答案</h3>
        </div>
        <div className="card-body">
          <LaTeXEditor
            initialValue={userAnswer}
            onChange={setUserAnswer}
            onSubmit={handleSubmit}
            placeholder="在这里输入您的LaTeX代码..."
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* 反馈区域 */}
      {feedback && (
        <div className="card mb-6">
          <div className="card-body">
            <div className={`p-4 rounded-lg ${
              feedback.isCorrect 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className={`text-2xl ${
                    feedback.isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {feedback.isCorrect ? '✅' : '❌'}
                  </span>
                </div>
                <div className="ml-3">
                  <h4 className={`font-semibold ${
                    feedback.isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {feedback.isCorrect ? '回答正确！' : '回答错误'}
                  </h4>
                  <p className={`mt-1 ${
                    feedback.isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {feedback.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleReset}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          重置
        </button>
        
        <div className="text-sm text-gray-500">
          这是一个演示版本，展示了LaTeX实时预览和练习功能的基本工作原理。
        </div>
      </div>

      {/* 使用说明 */}
      <div className="card mt-8">
        <div className="card-header">
          <h3 className="text-lg font-semibold">使用说明</h3>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">功能特点</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 实时LaTeX预览</li>
                <li>• 常用命令快捷插入</li>
                <li>• 智能错误提示</li>
                <li>• 键盘快捷键支持</li>
                <li>• 响应式设计</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">快捷键</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd> 提交答案</li>
                <li>• 点击工具栏按钮快速插入命令</li>
                <li>• 支持标准LaTeX语法</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PracticeDemo

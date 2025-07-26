import React from 'react'
import ThemeSwitcher from '../components/ThemeSwitcher'

const StyleTestPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">暗黑模式课程卡片测试</h1>
          <ThemeSwitcher />
        </div>


      {/* 新版课程卡片样式测试 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">新版课程卡片样式</h2>
        <div className="grid gap-4">
          {/* 待学习课程 */}
          <div className="lesson-card lesson-card-pending">
            <div className="lesson-card-content">
              <div className="lesson-number">
                <span className="font-bold">1</span>
              </div>
              <div className="lesson-info">
                <h3 className="lesson-title">第1课：数学环境与基础语法</h3>
                <p className="lesson-description">
                  学习LaTeX数学公式的基础语法，学习数学环境，上标、下标的使用方法。
                </p>
                <div className="lesson-meta">
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>理论 + 实践</span>
                    <span>约 15 分钟</span>
                  </div>
                </div>
              </div>
              <div className="lesson-actions">
                <button className="lesson-btn lesson-btn-learn">
                  开始学习
                </button>
              </div>
            </div>
          </div>

          {/* 已完成课程 */}
          <div className="lesson-card lesson-card-completed">
            <div className="lesson-card-content">
              <div className="lesson-number">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="lesson-info">
                <h3 className="lesson-title">第2课：分数与根号</h3>
                <p className="lesson-description">
                  学习如何在LaTeX中表示分数和根号，掌握复杂数学表达式的写法。
                </p>
                <div className="lesson-meta">
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>理论 + 实践</span>
                    <span>约 15 分钟</span>
                    <span className="text-green-600 dark:text-green-400">已掌握</span>
                  </div>
                </div>
              </div>
              <div className="lesson-actions">
                <button className="lesson-btn lesson-btn-review">
                  复习
                </button>
              </div>
            </div>
          </div>

          {/* 锁定课程 */}
          <div className="lesson-card lesson-card-locked">
            <div className="lesson-card-content">
              <div className="lesson-number">
                <span className="font-bold">3</span>
              </div>
              <div className="lesson-info">
                <h3 className="lesson-title">第3课：求和与积分符号</h3>
                <p className="lesson-description">
                  学习求和符号、积分符号等复杂数学符号的LaTeX表示方法。
                </p>
                <div className="lesson-meta">
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>理论 + 实践</span>
                    <span>约 20 分钟</span>
                  </div>
                </div>
              </div>
              <div className="lesson-actions">
                <button className="lesson-btn lesson-btn-learn" disabled>
                  🔒 已锁定
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 暗黑模式说明 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">暗黑模式说明</h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">暗黑模式特性：</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>✓ 课程卡片背景自动适配暗黑模式</li>
            <li>✓ 文字颜色在暗黑模式下保持良好对比度</li>
            <li>✓ 已完成课程在暗黑模式下使用深绿色渐变</li>
            <li>✓ 锁定课程在暗黑模式下使用深橙色渐变</li>
            <li>✓ 悬停效果在暗黑模式下增强阴影</li>
          </ul>
          <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              点击右上角的主题切换按钮来测试明亮/暗黑模式的切换效果。
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default StyleTestPage

import React from 'react'

const StyleTestPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">样式测试页面</h1>
      
      {/* Tailwind 基础样式测试 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Tailwind CSS 测试</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">蓝色卡片</h3>
            <p className="text-blue-600">这是一个蓝色主题的卡片</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800">绿色卡片</h3>
            <p className="text-green-600">这是一个绿色主题的卡片</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-red-800">红色卡片</h3>
            <p className="text-red-600">这是一个红色主题的卡片</p>
          </div>
        </div>
      </div>

      {/* 自定义样式测试 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">自定义样式测试</h2>
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">卡片标题</h3>
          </div>
          <div className="card-body">
            <p className="mb-4">这是卡片内容区域。</p>
            <div className="flex gap-4">
              <button className="btn btn-primary">主要按钮</button>
              <button className="btn btn-secondary">次要按钮</button>
            </div>
          </div>
        </div>
      </div>

      {/* 课程列表样式测试 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">课程列表样式测试</h2>
        <div className="space-y-4">
          <div className="lesson-item lesson-pending">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">第1课：数学环境与基础语法</h3>
                <p className="text-base text-gray-600">学习LaTeX数学公式的基础语法，学习数学环境，上标、下标的使用方法。</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="btn btn-secondary btn-sm">学习</button>
            </div>
          </div>

          <div className="lesson-item lesson-completed">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-green-800">第2课：分数与根号</h3>
                <p className="text-base text-green-600">学习如何在LaTeX中表示分数和根号，掌握复杂数学表达式的写法。</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">已完成</span>
              <button className="btn btn-secondary btn-sm">复习</button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS 加载状态检查 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">CSS 加载状态检查</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">样式检查清单：</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>✓ Tailwind CSS 基础样式（颜色、间距、布局）</li>
            <li>✓ 自定义 CSS 变量（--color-primary 等）</li>
            <li>✓ 组件样式（.btn, .card 等）</li>
            <li>✓ 课程列表样式（.lesson-item 等）</li>
          </ul>
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="text-sm text-gray-600">
              如果您看到这个框有正确的黄色背景和边框，说明 Tailwind CSS 正常工作。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StyleTestPage

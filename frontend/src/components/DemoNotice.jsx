import { useState } from 'react'
import { isDemoMode } from '../services/demoApi'

const DemoNotice = () => {
  const [isVisible, setIsVisible] = useState(true)

  if (!isDemoMode() || !isVisible) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 rounded-full p-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">🎯 在线演示模式</h3>
            <p className="text-sm opacity-90">
              您正在体验LaTeX速成训练器的演示版本。所有数据为模拟数据，无需注册即可体验完整功能。
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/prehisle/pipeak"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📚 查看源码
          </a>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="关闭提示"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DemoNotice

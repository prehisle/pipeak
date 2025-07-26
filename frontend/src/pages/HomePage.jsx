import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import ThemeSwitcher from '../components/ThemeSwitcher'
import LanguageSwitcher from '../components/LanguageSwitcher'

const HomePage = () => {
  const { user } = useAuthStore()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  <span className="text-blue-600">LaTeX</span> {t('home.title').replace('LaTeX ', '')}
                </h1>
              </div>
            </div>

            {/* 右侧按钮 */}
            <div className="flex items-center space-x-4">
              {/* 主题和语言切换器 */}
              <div className="flex items-center space-x-2">
                <ThemeSwitcher />
                <LanguageSwitcher />
              </div>

              {user ? (
                <Link
                  to="/app/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('home.enterLearning')}
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {t('home.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('home.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* 标题区域 */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-8">
              <span className="text-3xl text-white">📚</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">LaTeX</span> {t('home.title').replace('LaTeX ', '')}
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
          </div>

          {/* 特色功能 */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.quickStart')}</h3>
              <p className="text-gray-600 text-sm">
                {t('home.quickStartDesc')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.realTimePreview')}</h3>
              <p className="text-gray-600 text-sm">
                {t('home.realTimePreviewDesc')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.smartPractice')}</h3>
              <p className="text-gray-600 text-sm">
                {t('home.smartPracticeDesc')}
              </p>
            </div>
          </div>

          {/* 行动按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/offline-practice"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>⚡</span>
              <span>{t('home.quickExperience')}</span>
            </Link>

            {!user && (
              <Link
                to="/register"
                className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-colors border border-gray-200 hover:border-gray-300"
              >
                {t('home.registerAccount')}
              </Link>
            )}
          </div>

          {/* 说明文字 */}
          <p className="text-gray-500 text-sm mt-6">
            {t('home.experienceNote')}
          </p>
        </div>

        {/* 示例展示 */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.whatYouWillLearn')}</h2>
            <p className="text-gray-600 text-lg">{t('home.fromBasicToAdvanced')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('home.basicSyntax')}</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">x^2</code>
                  <span className="text-gray-400">→</span>
                  <span className="text-lg">x²</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">x_1</code>
                  <span className="text-gray-400">→</span>
                  <span className="text-lg">x₁</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">\\frac{1}{2}</code>
                  <span className="text-gray-400">→</span>
                  <span className="text-lg">½</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('home.advancedFormulas')}</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">\\sqrt{2}</code>
                  <span className="text-gray-400">→</span>
                  <span className="text-lg">√2</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">\\sqrt[3]{8}</code>
                  <span className="text-gray-400">→</span>
                  <span className="text-lg">∛8</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{'\\sum_{i=1}^n'}</code>
                  <span className="text-gray-400">→</span>
                  <span className="text-lg">Σᵢ₌₁ⁿ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>{t('home.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage

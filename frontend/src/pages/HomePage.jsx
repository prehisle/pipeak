import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle, PAGE_TITLES } from '../hooks/useDocumentTitle'
import { useAuthStore } from '../stores/authStore'
import ThemeSwitcher from '../components/ThemeSwitcher'
import LanguageSwitcher from '../components/LanguageSwitcher'
import LaTeXPreview from '../components/LaTeXPreview'

const HomePage = () => {
  const { user } = useAuthStore()
  const { t } = useTranslation()

  // 设置动态页面标题
  useDocumentTitle(PAGE_TITLES.HOME)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 导航栏 */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  <span className="text-blue-600 dark:text-blue-400">LaTeX</span> {t('home.title').replace('LaTeX ', '')}
                </h1>
              </div>
            </div>

            {/* 右侧按钮 */}
            <div className="flex items-center space-x-4">
              {/* GitHub链接 */}
              <a
                href="https://github.com/prehisle/pipeak"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title={t('common.github')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>

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
                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium"
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
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              <span className="text-blue-600 dark:text-blue-400">LaTeX</span> {t('home.title').replace('LaTeX ', '')}
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
          </div>

          {/* 特色功能 */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('home.quickStart')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t('home.quickStartDesc')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('home.realTimePreview')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t('home.realTimePreviewDesc')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('home.smartPractice')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
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
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg transition-colors border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              >
                {t('home.registerAccount')}
              </Link>
            )}
          </div>

          {/* 说明文字 */}
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-6">
            {t('home.experienceNote')}
          </p>
        </div>

        {/* 示例展示 */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('home.whatYouWillLearn')}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">{t('home.fromBasicToAdvanced')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('home.basicSyntax')}</h3>
              <div className="space-y-3 text-left">
                <div className="grid grid-cols-3 items-center gap-4">
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm justify-self-start">x^2</code>
                  <span className="text-gray-400 dark:text-gray-500 justify-self-center">→</span>
                  <div className="text-lg justify-self-end">
                    <LaTeXPreview latex="$x^2$" displayMode={false} />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm justify-self-start">x_1</code>
                  <span className="text-gray-400 dark:text-gray-500 justify-self-center">→</span>
                  <div className="text-lg justify-self-end">
                    <LaTeXPreview latex="$x_1$" displayMode={false} />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm justify-self-start">\frac{1}{2}</code>
                  <span className="text-gray-400 dark:text-gray-500 justify-self-center">→</span>
                  <div className="text-lg justify-self-end">
                    <LaTeXPreview latex={`$\\frac{1}{2}$`} displayMode={false} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('home.advancedFormulas')}</h3>
              <div className="space-y-3 text-left">
                <div className="grid grid-cols-3 items-center gap-4">
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm justify-self-start">\sqrt{2}</code>
                  <span className="text-gray-400 dark:text-gray-500 justify-self-center">→</span>
                  <div className="text-lg justify-self-end">
                    <LaTeXPreview latex={`$\\sqrt{2}$`} displayMode={false} />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm justify-self-start">\sqrt[3]{8}</code>
                  <span className="text-gray-400 dark:text-gray-500 justify-self-center">→</span>
                  <div className="text-lg justify-self-end">
                    <LaTeXPreview latex={`$\\sqrt[3]{8}$`} displayMode={false} />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm justify-self-start">{'\\sum_{i=1}^n'}</code>
                  <span className="text-gray-400 dark:text-gray-500 justify-self-center">→</span>
                  <div className="text-lg justify-self-end">
                    <LaTeXPreview latex={`$\\sum_{i=1}^n$`} displayMode={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400 space-y-4">
            <p>{t('home.copyright')}</p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-6">
                <a
                  href="https://github.com/prehisle/pipeak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span>{t('common.github')}</span>
                </a>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-sm">{t('common.openSource')}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                <span>赞助商:</span>
                <a
                  href="https://yuejxt.cn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <img 
                    src="https://yuejxt.cn/favicon.ico" 
                    alt="跃界星图" 
                    className="w-3 h-3"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <span>跃界星图</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage

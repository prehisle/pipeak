import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { useUserModeStore } from '../stores/userModeStore'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'
import GuestModeNotice from './GuestModeNotice'

const Layout = () => {
  const { user, logout } = useAuthStore()
  const { isGuestMode } = useUserModeStore()
  const { t } = useTranslation()
  const location = useLocation()

  const handleLogout = () => {
    logout()
  }

  const isActive = (path) => {
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">LaTeX {t('common.trainer', 'Trainer')}</span>
            </Link>

            {/* 导航菜单 */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/learning"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/learning')
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('nav.learning')}
              </Link>
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('nav.dashboard')}
              </Link>
              {/* 移除练习中心导航 - 精简为核心学习路径 */}
              <Link
                to="/review"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/review')
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('nav.review')}
              </Link>
            </nav>

            {/* 用户菜单 */}
            <div className="flex items-center space-x-4">
              <ThemeSwitcher />
              <LanguageSwitcher />

              {isGuestMode ? (
                // 游客模式：显示登录/注册按钮
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    {t('nav.login', '登录')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    {t('nav.register', '注册')}
                  </Link>
                </div>
              ) : (
                // 注册用户模式：显示用户信息和退出按钮
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {t('nav.welcome', { email: user?.email })}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 游客模式提示 */}
      <GuestModeNotice />

      {/* 主内容区域 */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* 底部 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; 2024 LaTeX {t('common.trainer', 'Trainer')}. {t('common.slogan', '专注提升数学公式输入效率')}.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout

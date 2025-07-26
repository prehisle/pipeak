import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import { useUserModeStore } from './stores/userModeStore'
import { useEffect } from 'react'

// 页面组件
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import LessonPage from './pages/LessonPage'
import LearningPage from './pages/LearningPage'
// 移除练习中心相关页面 - 精简为核心学习路径
import ReviewPage from './pages/ReviewPage'
import OfflinePracticePage from './pages/OfflinePracticePage'
import TestPage from './pages/TestPage'
import RenderTestPage from './pages/RenderTestPage'

// 布局组件
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const { user, isLoading, checkAuth, initializeAuth, isAuthenticated, isAuthenticatedOrGuest } = useAuthStore()
  const { initializeTheme } = useThemeStore()
  const { initializeUserMode } = useUserModeStore()

  useEffect(() => {
    // 应用启动时初始化用户模式
    initializeUserMode()

    // 应用启动时初始化主题
    initializeTheme()

    // 应用启动时初始化认证头和检查用户认证状态
    initializeAuth()
    checkAuth()
  }, [checkAuth, initializeAuth, initializeTheme, initializeUserMode])

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="App">
        <Routes>
        {/* 首页 - 公开访问 */}
        <Route path="/" element={<HomePage />} />

        {/* 离线练习 - 公开访问 */}
        <Route path="/offline-practice" element={<OfflinePracticePage />} />

        {/* 公开路由 */}
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/app/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated() ? <Navigate to="/app/dashboard" replace /> : <RegisterPage />}
        />

        {/* 测试路由 */}
        <Route path="/test" element={<TestPage />} />
        <Route path="/render-test" element={<RenderTestPage />} />

        {/* 受保护的路由 - 仅限注册用户 */}
        <Route
          path="/app"
          element={isAuthenticated() ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          {/* 将学习中心重定向到仪表盘，避免功能重复 */}
          <Route path="learning" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="lesson/:lessonId" element={<LessonPage />} />
          {/* 移除练习中心相关路由 - 精简为核心学习路径 */}
          <Route path="review" element={<ReviewPage />} />

        </Route>

        {/* 兼容性重定向 */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        
        {/* 404 路由 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App

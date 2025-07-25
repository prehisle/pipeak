import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useEffect } from 'react'

// 页面组件
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import LessonPage from './pages/LessonPage'
import LearningPage from './pages/LearningPage'
// 移除练习中心相关页面 - 精简为核心学习路径
import ReviewPage from './pages/ReviewPage'
import TestPage from './pages/TestPage'
import RenderTestPage from './pages/RenderTestPage'
import StyleTestPage from './pages/StyleTestPage'

// 布局组件
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'
import DemoNotice from './components/DemoNotice'
// 移除练习演示组件
import { isDemoMode } from './services/demoApi'

function App() {
  const { user, isLoading, checkAuth, initializeAuth } = useAuthStore()

  useEffect(() => {
    // 应用启动时初始化认证头和检查用户认证状态
    initializeAuth()

    // 在演示模式下，跳过认证检查
    if (!isDemoMode()) {
      checkAuth()
    }
  }, [checkAuth, initializeAuth])

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
        <DemoNotice />
        <Routes>
        {/* 公开路由 */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />

        {/* 测试路由 */}
        <Route path="/test" element={<TestPage />} />
        <Route path="/render-test" element={<RenderTestPage />} />

        {/* 受保护的路由 */}
        <Route 
          path="/" 
          element={user ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/learning" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="learning" element={<LearningPage />} />
          <Route path="lesson/:lessonId" element={<LessonPage />} />
          {/* 移除练习中心相关路由 - 精简为核心学习路径 */}
          <Route path="review" element={<ReviewPage />} />
          <Route path="style-test" element={<StyleTestPage />} />
        </Route>
        
        {/* 404 路由 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App

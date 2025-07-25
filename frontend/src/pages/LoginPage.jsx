import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { useUserModeStore } from '../stores/userModeStore'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeSwitcher from '../components/ThemeSwitcher'
import Button from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Alert, AlertDescription } from '../components/ui/Alert'
import DataSyncModal from '../components/DataSyncModal'
import dataSyncService from '../services/dataSyncService'
import { isDemoMode } from '../services/demoApi'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  const { login, isLoading, error } = useAuthStore()
  const { isGuestMode, hasLocalData, switchToUserMode } = useUserModeStore()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = t('auth.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.emailInvalid')
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const result = await login(formData.email, formData.password)

    if (result.success) {
      setLoginSuccess(true)

      // 检查是否有本地数据需要同步
      if (isGuestMode && hasLocalData()) {
        setShowSyncModal(true)
      } else {
        // 直接切换到用户模式并跳转
        switchToUserMode()
        navigate('/dashboard')
      }
    }
  }

  const handleSyncData = async () => {
    try {
      const result = await dataSyncService.syncAllData()
      if (result.success) {
        // 同步成功，清除本地数据并切换模式
        await dataSyncService.clearLocalData()
        switchToUserMode()
        setShowSyncModal(false)
        navigate('/dashboard')
      } else {
        console.error('Data sync failed:', result.message)
        // 即使同步失败，也允许用户继续
        switchToUserMode()
        setShowSyncModal(false)
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Data sync error:', error)
      // 同步出错，但仍然允许用户继续
      switchToUserMode()
      setShowSyncModal(false)
      navigate('/dashboard')
    }
  }

  const handleSkipSync = () => {
    // 跳过同步，直接切换到用户模式
    switchToUserMode()
    setShowSyncModal(false)
    navigate('/dashboard')
  }

  const handleCloseSyncModal = () => {
    setShowSyncModal(false)
    // 如果用户关闭模态框，仍然切换到用户模式
    switchToUserMode()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-8">
        {/* 主题和语言切换器 */}
        <div className="flex justify-end space-x-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>

        {/* 头部 */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('auth.loginTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* 登录表单 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* 全局错误提示 */}
          {error && (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* 邮箱输入 */}
            <div className="space-y-2">
              <Label htmlFor="email">
                {t('auth.email')}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                placeholder={t('auth.email')}
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <Label htmlFor="password">
                {t('auth.password')}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                placeholder={t('auth.password')}
              />
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>
          </div>

          {/* 演示模式快速登录 */}
          {isDemoMode() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-blue-800">演示模式</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                您正在使用演示版本，可以直接体验功能，无需真实账户。
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormData({ email: 'demo@example.com', password: 'demo123' })
                  // 自动提交演示登录
                  setTimeout(() => {
                    handleSubmit({ preventDefault: () => {} })
                  }, 100)
                }}
                className="btn btn-secondary w-full text-sm"
              >
                🚀 一键体验演示
              </button>
            </div>
          )}

          {/* 登录按钮 */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={isLoading}
            className="w-full"
          >
            {t('auth.login')}
          </Button>

          {/* 注册链接 */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.noAccount')}{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
              >
                {t('auth.createAccount')}
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* 数据同步模态框 */}
      <DataSyncModal
        isOpen={showSyncModal}
        onClose={handleCloseSyncModal}
        onSync={handleSyncData}
        onSkip={handleSkipSync}
      />
    </div>
  )
}

export default LoginPage

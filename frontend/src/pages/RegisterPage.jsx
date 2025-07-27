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

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const { register, isLoading, error } = useAuthStore()
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
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordMinLength')
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired')
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordMismatch')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const result = await register(formData.email, formData.password)

    if (result.success) {
      setRegistrationSuccess(true)

      // 检查是否有本地数据需要同步
      if (isGuestMode && hasLocalData()) {
        setShowSyncModal(true)
      } else {
        // 直接切换到用户模式并跳转
        switchToUserMode()
        navigate('/app/dashboard')
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
        navigate('/app/dashboard')
      } else {
        console.error('Data sync failed:', result.message)
        // 即使同步失败，也允许用户继续
        switchToUserMode()
        setShowSyncModal(false)
        navigate('/app/dashboard')
      }
    } catch (error) {
      console.error('Data sync error:', error)
      // 同步出错，但仍然允许用户继续
      switchToUserMode()
      setShowSyncModal(false)
      navigate('/app/dashboard')
    }
  }

  const handleSkipSync = () => {
    // 跳过同步，直接切换到用户模式
    switchToUserMode()
    setShowSyncModal(false)
    navigate('/app/dashboard')
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
            {t('auth.registerTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('auth.registerSubtitle')}
          </p>
        </div>

        {/* 注册表单 */}
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
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                placeholder={t('auth.password')}
              />
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* 确认密码输入 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t('auth.confirmPassword')}
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                placeholder={t('auth.confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* 注册按钮 */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={isLoading}
            className="w-full"
          >
            {t('auth.register')}
          </Button>

          {/* 登录链接 */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              {t('auth.hasAccount')}{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                {t('auth.loginNow')}
              </Link>
            </p>

            {/* 返回首页链接 */}
            <p className="text-sm">
              <Link
                to="/"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                ← {t('auth.backToHome')}
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

export default RegisterPage

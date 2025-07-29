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
import GoogleLoginButton from '../components/auth/GoogleLoginButton'


const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

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

      // 直接切换到用户模式并跳转
      switchToUserMode()
      navigate('/app/dashboard')
    }
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

          {/* OAuth 登录选项 */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {t('auth.orContinueWith')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <GoogleLoginButton />
            </div>
          </div>

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
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.noAccount')}{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
              >
                {t('auth.createAccount')}
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


    </div>
  )
}

export default LoginPage

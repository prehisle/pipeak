import React from 'react'
import { useTranslation } from 'react-i18next'

// 函数组件包装器，用于在类组件中使用hooks
const ErrorBoundaryWrapper = ({ children }) => {
  const { t } = useTranslation()

  return (
    <ErrorBoundaryClass t={t}>
      {children}
    </ErrorBoundaryClass>
  )
}

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    const { t } = this.props

    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('errorBoundary.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('errorBoundary.message')}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                {t('errorBoundary.refreshPage')}
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                {t('errorBoundary.backToHome')}
              </button>
            </div>

            {/* 开发模式下显示错误详情 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  {t('errorBoundary.viewDetails')}
                </summary>
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-800 dark:text-red-200 font-mono">
                  <div className="mb-2">
                    <strong>{t('errorBoundary.errorMessage')}</strong>
                    <br />
                    {this.state.error && this.state.error.toString()}
                  </div>
                  <div>
                    <strong>{t('errorBoundary.errorStack')}</strong>
                    <br />
                    {this.state.errorInfo.componentStack}
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundaryWrapper

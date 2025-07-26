import { useState, useEffect } from 'react'

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let hideTimer, closeTimer

    hideTimer = setTimeout(() => {
      setIsVisible(false)
      closeTimer = setTimeout(() => {
        onClose && onClose()
      }, 300) // 等待动画完成
    }, duration)

    return () => {
      clearTimeout(hideTimer)
      clearTimeout(closeTimer)
    }
  }, [duration, onClose])

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg transition-all duration-300 transform"
    
    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0`
    }

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white`
      case 'error':
        return `${baseStyles} bg-red-500 text-white`
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-white`
      default:
        return `${baseStyles} bg-blue-500 text-white`
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '🎉'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        <span className="text-xl mr-3 flex-shrink-0">{getIcon()}</span>
        <div className="flex-1">
          <p className="font-medium whitespace-pre-line">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose && onClose(), 300)
          }}
          className="ml-3 text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// Toast管理器组件
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    const newToast = { id, message, type, duration }

    setToasts(prev => [...prev, newToast])

    // 自动移除 - 使用ref存储定时器ID以便清理
    const timerId = setTimeout(() => {
      removeToast(id)
    }, duration + 300)

    // 存储定时器ID到toast对象中，以便后续清理
    newToast.timerId = timerId
  }

  const removeToast = (id) => {
    setToasts(prev => {
      const toastToRemove = prev.find(toast => toast.id === id)
      if (toastToRemove && toastToRemove.timerId) {
        clearTimeout(toastToRemove.timerId)
      }
      return prev.filter(toast => toast.id !== id)
    })
  }

  const showSuccess = (message, duration) => addToast(message, 'success', duration)
  const showError = (message, duration) => addToast(message, 'error', duration)
  const showWarning = (message, duration) => addToast(message, 'warning', duration)
  const showInfo = (message, duration) => addToast(message, 'info', duration)

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastContainer: () => <ToastContainer toasts={toasts} removeToast={removeToast} />
  }
}

export default Toast

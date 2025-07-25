import React from 'react'
import { cn } from '../../utils/cn'

const Badge = React.forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  
  const variants = {
    default: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
    primary: 'bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100',
    success: 'bg-green-100 text-green-900 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-900 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs rounded-full',
    default: 'px-2.5 py-0.5 text-xs rounded-full',
    lg: 'px-3 py-1 text-sm rounded-full'
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Badge.displayName = 'Badge'

export default Badge

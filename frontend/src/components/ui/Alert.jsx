import React from 'react'
import { cn } from '../../utils/cn'

const Alert = React.forwardRef(({
  className,
  variant = 'default',
  children,
  ...props
}, ref) => {
  const baseClasses = 'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground'
  
  const variants = {
    default: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700',
    success: 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-400 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-400 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-400 border-blue-200 dark:border-blue-800'
  }
  
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        baseClasses,
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <h5
      ref={ref}
      className={cn(
        'mb-1 font-medium leading-none tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h5>
  )
})

AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'text-sm [&_p]:leading-relaxed',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }

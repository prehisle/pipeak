import React from 'react'
import { cn } from '../../utils/cn'

const Input = React.forwardRef(({
  className,
  type = 'text',
  size = 'default',
  variant = 'default',
  error = false,
  disabled = false,
  ...props
}, ref) => {
  const baseClasses = 'flex w-full rounded-md border bg-white dark:bg-gray-800 px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
  
  const variants = {
    default: 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus-visible:ring-blue-500',
    ghost: 'border-0 bg-transparent dark:bg-transparent shadow-none focus-visible:ring-1'
  }
  
  const sizes = {
    sm: 'h-8 px-2 text-xs',
    default: 'h-10 px-3 py-2',
    lg: 'h-12 px-4 py-3 text-base'
  }
  
  const errorClasses = error 
    ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' 
    : ''
  
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        errorClasses,
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
})

Input.displayName = 'Input'

const Textarea = React.forwardRef(({
  className,
  size = 'default',
  variant = 'default',
  error = false,
  disabled = false,
  ...props
}, ref) => {
  const baseClasses = 'flex min-h-[80px] w-full rounded-md border bg-white dark:bg-gray-800 px-3 py-2 text-sm transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical'
  
  const variants = {
    default: 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus-visible:ring-blue-500',
    ghost: 'border-0 bg-transparent dark:bg-transparent shadow-none focus-visible:ring-1'
  }
  
  const sizes = {
    sm: 'px-2 py-1 text-xs min-h-[60px]',
    default: 'px-3 py-2 min-h-[80px]',
    lg: 'px-4 py-3 text-base min-h-[100px]'
  }
  
  const errorClasses = error 
    ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' 
    : ''
  
  return (
    <textarea
      ref={ref}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        errorClasses,
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
})

Textarea.displayName = 'Textarea'

const Label = React.forwardRef(({
  className,
  required = false,
  children,
  ...props
}, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none text-gray-700 dark:text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
})

Label.displayName = 'Label'

export { Input, Textarea, Label }

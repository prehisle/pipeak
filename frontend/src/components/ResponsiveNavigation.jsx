import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * 响应式导航组件
 * 在桌面端显示所有导航按钮，在移动端显示轮播导航
 */
const ResponsiveNavigation = ({ 
  items, 
  currentIndex, 
  onChange, 
  className = '' 
}) => {
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  if (isMobile) {
    return (
      <MobileCarousel 
        items={items}
        currentIndex={currentIndex}
        onChange={onChange}
        className={className}
      />
    )
  }
  
  return (
    <DesktopNavigation 
      items={items}
      currentIndex={currentIndex}
      onChange={onChange}
      className={className}
    />
  )
}

/**
 * 桌面端导航组件
 */
const DesktopNavigation = ({ items, currentIndex, onChange, className }) => {
  return (
    <div className={`flex flex-wrap gap-2 justify-center ${className}`}>
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => onChange(index)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            index === currentIndex
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {item.title}
        </button>
      ))}
    </div>
  )
}

/**
 * 移动端轮播导航组件
 */
const MobileCarousel = ({ items, currentIndex, onChange, className }) => {
  const { t } = useTranslation()
  
  const goToPrevious = () => {
    if (currentIndex > 0) {
      onChange(currentIndex - 1)
    }
  }
  
  const goToNext = () => {
    if (currentIndex < items.length - 1) {
      onChange(currentIndex + 1)
    }
  }
  
  return (
    <div className={`flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      {/* 上一个按钮 */}
      <button
        onClick={goToPrevious}
        disabled={currentIndex === 0}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        aria-label={t('common.previous')}
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* 当前项目信息 */}
      <div className="flex-1 mx-4 text-center">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {items[currentIndex]?.title}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {currentIndex + 1} / {items.length}
        </div>
      </div>
      
      {/* 下一个按钮 */}
      <button
        onClick={goToNext}
        disabled={currentIndex === items.length - 1}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        aria-label={t('common.next')}
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

/**
 * 设备感知Hook
 */
export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState('desktop')

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth

      // 简化设备检测逻辑，主要基于屏幕宽度
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    detectDevice()
    window.addEventListener('resize', detectDevice)
    return () => window.removeEventListener('resize', detectDevice)
  }, [])

  return deviceType
}

export default ResponsiveNavigation

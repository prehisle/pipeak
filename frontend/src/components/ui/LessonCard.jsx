import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../utils/cn'
import { Card, CardContent } from './Card'
import Button from './Button'
import Badge from './Badge'

const LessonCard = ({
  lesson,
  lessonNumber,
  isCompleted = false,
  isLocked = false,
  practiceProgress = { completed: 0, total: 0 },
  className,
  ...props
}) => {
  const { t } = useTranslation()
  
  const getStatusBadge = () => {
    if (isLocked) {
      return <Badge variant="warning" size="sm">🔒 {t('learning.locked', '已锁定')}</Badge>
    }
    if (isCompleted) {
      return <Badge variant="success" size="sm">✓ {t('learning.completed')}</Badge>
    }
    if (practiceProgress.completed > 0) {
      return <Badge variant="primary" size="sm">{t('learning.inProgress')}</Badge>
    }
    return <Badge variant="outline" size="sm">{t('learning.notStarted')}</Badge>
  }
  
  const getActionButton = () => {
    if (isLocked) {
      return (
        <Button variant="outline" size="sm" disabled>
          🔒 {t('learning.locked', '已锁定')}
        </Button>
      )
    }
    
    if (isCompleted) {
      return (
        <Button variant="outline" size="sm" asChild>
          <Link to={`/lesson/${lesson._id}`}>
            {t('learning.reviewLesson')}
          </Link>
        </Button>
      )
    }
    
    const buttonText = practiceProgress.completed > 0 
      ? t('learning.continueLesson')
      : t('learning.startLesson')
    
    return (
      <Button variant="primary" size="sm" asChild>
        <Link to={`/lesson/${lesson._id}`}>
          {buttonText}
        </Link>
      </Button>
    )
  }
  
  const progressPercentage = practiceProgress.total > 0 
    ? Math.round((practiceProgress.completed / practiceProgress.total) * 100)
    : 0
  
  return (
    <Card
      variant="elevated"
      className={cn(
        'transition-all duration-200 hover:scale-[1.02]',
        isCompleted && 'border-l-4 border-l-green-500',
        isLocked && 'border-l-4 border-l-yellow-500 opacity-75',
        !isCompleted && !isLocked && 'border-l-4 border-l-blue-500',
        className
      )}
      {...props}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* 课程信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              {/* 课程编号 */}
              <div className={cn(
                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold',
                isCompleted 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : isLocked
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              )}>
                {lessonNumber}
              </div>
              
              {/* 状态徽章 */}
              {getStatusBadge()}
            </div>
            
            {/* 课程标题 */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
              {lesson.title}
            </h3>
            
            {/* 课程描述 */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
              {lesson.description}
            </p>
            
            {/* 进度信息 */}
            {practiceProgress.total > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('learning.practiceCount', {
                      completed: practiceProgress.completed,
                      total: practiceProgress.total
                    })}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {progressPercentage}%
                  </span>
                </div>
                
                {/* 进度条 */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      isCompleted 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                    )}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* 操作按钮 */}
          <div className="flex-shrink-0">
            {getActionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LessonCard

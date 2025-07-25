/**
 * 进度数据一致性调试工具
 * 用于检测和修复游客模式下的进度显示不一致问题
 */

import { validateProgressConsistency } from './progressCalculator'
import localStorageManager from './localStorage'

/**
 * 调试进度数据一致性
 * @param {Object} lessonStore - lessonStore 实例
 * @param {Object} userModeStore - userModeStore 实例
 */
export function debugProgressConsistency(lessonStore, userModeStore) {
  console.group('🔍 进度数据一致性检查')
  
  try {
    // 获取 lessonStore 的数据
    const lessonStats = lessonStore.getLessonStats()
    const lessonDataSummary = lessonStore.getDataSummary()
    const lessons = lessonStore.lessons
    
    console.log('📊 LessonStore 数据:')
    console.log('  - 课程列表长度:', lessons.length)
    console.log('  - 已完成课程:', lessonStats.completedLessons)
    console.log('  - 总课程数:', lessonStats.totalLessons)
    console.log('  - 进度百分比:', lessonStats.progressPercentage)
    console.log('  - 完整数据摘要:', lessonDataSummary)
    
    // 获取 userModeStore 的数据（已弃用但仍在使用）
    const userDataSummary = userModeStore.getLocalDataSummary()
    
    console.log('📊 UserModeStore 数据 (已弃用):')
    console.log('  - 已完成课程:', userDataSummary.lessonsCompleted)
    console.log('  - 练习次数:', userDataSummary.practiceAttempts)
    console.log('  - 正确率:', userDataSummary.accuracy)
    console.log('  - 完整数据摘要:', userDataSummary)
    
    // 获取原始 localStorage 数据
    const lessonProgress = localStorageManager.getLessonProgress()
    const practiceRecords = localStorageManager.getPracticeRecords()
    
    console.log('💾 LocalStorage 原始数据:')
    console.log('  - 课程进度:', lessonProgress)
    console.log('  - 练习记录数量:', practiceRecords.length)
    
    // 分析课程完成状态的差异
    console.log('🔍 课程完成状态分析:')
    lessons.forEach((lesson, index) => {
      const lessonId = lesson._id
      const isCompletedInStore = lesson.is_completed
      const progressInStorage = lessonProgress[lessonId]
      const isCompletedInStorage = progressInStorage?.isCompleted || false
      
      console.log(`  课程 ${index + 1} (${lessonId}):`)
      console.log(`    - Store中状态: ${isCompletedInStore}`)
      console.log(`    - Storage中状态: ${isCompletedInStorage}`)
      console.log(`    - 是否一致: ${isCompletedInStore === isCompletedInStorage}`)
      
      if (isCompletedInStore !== isCompletedInStorage) {
        console.warn(`    ⚠️ 发现不一致！`)
      }
    })
    
    // 验证一致性
    const validation = validateProgressConsistency(lessonStats, userDataSummary)
    
    console.log('✅ 一致性验证结果:')
    console.log('  - 是否一致:', validation.isConsistent)
    if (!validation.isConsistent) {
      console.log('  - 不一致项:', validation.inconsistencies)
    }
    
    // 提供修复建议
    if (!validation.isConsistent) {
      console.log('🔧 修复建议:')
      console.log('  1. 确保所有组件都使用 lessonStore.getDataSummary()')
      console.log('  2. 停止使用 userModeStore.getLocalDataSummary()')
      console.log('  3. 检查 localDataAdapter 的数据同步逻辑')
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出错:', error)
  }
  
  console.groupEnd()
}

/**
 * 修复进度数据不一致问题
 * @param {Object} lessonStore - lessonStore 实例
 */
export function fixProgressInconsistency(lessonStore) {
  console.group('🔧 修复进度数据不一致')
  
  try {
    const lessons = lessonStore.lessons
    const lessonProgress = localStorageManager.getLessonProgress()
    
    let hasChanges = false
    
    // 同步课程完成状态
    lessons.forEach(lesson => {
      const lessonId = lesson._id
      const isCompletedInStore = lesson.is_completed
      const progressInStorage = lessonProgress[lessonId] || {}
      const isCompletedInStorage = progressInStorage.isCompleted || false
      
      if (isCompletedInStore !== isCompletedInStorage) {
        console.log(`修复课程 ${lessonId} 的完成状态: ${isCompletedInStorage} -> ${isCompletedInStore}`)
        
        const updatedProgress = {
          ...progressInStorage,
          isCompleted: isCompletedInStore,
          updatedAt: new Date().toISOString()
        }
        
        localStorageManager.setLessonProgress(lessonId, updatedProgress)
        hasChanges = true
      }
    })
    
    if (hasChanges) {
      console.log('✅ 进度数据已修复')
      // 触发重新渲染
      window.dispatchEvent(new Event('storage'))
    } else {
      console.log('✅ 进度数据已一致，无需修复')
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error)
  }
  
  console.groupEnd()
}

/**
 * 在开发模式下自动检查进度一致性
 */
export function autoCheckProgressConsistency() {
  if (process.env.NODE_ENV === 'development') {
    // 延迟执行，确保 stores 已初始化
    setTimeout(() => {
      try {
        // 动态导入 stores 以避免循环依赖
        import('../stores/lessonStore').then(({ useLessonStore }) => {
          import('../stores/userModeStore').then(({ useUserModeStore }) => {
            const lessonStore = useLessonStore.getState()
            const userModeStore = useUserModeStore.getState()
            
            debugProgressConsistency(lessonStore, userModeStore)
          })
        })
      } catch (error) {
        console.warn('自动进度一致性检查失败:', error)
      }
    }, 1000)
  }
}

export default {
  debugProgressConsistency,
  fixProgressInconsistency,
  autoCheckProgressConsistency
}

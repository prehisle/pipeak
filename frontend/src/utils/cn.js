/**
 * 合并类名的工具函数
 * 类似于 clsx 或 classnames 库的功能
 */
export function cn(...classes) {
  return classes
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

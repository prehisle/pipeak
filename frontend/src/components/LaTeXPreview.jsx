import { useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const LaTeXPreview = ({
  latex,
  displayMode = false,
  className = '',
  errorColor = '#dc2626',
  placeholder = '在左侧输入LaTeX代码，这里将显示渲染结果...'
}) => {
  const containerRef = useRef(null)

  // 解析混合文本和LaTeX公式
  const parseContent = (content) => {
    if (!content) return []

    const parts = []
    let currentIndex = 0

    // 更精确的正则表达式，避免匹配 $...$ 和 $$...$$ 这样的示例文本
    // 只匹配包含实际数学内容的公式（不是纯省略号或空格）
    const mathRegex = /(\$\$[^$\s][^$]*[^$\s]\$\$|\$[^$\s][^$]*[^$\s]\$)/g
    let match

    while ((match = mathRegex.exec(content)) !== null) {
      // 添加数学公式前的普通文本
      if (match.index > currentIndex) {
        const textPart = content.slice(currentIndex, match.index)
        if (textPart.trim()) {
          parts.push({ type: 'text', content: textPart })
        }
      }

      // 添加数学公式
      const mathContent = match[0]
      const isDisplayMode = mathContent.startsWith('$$')
      const formula = isDisplayMode
        ? mathContent.slice(2, -2)
        : mathContent.slice(1, -1)

      // 检查是否是有效的数学公式（不是纯省略号）
      if (formula.trim() !== '...' && formula.trim() !== '') {
        parts.push({
          type: 'math',
          content: formula,
          displayMode: isDisplayMode
        })
      } else {
        // 如果是省略号或空内容，作为普通文本处理
        parts.push({ type: 'text', content: mathContent })
      }

      currentIndex = match.index + match[0].length
    }

    // 添加剩余的普通文本
    if (currentIndex < content.length) {
      const textPart = content.slice(currentIndex)
      if (textPart.trim()) {
        parts.push({ type: 'text', content: textPart })
      }
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }]
  }

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    container.innerHTML = ''

    if (!latex || latex.trim() === '') {
      container.innerHTML = `<div style="color: #9ca3af; font-style: italic; padding: 1rem; text-align: center;">${placeholder}</div>`
      return
    }

    try {
      const parts = parseContent(latex)

      parts.forEach((part, index) => {
        if (part.type === 'text') {
          // 创建文本节点
          const textSpan = document.createElement('span')
          textSpan.textContent = part.content
          textSpan.style.lineHeight = '1.6'
          container.appendChild(textSpan)
        } else if (part.type === 'math') {
          // 创建数学公式节点
          const mathSpan = document.createElement('span')
          mathSpan.style.display = part.displayMode ? 'block' : 'inline'
          mathSpan.style.margin = part.displayMode ? '0.5rem 0' : '0 0.2rem'

          katex.render(part.content, mathSpan, {
            displayMode: part.displayMode,
            throwOnError: false,
            errorColor: errorColor,
            strict: false,
            trust: false
          })

          container.appendChild(mathSpan)
        }
      })
    } catch (error) {
      container.innerHTML = `
        <div style="color: ${errorColor}; padding: 1rem; border: 1px solid ${errorColor}; border-radius: 0.375rem; background-color: #fef2f2;">
          <strong>LaTeX 渲染错误:</strong><br/>
          ${error.message || '未知错误'}
        </div>
      `
    }
  }, [latex, displayMode, errorColor, placeholder])

  return (
    <div
      ref={containerRef}
      className={`latex-preview ${className}`}
      style={{
        minHeight: '2rem',
        padding: '1rem',
        lineHeight: '1.8',
        fontSize: '16px',
        color: 'inherit',
        backgroundColor: 'transparent'
      }}
    />
  )
}

export default LaTeXPreview

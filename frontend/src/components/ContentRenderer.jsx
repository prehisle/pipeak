import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const ContentRenderer = ({
  content,
  className = '',
  errorColor = '#dc2626'
}) => {
  const { t } = useTranslation()
  const containerRef = useRef(null)

  // 解析内容为结构化数据
  const parseContent = (text) => {
    if (!text) return []

    const result = []
    const paragraphs = text.split('\n\n')

    paragraphs.forEach(paragraph => {
      if (!paragraph.trim()) return

      const lines = paragraph.split('\n')
      const paragraphData = { type: 'paragraph', lines: [] }

      lines.forEach(line => {
        if (!line.trim()) return

        if (line.startsWith('**') && line.endsWith('**')) {
          // 标题
          paragraphData.lines.push({
            type: 'title',
            content: line.slice(2, -2)
          })
        } else if (line.startsWith('• ')) {
          // 列表项
          const listContent = line.slice(2)
          paragraphData.lines.push({
            type: 'list',
            content: listContent
          })
        } else {
          // 普通文本
          paragraphData.lines.push({
            type: 'text',
            content: line
          })
        }
      })

      result.push(paragraphData)
    })

    return result
  }

  // 解析单行内容中的LaTeX、代码和格式
  const parseLineContent = (text) => {
    const parts = []
    let currentIndex = 0

    // 按优先级顺序匹配：代码块 > LaTeX > 粗体
    const patterns = [
      { regex: /`([^`]+)`/g, type: 'code' },
      { regex: /\$\$([^$]+)\$\$/g, type: 'display-math' },
      { regex: /\$([^$]+)\$/g, type: 'inline-math' },
      { regex: /\*\*(.*?)\*\*/g, type: 'bold' }
    ]

    const matches = []

    patterns.forEach(pattern => {
      let match
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags)
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          type: pattern.type,
          content: match[1],
          start: match.index,
          end: match.index + match[0].length,
          full: match[0]
        })
      }
    })

    // 按位置排序，如果位置相同则按优先级排序
    matches.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start
      // 优先级：code > display-math > inline-math > bold
      const priority = { 'code': 0, 'display-math': 1, 'inline-math': 2, 'bold': 3 }
      return priority[a.type] - priority[b.type]
    })

    // 去除重叠的匹配（优先级高的保留）
    const filteredMatches = []
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i]
      let isOverlapped = false

      for (let j = 0; j < filteredMatches.length; j++) {
        const existing = filteredMatches[j]
        // 检查是否重叠
        if (current.start < existing.end && current.end > existing.start) {
          isOverlapped = true
          break
        }
      }

      if (!isOverlapped) {
        filteredMatches.push(current)
      }
    }

    // 重新按位置排序
    filteredMatches.sort((a, b) => a.start - b.start)

    // 构建结果
    filteredMatches.forEach(match => {
      // 添加匹配前的文本
      if (match.start > currentIndex) {
        const textContent = text.slice(currentIndex, match.start)
        if (textContent.trim()) {
          parts.push({ type: 'text', content: textContent })
        }
      }

      // 添加匹配的内容
      parts.push({
        type: match.type,
        content: match.content
      })

      currentIndex = match.end
    })

    // 添加剩余文本
    if (currentIndex < text.length) {
      const textContent = text.slice(currentIndex)
      if (textContent.trim()) {
        parts.push({ type: 'text', content: textContent })
      }
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }]
  }

  // 渲染单个部分
  const renderPart = (part) => {
    const element = document.createElement('span')

    switch (part.type) {
      case 'text':
        element.textContent = part.content
        break

      case 'bold':
        element.innerHTML = `<strong>${part.content}</strong>`
        break

      case 'code':
        element.className = 'bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800'
        element.textContent = part.content
        break

      case 'inline-math':
        element.className = 'inline-block mx-1'
        try {
          // 预处理LaTeX内容
          let processedContent = part.content
          // 修复转义字符问题
          processedContent = processedContent.replace(/\\\\\\\\/g, '\\\\')

          katex.render(processedContent, element, {
            displayMode: false,
            throwOnError: false,
            errorColor: errorColor,
            strict: false,
            trust: true,  // 允许更多LaTeX命令
            macros: {
              // 添加自定义宏定义
              '\\gcd': '\\operatorname{gcd}',
              '\\lcm': '\\operatorname{lcm}',
              '\\Ack': '\\operatorname{Ack}',
              // 矩阵和向量相关宏
              '\\mat': '\\begin{pmatrix}#1\\end{pmatrix}',
              '\\det': '\\begin{vmatrix}#1\\end{vmatrix}',
              // 确保常用命令可用
              '\\vec': '\\overrightarrow{#1}',
              '\\norm': '\\left\\|#1\\right\\|',
            }
          })
        } catch (e) {
          element.textContent = `[LaTeX错误: ${part.content}]`
          element.className = 'text-red-500'
        }
        break

      case 'display-math':
        element.className = 'block my-3 text-center'
        try {
          katex.render(part.content, element, {
            displayMode: true,
            throwOnError: false,
            errorColor: errorColor,
            strict: false,
            trust: false
          })
        } catch (e) {
          element.textContent = `[${t('contentRenderer.latexError', { content: part.content })}]`
          element.className = 'text-red-500 dark:text-red-400 block my-3 text-center'
        }
        break

      default:
        element.textContent = part.content
    }

    return element
  }

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    container.innerHTML = ''

    if (!content || content.trim() === '') {
      container.innerHTML = `<div class="text-gray-400 dark:text-gray-500 italic">${t('contentRenderer.noContent')}</div>`
      return
    }

    try {
      const parsedContent = parseContent(content)

      parsedContent.forEach(paragraph => {
        const paragraphDiv = document.createElement('div')
        paragraphDiv.className = 'mb-4'

        paragraph.lines.forEach(line => {
          const lineDiv = document.createElement('div')

          if (line.type === 'title') {
            lineDiv.className = 'text-lg font-semibold text-gray-900 mb-3'
            lineDiv.textContent = line.content
          } else if (line.type === 'list') {
            lineDiv.className = 'flex items-start mb-2'

            // 创建列表标记
            const bullet = document.createElement('span')
            bullet.className = 'text-blue-600 mr-2 mt-1'
            bullet.textContent = '•'
            lineDiv.appendChild(bullet)

            // 创建内容容器
            const contentDiv = document.createElement('div')
            contentDiv.className = 'flex-1'

            // 解析并渲染列表内容
            const parts = parseLineContent(line.content)
            parts.forEach(part => {
              const partElement = renderPart(part)
              contentDiv.appendChild(partElement)
            })

            lineDiv.appendChild(contentDiv)
          } else {
            lineDiv.className = 'mb-2'

            // 解析并渲染普通文本
            const parts = parseLineContent(line.content)
            parts.forEach(part => {
              const partElement = renderPart(part)
              lineDiv.appendChild(partElement)
            })
          }

          paragraphDiv.appendChild(lineDiv)
        })

        container.appendChild(paragraphDiv)
      })

    } catch (error) {
      console.error('渲染错误:', error)
      container.innerHTML = `
        <div style="color: ${errorColor}; padding: 1rem; border: 1px solid ${errorColor}; border-radius: 0.375rem; background-color: #fef2f2;">
          <strong>渲染错误:</strong><br/>
          ${error.message || '未知错误'}
        </div>
      `
    }
  }, [content, errorColor])

  return (
    <div
      ref={containerRef}
      className={`content-renderer ${className}`}
      style={{
        lineHeight: '1.6',
        fontSize: '15px'
      }}
    />
  )
}

export default ContentRenderer

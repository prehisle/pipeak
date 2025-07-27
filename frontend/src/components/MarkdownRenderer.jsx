import { useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const MarkdownRenderer = ({
  content,
  className = '',
  theme = 'default'
}) => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !content) return

    // 确保content是字符串
    const contentStr = typeof content === 'string' ? content : String(content || '')
    if (!contentStr.trim()) return

    const container = containerRef.current
    container.innerHTML = ''

    try {
      // 创建主容器
      const mainDiv = document.createElement('div')
      mainDiv.className = 'space-y-4'

      // 按段落分割内容
      const paragraphs = contentStr.split('\n\n')

      paragraphs.forEach(paragraph => {
        if (!paragraph.trim()) return

        const paragraphDiv = document.createElement('div')
        paragraphDiv.className = 'mb-4'

        // 按行处理
        const lines = paragraph.split('\n')
        lines.forEach(line => {
          if (!line.trim()) return

          const lineDiv = document.createElement('div')
          lineDiv.className = 'mb-2'

          // 处理不同类型的行
          if (line.startsWith('**') && line.endsWith('**')) {
            // 标题行
            const title = line.slice(2, -2)
            lineDiv.className = 'text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3'
            lineDiv.textContent = title
          } else if (line.startsWith('• ')) {
            // 列表项
            const listContent = line.slice(2).trim()
            lineDiv.className = 'flex items-start mb-3'

            // 创建列表标记
            const bullet = document.createElement('span')
            bullet.className = 'text-blue-500 dark:text-blue-400 mr-3 mt-1 flex-shrink-0'
            bullet.textContent = '•'
            lineDiv.appendChild(bullet)

            // 创建内容容器
            const contentDiv = document.createElement('div')
            contentDiv.className = 'flex-1'

            // 解析并渲染列表内容
            renderLineContent(listContent, contentDiv)

            lineDiv.appendChild(contentDiv)
          } else {
            // 普通文本行
            lineDiv.className = 'mb-2'
            renderLineContent(line, lineDiv)
          }

          paragraphDiv.appendChild(lineDiv)
        })

        mainDiv.appendChild(paragraphDiv)
      })

      container.appendChild(mainDiv)
    } catch (error) {
      console.error('渲染错误:', error)
      container.innerHTML = `
        <div class="text-red-600 p-4 border border-red-300 rounded bg-red-50">
          <strong>渲染错误:</strong><br/>
          ${error.message || '未知错误'}
        </div>
      `
    }
  }, [content])

  // 预处理LaTeX内容，修复兼容性问题
  const preprocessLatex = (latex) => {
    let processed = latex

    // 修复一些KaTeX不支持的命令
    const replacements = {
      // 数论符号替换
      '\\mid': '\\,|\\,',  // 整除符号
      '\\nmid': '\\,\\not|\\,',  // 不整除符号

      // 如果KaTeX不支持某些命令，提供替代方案
      '\\mathbb{Z}': '\\mathbb{Z}',  // 整数集（通常支持）
      '\\mathbb{N}': '\\mathbb{N}',  // 自然数集（通常支持）
      '\\mathbb{R}': '\\mathbb{R}',  // 实数集（通常支持）
      '\\mathbb{C}': '\\mathbb{C}',  // 复数集（通常支持）

      // 高德纳箭头通常KaTeX支持，保持原样
      // 如果渲染有问题，可以启用下面的替代方案
      // '\\uparrow\\uparrow\\uparrow': '\\uparrow\\uparrow\\uparrow',
      // '\\uparrow\\uparrow': '\\uparrow\\uparrow',
    }

    // 应用替换
    for (const [from, to] of Object.entries(replacements)) {
      processed = processed.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to)
    }

    return processed
  }

  // 渲染单行内容
  const renderLineContent = (text, container) => {
    let currentIndex = 0
    const parts = []

    // 按优先级匹配：代码块 > 显示数学 > 行内数学 > 粗体
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

    // 按位置排序并去除重叠
    matches.sort((a, b) => a.start - b.start)
    const filteredMatches = []

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i]
      let isOverlapped = false

      for (let j = 0; j < filteredMatches.length; j++) {
        const existing = filteredMatches[j]
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
          const textSpan = document.createElement('span')
          textSpan.textContent = textContent
          container.appendChild(textSpan)
        }
      }

      // 添加匹配的内容
      const element = document.createElement('span')

      switch (match.type) {
        case 'code':
          element.className = 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded text-lg font-mono border border-gray-300 dark:border-gray-600'  // 添加暗黑模式支持
          element.textContent = match.content
          break

        case 'bold':
          element.innerHTML = `<strong class="font-bold text-gray-900 dark:text-gray-100 text-lg">${match.content}</strong>`  // 增大粗体字体，添加暗黑模式支持
          break

        case 'inline-math':
          element.className = 'inline-block mx-1'
          try {
            // 预处理LaTeX内容，修复一些常见的兼容性问题
            let processedContent = preprocessLatex(match.content)

            katex.render(processedContent, element, {
              displayMode: false,
              throwOnError: false,
              strict: false,
              trust: true,  // 允许更多LaTeX命令
              macros: {
                // 添加自定义宏定义
                '\\gcd': '\\operatorname{gcd}',
                '\\lcm': '\\operatorname{lcm}',
                '\\Ack': '\\operatorname{Ack}',
              }
            })
          } catch (e) {
            console.warn('LaTeX渲染警告:', e, '内容:', match.content)
            element.textContent = `[LaTeX错误: ${match.content}]`
            element.className = 'text-red-500'
          }
          break

        case 'display-math':
          element.className = 'block my-4 text-center'
          try {
            // 预处理LaTeX内容
            let processedContent = preprocessLatex(match.content)

            katex.render(processedContent, element, {
              displayMode: true,
              throwOnError: false,
              strict: false,
              trust: true,  // 允许更多LaTeX命令
              macros: {
                // 添加自定义宏定义
                '\\gcd': '\\operatorname{gcd}',
                '\\lcm': '\\operatorname{lcm}',
                '\\Ack': '\\operatorname{Ack}',
              }
            })
          } catch (e) {
            console.warn('LaTeX渲染警告:', e, '内容:', match.content)
            element.textContent = `[LaTeX错误: ${match.content}]`
            element.className = 'text-red-500 block my-4 text-center'
          }
          break

        default:
          element.textContent = match.content
      }

      container.appendChild(element)
      currentIndex = match.end
    })

    // 添加剩余文本
    if (currentIndex < text.length) {
      const textContent = text.slice(currentIndex)
      if (textContent.trim()) {
        const textSpan = document.createElement('span')
        textSpan.textContent = textContent
        container.appendChild(textSpan)
      }
    }
  }

  // 主题样式
  const themeClasses = {
    default: 'leading-relaxed text-base',  // 统一为16px基础字体
    compact: 'leading-relaxed text-sm',
    large: 'leading-loose text-lg'  // 大主题使用18px
  }

  return (
    <div
      ref={containerRef}
      className={`markdown-renderer ${themeClasses[theme]} ${className}`}
      style={{
        fontSize: theme === 'compact' ? '14px' : theme === 'large' ? '18px' : '16px'  // 统一基础字体为16px
      }}
    />
  )
}

export default MarkdownRenderer

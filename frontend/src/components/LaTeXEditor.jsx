import { useState, useCallback, useMemo } from 'react'
import LaTeXPreview from './LaTeXPreview'

const LaTeXEditor = ({ 
  initialValue = '',
  onChange,
  onSubmit,
  placeholder = '在这里输入LaTeX代码...',
  showPreview = true,
  displayMode = false,
  className = '',
  disabled = false
}) => {
  const [latex, setLatex] = useState(initialValue)

  // 防抖处理，避免频繁渲染
  const debouncedLatex = useMemo(() => {
    const timeoutId = setTimeout(() => latex, 300)
    return () => clearTimeout(timeoutId)
  }, [latex])

  const handleChange = useCallback((e) => {
    const value = e.target.value
    setLatex(value)
    if (onChange) {
      onChange(value)
    }
  }, [onChange])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(latex)
    }
  }, [latex, onSubmit])

  const handleKeyDown = useCallback((e) => {
    // Ctrl+Enter 或 Cmd+Enter 提交
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (onSubmit) {
        onSubmit(latex)
      }
    }
  }, [latex, onSubmit])

  // 常用LaTeX命令快捷插入
  const insertCommand = useCallback((command) => {
    const textarea = document.querySelector('.latex-input')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const before = text.substring(0, start)
    const after = text.substring(end)
    
    const newText = before + command + after
    setLatex(newText)
    
    // 设置光标位置
    setTimeout(() => {
      const cursorPos = start + command.length
      textarea.setSelectionRange(cursorPos, cursorPos)
      textarea.focus()
    }, 0)
    
    if (onChange) {
      onChange(newText)
    }
  }, [onChange])

  const commonCommands = [
    { label: '分数', command: '\\frac{}{} ', description: '分数' },
    { label: '根号', command: '\\sqrt{} ', description: '平方根' },
    { label: '上标', command: '^{} ', description: '上标' },
    { label: '下标', command: '_{} ', description: '下标' },
    { label: 'α', command: '\\alpha ', description: 'alpha' },
    { label: 'β', command: '\\beta ', description: 'beta' },
    { label: 'π', command: '\\pi ', description: 'pi' },
    { label: '∑', command: '\\sum ', description: '求和' },
  ]

  return (
    <div className={`latex-editor ${className}`}>
      {/* 工具栏 */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
          <span className="text-sm text-gray-600 font-medium mr-2">常用命令:</span>
          {commonCommands.map((cmd, index) => (
            <button
              key={index}
              type="button"
              onClick={() => insertCommand(cmd.command)}
              className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              title={cmd.description}
              disabled={disabled}
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-4 ${showPreview ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {/* 输入区域 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LaTeX 代码输入
          </label>
          <form onSubmit={handleSubmit}>
            <textarea
              className="latex-input input textarea w-full"
              value={latex}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={8}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              style={{
                fontFamily: 'Fira Code, JetBrains Mono, Consolas, monospace',
                fontSize: '14px'
              }}
            />
            {onSubmit && (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  提示: 按 Ctrl+Enter 快速提交
                </p>
                <button
                  type="submit"
                  disabled={disabled || !latex.trim()}
                  className="btn btn-primary"
                >
                  提交答案
                </button>
              </div>
            )}
          </form>
        </div>

        {/* 预览区域 */}
        {showPreview && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              实时预览
            </label>
            <LaTeXPreview
              latex={latex ? (displayMode ? `$$${latex}$$` : `$${latex}$`) : ''}
              displayMode={false} // 让LaTeXPreview自己处理displayMode
              className="min-h-[200px] border border-gray-200 rounded-lg"
            />
            {latex && (
              <div className="mt-2 text-xs text-gray-500">
                <p>字符数: {latex.length}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default LaTeXEditor

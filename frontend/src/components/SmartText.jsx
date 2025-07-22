import { useState, useRef, useEffect } from 'react'

const SmartText = ({ 
  text, 
  maxLength = 20, 
  className = '', 
  prefix = '',
  showTooltip = true 
}) => {
  const [isOverflowing, setIsOverflowing] = useState(false)
  const textRef = useRef(null)

  useEffect(() => {
    if (textRef.current) {
      const element = textRef.current
      setIsOverflowing(element.scrollWidth > element.clientWidth)
    }
  }, [text])

  const shouldTruncate = text.length > maxLength
  const displayText = shouldTruncate ? `${text.slice(0, maxLength)}...` : text

  return (
    <span 
      ref={textRef}
      className={`${className} ${shouldTruncate ? 'cursor-help' : ''}`}
      title={showTooltip && shouldTruncate ? `${prefix}${text}` : undefined}
    >
      {prefix && <span className="text-gray-500">{prefix}</span>}
      <span className="font-medium">
        {shouldTruncate ? displayText : text}
      </span>
    </span>
  )
}

export default SmartText

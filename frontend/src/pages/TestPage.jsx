import { useState, useEffect } from 'react'
import LaTeXPreview from '../components/LaTeXPreview'

const TestPage = () => {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 直接测试课程API
  const testLessonsAPI = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 首先注册一个新用户
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `test${Date.now()}@example.com`,
          password: '123456'
        })
      })
      
      if (registerResponse.ok) {
        const registerData = await registerResponse.json()
        const token = registerData.access_token
        
        // 使用token获取课程列表
        const lessonsResponse = await fetch('/api/lessons/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
        
        if (lessonsResponse.ok) {
          const lessonsData = await lessonsResponse.json()
          setLessons(lessonsData.lessons || [])
        } else {
          setError(`课程API错误: ${lessonsResponse.status}`)
        }
      } else {
        setError(`注册失败: ${registerResponse.status}`)
      }
    } catch (err) {
      setError(`网络错误: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testLessonsAPI()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">LaTeX 训练器测试页面</h1>
        
        {/* 课程数据测试 */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-xl font-semibold">课程数据测试</h2>
          </div>
          <div className="card-body">
            {loading ? (
              <p className="text-center py-4">加载中...</p>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">❌ {error}</p>
              </div>
            ) : lessons.length > 0 ? (
              <div className="space-y-4">
                <p className="text-green-700">✅ 成功获取到 {lessons.length} 个课程</p>
                {lessons.map((lesson, index) => (
                  <div key={lesson._id || index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold">{lesson.title}</h3>
                    <p className="text-gray-600">{lesson.description}</p>
                    <p className="text-sm text-gray-500">序号: {lesson.sequence}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-yellow-700">⚠️ 课程列表为空</p>
            )}
          </div>
        </div>

        {/* LaTeX渲染测试 */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">LaTeX 渲染测试</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <h3 className="font-medium mb-2">测试1: 简单上标</h3>
              <LaTeXPreview latex="x^2" />
            </div>
            
            <div>
              <h3 className="font-medium mb-2">测试2: 分数</h3>
              <LaTeXPreview latex="\frac{1}{2}" />
            </div>
            
            <div>
              <h3 className="font-medium mb-2">测试3: 根号</h3>
              <LaTeXPreview latex="\sqrt{x}" />
            </div>
            
            <div>
              <h3 className="font-medium mb-2">测试4: 复杂公式</h3>
              <LaTeXPreview latex="\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" displayMode={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPage

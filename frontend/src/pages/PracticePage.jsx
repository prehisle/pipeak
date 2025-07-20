import { useParams } from 'react-router-dom'

const PracticePage = () => {
  const { practiceId } = useParams()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          练习模式
        </h1>
        <p className="text-gray-600">
          练习 ID: {practiceId}
        </p>
      </div>

      <div className="card">
        <div className="card-body text-center py-12">
          <p className="text-gray-500 text-lg">练习功能正在开发中...</p>
          <p className="text-sm text-gray-400 mt-2">即将为您提供互动式 LaTeX 练习体验</p>
        </div>
      </div>
    </div>
  )
}

export default PracticePage

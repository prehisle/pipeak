const LessonSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
      {/* 课程头部骨架 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* 进度条骨架 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gray-300 h-2 rounded-full w-1/3"></div>
        </div>
      </div>

      {/* 内容卡片骨架 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="space-y-4">
          {/* 知识点内容骨架 */}
          <div className="bg-gray-100 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                </div>
                
                {/* 公式区域骨架 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 导航按钮骨架 */}
      <div className="flex justify-between items-center">
        <div className="h-10 bg-gray-200 rounded w-20"></div>
        <div className="flex space-x-2">
          <div className="h-10 bg-gray-200 rounded w-16"></div>
          <div className="h-10 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}

export default LessonSkeleton

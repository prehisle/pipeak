import React, { useState } from 'react';
import { LightBulbIcon } from '@heroicons/react/24/outline';

/**
 * 增强的反馈组件 - 显示友好的小贴士
 */
const EnhancedFeedback = ({ validationResult }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!validationResult) return null;

  const { result, suggestions = [] } = validationResult;

  // 只显示有建议的情况（correct_but_non_standard）
  if (result !== 'correct_but_non_standard' || !suggestions.length) {
    return null;
  }

  return (
    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
      {/* 小贴士标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LightBulbIcon className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-blue-900 dark:text-blue-100 text-sm">
            小贴士
          </span>
        </div>

        {suggestions.length > 1 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            {showDetails ? '收起' : `查看全部 (${suggestions.length})`}
          </button>
        )}
      </div>

      {/* 建议内容 */}
      <div className="mt-2 space-y-2">
        {/* 显示第一个建议 */}
        {suggestions[0] && (
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p>{suggestions[0].suggestion}</p>
            {suggestions[0].corrected_version && (
              <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-800/50 rounded text-xs font-mono">
                <span className="text-blue-600 dark:text-blue-300">建议写法：</span>
                <span className="text-blue-900 dark:text-blue-100">{suggestions[0].corrected_version}</span>
              </div>
            )}
          </div>
        )}

        {/* 展开显示其他建议 */}
        {showDetails && suggestions.slice(1).map((suggestion, index) => (
          <div key={index + 1} className="text-sm text-blue-800 dark:text-blue-200 border-t border-blue-200 dark:border-blue-700 pt-2">
            <p>{suggestion.suggestion}</p>
            {suggestion.corrected_version && (
              <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-800/50 rounded text-xs font-mono">
                <span className="text-blue-600 dark:text-blue-300">建议写法：</span>
                <span className="text-blue-900 dark:text-blue-100">{suggestion.corrected_version}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};



export default EnhancedFeedback;

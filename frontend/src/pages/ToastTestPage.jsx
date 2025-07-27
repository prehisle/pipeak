import React from 'react'
import { useToast } from '../components/Toast'

const ToastTestPage = () => {
  const { showSuccess, showError, showWarning, showInfo, ToastContainer } = useToast()

  const handleTestSuccess = () => {
    showSuccess('This is a success toast message! It should appear at the top center of the screen.')
  }

  const handleTestError = () => {
    showError('This is an error toast message! It should appear at the top center of the screen.')
  }

  const handleTestWarning = () => {
    showWarning('This is a warning toast message! It should appear at the top center of the screen.')
  }

  const handleTestInfo = () => {
    showInfo('This is an info toast message! It should appear at the top center of the screen.')
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Toast Position Test Page
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
            Click the buttons below to test different types of toast messages. 
            All toasts should appear at the top center of the screen.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleTestSuccess}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Test Success Toast
            </button>
            
            <button
              onClick={handleTestError}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Test Error Toast
            </button>
            
            <button
              onClick={handleTestWarning}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Test Warning Toast
            </button>
            
            <button
              onClick={handleTestInfo}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Test Info Toast
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Expected Behavior:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• All toast messages should appear at the top center of the screen</li>
              <li>• Toasts should slide down from the top when appearing</li>
              <li>• Toasts should slide up and fade out when disappearing</li>
              <li>• Multiple toasts should stack vertically with spacing</li>
              <li>• Each toast should auto-dismiss after 3 seconds</li>
              <li>• Users can manually close toasts by clicking the ✕ button</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}

export default ToastTestPage

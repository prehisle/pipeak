import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';

// 全局处理状态，防止多个组件实例同时处理
const processedCodes = new Set();
let isGloballyProcessing = false;

const OAuthCallbackPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithOAuth } = useAuthStore();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');
  const hasProcessedRef = useRef(false); // 使用ref防止重复处理

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // 强制单次处理检查
      if (hasProcessedRef.current || isGloballyProcessing) {
        return;
      }

      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // 检查授权码是否已处理过
      if (!code || processedCodes.has(code)) {
        return;
      }

      // 设置处理状态
      hasProcessedRef.current = true;
      isGloballyProcessing = true;
      processedCodes.add(code);

      try {

        // 检查是否有错误
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        // 检查是否有授权码
        if (!code) {
          throw new Error('No authorization code received');
        }

        // 根据state参数确定OAuth提供商
        let provider = 'google'; // 默认Google
        if (state === 'github') {
          provider = 'github';
        } else if (state === 'google') {
          provider = 'google';
        }

        setMessage(t('auth.processingOAuth', { provider: provider.charAt(0).toUpperCase() + provider.slice(1) }));

        // 获取API基础URL
        const getApiBaseUrl = () => {
          // 生产环境使用环境变量
          if (import.meta.env.VITE_API_BASE_URL) {
            return import.meta.env.VITE_API_BASE_URL
          }
          // 开发环境默认
          return 'http://localhost:5000/api'
        }

        // 发送授权码到后端
        const apiUrl = `${getApiBaseUrl()}/auth/oauth/${provider}`

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code })
        });

        const data = await response.json();



        if (response.ok) {
          // OAuth登录成功
          console.log('OAuth login successful, setting auth state...');
          await loginWithOAuth(data.access_token, data.user, data.refresh_token);

          setStatus('success');
          setMessage(data.message || t('auth.oauthSuccess'));

          // 获取重定向URL
          const redirectPath = sessionStorage.getItem('oauth_redirect') || '/app/dashboard';
          sessionStorage.removeItem('oauth_redirect');

          // 延迟跳转，让用户看到成功消息
          setTimeout(() => {
            console.log('Redirecting to:', redirectPath);
            navigate(redirectPath);
          }, 1500); // 减少延迟时间
        } else {
          // 显示更详细的错误信息
          const errorMessage = data.error || 'OAuth authentication failed';
          const errorDetails = data.details ? ` (${data.details})` : '';
          console.error('OAuth failed:', errorMessage, errorDetails);
          throw new Error(errorMessage + errorDetails);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || t('auth.oauthError'));

        // 延迟跳转到登录页面
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } finally {
        // 重置全局处理状态，但保持本地状态
        isGloballyProcessing = false;
      }
    };

    // 只在组件首次挂载时执行
    if (!hasProcessedRef.current) {
      handleOAuthCallback();
    }
  }, []); // 空依赖数组，只在挂载时执行一次

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        );
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center space-y-6">
            {getStatusIcon()}
            
            <div className="text-center">
              <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
                {status === 'processing' && t('auth.processing')}
                {status === 'success' && t('auth.success')}
                {status === 'error' && t('auth.error')}
              </h2>
              
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>
              
              {status === 'success' && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  {t('auth.redirecting')}
                </p>
              )}
              
              {status === 'error' && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  {t('auth.redirectingToLogin')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;

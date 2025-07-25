import os
from datetime import timedelta

class ProductionConfig:
    """生产环境配置"""
    
    # 基础配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-super-secret-key-change-in-production'
    DEBUG = False
    TESTING = False
    
    # JWT配置
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # MongoDB配置
    MONGODB_URI = os.environ.get('MONGODB_URI') or 'mongodb://localhost:27017/pipeak'
    MONGODB_DB = os.environ.get('MONGODB_DB') or 'pipeak'
    
    # CORS配置
    CORS_ORIGINS = [
        'https://pipeak.vercel.app',  # 您的Vercel域名
        'https://*.vercel.app',       # Vercel预览域名
        'https://*.onrender.com',     # Render域名
        'http://localhost:5173',      # 本地开发
        'http://localhost:3000'       # 备用本地端口
    ]
    
    # 其他配置
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    JSONIFY_PRETTYPRINT_REGULAR = False

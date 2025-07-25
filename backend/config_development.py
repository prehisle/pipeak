import os
from datetime import timedelta

class DevelopmentConfig:
    """开发环境配置"""
    
    # 基础配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-not-for-production'
    DEBUG = True
    TESTING = False
    
    # JWT配置
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # MongoDB配置 - 开发环境使用本地MongoDB
    MONGODB_URI = os.environ.get('MONGODB_URI') or 'mongodb://user:password@192.168.1.4:27017/?authSource=admin'
    MONGODB_DB = os.environ.get('MONGODB_DB') or 'latex_trainer'
    
    # CORS配置 - 开发环境允许所有本地端口
    CORS_ORIGINS = [
        'http://localhost:5173',
        'http://localhost:5177',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5177',
        'http://127.0.0.1:3000'
    ]
    
    # 其他配置
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    JSONIFY_PRETTYPRINT_REGULAR = True  # 开发环境美化JSON输出

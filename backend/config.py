"""
配置文件 - LaTeX 速成训练器
包含不同环境的配置设置
"""
import os
from datetime import timedelta


class Config:
    """基础配置类"""

    # Flask 基础配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # MongoDB 配置
    MONGODB_URI = os.environ.get('MONGODB_URI') or 'mongodb://user:password@192.168.1.4:27017/latex_trainer?authSource=admin'
    MONGODB_DB = os.environ.get('MONGODB_DB') or 'latex_trainer'

    # JWT 配置
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # CORS 配置
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,https://pipeak.vercel.app').split(',')

    # 管理后台配置
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

    # OAuth 配置
    # Google OAuth
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')

    # GitHub OAuth
    GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID')
    GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET')

    # OAuth回调URL
    OAUTH_REDIRECT_URI = os.environ.get('OAUTH_REDIRECT_URI', 'http://localhost:5173/auth/callback')

    # Token加密密钥
    TOKEN_ENCRYPTION_KEY = os.environ.get('TOKEN_ENCRYPTION_KEY') or 'dev-encryption-key-change-in-production'

    # 应用配置
    DEBUG = False
    TESTING = False


class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    # 继承基础配置的MONGODB_URI和MONGODB_DB


class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    MONGODB_URI = 'mongodb://user:password@192.168.1.4:27017/latex_trainer_test?authSource=admin'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)  # 测试时使用较短的过期时间


class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    # 生产环境应该从环境变量获取敏感信息

    def __init__(self):
        super().__init__()
        SECRET_KEY = os.environ.get('SECRET_KEY')
        JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
        MONGODB_URI = os.environ.get('MONGODB_URI')

        if not SECRET_KEY:
            raise ValueError("No SECRET_KEY set for production environment")
        if not JWT_SECRET_KEY:
            raise ValueError("No JWT_SECRET_KEY set for production environment")
        if not MONGODB_URI:
            raise ValueError("No MONGODB_URI set for production environment")

        self.SECRET_KEY = SECRET_KEY
        self.JWT_SECRET_KEY = JWT_SECRET_KEY
        self.MONGODB_URI = MONGODB_URI


# 配置字典
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


def get_config():
    """获取当前环境的配置"""
    env = os.environ.get('FLASK_ENV', 'development')

    # 如果设置了ENVIRONMENT环境变量，优先使用
    if os.environ.get('ENVIRONMENT') == 'production':
        env = 'production'

    return config.get(env, config['default'])

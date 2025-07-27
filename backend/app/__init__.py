"""
Flask 应用工厂 - LaTeX 速成训练器
"""
from flask import Flask, request, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient

from config import get_config

# 全局变量
mongo_client = None
db = None
jwt = JWTManager()


def create_app(config_name=None):
    """
    Flask 应用工厂函数
    
    Args:
        config_name: 配置名称 ('development', 'testing', 'production')
    
    Returns:
        Flask: 配置好的Flask应用实例
    """
    app = Flask(__name__)
    
    # 加载配置
    if config_name == 'production':
        from config_production import ProductionConfig
        app.config.from_object(ProductionConfig)
    elif config_name:
        from config import config
        app.config.from_object(config[config_name])
    else:
        app.config.from_object(get_config())
    
    # 初始化扩展
    init_extensions(app)
    
    # 初始化数据库
    init_database(app)
    
    # 注册蓝图
    register_blueprints(app)
    
    # 注册错误处理器
    register_error_handlers(app)
    
    return app


def init_extensions(app):
    """初始化Flask扩展"""
    
    # 初始化CORS - 支持局域网访问
    # 获取当前环境，如果是开发环境则允许所有来源
    if app.config.get('DEBUG', False):
        # 开发环境：允许所有来源（包括局域网IP）
        CORS(app, resources={
            r"/api/*": {
                "origins": "*",  # 允许所有来源
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True
            }
        })
    else:
        # 生产环境：使用配置文件中的CORS_ORIGINS
        cors_origins = app.config.get('CORS_ORIGINS', [
            "http://localhost:5173", "http://127.0.0.1:5173"
        ])
        CORS(app, resources={
            r"/api/*": {
                "origins": cors_origins,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True
            }
        })
    
    # 初始化JWT
    jwt.init_app(app)
    
    # JWT错误处理
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print(f"DEBUG JWT: Token expired - header: {jwt_header}, payload: {jwt_payload}")
        return {'message': 'Token has expired'}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"DEBUG JWT: Invalid token - error: {error}")
        return {'message': 'Invalid token'}, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        print(f"DEBUG JWT: Missing token - error: {error}")
        return {'message': 'Authorization token is required'}, 401


def init_database(app):
    """初始化数据库连接"""
    global mongo_client, db

    try:
        # 检查MongoDB URI是否存在
        mongodb_uri = app.config.get('MONGODB_URI')
        if not mongodb_uri:
            raise ValueError("MONGODB_URI is not configured")

        app.logger.info(f"Connecting to MongoDB with URI: {mongodb_uri[:20]}...")

        mongo_client = MongoClient(mongodb_uri)
        db = mongo_client[app.config['MONGODB_DB']]

        # 测试连接
        mongo_client.admin.command('ping')
        app.logger.info(f"Connected to MongoDB: {app.config['MONGODB_DB']}")

        # 创建索引
        create_indexes()

    except Exception as e:
        app.logger.error(f"Failed to connect to MongoDB: {e}")
        raise


def create_indexes():
    """创建数据库索引"""
    if db is None:
        return
    
    try:
        # 用户集合索引
        db.users.create_index("email", unique=True)
        
        # 课程集合索引
        db.lessons.create_index("sequence")
        
        # 复习集合索引
        db.reviews.create_index([("user_id", 1), ("next_review_date", 1)])
        
        print("Database indexes created successfully")
        
    except Exception as e:
        print(f"Error creating indexes: {e}")


def register_blueprints(app):
    """注册蓝图"""

    # 导入并注册认证蓝图
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    # 导入并注册课程蓝图
    from app.routes.lessons import lessons_bp
    app.register_blueprint(lessons_bp, url_prefix='/api/lessons')

    # 导入并注册练习蓝图
    from app.routes.practice import practice_bp
    app.register_blueprint(practice_bp, url_prefix='/api/practice')

    # 导入并注册复习蓝图
    from app.routes.reviews import reviews_bp
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')

    # 初始化管理后台
    from app.admin import init_admin
    init_admin(app)


def register_error_handlers(app):
    """注册错误处理器"""
    
    @app.errorhandler(400)
    def bad_request(error):
        return {'message': 'Bad request'}, 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return {'message': 'Unauthorized'}, 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return {'message': 'Forbidden'}, 403
    
    @app.errorhandler(404)
    def not_found(error):
        return {'message': 'Resource not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'message': 'Internal server error'}, 500


def get_db():
    """获取数据库实例"""
    return db

"""
LaTeX 速成训练器 - 应用入口文件
"""
import os
from app import create_app

# 根据环境变量选择配置
config_name = os.environ.get('FLASK_ENV', 'development')
app = create_app(config_name)

# 添加健康检查端点
@app.route('/api/health')
def health_check():
    return {'status': 'healthy', 'message': 'LaTeX Speed Trainer API is running'}

# 添加环境变量检查端点
@app.route('/api/debug/env')
def check_env():
    """检查关键环境变量是否设置"""
    import os

    env_vars = {
        'MONGODB_URI': 'SET' if os.environ.get('MONGODB_URI') else 'NOT SET',
        'MONGODB_DB': os.environ.get('MONGODB_DB', 'NOT SET'),
        'JWT_SECRET_KEY': 'SET' if os.environ.get('JWT_SECRET_KEY') else 'NOT SET',
        'FLASK_ENV': os.environ.get('FLASK_ENV', 'NOT SET'),
        'ENVIRONMENT': os.environ.get('ENVIRONMENT', 'NOT SET')
    }

    # 如果MONGODB_URI设置了，显示前缀（不显示完整URI以保护安全）
    if os.environ.get('MONGODB_URI'):
        uri = os.environ.get('MONGODB_URI')
        if uri.startswith('mongodb+srv://'):
            env_vars['MONGODB_URI_PREFIX'] = 'mongodb+srv://***'
        elif uri.startswith('mongodb://'):
            env_vars['MONGODB_URI_PREFIX'] = 'mongodb://***'
        else:
            env_vars['MONGODB_URI_PREFIX'] = 'UNKNOWN_FORMAT'

    return {
        'environment_variables': env_vars,
        'config_loaded': app.config.get('MONGODB_URI') is not None
    }

# 添加数据库初始化端点
@app.route('/api/init-db')
def init_database():
    """初始化数据库 - 仅在生产环境首次部署时使用"""
    try:
        import subprocess
        import sys

        # 运行初始化脚本
        result = subprocess.run([
            sys.executable,
            'init_railway_db.py'
        ], capture_output=True, text=True, cwd='/app')

        if result.returncode == 0:
            return {
                'message': 'Database initialized successfully',
                'output': result.stdout
            }
        else:
            return {
                'error': 'Database initialization failed',
                'output': result.stderr
            }, 500

    except Exception as e:
        return {'error': f'Database initialization failed: {str(e)}'}, 500

# 添加强制重新初始化端点
@app.route('/api/reset-db')
def reset_database():
    """强制重新初始化数据库 - 使用comprehensive_lessons.py中的完整课程数据"""
    try:
        from app import get_db
        import sys
        import os

        # 添加backend目录到Python路径
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        if backend_dir not in sys.path:
            sys.path.insert(0, backend_dir)

        # 导入完整课程数据
        from comprehensive_lessons import create_comprehensive_lessons

        db = get_db()
        if db is None:
            return {'error': 'Database connection failed'}, 500

        # 清空所有数据
        db.lessons.delete_many({})
        db.users.delete_many({})
        db.practice_records.delete_many({})
        db.user_progress.delete_many({})

        # 使用comprehensive_lessons.py中的完整课程数据
        lessons = create_comprehensive_lessons()

        # 插入课程数据
        result = db.lessons.insert_many(lessons)

        # 创建管理员用户
        from datetime import datetime
        from bson import ObjectId
        import bcrypt

        admin_user = {
            '_id': ObjectId(),
            'username': 'admin',
            'email': 'admin@pipeak.com',
            'password_hash': bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            'is_admin': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'lesson_progress': {},
            'practice_stats': {
                'total_attempts': 0,
                'correct_answers': 0,
                'accuracy_rate': 0.0
            }
        }

        db.users.insert_one(admin_user)

        return {
            'message': 'Database reset with comprehensive lessons successfully',
            'lesson_count': len(result.inserted_ids),
            'lessons': [lesson['title'] for lesson in lessons[:5]]  # 显示前5课标题
        }

    except Exception as e:
        return {'error': f'Database reset failed: {str(e)}'}, 500

if __name__ == '__main__':
    # 从环境变量获取配置，默认为开发模式
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    host = os.environ.get('FLASK_HOST', '0.0.0.0')  # 监听所有网络接口
    port = int(os.environ.get('FLASK_PORT', 5000))
    
    print(f"Starting LaTeX Speed Trainer API server...")
    print(f"Environment: {os.environ.get('FLASK_ENV', 'development')}")
    print(f"Debug mode: {debug}")
    print(f"Server: http://{host}:{port}")
    
    app.run(
        host=host,
        port=port,
        debug=debug
    )

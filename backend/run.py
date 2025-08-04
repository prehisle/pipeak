"""
LaTeX 速成训练器 - 应用入口文件
"""
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

from app import create_app
from flask import request

# 根据环境变量选择配置
config_name = os.environ.get('FLASK_ENV', 'development')
app = create_app(config_name)

# 添加健康检查端点
@app.route('/api/health')
def health_check():
    return {'status': 'healthy', 'message': 'LaTeX Speed Trainer API is running'}



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

# 添加强制重新初始化端点 - 仅限开发环境
@app.route('/api/reset-db')
def reset_database():
    """强制重新初始化数据库 - 使用comprehensive_lessons.py中的完整课程数据

    安全限制：
    1. 仅在开发环境启用
    2. 生产环境直接拒绝访问
    3. 需要特定的开发环境标识
    """
    # 安全检查：只允许在开发环境使用
    import os

    # 检查环境变量
    env = os.getenv('FLASK_ENV', 'production')
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    dev_secret = os.getenv('DEV_RESET_SECRET', '')

    # 生产环境直接拒绝
    if env == 'production' or not debug_mode:
        return {
            'error': 'Database reset is disabled in production environment',
            'message': 'This endpoint is only available in development mode'
        }, 403

    # 开发环境也需要特殊密钥（可选的额外保护）
    reset_key = request.args.get('dev_key', '')
    if dev_secret and reset_key != dev_secret:
        return {
            'error': 'Invalid development key',
            'message': 'Please provide valid dev_key parameter'
        }, 401

    try:
        from app import get_db
        from bson import ObjectId
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
        db.admins.delete_many({})

        # 使用comprehensive_lessons.py中的完整课程数据
        lessons = create_comprehensive_lessons()

        # 插入课程数据
        result = db.lessons.insert_many(lessons)

        # 初始化默认管理员
        from app.models.admin import Admin
        default_admin = Admin(username='admin', password='admin123')
        default_admin.save()
        print("已创建默认管理员账户: admin / admin123")

        # 自动导入英文翻译数据
        translation_count = 0
        try:
            import json
            with open('translations/lessons_en_US.json', 'r', encoding='utf-8') as f:
                translation_data = json.load(f)

            # 按照课程顺序匹配翻译数据，而不是依赖ID
            for i, lesson_data in enumerate(translation_data['lessons']):
                # 查找对应序号的课程
                existing_lesson = db.lessons.find_one({'sequence': i + 1})
                if existing_lesson:
                    # 更新翻译数据
                    update_data = {}
                    translations = lesson_data.get('translations', {})

                    for lang, trans_data in translations.items():
                        if lang == 'en-US':
                            if 'title' in trans_data:
                                update_data['title_en'] = trans_data['title']
                            if 'description' in trans_data:
                                update_data['description_en'] = trans_data['description']
                            if 'cards' in trans_data:
                                update_data['cards_en'] = trans_data['cards']

                    if update_data:
                        update_result = db.lessons.update_one(
                            {'_id': existing_lesson['_id']},
                            {'$set': update_data}
                        )
                        if update_result.modified_count > 0:
                            translation_count += 1
                            print(f"导入第{i+1}课的英文翻译: {trans_data.get('title', 'Unknown')}")
        except Exception as e:
            print(f"导入翻译数据时出错: {str(e)}")

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
            'message': 'Database reset with comprehensive lessons and translations successfully',
            'lesson_count': len(result.inserted_ids),
            'translation_count': translation_count,
            'admin_created': True,
            'admin_credentials': 'admin / admin123',
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

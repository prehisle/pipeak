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

# 添加数据库初始化端点
@app.route('/api/init-db')
def init_database():
    """初始化数据库 - 仅在生产环境首次部署时使用"""
    try:
        from app import get_db
        from datetime import datetime
        from bson import ObjectId
        import bcrypt

        db = get_db()
        if db is None:
            return {'error': 'Database connection failed'}, 500

        # 检查是否已经初始化过
        lesson_count = db.lessons.count_documents({})
        if lesson_count > 0:
            return {
                'message': 'Database already initialized',
                'lesson_count': lesson_count,
                'user_count': db.users.count_documents({})
            }

        # 创建示例课程
        lessons = [
            {
                '_id': ObjectId(),
                'title': '第1课：数学环境与基础语法',
                'sequence': 1,
                'description': '学习LaTeX数学公式的基础语法，掌握数学环境、上标、下标的使用方法。',
                'cards': [
                    {
                        'type': 'knowledge',
                        'content': '**LaTeX数学环境**\n\nLaTeX数学公式需要在特定环境中编写：\n\n• **行内公式**：使用 `$...$` 包围，如 `$x^2$`\n• **独立公式**：使用 `$$...$$` 包围，如 `$$E = mc^2$$`'
                    },
                    {
                        'type': 'knowledge',
                        'content': '**上标和下标**\n\n• 上标使用 `^` 符号：`$x^2$`\n• 下标使用 `_` 符号：`$x_1$`\n• 同时使用：`$x_1^2$`'
                    },
                    {
                        'type': 'practice',
                        'question': '请输入 LaTeX 代码来表示：x 的平方',
                        'target_formula': '$x^2$',
                        'hints': [
                            '使用 ^ 符号表示上标',
                            '上标内容是 2',
                            '完整格式：$x^2$'
                        ],
                        'difficulty': 'easy'
                    }
                ],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            },
            {
                '_id': ObjectId(),
                'title': '第2课：分数与根号',
                'sequence': 2,
                'description': '学习如何在LaTeX中输入分数和根号，掌握 \\frac 和 \\sqrt 命令的使用。',
                'cards': [
                    {
                        'type': 'knowledge',
                        'content': '**分数表示**\n\n使用 `\\frac{分子}{分母}` 命令：\n\n• `\\frac{1}{2}` → 二分之一\n• `\\frac{a+b}{c-d}` → 复杂分数'
                    },
                    {
                        'type': 'knowledge',
                        'content': '**根号表示**\n\n使用 `\\sqrt{}` 命令：\n\n• `\\sqrt{x}` → 根号x\n• `\\sqrt[3]{x}` → 三次根号x'
                    },
                    {
                        'type': 'practice',
                        'question': '请输入 LaTeX 代码来表示：二分之一',
                        'target_formula': '$\\frac{1}{2}$',
                        'hints': [
                            '使用 \\frac{}{} 命令',
                            '分子是 1，分母是 2',
                            '完整格式：$\\frac{1}{2}$'
                        ],
                        'difficulty': 'easy'
                    }
                ],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
        ]

        # 插入课程数据
        result = db.lessons.insert_many(lessons)

        # 创建管理员用户
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

        # 检查管理员是否已存在
        existing_admin = db.users.find_one({'username': 'admin'})
        if not existing_admin:
            db.users.insert_one(admin_user)

        return {
            'message': 'Database initialized successfully',
            'lesson_count': len(result.inserted_ids),
            'admin_created': not existing_admin
        }

    except Exception as e:
        return {'error': f'Database initialization failed: {str(e)}'}, 500

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

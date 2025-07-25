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
    """强制重新初始化数据库 - 清空所有数据并重新创建"""
    try:
        from app import get_db
        from datetime import datetime
        from bson import ObjectId
        import bcrypt

        db = get_db()
        if db is None:
            return {'error': 'Database connection failed'}, 500

        # 清空所有数据
        db.lessons.delete_many({})
        db.users.delete_many({})
        db.practice_records.delete_many({})
        db.user_progress.delete_many({})

        # 创建5个完整课程
        lessons = [
            # 第1课：数学环境与基础语法
            {
                '_id': ObjectId(),
                'title': '第1课：数学环境与基础语法',
                'sequence': 1,
                'description': '学习LaTeX数学公式的基础语法，掌握数学环境、上标、下标的使用方法。',
                'cards': [
                    {
                        'type': 'knowledge',
                        'content': '**LaTeX数学环境**\n\nLaTeX数学公式需要在特定环境中编写：\n\n• **行内公式**：使用 `$...$` 包围，如 `$x^2$` → $x^2$\n• **独立公式**：使用 `$$...$$` 包围，如 `$$E = mc^2$$` → $$E = mc^2$$'
                    },
                    {
                        'type': 'knowledge',
                        'content': '**上标和下标**\n\n• 上标使用 `^` 符号：`$x^2$` → $x^2$\n• 下标使用 `_` 符号：`$x_1$` → $x_1$\n• 同时使用：`$x_1^2$` → $x_1^2$'
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
            # 第2课：分数与根号
            {
                '_id': ObjectId(),
                'title': '第2课：分数与根号',
                'sequence': 2,
                'description': '学习如何在LaTeX中表示分数和根号，掌握复杂数学表达式的写法。',
                'cards': [
                    {
                        'type': 'knowledge',
                        'content': '**分数表示**\n\n使用 `\\frac{分子}{分母}` 命令：\n\n• `\\frac{1}{2}` → $\\frac{1}{2}$\n• `\\frac{a+b}{c-d}` → $\\frac{a+b}{c-d}$'
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
            },
            # 第3课：希腊字母
            {
                '_id': ObjectId(),
                'title': '第3课：希腊字母与常用符号',
                'sequence': 3,
                'description': '学习常用的希腊字母和数学符号的LaTeX写法。',
                'cards': [
                    {
                        'type': 'knowledge',
                        'content': '**常用希腊字母**\n\n• `\\alpha` → $\\alpha$\n• `\\beta` → $\\beta$\n• `\\pi` → $\\pi$\n• `\\theta` → $\\theta$'
                    },
                    {
                        'type': 'practice',
                        'question': '请输入 LaTeX 代码来表示：π（圆周率）',
                        'target_formula': '$\\pi$',
                        'hints': [
                            '使用 \\pi 命令',
                            '完整格式：$\\pi$'
                        ],
                        'difficulty': 'easy'
                    }
                ],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            },
            # 第4课：函数
            {
                '_id': ObjectId(),
                'title': '第4课：函数与三角函数',
                'sequence': 4,
                'description': '学习函数表示法、三角函数等的LaTeX写法。',
                'cards': [
                    {
                        'type': 'knowledge',
                        'content': '**三角函数**\n\n• `\\sin x` → $\\sin x$\n• `\\cos x` → $\\cos x$\n• `\\log x` → $\\log x$'
                    },
                    {
                        'type': 'practice',
                        'question': '请输入 LaTeX 代码来表示：sin x',
                        'target_formula': '$\\sin x$',
                        'hints': [
                            '使用 \\sin 命令',
                            '完整格式：$\\sin x$'
                        ],
                        'difficulty': 'easy'
                    }
                ],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            },
            # 第5课：求和
            {
                '_id': ObjectId(),
                'title': '第5课：求和与积分',
                'sequence': 5,
                'description': '学习求和符号、积分符号等高级数学记号。',
                'cards': [
                    {
                        'type': 'knowledge',
                        'content': '**求和与积分**\n\n• `\\sum_{i=1}^{n}` → $\\sum_{i=1}^{n}$\n• `\\int_{a}^{b}` → $\\int_{a}^{b}$'
                    },
                    {
                        'type': 'practice',
                        'question': '请输入 LaTeX 代码来表示：从1到n的求和',
                        'target_formula': '$\\sum_{i=1}^{n}$',
                        'hints': [
                            '使用 \\sum 命令',
                            '下标用 _{i=1}，上标用 ^{n}',
                            '完整格式：$\\sum_{i=1}^{n}$'
                        ],
                        'difficulty': 'medium'
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

        db.users.insert_one(admin_user)

        return {
            'message': 'Database reset and initialized successfully',
            'lesson_count': len(result.inserted_ids),
            'lessons': [lesson['title'] for lesson in lessons]
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

#!/usr/bin/env python3
"""
Railway生产环境数据库初始化脚本
用于在MongoDB Atlas中创建完整的课程数据
"""

import os
import sys
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import bcrypt

def connect_to_database():
    """连接到MongoDB Atlas数据库"""
    mongodb_uri = os.environ.get('MONGODB_URI')
    if not mongodb_uri:
        print("❌ 错误: 请设置 MONGODB_URI 环境变量")
        sys.exit(1)
    
    try:
        client = MongoClient(mongodb_uri)
        # 测试连接
        client.admin.command('ping')
        db_name = os.environ.get('MONGODB_DB', 'pipeak')
        db = client[db_name]
        print(f"✅ 成功连接到数据库: {db_name}")
        return db
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        sys.exit(1)

def create_comprehensive_lessons(db):
    """创建完整的10课课程体系"""
    print("📚 创建完整的课程数据...")
    
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
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示：a 下标 1',
                    'target_formula': '$a_1$',
                    'hints': [
                        '使用 _ 符号表示下标',
                        '下标内容是 1',
                        '完整格式：$a_1$'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示：x 下标 max 的平方',
                    'target_formula': '$x_{max}^2$',
                    'hints': [
                        '多个字符的下标需要用花括号包围',
                        '先写下标，再写上标',
                        '完整格式：$x_{max}^2$'
                    ],
                    'difficulty': 'medium'
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
                    'type': 'knowledge',
                    'content': '**根号表示**\n\n使用 `\\sqrt{}` 命令：\n\n• `\\sqrt{x}` → $\\sqrt{x}$\n• `\\sqrt[3]{x}` → $\\sqrt[3]{x}$'
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
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示：根号 x',
                    'target_formula': '$\\sqrt{x}$',
                    'hints': [
                        '使用 \\sqrt{} 命令',
                        '根号内容是 x',
                        '完整格式：$\\sqrt{x}$'
                    ],
                    'difficulty': 'easy'
                }
            ],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        
        # 第3课：希腊字母与常用符号
        {
            '_id': ObjectId(),
            'title': '第3课：希腊字母与常用符号',
            'sequence': 3,
            'description': '学习常用的希腊字母和数学符号的LaTeX写法，为高级数学公式打基础。',
            'cards': [
                {
                    'type': 'knowledge',
                    'content': '**常用希腊字母**\n\n• `\\alpha` → $\\alpha$\n• `\\beta` → $\\beta$\n• `\\gamma` → $\\gamma$\n• `\\delta` → $\\delta$\n• `\\pi` → $\\pi$\n• `\\theta` → $\\theta$'
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
        }
    ]
    
    # 清空现有课程数据
    db.lessons.delete_many({})
    
    # 插入新课程数据
    result = db.lessons.insert_many(lessons)
    print(f"✅ 成功创建 {len(result.inserted_ids)} 个课程")
    
    return lessons

def create_admin_user(db):
    """创建管理员用户"""
    print("👤 创建管理员用户...")
    
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
    
    # 检查是否已存在管理员用户
    existing_admin = db.users.find_one({'username': 'admin'})
    if existing_admin:
        print("⚠️  管理员用户已存在，跳过创建")
        return
    
    db.users.insert_one(admin_user)
    print("✅ 成功创建管理员用户 (用户名: admin, 密码: admin123)")

def main():
    """主函数"""
    print("🚀 开始初始化Railway生产环境数据库...")
    
    # 连接数据库
    db = connect_to_database()
    
    # 创建课程数据
    create_comprehensive_lessons(db)
    
    # 创建管理员用户
    create_admin_user(db)
    
    print("\n🎉 数据库初始化完成！")
    print("\n📋 初始化摘要:")
    print(f"   • 课程数量: {db.lessons.count_documents({})}")
    print(f"   • 用户数量: {db.users.count_documents({})}")
    print("\n🔗 您现在可以访问应用并使用以下账户登录:")
    print("   用户名: admin")
    print("   密码: admin123")

if __name__ == '__main__':
    main()

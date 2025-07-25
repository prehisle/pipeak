#!/usr/bin/env python3
"""
生产环境数据库初始化脚本
用于在MongoDB Atlas中创建初始数据
"""

import os
import sys
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

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

def create_lessons(db):
    """创建课程数据 - 使用comprehensive_lessons.py中的完整数据"""
    print("📚 创建课程数据...")

    # 导入完整的课程数据
    try:
        from comprehensive_lessons import create_comprehensive_lessons
        lessons = create_comprehensive_lessons()
        print(f"✅ 成功导入 {len(lessons)} 个课程数据")
    except ImportError:
        print("⚠️  无法导入comprehensive_lessons.py，使用默认课程数据")
        # 如果无法导入，使用简化的默认数据
        lessons = [
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
                        'type': 'practice',
                        'question': '请输入 LaTeX 代码来表示：x 的平方',
                        'target_formula': '$x^2$',
                        'hints': ['使用 ^ 符号表示上标'],
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
    
    # 检查是否已存在管理员用户
    existing_admin = db.users.find_one({'username': 'admin'})
    if existing_admin:
        print("⚠️  管理员用户已存在，跳过创建")
        return
    
    db.users.insert_one(admin_user)
    print("✅ 成功创建管理员用户 (用户名: admin, 密码: admin123)")

def main():
    """主函数"""
    print("🚀 开始初始化生产环境数据库...")
    
    # 连接数据库
    db = connect_to_database()
    
    # 创建课程数据
    create_lessons(db)
    
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

#!/usr/bin/env python3
"""
测试课程数据是否存在
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, get_db

def test_lessons():
    app = create_app()
    with app.app_context():
        db = get_db()
        
        # 检查课程数量
        lesson_count = db.lessons.count_documents({})
        print(f"数据库中的课程数量: {lesson_count}")
        
        if lesson_count == 0:
            print("❌ 没有找到课程数据！")
            print("需要运行数据初始化脚本")
            return False
        
        # 显示前几个课程
        lessons = list(db.lessons.find({}).sort('sequence', 1).limit(5))
        print(f"\n前 {len(lessons)} 个课程:")
        for lesson in lessons:
            print(f"  课程 {lesson.get('sequence', '?')}: {lesson.get('title', '无标题')}")
            print(f"    描述: {lesson.get('description', '无描述')[:50]}...")
            print(f"    卡片数量: {len(lesson.get('cards', []))}")
            print()
        
        return True

if __name__ == '__main__':
    test_lessons()

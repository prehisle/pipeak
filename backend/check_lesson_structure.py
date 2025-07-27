#!/usr/bin/env python3
"""
检查课程数据结构
"""
import os
import sys
from bson import ObjectId

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, get_db

def check_lesson_structure():
    """检查课程数据结构"""
    app = create_app()
    
    with app.app_context():
        db = get_db()
        
        # 查找分数相关的课程
        lesson = db.lessons.find_one({'title': {'$regex': '分数'}})
        if not lesson:
            print("找不到分数相关的课程")
            return
        
        print(f"课程标题: {lesson['title']}")
        print(f"课程ID: {lesson['_id']}")
        print(f"卡片数量: {len(lesson.get('cards', []))}")
        
        # 打印所有卡片的详细信息
        cards = lesson.get('cards', [])
        for i, card in enumerate(cards):
            print(f"\n卡片 {i}:")
            print(f"  - 题目: {card.get('question', 'N/A')}")
            print(f"  - 目标公式: {card.get('target_formula', 'N/A')}")
            print(f"  - 难度: {card.get('difficulty', 'N/A')}")
            
            # 检查是否有根号相关的题目
            question = card.get('question', '')
            target = card.get('target_formula', '')
            if '根号' in question or 'sqrt' in target.lower():
                print(f"  *** 这是根号题目！***")

if __name__ == '__main__':
    check_lesson_structure()

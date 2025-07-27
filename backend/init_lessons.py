#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
初始化课程数据脚本
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, get_db
from comprehensive_lessons import create_comprehensive_lessons

def init_lessons():
    """初始化课程数据"""
    print("Starting to create comprehensive LaTeX course system...")
    
    # 创建Flask应用上下文
    app = create_app()
    
    with app.app_context():
        # 获取数据库连接
        db = get_db()
        
        # 删除所有现有课程
        result = db.lessons.delete_many({})
        print(f'Deleted {result.deleted_count} old lessons')
        
        # 创建新课程
        lessons = create_comprehensive_lessons()
        
        # 插入新课程到数据库
        if lessons:
            result = db.lessons.insert_many(lessons)
            print(f'Successfully created {len(result.inserted_ids)} new lessons')
        
        # 显示课程概览
        print("\nCourse system overview:")
        for i, lesson in enumerate(lessons, 1):
            cards = lesson['cards']
            knowledge_count = sum(1 for card in cards if card['type'] == 'knowledge')
            practice_count = sum(1 for card in cards if card['type'] == 'practice')
            print(f"{i}. {lesson['title']}")
            print(f"   Knowledge: {knowledge_count}  Practice: {practice_count}")
        
        print(f"\nLaTeX course system creation completed!")
        print(f"Total: {len(lessons)} lessons")
        
        total_knowledge = sum(len([c for c in lesson['cards'] if c['type'] == 'knowledge']) for lesson in lessons)
        total_practice = sum(len([c for c in lesson['cards'] if c['type'] == 'practice']) for lesson in lessons)
        print(f"Total knowledge points: {total_knowledge}")
        print(f"Total practice problems: {total_practice}")

if __name__ == '__main__':
    init_lessons()

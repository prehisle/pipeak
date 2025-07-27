#!/usr/bin/env python3
"""
创建二次根号测试用例，重现用户截图中的问题
"""
import os
import sys
from datetime import datetime, timedelta
from bson import ObjectId

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, get_db

def create_sqrt2_test_case():
    """创建一个√2的复习任务用于测试"""
    app = create_app()
    
    with app.app_context():
        db = get_db()
        
        # 查找用户
        user = db.users.find_one({'email': 'newuser@example.com'})
        if not user:
            print("用户不存在")
            return
        
        user_id = user['_id']
        print(f"找到用户: {user['email']}, ID: {user_id}")
        
        # 首先找到一个现有的lesson来获取真实的lesson_id
        lesson = db.lessons.find_one({'title': {'$regex': '分数'}})
        if not lesson:
            print("找不到分数相关的课程")
            return

        lesson_id = lesson['_id']
        print(f"找到课程: {lesson['title']}, ID: {lesson_id}")

        # 创建一个practice_record
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

        practice_record = {
            'user_id': user_id,
            'lesson_id': lesson_id,
            'card_index': 0,  # 使用第一个卡片
            'completed_at': datetime.utcnow() - timedelta(days=1),  # 昨天完成的
            'is_correct': True
        }

        # 插入practice_record
        practice_result = db.practice_records.insert_one(practice_record)
        print(f"创建practice_record成功，ID: {practice_result.inserted_id}")

        # 创建对应的复习任务
        sqrt2_review = {
            'user_id': str(user_id),  # 确保是字符串格式
            'practice_id': str(practice_result.inserted_id),
            'next_review_date': today,
            'repetitions': 1,
            'easiness_factor': 2.5,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        # 插入复习任务
        result = db.reviews.insert_one(sqrt2_review)
        print(f"创建√2复习任务成功，ID: {result.inserted_id}")
        
        # 验证插入结果
        inserted_review = db.reviews.find_one({'_id': result.inserted_id})
        print(f"验证插入的复习任务:")
        print(f"  - 题目: {inserted_review['question']}")
        print(f"  - 目标公式: {inserted_review['target_formula']}")
        print(f"  - 难度: {inserted_review['difficulty']}")
        print(f"  - 下次复习时间: {inserted_review['next_review_date']}")
        
        # 查看当前所有今天到期的复习任务
        today_reviews = list(db.reviews.find({
            'user_id': str(user_id),
            'next_review_date': {'$lte': datetime.utcnow()}
        }))
        print(f"\n现在有 {len(today_reviews)} 个今天到期的复习任务:")
        for i, review in enumerate(today_reviews):
            print(f"  {i+1}. {review['question']} -> {review['target_formula']}")

if __name__ == '__main__':
    create_sqrt2_test_case()

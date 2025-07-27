#!/usr/bin/env python3
"""
调试复习任务数据
"""
import os
import sys
from datetime import datetime, timedelta
from bson import ObjectId

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, get_db

def debug_reviews():
    """调试复习任务数据"""
    app = create_app()
    
    with app.app_context():
        db = get_db()
        
        # 查找用户
        user = db.users.find_one({'email': 'newuser@example.com'})
        if not user:
            print("用户不存在")
            return
        
        user_id = user['_id']
        print(f"找到用户: {user['email']}, ID: {user_id}, 类型: {type(user_id)}")
        
        # 查看所有复习任务
        all_reviews = list(db.reviews.find({'user_id': str(user_id)}))
        print(f"\n所有复习任务 (user_id为字符串): {len(all_reviews)}")
        for i, review in enumerate(all_reviews):
            print(f"  {i+1}. ID: {review['_id']}, practice_id: {review.get('practice_id', 'N/A')}, next_review: {review['next_review_date']}")
        
        # 查看所有practice_records
        all_practices = list(db.practice_records.find({'user_id': user_id}))
        print(f"\n所有practice_records (user_id为ObjectId): {len(all_practices)}")
        for i, practice in enumerate(all_practices):
            print(f"  {i+1}. ID: {practice['_id']}, lesson_id: {practice['lesson_id']}, card_index: {practice['card_index']}")
        
        # 测试Review模型的get_due_reviews方法
        from app.models.review import Review
        due_reviews = Review.get_due_reviews(str(user_id))
        print(f"\nget_due_reviews返回的任务数: {len(due_reviews)}")
        for i, review in enumerate(due_reviews):
            print(f"  {i+1}. ID: {review._id}, practice_id: {review.practice_id}")
        
        # 查看今天到期的复习任务（原始查询）
        today_end = datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)
        today_reviews = list(db.reviews.find({
            'user_id': str(user_id),
            'next_review_date': {'$lte': today_end}
        }))
        print(f"\n今天到期的复习任务（原始查询）: {len(today_reviews)}")
        for i, review in enumerate(today_reviews):
            print(f"  {i+1}. ID: {review['_id']}, practice_id: {review.get('practice_id', 'N/A')}")

if __name__ == '__main__':
    debug_reviews()

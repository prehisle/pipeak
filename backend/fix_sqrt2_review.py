#!/usr/bin/env python3
"""
修复√2复习任务
"""
import os
import sys
from datetime import datetime, timedelta
from bson import ObjectId

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, get_db

def fix_sqrt2_review():
    """修复√2复习任务"""
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
        
        # 删除没有practice_id的复习任务
        result = db.reviews.delete_many({
            'user_id': str(user_id),
            'practice_id': {'$exists': False}
        })
        print(f"删除了 {result.deleted_count} 个没有practice_id的复习任务")
        
        # 删除practice_id为None的复习任务
        result2 = db.reviews.delete_many({
            'user_id': str(user_id),
            'practice_id': None
        })
        print(f"删除了 {result2.deleted_count} 个practice_id为None的复习任务")
        
        # 找到我们创建的practice_record（card_index为0的）
        practice_record = db.practice_records.find_one({
            'user_id': user_id,
            'card_index': 0
        })
        
        if not practice_record:
            print("找不到card_index为0的practice_record")
            return
        
        print(f"找到practice_record: {practice_record['_id']}")
        
        # 创建正确的复习任务
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        sqrt2_review = {
            'user_id': str(user_id),
            'practice_id': str(practice_record['_id']),
            'next_review_date': today,
            'repetitions': 1,
            'easiness_factor': 2.5,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # 插入复习任务
        result = db.reviews.insert_one(sqrt2_review)
        print(f"创建正确的√2复习任务成功，ID: {result.inserted_id}")
        
        # 验证结果
        from app.models.review import Review
        due_reviews = Review.get_due_reviews(str(user_id))
        print(f"\n现在有 {len(due_reviews)} 个到期的复习任务")

if __name__ == '__main__':
    fix_sqrt2_review()

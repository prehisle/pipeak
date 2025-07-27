#!/usr/bin/env python3
"""
测试脚本：创建当天到期的复习任务
用于测试复习功能
"""
import os
import sys
from datetime import datetime, timedelta
from bson import ObjectId

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, get_db

def create_today_review_tasks():
    """创建一些当天到期的复习任务用于测试"""
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
        
        # 查找用户的练习记录
        practice_records = list(db.practice_records.find({'user_id': user_id}))
        print(f"找到 {len(practice_records)} 个练习记录")
        
        if not practice_records:
            print("没有练习记录，无法创建复习任务")
            return
        
        # 查找现有的复习任务
        existing_reviews = list(db.reviews.find({'user_id': str(user_id)}))
        print(f"找到 {len(existing_reviews)} 个现有复习任务")
        
        # 将前3个复习任务设置为今天到期
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        updated_count = 0
        
        for i, review in enumerate(existing_reviews[:3]):
            # 更新复习任务的到期时间为今天
            result = db.reviews.update_one(
                {'_id': review['_id']},
                {'$set': {'next_review_date': today}}
            )
            if result.modified_count > 0:
                updated_count += 1
                print(f"已将复习任务 {review['_id']} 设置为今天到期")
        
        print(f"总共更新了 {updated_count} 个复习任务为今天到期")
        
        # 验证更新结果
        today_reviews = list(db.reviews.find({
            'user_id': str(user_id),
            'next_review_date': {'$lte': datetime.utcnow()}
        }))
        print(f"现在有 {len(today_reviews)} 个今天到期的复习任务")

if __name__ == '__main__':
    create_today_review_tasks()

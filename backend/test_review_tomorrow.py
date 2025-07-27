#!/usr/bin/env python3
"""
测试脚本：创建第二天到期的复习任务
用于测试第二天复习功能
"""
import os
import sys
from datetime import datetime, timedelta
from bson import ObjectId

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, get_db

def create_tomorrow_review_tasks():
    """创建一些第二天到期的复习任务用于测试"""
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
        
        # 查找现有的复习任务
        existing_reviews = list(db.reviews.find({'user_id': str(user_id)}))
        print(f"找到 {len(existing_reviews)} 个现有复习任务")
        
        # 将一些复习任务设置为明天到期
        tomorrow = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
        updated_count = 0
        
        # 找到那些下次复习时间在5天后的任务（刚才完成的任务）
        five_days_later = datetime.utcnow() + timedelta(days=5)
        recent_reviews = list(db.reviews.find({
            'user_id': str(user_id),
            'next_review_date': {
                '$gte': five_days_later - timedelta(hours=1),
                '$lte': five_days_later + timedelta(hours=1)
            }
        }))
        
        print(f"找到 {len(recent_reviews)} 个最近完成的复习任务")
        
        # 将前2个设置为明天到期
        for i, review in enumerate(recent_reviews[:2]):
            result = db.reviews.update_one(
                {'_id': review['_id']},
                {'$set': {'next_review_date': tomorrow}}
            )
            if result.modified_count > 0:
                updated_count += 1
                print(f"已将复习任务 {review['_id']} 设置为明天到期")
        
        print(f"总共更新了 {updated_count} 个复习任务为明天到期")
        
        # 验证更新结果
        tomorrow_reviews = list(db.reviews.find({
            'user_id': str(user_id),
            'next_review_date': {
                '$gte': tomorrow,
                '$lt': tomorrow + timedelta(days=1)
            }
        }))
        print(f"现在有 {len(tomorrow_reviews)} 个明天到期的复习任务")
        
        # 显示明天的复习任务详情
        for review in tomorrow_reviews:
            print(f"  - 任务ID: {review['_id']}, 卡片: {review.get('card_index', 'N/A')}, 下次复习: {review['next_review_date']}")

if __name__ == '__main__':
    create_tomorrow_review_tasks()

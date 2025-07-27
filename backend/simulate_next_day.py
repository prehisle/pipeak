#!/usr/bin/env python3
"""
模拟脚本：将明天到期的复习任务设置为今天到期
用于测试第二天复习功能
"""
import os
import sys
from datetime import datetime, timedelta
from bson import ObjectId

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, get_db

def simulate_next_day():
    """模拟时间推进到第二天，将明天到期的复习任务设置为今天到期"""
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
        
        # 查找明天到期的复习任务
        tomorrow = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
        tomorrow_reviews = list(db.reviews.find({
            'user_id': str(user_id),
            'next_review_date': {
                '$gte': tomorrow,
                '$lt': tomorrow + timedelta(days=1)
            }
        }))
        
        print(f"找到 {len(tomorrow_reviews)} 个明天到期的复习任务")
        
        # 将明天到期的任务设置为今天到期
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        updated_count = 0
        
        for review in tomorrow_reviews:
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
        
        # 显示今天的复习任务详情（前5个）
        for i, review in enumerate(today_reviews[:5]):
            print(f"  - 任务ID: {review['_id']}, 卡片: {review.get('card_index', 'N/A')}, 下次复习: {review['next_review_date']}")

if __name__ == '__main__':
    simulate_next_day()

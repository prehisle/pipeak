#!/usr/bin/env python3
"""
修复card_index，使用正确的√2题目
"""
import os
import sys
from datetime import datetime, timedelta
from bson import ObjectId

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, get_db

def fix_card_index():
    """修复card_index"""
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
        
        # 找到我们创建的practice_record（card_index为0的）
        practice_record = db.practice_records.find_one({
            'user_id': user_id,
            'card_index': 0
        })
        
        if not practice_record:
            print("找不到card_index为0的practice_record")
            return
        
        print(f"找到practice_record: {practice_record['_id']}")
        
        # 更新card_index为3（√2题目）
        result = db.practice_records.update_one(
            {'_id': practice_record['_id']},
            {'$set': {'card_index': 3}}
        )
        
        if result.modified_count > 0:
            print("成功更新card_index为3")
        else:
            print("更新失败")
            return
        
        # 验证更新结果
        updated_record = db.practice_records.find_one({'_id': practice_record['_id']})
        print(f"更新后的card_index: {updated_record['card_index']}")
        
        print("\n现在刷新复习页面应该能看到√2题目了！")

if __name__ == '__main__':
    fix_card_index()

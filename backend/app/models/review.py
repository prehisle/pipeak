"""
复习模型 - LaTeX 速成训练器
基于SM-2算法的间隔复习系统
"""
from datetime import datetime, timedelta
from bson import ObjectId
from app import get_db


class Review:
    """复习模型类 - 实现SM-2间隔复习算法"""
    
    def __init__(self, user_id=None, practice_id=None, next_review_date=None, 
                 easiness_factor=2.5, repetitions=0, last_interval_days=0, _id=None, created_at=None):
        self._id = _id or ObjectId()
        self.user_id = str(user_id) if user_id else None
        self.practice_id = str(practice_id) if practice_id else None
        self.next_review_date = next_review_date or datetime.utcnow()
        self.easiness_factor = easiness_factor  # SM-2算法的E-Factor，初始值2.5
        self.repetitions = repetitions  # 连续正确回答次数
        self.last_interval_days = last_interval_days  # 上次间隔天数
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            '_id': str(self._id),
            'user_id': self.user_id,
            'practice_id': self.practice_id,
            'next_review_date': self.next_review_date.isoformat(),
            'easiness_factor': self.easiness_factor,
            'repetitions': self.repetitions,
            'last_interval_days': self.last_interval_days,
            'created_at': self.created_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data):
        """从字典创建复习实例"""
        review = cls()
        review._id = data.get('_id', ObjectId())
        review.user_id = data.get('user_id')
        review.practice_id = data.get('practice_id')
        
        # 处理日期字段
        next_review_date = data.get('next_review_date')
        if isinstance(next_review_date, str):
            review.next_review_date = datetime.fromisoformat(next_review_date.replace('Z', '+00:00'))
        else:
            review.next_review_date = next_review_date or datetime.utcnow()
        
        review.easiness_factor = data.get('easiness_factor', 2.5)
        review.repetitions = data.get('repetitions', 0)
        review.last_interval_days = data.get('last_interval_days', 0)
        
        created_at = data.get('created_at')
        if isinstance(created_at, str):
            review.created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        else:
            review.created_at = created_at or datetime.utcnow()
        
        return review
    
    def save(self):
        """保存复习记录到数据库"""
        db = get_db()
        review_data = {
            'user_id': self.user_id,
            'practice_id': self.practice_id,
            'next_review_date': self.next_review_date,
            'easiness_factor': self.easiness_factor,
            'repetitions': self.repetitions,
            'last_interval_days': self.last_interval_days,
            'created_at': self.created_at
        }
        
        # 检查是否是更新操作（_id存在且在数据库中存在）
        if self._id and db.reviews.find_one({'_id': self._id}):
            # 更新现有复习记录
            result = db.reviews.update_one(
                {'_id': self._id},
                {'$set': review_data}
            )
            return result.modified_count > 0
        else:
            # 创建新复习记录
            result = db.reviews.insert_one(review_data)
            self._id = result.inserted_id
            return True
    
    @classmethod
    def find_by_user_and_practice(cls, user_id, practice_id):
        """根据用户ID和练习ID查找复习记录"""
        db = get_db()
        review_data = db.reviews.find_one({
            'user_id': str(user_id),
            'practice_id': str(practice_id)
        })
        if review_data:
            return cls.from_dict(review_data)
        return None
    
    @classmethod
    def get_due_reviews(cls, user_id, date=None):
        """获取用户到期的复习任务"""
        if date is None:
            date = datetime.utcnow()
        
        db = get_db()
        reviews_data = db.reviews.find({
            'user_id': str(user_id),
            'next_review_date': {'$lte': date}
        }).sort([('next_review_date', 1)])
        
        reviews = []
        for review_data in reviews_data:
            reviews.append(cls.from_dict(review_data))
        return reviews
    
    @classmethod
    def get_user_reviews(cls, user_id):
        """获取用户的所有复习记录"""
        db = get_db()
        reviews_data = db.reviews.find({'user_id': str(user_id)})
        
        reviews = []
        for review_data in reviews_data:
            reviews.append(cls.from_dict(review_data))
        return reviews
    
    def update_review_schedule(self, is_correct, quality=3):
        """
        根据SM-2算法更新复习计划
        
        Args:
            is_correct (bool): 用户是否回答正确
            quality (int): 回答质量 (0-5)，3表示勉强正确，5表示完美
        """
        if is_correct:
            if self.repetitions == 0:
                interval = 1
            elif self.repetitions == 1:
                interval = 6
            else:
                interval = round(self.last_interval_days * self.easiness_factor)
            
            self.repetitions += 1
            self.last_interval_days = interval
            self.next_review_date = datetime.utcnow() + timedelta(days=interval)
        else:
            # 回答错误，重置重复次数，明天再复习
            self.repetitions = 0
            self.last_interval_days = 1
            self.next_review_date = datetime.utcnow() + timedelta(days=1)
        
        # 更新难度因子
        self.easiness_factor = max(1.3, self.easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
        
        return self.save()
    
    @classmethod
    def create_or_update_review(cls, user_id, practice_id, is_correct, quality=3):
        """创建或更新复习记录"""
        # 查找现有记录
        existing_review = cls.find_by_user_and_practice(user_id, practice_id)
        
        if existing_review:
            # 更新现有记录
            existing_review.update_review_schedule(is_correct, quality)
            return existing_review
        else:
            # 创建新记录
            review = cls(user_id=user_id, practice_id=practice_id)
            review.update_review_schedule(is_correct, quality)
            return review
    
    @classmethod
    def get_review_stats(cls, user_id):
        """获取用户复习统计信息"""
        db = get_db()
        
        # 总复习题目数
        total_reviews = db.reviews.count_documents({'user_id': str(user_id)})
        
        # 今日到期复习数
        today = datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)
        due_today = db.reviews.count_documents({
            'user_id': str(user_id),
            'next_review_date': {'$lte': today}
        })
        
        # 明日到期复习数
        tomorrow = today + timedelta(days=1)
        due_tomorrow = db.reviews.count_documents({
            'user_id': str(user_id),
            'next_review_date': {'$gte': today, '$lte': tomorrow}
        })
        
        return {
            'total_reviews': total_reviews,
            'due_today': due_today,
            'due_tomorrow': due_tomorrow
        }
    
    def is_due(self, date=None):
        """检查是否到期需要复习"""
        if date is None:
            date = datetime.utcnow()
        return self.next_review_date <= date

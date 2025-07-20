"""
课程模型 - LaTeX 速成训练器
"""
from datetime import datetime
from bson import ObjectId
from app import get_db


class Lesson:
    """课程模型类"""
    
    def __init__(self, title=None, sequence=None, description=None, cards=None, _id=None, created_at=None):
        self._id = _id or ObjectId()
        self.title = title
        self.sequence = sequence  # 课程顺序，用于线性学习
        self.description = description
        self.cards = cards or []  # 课程卡片列表
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            '_id': str(self._id),
            'title': self.title,
            'sequence': self.sequence,
            'description': self.description,
            'cards': self.cards,
            'created_at': self.created_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data):
        """从字典创建课程实例"""
        lesson = cls()
        lesson._id = data.get('_id', ObjectId())
        lesson.title = data.get('title')
        lesson.sequence = data.get('sequence')
        lesson.description = data.get('description')
        lesson.cards = data.get('cards', [])
        lesson.created_at = data.get('created_at', datetime.utcnow())
        return lesson
    
    def save(self):
        """保存课程到数据库"""
        db = get_db()
        lesson_data = {
            'title': self.title,
            'sequence': self.sequence,
            'description': self.description,
            'cards': self.cards,
            'created_at': self.created_at
        }
        
        # 检查是否是更新操作（_id存在且在数据库中存在）
        if self._id and db.lessons.find_one({'_id': self._id}):
            # 更新现有课程
            result = db.lessons.update_one(
                {'_id': self._id},
                {'$set': lesson_data}
            )
            return result.modified_count > 0
        else:
            # 创建新课程
            result = db.lessons.insert_one(lesson_data)
            self._id = result.inserted_id
            return True
    
    @classmethod
    def find_by_id(cls, lesson_id):
        """根据ID查找课程"""
        db = get_db()
        if isinstance(lesson_id, str):
            lesson_id = ObjectId(lesson_id)
        
        lesson_data = db.lessons.find_one({'_id': lesson_id})
        if lesson_data:
            return cls.from_dict(lesson_data)
        return None
    
    @classmethod
    def find_by_sequence(cls, sequence):
        """根据序号查找课程"""
        db = get_db()
        lesson_data = db.lessons.find_one({'sequence': sequence})
        if lesson_data:
            return cls.from_dict(lesson_data)
        return None
    
    @classmethod
    def get_all_lessons(cls, sort_by_sequence=True):
        """获取所有课程"""
        db = get_db()
        sort_criteria = [('sequence', 1)] if sort_by_sequence else []
        lessons_data = db.lessons.find().sort(sort_criteria)
        
        lessons = []
        for lesson_data in lessons_data:
            lessons.append(cls.from_dict(lesson_data))
        return lessons
    
    @classmethod
    def get_lessons_up_to_sequence(cls, max_sequence):
        """获取指定序号之前的所有课程（用于检查用户解锁权限）"""
        db = get_db()
        lessons_data = db.lessons.find({'sequence': {'$lte': max_sequence}}).sort([('sequence', 1)])
        
        lessons = []
        for lesson_data in lessons_data:
            lessons.append(cls.from_dict(lesson_data))
        return lessons
    
    @classmethod
    def get_next_lesson(cls, current_sequence):
        """获取下一课程"""
        db = get_db()
        lesson_data = db.lessons.find_one({'sequence': current_sequence + 1})
        if lesson_data:
            return cls.from_dict(lesson_data)
        return None
    
    @classmethod
    def get_total_count(cls):
        """获取课程总数"""
        db = get_db()
        return db.lessons.count_documents({})
    
    def add_card(self, card_type, content=None, practice_id=None):
        """添加课程卡片"""
        card = {
            'type': card_type,  # 'knowledge' 或 'practice'
            'content': content,  # 知识点内容（对于knowledge类型）
            'practice_id': str(practice_id) if practice_id else None  # 练习ID（对于practice类型）
        }
        self.cards.append(card)
        return self.save()
    
    def get_practice_cards(self):
        """获取课程中的所有练习卡片"""
        return [card for card in self.cards if card['type'] == 'practice']
    
    def get_knowledge_cards(self):
        """获取课程中的所有知识点卡片"""
        return [card for card in self.cards if card['type'] == 'knowledge']

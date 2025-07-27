"""
课程模型 - LaTeX 速成训练器
"""
from datetime import datetime
from bson import ObjectId
from app import get_db


class Lesson:
    """课程模型类"""
    
    def __init__(self, title=None, sequence=None, description=None, cards=None, _id=None, created_at=None,
                 title_en=None, description_en=None, cards_en=None):
        self._id = _id or ObjectId()
        self.title = title
        self.sequence = sequence  # 课程顺序，用于线性学习
        self.description = description
        self.cards = cards or []  # 课程卡片列表
        # 多语言支持
        self.title_en = title_en
        self.description_en = description_en
        self.cards_en = cards_en or []
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self, language='zh-CN'):
        """转换为字典格式，支持多语言"""
        # 根据语言选择对应的字段
        if language == 'en-US' and self.title_en:
            title = self.title_en
            description = self.description_en
            cards = self.cards_en if self.cards_en else self.cards
        else:
            title = self.title
            description = self.description
            cards = self.cards

        # 将cards转换为前端期望的格式
        # 前端期望的是知识点和练习题混合的结构，每个卡片都是一个独立的知识点
        knowledge_points = []
        knowledge_point_counter = 0
        practice_counter = 0

        for i, card in enumerate(cards):
            if card['type'] == 'knowledge':
                knowledge_point_counter += 1
                # 根据语言返回合适的标题
                if language == 'en-US' and hasattr(self, 'cards_en') and self.cards_en and i < len(self.cards_en):
                    en_card = self.cards_en[i]
                    kp_title = en_card.get('title', f'Knowledge Point {knowledge_point_counter}')
                    kp_content = en_card.get('content', '')
                else:
                    kp_title = card.get('title', f'知识点 {knowledge_point_counter}')
                    kp_content = card.get('content', '')

                knowledge_points.append({
                    'id': f"{str(self._id)}_knowledge_{i}",
                    'title': kp_title,
                    'content': kp_content,
                    'titleKey': card.get('titleKey'),
                    'contentKey': card.get('contentKey'),
                    'exercises': []  # 知识点类型没有练习题
                })
            elif card['type'] == 'practice':
                practice_counter += 1
                # 根据语言返回合适的练习题标题和内容
                if language == 'en-US' and hasattr(self, 'cards_en') and self.cards_en and i < len(self.cards_en):
                    en_card = self.cards_en[i]
                    practice_title = f'Practice Exercise {practice_counter}'
                    question = en_card.get('question', card.get('question', ''))
                    hints = en_card.get('hints', card.get('hints', []))
                else:
                    practice_title = f'练习题 {practice_counter}'
                    question = card.get('question', '')
                    hints = card.get('hints', [])

                # 练习题也作为一个知识点，但包含exercises数组
                knowledge_points.append({
                    'id': f"{str(self._id)}_practice_{i}",
                    'title': practice_title,
                    'content': '',
                    'exercises': [{
                        'id': f"{str(self._id)}_exercise_{i}",
                        'question': question,
                        'target_formula': card.get('target_formula', ''),
                        'hints': hints,
                        'difficulty': card.get('difficulty', 'easy')
                    }]
                })

        # 为了向后兼容，也生成分离的exercises数组
        exercises = []
        for i, card in enumerate(cards):
            if card['type'] == 'practice':
                exercises.append({
                    'id': f"{str(self._id)}_practice_{i}",
                    'question': card.get('question', ''),
                    'target_formula': card.get('target_formula', ''),
                    'hints': card.get('hints', []),
                    'difficulty': card.get('difficulty', 'easy')
                })

        return {
            'id': str(self._id),  # 前端期望的字段名
            '_id': str(self._id),  # 保留原字段名以兼容
            'title': title,  # 课程主标题（根据语言选择）
            'sequence': self.sequence,
            'description': description,  # 课程描述（根据语言选择）
            'cards': cards,  # 保留原始cards数据
            'knowledgePoints': knowledge_points,  # 前端期望的格式
            'exercises': exercises,  # 前端期望的格式
            'created_at': self.created_at.isoformat(),
            # 多语言字段
            'title_en': self.title_en,
            'description_en': self.description_en,
            'has_translation': bool(self.title_en)
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
        # 多语言字段
        lesson.title_en = data.get('title_en')
        lesson.description_en = data.get('description_en')
        lesson.cards_en = data.get('cards_en', [])
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
            'title_en': self.title_en,
            'description_en': self.description_en,
            'cards_en': self.cards_en,
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

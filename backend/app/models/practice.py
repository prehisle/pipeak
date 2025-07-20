"""
练习模型 - LaTeX 速成训练器
"""
from datetime import datetime
from bson import ObjectId
import re
from app import get_db


class Practice:
    """练习模型类"""
    
    def __init__(self, prompt=None, solution_regex=None, hints=None, difficulty_level=1, 
                 topic_tags=None, _id=None, created_at=None):
        self._id = _id or ObjectId()
        self.prompt = prompt  # 题目描述
        self.solution_regex = solution_regex  # 标准答案的正则表达式
        self.hints = hints or []  # 错误提示规则列表
        self.difficulty_level = difficulty_level  # 难度等级 1-5
        self.topic_tags = topic_tags or []  # 主题标签
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            '_id': str(self._id),
            'prompt': self.prompt,
            'solution_regex': self.solution_regex,
            'hints': self.hints,
            'difficulty_level': self.difficulty_level,
            'topic_tags': self.topic_tags,
            'created_at': self.created_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data):
        """从字典创建练习实例"""
        practice = cls()
        practice._id = data.get('_id', ObjectId())
        practice.prompt = data.get('prompt')
        practice.solution_regex = data.get('solution_regex')
        practice.hints = data.get('hints', [])
        practice.difficulty_level = data.get('difficulty_level', 1)
        practice.topic_tags = data.get('topic_tags', [])
        practice.created_at = data.get('created_at', datetime.utcnow())
        return practice
    
    def save(self):
        """保存练习到数据库"""
        db = get_db()
        practice_data = {
            'prompt': self.prompt,
            'solution_regex': self.solution_regex,
            'hints': self.hints,
            'difficulty_level': self.difficulty_level,
            'topic_tags': self.topic_tags,
            'created_at': self.created_at
        }
        
        # 检查是否是更新操作（_id存在且在数据库中存在）
        if self._id and db.practices.find_one({'_id': self._id}):
            # 更新现有练习
            result = db.practices.update_one(
                {'_id': self._id},
                {'$set': practice_data}
            )
            return result.modified_count > 0
        else:
            # 创建新练习
            result = db.practices.insert_one(practice_data)
            self._id = result.inserted_id
            return True
    
    @classmethod
    def find_by_id(cls, practice_id):
        """根据ID查找练习"""
        db = get_db()
        if isinstance(practice_id, str):
            practice_id = ObjectId(practice_id)
        
        practice_data = db.practices.find_one({'_id': practice_id})
        if practice_data:
            return cls.from_dict(practice_data)
        return None
    
    @classmethod
    def find_by_topic_tags(cls, tags):
        """根据主题标签查找练习"""
        db = get_db()
        practices_data = db.practices.find({'topic_tags': {'$in': tags}})
        
        practices = []
        for practice_data in practices_data:
            practices.append(cls.from_dict(practice_data))
        return practices
    
    @classmethod
    def find_by_difficulty(cls, difficulty_level):
        """根据难度等级查找练习"""
        db = get_db()
        practices_data = db.practices.find({'difficulty_level': difficulty_level})
        
        practices = []
        for practice_data in practices_data:
            practices.append(cls.from_dict(practice_data))
        return practices
    
    def normalize_latex_answer(self, answer):
        """标准化LaTeX答案，去除多余空格和换行"""
        if not answer:
            return ""
        
        # 去除首尾空白
        answer = answer.strip()
        
        # 标准化空格：将多个连续空格替换为单个空格
        answer = re.sub(r'\s+', ' ', answer)
        
        # 去除花括号内外的多余空格
        # 例如: \frac { a } { b } -> \frac{a}{b}
        answer = re.sub(r'\{\s+', '{', answer)
        answer = re.sub(r'\s+\}', '}', answer)
        
        # 去除命令后的多余空格
        # 例如: \frac  {a}{b} -> \frac{a}{b}
        answer = re.sub(r'(\\[a-zA-Z]+)\s+', r'\1', answer)
        
        return answer
    
    def check_answer(self, user_answer):
        """检查用户答案是否正确"""
        if not self.solution_regex or not user_answer:
            return False
        
        # 标准化用户答案
        normalized_answer = self.normalize_latex_answer(user_answer)
        
        try:
            # 使用正则表达式匹配
            pattern = re.compile(self.solution_regex, re.IGNORECASE)
            return bool(pattern.match(normalized_answer))
        except re.error:
            # 正则表达式错误，返回False
            return False
    
    def get_hint_for_answer(self, user_answer):
        """根据用户答案获取相应的提示"""
        if not user_answer or not self.hints:
            return None
        
        # 遍历提示规则，找到匹配的错误模式
        for hint in self.hints:
            pattern = hint.get('pattern', '')
            message = hint.get('message', '')
            
            if pattern and message:
                try:
                    if re.search(pattern, user_answer):
                        return message
                except re.error:
                    continue
        
        # 如果没有匹配的特定提示，返回通用提示
        return "请检查您的LaTeX语法，确保命令和括号使用正确。"
    
    def add_hint(self, pattern, message):
        """添加错误提示规则"""
        hint = {
            'pattern': pattern,
            'message': message
        }
        self.hints.append(hint)
        return self.save()
    
    def update_difficulty(self, new_difficulty):
        """更新难度等级"""
        if 1 <= new_difficulty <= 5:
            self.difficulty_level = new_difficulty
            return self.save()
        return False
    
    def add_topic_tag(self, tag):
        """添加主题标签"""
        if tag not in self.topic_tags:
            self.topic_tags.append(tag)
            return self.save()
        return True

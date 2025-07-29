"""
用户模型 - LaTeX 速成训练器
"""
from datetime import datetime
from bson import ObjectId
import bcrypt
from app import get_db


class User:
    """用户模型类"""
    
    def __init__(self, email=None, password=None, _id=None, created_at=None, progress=None,
                 oauth_providers=None, display_name=None, avatar_url=None):
        self._id = _id or ObjectId()
        self.email = email
        self.password_hash = None
        if password:
            self.set_password(password)
        self.created_at = created_at or datetime.utcnow()
        self.progress = progress or {
            'current_lesson_id': None,
            'completed_lessons': []
        }
        # OAuth 相关字段
        self.oauth_providers = oauth_providers or []  # OAuth提供商列表
        self.display_name = display_name or email  # 显示名称
        self.avatar_url = avatar_url  # 头像URL
    
    def set_password(self, password):
        """设置密码（加密存储）"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    def check_password(self, password):
        """验证密码"""
        if not self.password_hash:
            return False

        # 确保password_hash是bytes类型
        if isinstance(self.password_hash, str):
            password_hash_bytes = self.password_hash.encode('utf-8')
        else:
            password_hash_bytes = self.password_hash

        return bcrypt.checkpw(password.encode('utf-8'), password_hash_bytes)
    
    def to_dict(self, include_sensitive=False):
        """转换为字典格式"""
        data = {
            '_id': str(self._id),
            'email': self.email,
            'created_at': self.created_at.isoformat(),
            'progress': self.progress,
            'oauth_providers': self.oauth_providers,
            'display_name': self.display_name,
            'avatar_url': self.avatar_url
        }

        if include_sensitive:
            data['password_hash'] = self.password_hash

        return data
    
    @classmethod
    def from_dict(cls, data):
        """从字典创建用户实例"""
        user = cls()
        user._id = data.get('_id', ObjectId())
        user.email = data.get('email')
        user.password_hash = data.get('password_hash')
        user.created_at = data.get('created_at', datetime.utcnow())
        user.progress = data.get('progress', {
            'current_lesson_id': None,
            'completed_lessons': []
        })
        user.oauth_providers = data.get('oauth_providers', [])
        user.display_name = data.get('display_name', data.get('email'))
        user.avatar_url = data.get('avatar_url')
        return user
    
    def save(self):
        """保存用户到数据库"""
        db = get_db()
        user_data = {
            'email': self.email,
            'password_hash': self.password_hash,
            'created_at': self.created_at,
            'progress': self.progress,
            'oauth_providers': self.oauth_providers,
            'display_name': self.display_name,
            'avatar_url': self.avatar_url
        }
        
        # 检查是否是更新操作（_id存在且在数据库中存在）
        if self._id and db.users.find_one({'_id': self._id}):
            # 更新现有用户
            result = db.users.update_one(
                {'_id': self._id},
                {'$set': user_data}
            )
            # 如果匹配到了文档，就认为操作成功（即使数据没有改变）
            return result.matched_count > 0
        else:
            # 创建新用户
            result = db.users.insert_one(user_data)
            self._id = result.inserted_id
            return True
    
    @classmethod
    def find_by_email(cls, email):
        """根据邮箱查找用户"""
        db = get_db()
        user_data = db.users.find_one({'email': email})
        if user_data:
            return cls.from_dict(user_data)
        return None
    
    @classmethod
    def find_by_id(cls, user_id):
        """根据ID查找用户"""
        db = get_db()
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        user_data = db.users.find_one({'_id': user_id})
        if user_data:
            return cls.from_dict(user_data)
        return None
    
    def update_progress(self, lesson_id, completed=False):
        """更新学习进度"""
        if completed and lesson_id not in self.progress['completed_lessons']:
            self.progress['completed_lessons'].append(str(lesson_id))
        
        self.progress['current_lesson_id'] = str(lesson_id)
        return self.save()
    
    def get_completed_lessons_count(self):
        """获取已完成课程数量"""
        return len(self.progress['completed_lessons'])
    
    def is_lesson_completed(self, lesson_id):
        """检查课程是否已完成"""
        return str(lesson_id) in self.progress['completed_lessons']

    # OAuth 相关方法
    def add_oauth_provider(self, provider_data):
        """添加OAuth提供商"""
        # 检查是否已经存在该提供商
        for provider in self.oauth_providers:
            if provider['provider'] == provider_data['provider']:
                # 更新现有提供商信息
                provider.update(provider_data)
                return self.save()

        # 添加新的提供商
        self.oauth_providers.append(provider_data)
        return self.save()

    def remove_oauth_provider(self, provider_name):
        """移除OAuth提供商"""
        self.oauth_providers = [p for p in self.oauth_providers if p['provider'] != provider_name]
        return self.save()

    def get_oauth_provider(self, provider_name):
        """获取指定的OAuth提供商信息"""
        for provider in self.oauth_providers:
            if provider['provider'] == provider_name:
                return provider
        return None

    def has_oauth_provider(self, provider_name):
        """检查是否绑定了指定的OAuth提供商"""
        return any(p['provider'] == provider_name for p in self.oauth_providers)

    def has_password(self):
        """检查用户是否设置了密码"""
        return self.password_hash is not None

    @classmethod
    def find_by_oauth_id(cls, provider, provider_id):
        """根据OAuth提供商ID查找用户"""
        db = get_db()
        user_data = db.users.find_one({
            'oauth_providers': {
                '$elemMatch': {
                    'provider': provider,
                    'provider_id': str(provider_id)
                }
            }
        })
        if user_data:
            return cls.from_dict(user_data)
        return None

    @classmethod
    def create_from_oauth(cls, email, oauth_data):
        """从OAuth数据创建新用户"""
        user = cls(
            email=email,
            display_name=oauth_data.get('name', email),
            avatar_url=oauth_data.get('avatar_url')
        )
        user.add_oauth_provider(oauth_data)
        return user

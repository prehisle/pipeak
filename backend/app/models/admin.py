"""
管理员模型 - LaTeX 速成训练器
"""
from datetime import datetime
from bson import ObjectId
import bcrypt
from app import get_db


class Admin:
    """管理员模型类"""
    
    def __init__(self, username=None, password=None, _id=None, created_at=None, updated_at=None):
        self._id = _id or ObjectId()
        self.username = username or 'admin'
        self.password_hash = None
        if password:
            self.set_password(password)
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def set_password(self, password):
        """设置密码（加密存储）"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
        self.updated_at = datetime.utcnow()
    
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
            'username': self.username,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_sensitive:
            data['password_hash'] = self.password_hash
        
        return data
    
    @classmethod
    def from_dict(cls, data):
        """从字典创建管理员实例"""
        admin = cls()
        admin._id = data.get('_id', ObjectId())
        admin.username = data.get('username', 'admin')
        admin.password_hash = data.get('password_hash')
        admin.created_at = data.get('created_at', datetime.utcnow())
        admin.updated_at = data.get('updated_at', datetime.utcnow())
        return admin
    
    def save(self):
        """保存管理员到数据库"""
        db = get_db()
        admin_data = {
            'username': self.username,
            'password_hash': self.password_hash,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
        
        # 检查是否是更新操作（_id存在且在数据库中存在）
        if self._id and db.admins.find_one({'_id': self._id}):
            # 更新现有管理员
            result = db.admins.update_one(
                {'_id': self._id},
                {'$set': admin_data}
            )
            return result.matched_count > 0
        else:
            # 创建新管理员
            result = db.admins.insert_one(admin_data)
            self._id = result.inserted_id
            return True
    
    @classmethod
    def find_by_username(cls, username):
        """根据用户名查找管理员"""
        db = get_db()
        admin_data = db.admins.find_one({'username': username})
        if admin_data:
            return cls.from_dict(admin_data)
        return None
    
    @classmethod
    def find_by_id(cls, admin_id):
        """根据ID查找管理员"""
        db = get_db()
        if isinstance(admin_id, str):
            admin_id = ObjectId(admin_id)
        
        admin_data = db.admins.find_one({'_id': admin_id})
        if admin_data:
            return cls.from_dict(admin_data)
        return None
    
    @classmethod
    def get_default_admin(cls):
        """获取默认管理员，如果不存在则创建"""
        admin = cls.find_by_username('admin')
        if not admin:
            # 创建默认管理员
            admin = cls(username='admin', password='admin123')
            admin.save()
        return admin
    
    @classmethod
    def count(cls):
        """获取管理员总数"""
        db = get_db()
        return db.admins.count_documents({})
    
    def change_password(self, old_password, new_password):
        """修改密码"""
        # 验证旧密码
        if not self.check_password(old_password):
            return False, "当前密码错误"
        
        # 验证新密码强度
        if len(new_password) < 6:
            return False, "新密码长度至少6位"
        
        if len(new_password) > 128:
            return False, "新密码长度不能超过128位"
        
        # 设置新密码
        self.set_password(new_password)
        
        # 保存到数据库
        if self.save():
            return True, "密码修改成功"
        else:
            return False, "密码修改失败，请稍后重试"

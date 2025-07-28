"""
管理后台认证模块
"""
import os
from flask import session, request, redirect, url_for, flash, render_template_string
from functools import wraps
from app.models.admin import Admin


# 管理员密码 - 可通过环境变量 ADMIN_PASSWORD 设置（仅用于向后兼容）
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')


def verify_admin_password(password):
    """验证管理员密码"""
    # 首先尝试从数据库验证
    admin = Admin.get_default_admin()
    if admin and admin.check_password(password):
        return True, admin

    # 向后兼容：如果数据库中没有管理员，使用环境变量密码创建管理员
    if not admin and password == ADMIN_PASSWORD:
        admin = Admin(username='admin', password=password)
        admin.save()
        return True, admin

    return False, None


def admin_required(f):
    """管理员权限装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin.login'))
        return f(*args, **kwargs)
    return decorated_function


def get_current_admin():
    """获取当前登录的管理员"""
    if session.get('admin_logged_in'):
        admin_id = session.get('admin_id')
        if admin_id:
            admin = Admin.find_by_id(admin_id)
            if admin:
                return admin
        # 向后兼容：如果没有admin_id或找不到管理员，返回默认管理员
        return Admin.get_default_admin()
    return None


class AdminAuthMixin:
    """管理员认证混入类"""
    
    def is_accessible(self):
        """检查是否有访问权限"""
        return session.get('admin_logged_in', False)
    
    def inaccessible_callback(self, name, **kwargs):
        """无权限时的回调"""
        return redirect(url_for('admin.login'))


# AdminLoginView类已移动到routes.py中

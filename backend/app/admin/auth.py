"""
管理后台认证模块
"""
import os
from flask import session, request, redirect, url_for, flash, render_template_string
from functools import wraps


# 管理员密码 - 可通过环境变量 ADMIN_PASSWORD 设置
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')


def admin_required(f):
    """管理员权限装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin.login'))
        return f(*args, **kwargs)
    return decorated_function


class AdminAuthMixin:
    """管理员认证混入类"""
    
    def is_accessible(self):
        """检查是否有访问权限"""
        return session.get('admin_logged_in', False)
    
    def inaccessible_callback(self, name, **kwargs):
        """无权限时的回调"""
        return redirect(url_for('admin.login'))


# AdminLoginView类已移动到routes.py中

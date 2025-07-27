"""
管理后台模块 - LaTeX 速成训练器
使用简单的Flask路由构建管理界面
"""
from flask import Flask, Blueprint
from .routes import admin_bp


def init_admin(app: Flask):
    """初始化管理后台"""

    # 注册管理后台蓝图
    app.register_blueprint(admin_bp, url_prefix='/admin')

    return True

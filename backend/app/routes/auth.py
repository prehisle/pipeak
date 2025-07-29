"""
认证路由 - LaTeX 速成训练器
处理用户注册、登录、JWT认证等功能
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
import re
import time
import hashlib
import os
from app.models.user import User

auth_bp = Blueprint('auth', __name__)


def validate_email(email):
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password):
    """验证密码强度"""
    if len(password) < 6:
        return False, "密码长度至少6位"
    if len(password) > 128:
        return False, "密码长度不能超过128位"
    return True, ""


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    用户注册
    
    Request Body:
    {
        "email": "user@example.com",
        "password": "password123"
    }
    
    Response:
    {
        "message": "注册成功",
        "user": {
            "_id": "user_id",
            "email": "user@example.com",
            "created_at": "2023-01-01T00:00:00",
            "progress": {...}
        },
        "access_token": "jwt_token",
        "refresh_token": "refresh_token"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': '请提供有效的JSON数据'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # 验证输入
        if not email:
            return jsonify({'message': '邮箱不能为空'}), 400
        
        if not password:
            return jsonify({'message': '密码不能为空'}), 400
        
        # 验证邮箱格式
        if not validate_email(email):
            return jsonify({'message': '邮箱格式不正确'}), 400
        
        # 验证密码强度
        is_valid, error_msg = validate_password(password)
        if not is_valid:
            return jsonify({'message': error_msg}), 400
        
        # 检查邮箱是否已存在
        existing_user = User.find_by_email(email)
        if existing_user:
            return jsonify({'message': '该邮箱已被注册'}), 409
        
        # 创建新用户
        user = User(email=email, password=password)
        if user.save():
            # 生成JWT令牌
            access_token = create_access_token(identity=str(user._id))
            refresh_token = create_refresh_token(identity=str(user._id))
            
            return jsonify({
                'message': '注册成功',
                'user': user.to_dict(),
                'access_token': access_token,
                'refresh_token': refresh_token
            }), 201
        else:
            return jsonify({'message': '注册失败，请稍后重试'}), 500
            
    except Exception as e:
        return jsonify({'message': f'服务器错误: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    用户登录
    
    Request Body:
    {
        "email": "user@example.com",
        "password": "password123"
    }
    
    Response:
    {
        "message": "登录成功",
        "user": {
            "_id": "user_id",
            "email": "user@example.com",
            "created_at": "2023-01-01T00:00:00",
            "progress": {...}
        },
        "access_token": "jwt_token",
        "refresh_token": "refresh_token"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': '请提供有效的JSON数据'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # 验证输入
        if not email or not password:
            return jsonify({'message': '邮箱和密码不能为空'}), 400
        
        # 查找用户
        user = User.find_by_email(email)
        if not user:
            return jsonify({'message': '邮箱或密码错误'}), 401
        
        # 验证密码
        if not user.check_password(password):
            return jsonify({'message': '邮箱或密码错误'}), 401
        
        # 生成JWT令牌
        access_token = create_access_token(identity=str(user._id))
        refresh_token = create_refresh_token(identity=str(user._id))
        
        return jsonify({
            'message': '登录成功',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'服务器错误: {str(e)}'}), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    刷新访问令牌
    
    Headers:
    Authorization: Bearer <refresh_token>
    
    Response:
    {
        "access_token": "new_jwt_token"
    }
    """
    try:
        current_user_id = get_jwt_identity()
        new_token = create_access_token(identity=current_user_id)
        
        return jsonify({
            'access_token': new_token
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'服务器错误: {str(e)}'}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    获取当前用户信息
    
    Headers:
    Authorization: Bearer <access_token>
    
    Response:
    {
        "user": {
            "_id": "user_id",
            "email": "user@example.com",
            "created_at": "2023-01-01T00:00:00",
            "progress": {...}
        }
    }
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.find_by_id(current_user_id)
        
        if not user:
            return jsonify({'message': '用户不存在'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'服务器错误: {str(e)}'}), 500


# ==================== OAuth 路由 ====================

# 简单的请求去重缓存（生产环境应使用Redis）
_request_cache = {}
_cache_timeout = 30  # 30秒超时


def _clean_cache():
    """清理过期的缓存条目"""
    current_time = time.time()
    expired_keys = [key for key, (timestamp, _) in _request_cache.items()
                   if current_time - timestamp > _cache_timeout]
    for key in expired_keys:
        del _request_cache[key]

def _get_request_key(code):
    """生成请求的唯一标识"""
    return hashlib.md5(code.encode()).hexdigest()



@auth_bp.route('/oauth/google', methods=['POST'])
def google_login():
    """Google OAuth 登录"""
    try:
        from app.utils.oauth_security import OAuthSecurity, AccountLinkingStrategy

        data = request.get_json()
        code = data.get('code')

        if not code:
            return jsonify({'error': 'Missing authorization code'}), 400

        # 清理过期缓存
        _clean_cache()

        # 检查是否是重复请求
        request_key = _get_request_key(code)
        current_time = time.time()

        if request_key in _request_cache:
            timestamp, cached_response = _request_cache[request_key]
            if current_time - timestamp < _cache_timeout:
                return cached_response

        # 交换授权码获取访问令牌
        access_token = OAuthSecurity.exchange_google_code(code)
        if not access_token:
            return jsonify({'error': 'Failed to exchange authorization code'}), 401

        # 使用访问令牌获取用户信息
        user_info = OAuthSecurity.validate_google_access_token(access_token)
        if not user_info:
            return jsonify({'error': 'Failed to get user information'}), 401

        # 查找或创建用户
        email = user_info.get('email')
        name = user_info.get('name', email.split('@')[0])

        user = User.find_by_email(email)
        action = 'login'

        if not user:
            # 创建新用户
            user = User(
                email=email,
                display_name=name,
                oauth_providers=['google']  # OAuth用户标识
            )
            if user.save():
                action = 'created'
            else:
                return jsonify({'error': 'Failed to create user'}), 500

        # 生成JWT token
        access_token_jwt = create_access_token(identity=str(user._id))
        refresh_token = create_refresh_token(identity=str(user._id))

        response_data = {
            'access_token': access_token_jwt,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
            'action': action,  # 'login', 'linked', 'created'
            'message': f'Google OAuth {action} successful'
        }

        # 缓存成功的响应
        _request_cache[request_key] = (current_time, (jsonify(response_data), 200))

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': 'OAuth authentication failed', 'details': str(e)}), 500

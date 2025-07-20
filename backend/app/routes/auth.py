"""
认证路由 - LaTeX 速成训练器
处理用户注册、登录、JWT认证等功能
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
import re
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

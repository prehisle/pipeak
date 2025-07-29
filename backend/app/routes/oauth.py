"""
OAuth 认证路由 - LaTeX 速成训练器
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token
from app.models.user import User
from app.utils.oauth_security import OAuthSecurity, AccountLinkingStrategy
import time
import hashlib

oauth_bp = Blueprint('oauth', __name__)

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

@oauth_bp.route('/google', methods=['POST'])
def google_login():
    """Google OAuth 登录"""
    try:
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
                current_app.logger.info(f"Returning cached OAuth response for request {request_key[:8]}")
                return cached_response

        # 交换授权码获取访问令牌
        access_token = OAuthSecurity.exchange_google_code(code)
        if not access_token:
            return jsonify({'error': 'Failed to exchange authorization code'}), 401

        # 使用访问令牌获取用户信息
        user_info = OAuthSecurity.validate_google_access_token(access_token)
        if not user_info:
            return jsonify({'error': 'Invalid Google token'}), 401

        email = user_info.get('email')
        if not email:
            return jsonify({'error': 'Email not provided by Google'}), 400

        # 准备OAuth数据
        oauth_data = AccountLinkingStrategy.prepare_oauth_data(
            'google', user_info, access_token
        )

        # 账号绑定逻辑
        user, action = AccountLinkingStrategy.link_oauth_account(email, oauth_data)

        # 生成JWT token
        access_token_jwt = create_access_token(identity=str(user._id))
        refresh_token = create_refresh_token(identity=str(user._id))

        response_data = {
            'access_token': access_token_jwt,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
            'action': action,  # 'login', 'linked', 'created'
            'message': get_action_message(action)
        }

        # 缓存成功的响应
        _request_cache[request_key] = (current_time, (jsonify(response_data), 200))

        return jsonify(response_data), 200

    except Exception as e:
        current_app.logger.error(f"Google OAuth error: {e}")
        current_app.logger.error(f"Request data: {data}")
        current_app.logger.error(f"Code: {code[:20] if code else 'None'}...")
        return jsonify({'error': 'OAuth authentication failed', 'details': str(e)}), 500


@oauth_bp.route('/github', methods=['POST'])
def github_login():
    """GitHub OAuth 登录"""
    try:
        data = request.get_json()
        code = data.get('code')
        
        if not code:
            return jsonify({'error': 'Missing authorization code'}), 400
        
        # 交换授权码获取访问令牌
        access_token = OAuthSecurity.exchange_github_code(code)
        if not access_token:
            return jsonify({'error': 'Failed to exchange authorization code'}), 401
        
        # 验证访问令牌并获取用户信息
        user_info = OAuthSecurity.validate_github_token(access_token)
        if not user_info:
            return jsonify({'error': 'Invalid GitHub token'}), 401
        
        email = user_info.get('email')
        if not email:
            return jsonify({'error': 'Email not provided by GitHub'}), 400
        
        # 准备OAuth数据
        oauth_data = AccountLinkingStrategy.prepare_oauth_data(
            'github', user_info, access_token
        )
        
        # 账号绑定逻辑
        user, action = AccountLinkingStrategy.link_oauth_account(email, oauth_data)
        
        # 生成JWT token
        access_token_jwt = create_access_token(identity=str(user._id))
        refresh_token = create_refresh_token(identity=str(user._id))
        
        return jsonify({
            'access_token': access_token_jwt,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
            'action': action,  # 'login', 'linked', 'created'
            'message': get_action_message(action)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"GitHub OAuth error: {e}")
        return jsonify({'error': 'OAuth authentication failed'}), 500


@oauth_bp.route('/link/<provider>', methods=['POST'])
def link_oauth_provider(provider):
    """为现有用户绑定OAuth提供商"""
    try:
        from flask_jwt_extended import jwt_required, get_jwt_identity
        
        @jwt_required()
        def _link_provider():
            user_id = get_jwt_identity()
            user = User.find_by_id(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            data = request.get_json()
            
            if provider == 'google':
                credential = data.get('credential')
                if not credential:
                    return jsonify({'error': 'Missing credential'}), 400
                
                idinfo = OAuthSecurity.validate_google_token(credential)
                if not idinfo:
                    return jsonify({'error': 'Invalid Google token'}), 401
                
                oauth_data = AccountLinkingStrategy.prepare_oauth_data('google', idinfo)
                
            elif provider == 'github':
                code = data.get('code')
                if not code:
                    return jsonify({'error': 'Missing authorization code'}), 400
                
                access_token = OAuthSecurity.exchange_github_code(code)
                if not access_token:
                    return jsonify({'error': 'Failed to exchange authorization code'}), 401
                
                user_info = OAuthSecurity.validate_github_token(access_token)
                if not user_info:
                    return jsonify({'error': 'Invalid GitHub token'}), 401
                
                oauth_data = AccountLinkingStrategy.prepare_oauth_data(
                    'github', user_info, access_token
                )
            else:
                return jsonify({'error': 'Unsupported provider'}), 400
            
            # 检查是否已经绑定
            if user.has_oauth_provider(provider):
                return jsonify({'error': f'{provider.title()} account already linked'}), 409
            
            # 绑定OAuth提供商
            user.add_oauth_provider(oauth_data)
            
            return jsonify({
                'message': f'{provider.title()} account linked successfully',
                'user': user.to_dict()
            }), 200
        
        return _link_provider()
        
    except Exception as e:
        current_app.logger.error(f"OAuth linking error: {e}")
        return jsonify({'error': 'Failed to link OAuth provider'}), 500


@oauth_bp.route('/unlink/<provider>', methods=['DELETE'])
def unlink_oauth_provider(provider):
    """解绑OAuth提供商"""
    try:
        from flask_jwt_extended import jwt_required, get_jwt_identity
        
        @jwt_required()
        def _unlink_provider():
            user_id = get_jwt_identity()
            user = User.find_by_id(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # 检查是否绑定了该提供商
            if not user.has_oauth_provider(provider):
                return jsonify({'error': f'{provider.title()} account not linked'}), 404
            
            # 检查用户是否有密码或其他登录方式
            if not user.has_password() and len(user.oauth_providers) <= 1:
                return jsonify({
                    'error': 'Cannot unlink the only authentication method. Please set a password first.'
                }), 409
            
            # 解绑OAuth提供商
            user.remove_oauth_provider(provider)
            
            return jsonify({
                'message': f'{provider.title()} account unlinked successfully',
                'user': user.to_dict()
            }), 200
        
        return _unlink_provider()
        
    except Exception as e:
        current_app.logger.error(f"OAuth unlinking error: {e}")
        return jsonify({'error': 'Failed to unlink OAuth provider'}), 500


def get_action_message(action):
    """获取操作消息"""
    messages = {
        'login': 'Successfully logged in',
        'linked': 'OAuth account linked to existing account',
        'created': 'New account created and logged in'
    }
    return messages.get(action, 'Authentication successful')

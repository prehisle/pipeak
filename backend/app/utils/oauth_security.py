"""
OAuth 安全工具类 - LaTeX 速成训练器
"""
import base64
import json
import requests
from datetime import datetime
from cryptography.fernet import Fernet
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from flask import current_app


class OAuthSecurity:
    """OAuth安全措施"""
    
    @staticmethod
    def exchange_google_code(code):
        """交换Google授权码获取访问令牌"""
        try:
            import os
            # 直接从环境变量获取配置，避免Flask配置问题
            client_id = os.environ.get('GOOGLE_CLIENT_ID') or current_app.config.get('GOOGLE_CLIENT_ID')
            client_secret = os.environ.get('GOOGLE_CLIENT_SECRET') or current_app.config.get('GOOGLE_CLIENT_SECRET')
            redirect_uri = os.environ.get('OAUTH_REDIRECT_URI') or current_app.config.get('OAUTH_REDIRECT_URI')
            # 清理URL中的双斜杠（除了协议部分）
            if redirect_uri:
                redirect_uri = redirect_uri.replace('://', '|||PROTOCOL|||').replace('//', '/').replace('|||PROTOCOL|||', '://')

            if not client_id or not client_secret:
                current_app.logger.error(f"Missing Google OAuth config: client_id={bool(client_id)}, client_secret={bool(client_secret)}")
                return None

            data = {
                'client_id': client_id,
                'client_secret': client_secret,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': redirect_uri
            }

            response = requests.post(
                'https://oauth2.googleapis.com/token',
                data=data,
                headers={'Accept': 'application/json'}
            )

            if response.status_code == 200:
                token_data = response.json()
                return token_data.get('access_token')
            else:
                current_app.logger.error(f"Google OAuth token exchange failed: {response.status_code}")
                return None
        except Exception as e:
            current_app.logger.error(f"Google code exchange failed: {e}")
            return None

    @staticmethod
    def validate_google_access_token(access_token):
        """使用访问令牌获取Google用户信息"""
        try:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json'
            }

            response = requests.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers=headers
            )

            if response.status_code == 200:
                return response.json()
            else:
                current_app.logger.error(f"Google user info request failed: {response.status_code}")
                return None
        except Exception as e:
            current_app.logger.error(f"Google access token validation failed: {e}")
            return None

    @staticmethod
    def validate_google_token(credential):
        """验证Google ID Token（保留用于兼容性）"""
        try:
            import os
            client_id = os.environ.get('GOOGLE_CLIENT_ID') or current_app.config.get('GOOGLE_CLIENT_ID')

            if not client_id:
                current_app.logger.error("Missing GOOGLE_CLIENT_ID for token validation")
                return None

            # 验证Google ID Token
            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                client_id
            )

            # 检查token是否来自正确的发行者
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')

            return idinfo
        except ValueError as e:
            current_app.logger.error(f"Google token validation failed: {e}")
            return None
    
    @staticmethod
    def validate_github_token(access_token):
        """验证GitHub访问令牌并获取用户信息"""
        try:
            # 获取用户信息
            headers = {
                'Authorization': f'token {access_token}',
                'Accept': 'application/vnd.github.v3+json'
            }
            
            # 获取用户基本信息
            user_response = requests.get('https://api.github.com/user', headers=headers)
            if user_response.status_code != 200:
                return None
            
            user_data = user_response.json()
            
            # 获取用户邮箱（如果公开）
            email_response = requests.get('https://api.github.com/user/emails', headers=headers)
            emails = []
            if email_response.status_code == 200:
                emails = email_response.json()
                # 找到主要邮箱
                primary_email = next((email['email'] for email in emails if email['primary']), None)
                if primary_email:
                    user_data['email'] = primary_email
            
            return user_data
        except Exception as e:
            current_app.logger.error(f"GitHub token validation failed: {e}")
            return None
    
    @staticmethod
    def exchange_github_code(code):
        """交换GitHub授权码获取访问令牌"""
        try:
            import os
            # 直接从环境变量获取配置
            client_id = os.environ.get('GITHUB_CLIENT_ID') or current_app.config.get('GITHUB_CLIENT_ID')
            client_secret = os.environ.get('GITHUB_CLIENT_SECRET') or current_app.config.get('GITHUB_CLIENT_SECRET')

            if not client_id or not client_secret:
                current_app.logger.error(f"Missing GitHub OAuth config: client_id={bool(client_id)}, client_secret={bool(client_secret)}")
                return None

            data = {
                'client_id': client_id,
                'client_secret': client_secret,
                'code': code
            }
            
            headers = {
                'Accept': 'application/json'
            }
            
            response = requests.post(
                'https://github.com/login/oauth/access_token',
                data=data,
                headers=headers
            )
            
            if response.status_code == 200:
                token_data = response.json()
                return token_data.get('access_token')
            
            return None
        except Exception as e:
            current_app.logger.error(f"GitHub code exchange failed: {e}")
            return None
    
    @staticmethod
    def encrypt_tokens(access_token, refresh_token=None):
        """加密存储访问令牌"""
        try:
            import os
            encryption_key = os.environ.get('TOKEN_ENCRYPTION_KEY') or current_app.config.get('TOKEN_ENCRYPTION_KEY')

            if not encryption_key:
                current_app.logger.warning("No encryption key found, storing tokens in plain text")
                return access_token, refresh_token

            key = encryption_key.encode()
            if len(key) != 44:  # Fernet key should be 32 bytes (44 chars in base64)
                # 如果密钥长度不对，生成一个新的
                key = Fernet.generate_key()
                current_app.logger.warning("Generated new encryption key. Update TOKEN_ENCRYPTION_KEY in config.")
            
            f = Fernet(key)
            
            encrypted_access = f.encrypt(access_token.encode()).decode()
            encrypted_refresh = None
            if refresh_token:
                encrypted_refresh = f.encrypt(refresh_token.encode()).decode()
            
            return encrypted_access, encrypted_refresh
        except Exception as e:
            current_app.logger.error(f"Token encryption failed: {e}")
            return access_token, refresh_token  # 如果加密失败，返回原始token
    
    @staticmethod
    def decrypt_tokens(encrypted_access_token, encrypted_refresh_token=None):
        """解密访问令牌"""
        try:
            import os
            encryption_key = os.environ.get('TOKEN_ENCRYPTION_KEY') or current_app.config.get('TOKEN_ENCRYPTION_KEY')

            if not encryption_key:
                # 如果没有加密密钥，假设token是明文存储的
                return encrypted_access_token, encrypted_refresh_token

            key = encryption_key.encode()
            if len(key) != 44:
                # 如果密钥格式不对，直接返回原始token（可能未加密）
                return encrypted_access_token, encrypted_refresh_token
            
            f = Fernet(key)
            
            access_token = f.decrypt(encrypted_access_token.encode()).decode()
            refresh_token = None
            if encrypted_refresh_token:
                refresh_token = f.decrypt(encrypted_refresh_token.encode()).decode()
            
            return access_token, refresh_token
        except Exception as e:
            current_app.logger.error(f"Token decryption failed: {e}")
            return encrypted_access_token, encrypted_refresh_token  # 返回原始token


class AccountLinkingStrategy:
    """账号绑定策略"""
    
    @staticmethod
    def link_oauth_account(email, oauth_data):
        """
        OAuth账号绑定逻辑：
        1. 如果OAuth ID已绑定 -> 直接登录
        2. 如果邮箱已存在 -> 绑定到现有账号
        3. 如果邮箱不存在 -> 创建新账号
        """
        from app.models.user import User
        
        # 检查是否已经绑定过此OAuth账号
        existing_user = User.find_by_oauth_id(
            oauth_data['provider'], 
            oauth_data['provider_id']
        )
        if existing_user:
            # 更新OAuth信息（可能有变化）
            existing_user.add_oauth_provider(oauth_data)
            return existing_user, 'login'
        
        # 检查邮箱是否已存在
        existing_user = User.find_by_email(email)
        if existing_user:
            # 绑定OAuth到现有账号
            existing_user.add_oauth_provider(oauth_data)
            # 更新显示名称和头像（如果用户没有设置）
            if not existing_user.display_name or existing_user.display_name == existing_user.email:
                existing_user.display_name = oauth_data.get('name', email)
            if not existing_user.avatar_url and oauth_data.get('avatar_url'):
                existing_user.avatar_url = oauth_data.get('avatar_url')
            existing_user.save()
            return existing_user, 'linked'
        
        # 创建新账号
        new_user = User.create_from_oauth(email, oauth_data)
        return new_user, 'created'
    
    @staticmethod
    def prepare_oauth_data(provider, user_info, access_token=None, refresh_token=None):
        """准备OAuth数据"""
        # 根据提供商确定用户ID字段
        if provider == 'google':
            provider_id = str(user_info.get('id') or user_info.get('sub'))
            avatar_url = user_info.get('picture')
        else:  # github
            provider_id = str(user_info.get('id'))
            avatar_url = user_info.get('avatar_url')

        oauth_data = {
            'provider': provider,
            'provider_id': provider_id,
            'email': user_info.get('email'),
            'name': user_info.get('name'),
            'avatar_url': avatar_url,
            'linked_at': datetime.utcnow()
        }
        
        # 加密并存储访问令牌
        if access_token:
            encrypted_access, encrypted_refresh = OAuthSecurity.encrypt_tokens(
                access_token, refresh_token
            )
            oauth_data['access_token'] = encrypted_access
            if encrypted_refresh:
                oauth_data['refresh_token'] = encrypted_refresh
        
        return oauth_data

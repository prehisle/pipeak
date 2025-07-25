"""
LaTeX 速成训练器 - 应用入口文件
"""
import os
from app import create_app

# 根据环境变量选择配置
config_name = os.environ.get('FLASK_ENV', 'development')
app = create_app(config_name)

# 添加健康检查端点
@app.route('/api/health')
def health_check():
    return {'status': 'healthy', 'message': 'LaTeX Speed Trainer API is running'}

# 添加数据库初始化端点
@app.route('/api/init-db')
def init_database():
    """初始化数据库 - 仅在生产环境首次部署时使用"""
    try:
        import subprocess
        import sys

        # 运行初始化脚本
        result = subprocess.run([
            sys.executable,
            'init_railway_db.py'
        ], capture_output=True, text=True, cwd='/app')

        if result.returncode == 0:
            return {
                'message': 'Database initialized successfully',
                'output': result.stdout
            }
        else:
            return {
                'error': 'Database initialization failed',
                'output': result.stderr
            }, 500

    except Exception as e:
        return {'error': f'Database initialization failed: {str(e)}'}, 500

if __name__ == '__main__':
    # 从环境变量获取配置，默认为开发模式
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    host = os.environ.get('FLASK_HOST', '0.0.0.0')  # 监听所有网络接口
    port = int(os.environ.get('FLASK_PORT', 5000))
    
    print(f"Starting LaTeX Speed Trainer API server...")
    print(f"Environment: {os.environ.get('FLASK_ENV', 'development')}")
    print(f"Debug mode: {debug}")
    print(f"Server: http://{host}:{port}")
    
    app.run(
        host=host,
        port=port,
        debug=debug
    )

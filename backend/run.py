"""
LaTeX 速成训练器 - 应用入口文件
"""
import os
from app import create_app

# 创建Flask应用实例
app = create_app()

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

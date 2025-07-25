#!/usr/bin/env python3
"""
环境变量检查脚本
用于调试生产环境配置问题
"""

import os
import sys

def check_environment():
    """检查关键环境变量"""
    print("=== 环境变量检查 ===")
    
    # 关键环境变量列表
    required_vars = [
        'MONGODB_URI',
        'MONGODB_DB',
        'SECRET_KEY',
        'JWT_SECRET_KEY'
    ]
    
    optional_vars = [
        'FLASK_ENV',
        'FLASK_DEBUG',
        'CORS_ORIGINS'
    ]
    
    print("\n📋 必需的环境变量:")
    missing_required = []
    for var in required_vars:
        value = os.environ.get(var)
        if value:
            # 对敏感信息进行脱敏显示
            if 'SECRET' in var or 'PASSWORD' in var:
                display_value = f"{value[:8]}..." if len(value) > 8 else "***"
            elif 'MONGODB_URI' in var:
                display_value = f"{value[:30]}..." if len(value) > 30 else value
            else:
                display_value = value
            print(f"  ✅ {var}: {display_value}")
        else:
            print(f"  ❌ {var}: 未设置")
            missing_required.append(var)
    
    print("\n📋 可选的环境变量:")
    for var in optional_vars:
        value = os.environ.get(var)
        if value:
            print(f"  ✅ {var}: {value}")
        else:
            print(f"  ⚪ {var}: 未设置")
    
    print("\n📋 所有环境变量:")
    env_vars = sorted([k for k in os.environ.keys() if not k.startswith('_')])
    for var in env_vars:
        value = os.environ[var]
        # 脱敏显示
        if any(sensitive in var.upper() for sensitive in ['SECRET', 'PASSWORD', 'TOKEN', 'KEY']):
            display_value = f"{value[:8]}..." if len(value) > 8 else "***"
        else:
            display_value = value[:50] + "..." if len(value) > 50 else value
        print(f"  {var}: {display_value}")
    
    # 检查结果
    if missing_required:
        print(f"\n❌ 缺少必需的环境变量: {', '.join(missing_required)}")
        return False
    else:
        print(f"\n✅ 所有必需的环境变量都已设置")
        return True

def test_mongodb_connection():
    """测试MongoDB连接"""
    print("\n=== MongoDB连接测试 ===")
    
    mongodb_uri = os.environ.get('MONGODB_URI')
    if not mongodb_uri:
        print("❌ MONGODB_URI 未设置，无法测试连接")
        return False
    
    try:
        from pymongo import MongoClient
        print(f"📡 尝试连接到: {mongodb_uri[:30]}...")
        
        client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        
        print("✅ MongoDB连接成功")
        
        # 获取数据库信息
        db_name = os.environ.get('MONGODB_DB', 'pipeak')
        db = client[db_name]
        collections = db.list_collection_names()
        print(f"📊 数据库 '{db_name}' 包含 {len(collections)} 个集合")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB连接失败: {e}")
        return False

if __name__ == "__main__":
    print("🔍 生产环境诊断工具")
    print("=" * 50)
    
    # 检查环境变量
    env_ok = check_environment()
    
    # 测试MongoDB连接
    if env_ok:
        mongo_ok = test_mongodb_connection()
    else:
        mongo_ok = False
    
    print("\n" + "=" * 50)
    if env_ok and mongo_ok:
        print("🎉 环境配置检查通过，应用应该可以正常启动")
        sys.exit(0)
    else:
        print("💥 环境配置有问题，请检查上述错误")
        sys.exit(1)

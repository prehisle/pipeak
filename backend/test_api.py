"""
API测试脚本
"""
import requests
import json

def test_register_api():
    """测试注册API"""
    url = "http://127.0.0.1:5000/api/auth/register"
    data = {
        "email": "test@example.com",
        "password": "123456"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 201
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_server_health():
    """测试服务器健康状态"""
    try:
        response = requests.get("http://127.0.0.1:5000/")
        print(f"Server Health - Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Server Health Error: {e}")

def test_lessons_api():
    """测试课程API"""
    # 首先注册并获取token
    register_url = "http://127.0.0.1:5000/api/auth/register"
    import random
    register_data = {
        "email": f"testuser{random.randint(1000,9999)}@example.com",
        "password": "123456"
    }

    try:
        # 注册用户
        register_response = requests.post(register_url, json=register_data)
        if register_response.status_code == 201:
            token = register_response.json()['access_token']
            print(f"✅ 用户注册成功，获取到token")

            # 测试课程列表API
            lessons_url = "http://127.0.0.1:5000/api/lessons/"
            headers = {"Authorization": f"Bearer {token}"}

            lessons_response = requests.get(lessons_url, headers=headers)
            print(f"课程API - Status Code: {lessons_response.status_code}")
            print(f"课程API - Response: {lessons_response.text}")

        else:
            print(f"❌ 用户注册失败: {register_response.text}")

    except Exception as e:
        print(f"课程API测试错误: {e}")

if __name__ == "__main__":
    print("Testing backend API...")
    print("\n1. Testing server health:")
    test_server_health()

    print("\n2. Testing register API:")
    test_register_api()

    print("\n3. Testing lessons API:")
    test_lessons_api()

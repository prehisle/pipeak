#!/usr/bin/env python3
"""
修复数据库中Knuth箭头符号的错误表示
"""

import os
import sys
from pymongo import MongoClient
from bson import ObjectId

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import Config

def fix_knuth_arrows():
    """修复第9课中Knuth箭头的错误表示"""
    
    # 连接数据库
    client = MongoClient(Config.MONGODB_URI)
    db = client[Config.MONGODB_DB]
    lessons_collection = db.lessons
    
    print("🔧 开始修复Knuth箭头符号错误...")
    
    # 查找第9课
    lesson_9 = lessons_collection.find_one({"sequence": 9})
    
    if not lesson_9:
        print("❌ 未找到第9课，请先运行 comprehensive_lessons.py")
        return False
    
    print(f"📚 找到第9课: {lesson_9['title']}")
    
    # 修复的内容
    corrected_content = '**高德纳箭头与超运算**\n\n• `$a \\uparrow b = a^b$` → $a \\uparrow b = a^b$ (指数运算，三级运算)\n• `$a \\uparrow\\uparrow b$` → $a \\uparrow\\uparrow b$ (幂塔，四级运算)\n• `$a \\uparrow\\uparrow\\uparrow b$` → $a \\uparrow\\uparrow\\uparrow b$ (五级运算)\n• `${}^n a$` → ${}^n a$ (超幂)\n• `$a^{(n)} b$` → $a^{(n)} b$ (n级运算)\n• `$\\text{Ack}(m,n)$` → $\\text{Ack}(m,n)$ (阿克曼函数)'
    
    # 查找并更新包含错误内容的卡片
    updated = False
    for i, card in enumerate(lesson_9['cards']):
        if card['type'] == 'knowledge' and '高德纳箭头与超运算' in card['content']:
            print(f"🔍 找到需要修复的卡片 #{i+1}")
            print(f"修复前: {card['content'][:100]}...")
            
            # 更新内容
            lesson_9['cards'][i]['content'] = corrected_content
            updated = True
            
            print(f"修复后: {corrected_content[:100]}...")
            break
    
    if not updated:
        print("⚠️ 未找到需要修复的内容")
        return False
    
    # 保存更新
    result = lessons_collection.update_one(
        {"_id": lesson_9["_id"]},
        {"$set": {"cards": lesson_9["cards"]}}
    )
    
    if result.modified_count > 0:
        print("✅ 成功修复Knuth箭头符号错误！")
        
        # 验证修复结果
        updated_lesson = lessons_collection.find_one({"sequence": 9})
        for card in updated_lesson['cards']:
            if card['type'] == 'knowledge' and '高德纳箭头与超运算' in card['content']:
                print("\n📋 修复后的内容:")
                print(card['content'])
                break
        
        return True
    else:
        print("❌ 修复失败")
        return False

def verify_fix():
    """验证修复结果"""
    client = MongoClient(Config.MONGODB_URI)
    db = client[Config.MONGODB_DB]
    lessons_collection = db.lessons
    
    lesson_9 = lessons_collection.find_one({"sequence": 9})
    
    if not lesson_9:
        print("❌ 验证失败：未找到第9课")
        return False
    
    print("\n🔍 验证修复结果...")
    
    for card in lesson_9['cards']:
        if card['type'] == 'knowledge' and '高德纳箭头与超运算' in card['content']:
            content = card['content']
            
            # 检查是否包含正确的表示
            checks = [
                ('$a \\uparrow b = a^b$', '三级运算正确表示'),
                ('指数运算，三级运算', '三级运算标注正确'),
                ('幂塔，四级运算', '四级运算标注正确'),
                ('五级运算', '五级运算标注正确')
            ]
            
            all_correct = True
            for check, description in checks:
                if check in content:
                    print(f"✅ {description}")
                else:
                    print(f"❌ {description} - 未找到: {check}")
                    all_correct = False
            
            # 检查是否还有错误的表示
            errors = [
                ('三级运算', '\\uparrow\\uparrow\\uparrow'),  # 三个箭头不应该标注为三级运算
                ('→ $a^b$', '\\uparrow\\uparrow\\uparrow')   # 三个箭头不应该等于a^b
            ]
            
            for error_text, context in errors:
                if error_text in content and context in content:
                    print(f"⚠️ 仍存在错误: {error_text} 与 {context} 同时出现")
                    all_correct = False
            
            if all_correct:
                print("\n🎉 所有检查通过！Knuth箭头符号已正确修复。")
            else:
                print("\n⚠️ 部分检查未通过，可能需要进一步修复。")
            
            return all_correct
    
    print("❌ 验证失败：未找到相关内容")
    return False

if __name__ == "__main__":
    print("🚀 Knuth箭头符号修复工具")
    print("=" * 50)
    
    try:
        # 执行修复
        if fix_knuth_arrows():
            # 验证修复结果
            verify_fix()
        else:
            print("❌ 修复失败")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ 执行过程中出现错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    print("\n🎯 修复完成！")
    print("建议:")
    print("1. 重启后端服务以确保更改生效")
    print("2. 刷新前端页面查看修复结果")
    print("3. 检查第9课的内容是否正确显示")

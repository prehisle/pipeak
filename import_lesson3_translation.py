#!/usr/bin/env python3
"""
导入第3课翻译数据的简单脚本
"""
import json
import sys
import os
from bson import ObjectId

# 添加backend目录到Python路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app import create_app, get_db

def import_lesson3_translation():
    """导入第3课的英文翻译数据"""
    # 创建Flask应用上下文
    app = create_app()

    with app.app_context():
        # 读取翻译文件
        with open('backend/translations/lessons_en_US.json', 'r', encoding='utf-8') as f:
            translation_data = json.load(f)

        db = get_db()
        
        # 查找第3课的翻译数据
        lesson3_data = None
        for lesson_data in translation_data['lessons']:
            if lesson_data.get('id') == '68863b34f1ac4df0050b32c9':
                lesson3_data = lesson_data
                break
        
        if not lesson3_data:
            print("[ERROR] 未找到第3课的翻译数据")
            return
        
        # 查找现有课程
        lesson_id = '68863b34f1ac4df0050b32c9'
        existing_lesson = db.lessons.find_one({'_id': ObjectId(lesson_id)})
        
        if not existing_lesson:
            print(f"[ERROR] 课程 {lesson_id} 不存在")
            return
        
        # 更新英文翻译
        translations = lesson3_data.get('translations', {})
        en_data = translations.get('en-US', {})
        
        update_data = {}
        if 'title' in en_data:
            update_data['title_en'] = en_data['title']
        if 'description' in en_data:
            update_data['description_en'] = en_data['description']
        if 'cards' in en_data:
            update_data['cards_en'] = en_data['cards']
        
        if update_data:
            result = db.lessons.update_one(
                {'_id': ObjectId(lesson_id)},
                {'$set': update_data}
            )
            if result.modified_count > 0:
                print(f"[SUCCESS] 成功更新第3课英文翻译")
                print(f"[INFO] 标题: {en_data.get('title', 'N/A')}")
                print(f"[INFO] 卡片数量: {len(en_data.get('cards', []))}")
            else:
                print(f"[WARNING] 第3课数据未发生变化")
        else:
            print(f"[ERROR] 没有找到有效的翻译数据")

if __name__ == '__main__':
    print("[START] 开始导入第3课翻译数据...")
    import_lesson3_translation()
    print("[DONE] 导入完成!")

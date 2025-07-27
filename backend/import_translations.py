#!/usr/bin/env python3
"""
导入翻译数据的脚本
"""
import json
import requests
from bson import ObjectId
import os
import sys

# 添加app目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, get_db

def import_translations_directly():
    """直接通过数据库导入翻译数据"""
    # 创建Flask应用上下文
    app = create_app()

    with app.app_context():
        # 读取翻译文件
        with open('translations/lessons_en_US.json', 'r', encoding='utf-8') as f:
            translation_data = json.load(f)

        db = get_db()
        updated_count = 0
        error_count = 0

        for lesson_data in translation_data['lessons']:
            try:
                lesson_id = lesson_data.get('id')
                if not lesson_id:
                    error_count += 1
                    continue

                # 查找现有课程
                existing_lesson = db.lessons.find_one({'_id': ObjectId(lesson_id)})

                if existing_lesson:
                    # 更新现有课程的翻译
                    update_data = {}
                    translations = lesson_data.get('translations', {})

                    for lang, trans_data in translations.items():
                        if lang == 'en-US':
                            if 'title' in trans_data:
                                update_data['title_en'] = trans_data['title']
                            if 'description' in trans_data:
                                update_data['description_en'] = trans_data['description']
                            if 'cards' in trans_data:
                                update_data['cards_en'] = trans_data['cards']

                    if update_data:
                        result = db.lessons.update_one(
                            {'_id': ObjectId(lesson_id)},
                            {'$set': update_data}
                        )
                        if result.modified_count > 0:
                            updated_count += 1
                            print(f"[SUCCESS] 更新课程 {lesson_id}: {trans_data.get('title', 'Unknown')}")
                        else:
                            print(f"[WARNING] 课程 {lesson_id} 数据未发生变化")
                else:
                    # 如果课程不存在，记录错误
                    error_count += 1
                    print(f"[ERROR] 课程 {lesson_id} 不存在")

            except Exception as e:
                print(f"[ERROR] 处理课程 {lesson_data.get('id', 'unknown')} 时出错: {str(e)}")
                error_count += 1

        print(f"\n[RESULT] 导入结果:")
        print(f"[SUCCESS] 成功更新: {updated_count} 个课程")
        print(f"[ERROR] 处理失败: {error_count} 个课程")

if __name__ == '__main__':
    print("[START] 开始导入翻译数据...")
    import_translations_directly()
    print("[DONE] 导入完成!")

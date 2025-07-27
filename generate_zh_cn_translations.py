#!/usr/bin/env python3
"""
从数据库生成标准的中文翻译文件 lessons_zh_CN.json
这将作为所有其他语言翻译的基准
"""
import json
import sys
import os
from bson import ObjectId

# 添加backend目录到Python路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app import create_app, get_db

def generate_zh_cn_translations():
    """从数据库生成标准的中文翻译文件"""
    # 创建Flask应用上下文
    app = create_app()

    with app.app_context():
        db = get_db()
        
        # 获取所有课程
        lessons = list(db.lessons.find().sort('sequence', 1))
        
        translation_data = {
            "lessons": []
        }
        
        for lesson in lessons:
            lesson_translation = {
                "id": str(lesson['_id']),
                "translations": {
                    "zh-CN": {
                        "title": lesson.get('title', ''),
                        "description": lesson.get('description', ''),
                        "cards": []
                    }
                }
            }
            
            # 处理卡片数据
            cards = lesson.get('cards', [])
            for card in cards:
                card_translation = {
                    "type": card.get('type', ''),
                }
                
                if card['type'] == 'knowledge':
                    card_translation["content"] = card.get('content', '')
                elif card['type'] == 'practice':
                    card_translation.update({
                        "question": card.get('question', ''),
                        "target_formula": card.get('target_formula', ''),
                        "hints": card.get('hints', []),
                        "difficulty": card.get('difficulty', 'easy')
                    })
                
                lesson_translation["translations"]["zh-CN"]["cards"].append(card_translation)
            
            translation_data["lessons"].append(lesson_translation)
        
        # 保存到文件
        output_file = 'backend/translations/lessons_zh_CN.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(translation_data, f, ensure_ascii=False, indent=2)
        
        print(f"[SUCCESS] 成功生成中文翻译文件: {output_file}")
        print(f"[INFO] 包含 {len(translation_data['lessons'])} 个课程")
        
        # 统计信息
        total_cards = 0
        for lesson in translation_data['lessons']:
            cards_count = len(lesson['translations']['zh-CN']['cards'])
            total_cards += cards_count
            print(f"[INFO] 课程 {lesson['translations']['zh-CN']['title']}: {cards_count} 个卡片")
        
        print(f"[INFO] 总计 {total_cards} 个卡片")

if __name__ == '__main__':
    print("[START] 开始生成中文翻译文件...")
    generate_zh_cn_translations()
    print("[DONE] 生成完成!")

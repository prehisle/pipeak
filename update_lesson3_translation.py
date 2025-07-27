#!/usr/bin/env python3
"""
直接更新第3课的英文翻译数据
"""
import json
import sys
import os
from bson import ObjectId

# 添加backend目录到Python路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app import create_app, get_db

def update_lesson3_translation():
    """直接更新第3课的英文翻译"""
    # 创建Flask应用上下文
    app = create_app()

    with app.app_context():
        db = get_db()
        
        # 第3课的新ID
        lesson_id = '688647a7f1ac4df0050b4748'
        
        # 查找现有课程
        existing_lesson = db.lessons.find_one({'_id': ObjectId(lesson_id)})
        
        if not existing_lesson:
            print(f"[ERROR] 课程 {lesson_id} 不存在")
            return
        
        print(f"[INFO] 找到课程: {existing_lesson.get('title', 'Unknown')}")
        print(f"[INFO] 当前卡片数量: {len(existing_lesson.get('cards', []))}")
        
        # 英文翻译数据
        en_translation = {
            "title_en": "Lesson 3: Greek Letters & Common Symbols",
            "description_en": "Learn LaTeX notation for common Greek letters and mathematical symbols, laying foundation for advanced formulas.",
            "cards_en": [
                {
                    "type": "knowledge",
                    "content": "**Common Lowercase Greek Letters**\n\n• `$\\alpha$` → $\\alpha$ (alpha)\n• `$\\beta$` → $\\beta$ (beta)\n• `$\\gamma$` → $\\gamma$ (gamma)\n• `$\\delta$` → $\\delta$ (delta)\n• `$\\pi$` → $\\pi$ (pi)\n• `$\\theta$` → $\\theta$ (theta)\n• `$\\lambda$` → $\\lambda$ (lambda)\n• `$\\mu$` → $\\mu$ (mu)"
                },
                {
                    "type": "knowledge",
                    "content": "**Common Uppercase Greek Letters**\n\n• `$\\Gamma$` → $\\Gamma$ (Gamma)\n• `$\\Delta$` → $\\Delta$ (Delta)\n• `$\\Theta$` → $\\Theta$ (Theta)\n• `$\\Lambda$` → $\\Lambda$ (Lambda)\n• `$\\Pi$` → $\\Pi$ (Pi)\n• `$\\Sigma$` → $\\Sigma$ (Sigma)\n• `$\\Omega$` → $\\Omega$ (Omega)"
                },
                {
                    "type": "knowledge",
                    "content": "**Common Mathematical Symbols**\n\n• `$\\infty$` → $\\infty$ (infinity)\n• `$\\pm$` → $\\pm$ (plus/minus)\n• `$\\times$` → $\\times$ (multiplication)\n• `$\\div$` → $\\div$ (division)\n• `$\\neq$` → $\\neq$ (not equal)\n• `$\\leq$` → $\\leq$ (less than or equal)\n• `$\\geq$` → $\\geq$ (greater than or equal)\n• `$\\approx$` → $\\approx$ (approximately equal)"
                },
                {
                    "type": "practice",
                    "question": "Please enter LaTeX code to represent the Greek letter: π (pi)",
                    "target_formula": "$\\pi$",
                    "hints": [
                        "The LaTeX command for Greek letter π is \\pi",
                        "Use it within math environment",
                        "Complete format: $\\pi$"
                    ],
                    "difficulty": "easy"
                },
                {
                    "type": "practice",
                    "question": "Please enter LaTeX code to represent: α + β",
                    "target_formula": "$\\alpha + \\beta$",
                    "hints": [
                        "α is \\alpha, β is \\beta",
                        "Greek letter commands start with backslash",
                        "Complete format: $\\alpha + \\beta$"
                    ],
                    "difficulty": "easy"
                },
                {
                    "type": "practice",
                    "question": "Please enter LaTeX code to represent: x ≠ ∞",
                    "target_formula": "$x \\neq \\infty$",
                    "hints": [
                        "Not equal symbol is \\neq",
                        "Infinity symbol is \\infty",
                        "Complete format: $x \\neq \\infty$"
                    ],
                    "difficulty": "medium"
                },
                {
                    "type": "practice",
                    "question": "Please enter LaTeX code to represent: Δx ≈ 0",
                    "target_formula": "$\\Delta x \\approx 0$",
                    "hints": [
                        "Capital Delta is \\Delta",
                        "Approximately equal symbol is \\approx",
                        "Complete format: $\\Delta x \\approx 0$"
                    ],
                    "difficulty": "medium"
                }
            ]
        }
        
        # 更新数据库
        result = db.lessons.update_one(
            {'_id': ObjectId(lesson_id)},
            {'$set': en_translation}
        )
        
        if result.modified_count > 0:
            print(f"[SUCCESS] 成功更新第3课英文翻译")
            print(f"[INFO] 英文标题: {en_translation['title_en']}")
            print(f"[INFO] 英文卡片数量: {len(en_translation['cards_en'])}")
        else:
            print(f"[WARNING] 第3课数据未发生变化")

if __name__ == '__main__':
    print("[START] 开始更新第3课英文翻译...")
    update_lesson3_translation()
    print("[DONE] 更新完成!")

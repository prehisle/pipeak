#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能课程更新脚本
- 保持课程ID不变，保护用户学习数据
- 只更新有差异的课程内容
- 安全的增量更新机制
"""

import pymongo
from datetime import datetime
from bson import ObjectId
import json
import os

from dotenv import load_dotenv
# 加载环境变量
load_dotenv()

def connect_database():
    """连接数据库"""
    try:
        # 尝试从环境变量获取数据库连接信息
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://user:password@192.168.1.4:27017/?authSource=admin')
        db_name = os.getenv('DB_NAME', 'latex_trainer')

        print(f"🔌 尝试连接数据库: {db_name}")
        client = pymongo.MongoClient(mongodb_uri)
        db = client[db_name]

        # 测试连接
        db.lessons.find_one()
        print("✅ 数据库连接成功")
        return client, db
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        print("💡 提示：请检查数据库连接信息或设置环境变量 MONGODB_URI")
        return None, None

def get_updated_lesson_data():
    """获取需要更新的课程数据（只包含第6课和第7课的修改）"""
    return {
        6: {  # 第6课：矩阵与向量
            'title': '第6课：矩阵与向量',
            'description': '学习矩阵、向量、行列式等线性代数符号的LaTeX表示方法。',
            'cards': [
                {
                    'type': 'knowledge',
                    'content': '**矩阵表示法**\n\n• `$$\\begin{matrix} a & b \\\\ c & d \\end{matrix}$$` → $$\\begin{matrix} a & b \\\\ c & d \\end{matrix}$$\n• `$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$` → $$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$\n• `$$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$$` → $$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$$\n• `$$\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}$$` → $$\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}$$'
                },
                {
                    'type': 'knowledge',
                    'content': '**向量表示法**\n\n• `$\\vec{v}$` → $\\vec{v}$ (向量箭头)\n• `$\\mathbf{v}$` → $\\mathbf{v}$ (粗体向量)\n• `$\\overrightarrow{AB}$` → $\\overrightarrow{AB}$ (有向线段)\n• `$\\hat{i}$` → $\\hat{i}$ (单位向量)\n• `$\\vec{a} \\cdot \\vec{b}$` → $\\vec{a} \\cdot \\vec{b}$ (点积)\n• `$\\vec{a} \\times \\vec{b}$` → $\\vec{a} \\times \\vec{b}$ (叉积)'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示一个 2×2 矩阵（带圆括号）',
                    'target_formula': '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$',
                    'hints': [
                        '使用 \\begin{pmatrix}...\\end{pmatrix} 环境',
                        '矩阵元素用 & 分隔，行用 \\\\ 分隔',
                        '完整格式：$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示向量 v',
                    'target_formula': '$\\vec{v}$',
                    'hints': [
                        '使用 \\vec{} 命令',
                        '向量名称放在大括号内',
                        '完整格式：$\\vec{v}$'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示 3×3 单位矩阵',
                    'target_formula': '$\\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}$',
                    'hints': [
                        '使用 pmatrix 环境',
                        '三行三列，对角线为1，其余为0',
                        '每行用 \\\\ 分隔，每列用 & 分隔'
                    ],
                    'difficulty': 'hard'
                }
            ]
        },
        7: {  # 第7课：方程组与不等式
            'title': '第7课：方程组与不等式',
            'description': '学习方程组、不等式组、条件表达式等复杂数学结构的LaTeX表示。',
            'cards': [
                {
                    'type': 'knowledge',
                    'content': '**方程组表示法**\n\n• `$$\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}$$` → $$\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}$$\n• `$$\\begin{aligned} x + y &= 1 \\\\ 2x - y &= 3 \\end{aligned}$$` → $$\\begin{aligned} x + y &= 1 \\\\ 2x - y &= 3 \\end{aligned}$$\n• `$$\\left\\{\\begin{array}{l} x > 0 \\\\ y > 0 \\end{array}\\right.$$` → $$\\left\\{\\begin{array}{l} x > 0 \\\\ y > 0 \\end{array}\\right.$$'
                },
                {
                    'type': 'knowledge',
                    'content': '**不等式符号**\n\n• `$<$` → $<$ (小于)\n• `$>$` → $>$ (大于)\n• `$\\leq$` → $\\leq$ (小于等于)\n• `$\\geq$` → $\\geq$ (大于等于)\n• `$\\ll$` → $\\ll$ (远小于)\n• `$\\gg$` → $\\gg$ (远大于)\n• `$\\subset$` → $\\subset$ (子集)\n• `$\\supset$` → $\\supset$ (超集)'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示二元方程组',
                    'target_formula': '$\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}$',
                    'hints': [
                        '使用 \\begin{cases}...\\end{cases} 环境',
                        '方程之间用 \\\\ 分隔',
                        '完整格式：$\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}$'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示小于等于符号',
                    'target_formula': '$\\leq$',
                    'hints': [
                        '使用 \\leq 命令',
                        '完整格式：$\\leq$'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示分段函数',
                    'target_formula': '$f(x) = \\begin{cases} x^2 & \\text{if } x \\geq 0 \\\\ -x^2 & \\text{if } x < 0 \\end{cases}$',
                    'hints': [
                        '使用 cases 环境',
                        '条件用 \\text{} 包围',
                        '完整格式：$f(x) = \\begin{cases} x^2 & \\text{if } x \\geq 0 \\\\ -x^2 & \\text{if } x < 0 \\end{cases}$'
                    ],
                    'difficulty': 'hard'
                }
            ]
        }
    }

def compare_lesson_content(existing_lesson, new_lesson_data):
    """比较课程内容是否有差异"""
    # 比较标题
    if existing_lesson.get('title') != new_lesson_data.get('title'):
        return True
    
    # 比较描述
    if existing_lesson.get('description') != new_lesson_data.get('description'):
        return True
    
    # 比较卡片内容
    existing_cards = existing_lesson.get('cards', [])
    new_cards = new_lesson_data.get('cards', [])
    
    if len(existing_cards) != len(new_cards):
        return True
    
    for i, (existing_card, new_card) in enumerate(zip(existing_cards, new_cards)):
        # 比较卡片类型
        if existing_card.get('type') != new_card.get('type'):
            return True
        
        # 比较内容
        if existing_card.get('content') != new_card.get('content'):
            return True
        
        # 比较练习题相关字段
        if new_card.get('type') == 'practice':
            for field in ['question', 'target_formula', 'hints', 'difficulty']:
                if existing_card.get(field) != new_card.get(field):
                    return True
    
    return False

def update_lesson_safely(db, lesson_sequence, new_lesson_data):
    """安全地更新单个课程"""
    try:
        # 查找现有课程
        existing_lesson = db.lessons.find_one({'sequence': lesson_sequence})
        
        if not existing_lesson:
            print(f"⚠️  第{lesson_sequence}课不存在，跳过更新")
            return False
        
        # 比较内容是否有差异
        if not compare_lesson_content(existing_lesson, new_lesson_data):
            print(f"ℹ️  第{lesson_sequence}课内容无变化，跳过更新")
            return False
        
        # 准备更新数据（保持ID和创建时间不变）
        update_data = {
            'title': new_lesson_data['title'],
            'description': new_lesson_data['description'],
            'cards': new_lesson_data['cards'],
            'updated_at': datetime.utcnow()
        }
        
        # 执行更新
        result = db.lessons.update_one(
            {'sequence': lesson_sequence},
            {'$set': update_data}
        )
        
        if result.modified_count > 0:
            print(f"✅ 第{lesson_sequence}课更新成功")
            print(f"   课程ID: {existing_lesson['_id']} (保持不变)")
            return True
        else:
            print(f"⚠️  第{lesson_sequence}课更新失败")
            return False
            
    except Exception as e:
        print(f"❌ 第{lesson_sequence}课更新出错: {e}")
        return False

def backup_lessons(db, lesson_sequences):
    """备份要更新的课程数据"""
    try:
        backup_data = []
        for seq in lesson_sequences:
            lesson = db.lessons.find_one({'sequence': seq})
            if lesson:
                backup_data.append(lesson)

        # 保存备份到文件
        backup_filename = f"lesson_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(backup_filename, 'w', encoding='utf-8') as f:
            # 处理ObjectId序列化
            for lesson in backup_data:
                lesson['_id'] = str(lesson['_id'])
            json.dump(backup_data, f, ensure_ascii=False, indent=2)

        print(f"💾 备份已保存到: {backup_filename}")
        return backup_filename
    except Exception as e:
        print(f"⚠️  备份失败: {e}")
        return None

def main():
    """主函数"""
    print("🔄 开始智能更新课程内容...")
    print("🔒 保护措施：保持课程ID不变，只更新有差异的内容")

    # 连接数据库
    client, db = connect_database()
    if db is None:
        return
    
    try:
        # 获取更新数据
        updated_lessons = get_updated_lesson_data()

        print(f"\n📋 计划更新 {len(updated_lessons)} 个课程...")

        # 创建备份
        lesson_sequences = list(updated_lessons.keys())
        backup_file = backup_lessons(db, lesson_sequences)

        # 用户确认
        print(f"\n⚠️  即将更新第{', '.join(map(str, lesson_sequences))}课")
        print("📝 更新内容：修正矩阵和方程组的显示格式")
        confirm = input("🤔 确认继续更新吗？(y/N): ").strip().lower()

        if confirm != 'y':
            print("❌ 用户取消更新")
            return

        updated_count = 0
        skipped_count = 0
        
        # 逐个更新课程
        for lesson_sequence, lesson_data in updated_lessons.items():
            print(f"\n🔍 检查第{lesson_sequence}课：{lesson_data['title']}")
            
            if update_lesson_safely(db, lesson_sequence, lesson_data):
                updated_count += 1
            else:
                skipped_count += 1
        
        # 显示更新结果
        print(f"\n🎉 更新完成！")
        print(f"✅ 成功更新: {updated_count} 个课程")
        print(f"⏭️  跳过更新: {skipped_count} 个课程")
        
        if updated_count > 0:
            print(f"\n💡 提示：课程ID保持不变，用户学习数据不受影响")
        
    except Exception as e:
        print(f"❌ 更新过程出错: {e}")
    
    finally:
        client.close()
        print("🔌 数据库连接已关闭")

if __name__ == '__main__':
    main()

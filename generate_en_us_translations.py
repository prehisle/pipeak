#!/usr/bin/env python3
"""
基于中文翻译文件生成英文翻译文件
确保ID一致性和内容完整性
"""
import json
import os

def generate_en_us_translations():
    """基于中文翻译文件生成英文翻译"""
    
    # 读取中文翻译文件
    zh_file = 'backend/translations/lessons_zh_CN.json'
    if not os.path.exists(zh_file):
        print(f"[ERROR] 中文翻译文件不存在: {zh_file}")
        print("[INFO] 请先运行 generate_zh_cn_translations.py")
        return
    
    with open(zh_file, 'r', encoding='utf-8') as f:
        zh_data = json.load(f)
    
    # 创建英文翻译数据结构
    en_data = {
        "lessons": []
    }
    
    # 翻译映射表
    translations = {
        # 课程标题翻译
        "第1课：数学环境与基础语法": "Lesson 1: Math Environment & Basic Syntax",
        "第2课：分数与根号": "Lesson 2: Fractions & Radicals", 
        "第3课：希腊字母与常用符号": "Lesson 3: Greek Letters & Common Symbols",
        "第4课：函数与三角函数": "Lesson 4: Functions & Trigonometric Functions",
        "第5课：求和、积分与极限": "Lesson 5: Summation, Integration & Limits",
        "第6课：矩阵与向量": "Lesson 6: Matrices & Vectors",
        "第7课：方程组与不等式": "Lesson 7: Equation Systems & Inequalities",
        "第8课：集合论与逻辑符号": "Lesson 8: Set Theory & Logic Symbols",
        "第9课：数论与特殊运算": "Lesson 9: Number Theory & Special Operations",
        "第10课：高级分析与拓扑": "Lesson 10: Advanced Analysis & Topology",
        
        # 描述翻译
        "学习LaTeX数学环境的基础语法，包括上标、下标等": "Learn the basic syntax of LaTeX mathematical formulas, master the use of math environments, superscripts, and subscripts.",
        "学习分数和根号的LaTeX表示方法，掌握复杂数学表达式": "Learn how to represent fractions and radicals in LaTeX, master complex mathematical expressions.",
        "学习常用的希腊字母和数学符号的LaTeX写法，为高级数学公式打基础。": "Learn LaTeX notation for common Greek letters and mathematical symbols, laying foundation for advanced formulas.",
        
        # 知识点内容翻译 - 第3课
        "**常用小写希腊字母**": "**Common Lowercase Greek Letters**",
        "**常用大写希腊字母**": "**Common Uppercase Greek Letters**", 
        "**常用数学符号**": "**Common Mathematical Symbols**",
        
        # 练习题翻译 - 第3课
        "请输入 LaTeX 代码来表示希腊字母：π (圆周率)": "Please enter LaTeX code to represent the Greek letter: π (pi)",
        "请输入 LaTeX 代码来表示：α + β": "Please enter LaTeX code to represent: α + β",
        "请输入 LaTeX 代码来表示：x ≠ ∞": "Please enter LaTeX code to represent: x ≠ ∞",
        "请输入 LaTeX 代码来表示：Δx ≈ 0": "Please enter LaTeX code to represent: Δx ≈ 0",
        
        # 提示翻译
        "希腊字母 π 的 LaTeX 命令是 \\pi": "The LaTeX command for Greek letter π is \\pi",
        "需要在数学环境中使用": "Use it within math environment",
        "完整格式：$\\pi$": "Complete format: $\\pi$",
        "α 是 \\alpha，β 是 \\beta": "α is \\alpha, β is \\beta",
        "希腊字母命令都以反斜杠开头": "Greek letter commands start with backslash",
        "完整格式：$\\alpha + \\beta$": "Complete format: $\\alpha + \\beta$",
        "不等于符号是 \\neq": "Not equal symbol is \\neq",
        "无穷符号是 \\infty": "Infinity symbol is \\infty", 
        "完整格式：$x \\neq \\infty$": "Complete format: $x \\neq \\infty$",
        "大德尔塔是 \\Delta": "Capital Delta is \\Delta",
        "约等于符号是 \\approx": "Approximately equal symbol is \\approx",
        "完整格式：$\\Delta x \\approx 0$": "Complete format: $\\Delta x \\approx 0$",
    }
    
    # 处理每个课程
    for zh_lesson in zh_data['lessons']:
        en_lesson = {
            "id": zh_lesson['id'],  # 保持ID一致
            "translations": {
                "en-US": {
                    "title": translate_text(zh_lesson['translations']['zh-CN']['title'], translations),
                    "description": translate_text(zh_lesson['translations']['zh-CN']['description'], translations),
                    "cards": []
                }
            }
        }
        
        # 处理卡片
        for zh_card in zh_lesson['translations']['zh-CN']['cards']:
            en_card = {
                "type": zh_card['type']
            }
            
            if zh_card['type'] == 'knowledge':
                en_card['content'] = translate_content(zh_card['content'], translations)
            elif zh_card['type'] == 'practice':
                en_card.update({
                    "question": translate_text(zh_card['question'], translations),
                    "target_formula": zh_card['target_formula'],  # 公式不翻译
                    "hints": [translate_text(hint, translations) for hint in zh_card.get('hints', [])],
                    "difficulty": zh_card.get('difficulty', 'easy')
                })
            
            en_lesson['translations']['en-US']['cards'].append(en_card)
        
        en_data['lessons'].append(en_lesson)
    
    # 保存英文翻译文件
    output_file = 'backend/translations/lessons_en_US.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(en_data, f, ensure_ascii=False, indent=2)
    
    print(f"[SUCCESS] 成功生成英文翻译文件: {output_file}")
    print(f"[INFO] 包含 {len(en_data['lessons'])} 个课程")
    
    # 验证第3课的卡片数量
    for lesson in en_data['lessons']:
        title = lesson['translations']['en-US']['title']
        cards_count = len(lesson['translations']['en-US']['cards'])
        if 'Lesson 3' in title:
            print(f"[INFO] {title}: {cards_count} 个卡片")

def translate_text(text, translations):
    """翻译文本，如果找不到翻译则返回原文"""
    return translations.get(text, text)

def translate_content(content, translations):
    """翻译知识点内容，处理复杂的markdown格式"""
    # 对于第3课的特殊内容处理
    if "常用小写希腊字母" in content:
        return """**Common Lowercase Greek Letters**

• `$\\alpha$` → $\\alpha$ (alpha)
• `$\\beta$` → $\\beta$ (beta)
• `$\\gamma$` → $\\gamma$ (gamma)
• `$\\delta$` → $\\delta$ (delta)
• `$\\pi$` → $\\pi$ (pi)
• `$\\theta$` → $\\theta$ (theta)
• `$\\lambda$` → $\\lambda$ (lambda)
• `$\\mu$` → $\\mu$ (mu)"""
    
    elif "常用大写希腊字母" in content:
        return """**Common Uppercase Greek Letters**

• `$\\Gamma$` → $\\Gamma$ (Gamma)
• `$\\Delta$` → $\\Delta$ (Delta)
• `$\\Theta$` → $\\Theta$ (Theta)
• `$\\Lambda$` → $\\Lambda$ (Lambda)
• `$\\Pi$` → $\\Pi$ (Pi)
• `$\\Sigma$` → $\\Sigma$ (Sigma)
• `$\\Omega$` → $\\Omega$ (Omega)"""
    
    elif "常用数学符号" in content:
        return """**Common Mathematical Symbols**

• `$\\infty$` → $\\infty$ (infinity)
• `$\\pm$` → $\\pm$ (plus/minus)
• `$\\times$` → $\\times$ (multiplication)
• `$\\div$` → $\\div$ (division)
• `$\\neq$` → $\\neq$ (not equal)
• `$\\leq$` → $\\leq$ (less than or equal)
• `$\\geq$` → $\\geq$ (greater than or equal)
• `$\\approx$` → $\\approx$ (approximately equal)"""
    
    # 对于其他内容，尝试直接翻译
    for zh_text, en_text in translations.items():
        if zh_text in content:
            content = content.replace(zh_text, en_text)
    
    return content

if __name__ == '__main__':
    print("[START] 开始生成英文翻译文件...")
    generate_en_us_translations()
    print("[DONE] 生成完成!")

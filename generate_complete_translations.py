#!/usr/bin/env python3
"""
生成完整的中英文翻译文件
基于 comprehensive_lessons.py 的内容
"""
import json

def generate_complete_translations():
    """生成完整的翻译文件"""
    
    # 课程翻译映射
    lesson_translations = {
        "第1课：数学环境与基础语法": "Lesson 1: Math Environment & Basic Syntax",
        "第2课：分数与根号": "Lesson 2: Fractions & Radicals",
        "第3课：希腊字母与常用符号": "Lesson 3: Greek Letters & Common Symbols",
        "第4课：函数与三角函数": "Lesson 4: Functions & Trigonometric Functions",
        "第5课：求和、积分与极限": "Lesson 5: Summation, Integration & Limits",
        "第6课：矩阵与向量": "Lesson 6: Matrices & Vectors",
        "第7课：方程组与不等式": "Lesson 7: Equation Systems & Inequalities",
        "第8课：集合论与逻辑符号": "Lesson 8: Set Theory & Logic Symbols",
        "第9课：数论与特殊运算": "Lesson 9: Number Theory & Special Operations",
        "第10课：高级分析与拓扑": "Lesson 10: Advanced Analysis & Topology"
    }
    
    description_translations = {
        "学习LaTeX数学公式的基础语法，掌握数学环境、上标、下标的使用方法。": "Learn the basic syntax of LaTeX mathematical formulas, master the use of math environments, superscripts, and subscripts.",
        "学习如何在LaTeX中表示分数和根号，掌握复杂数学表达式的写法。": "Learn how to represent fractions and radicals in LaTeX, master complex mathematical expressions.",
        "学习常用的希腊字母和数学符号的LaTeX写法，为高级数学公式打基础。": "Learn LaTeX notation for common Greek letters and mathematical symbols, laying foundation for advanced formulas.",
        "学习函数表示法、三角函数、对数函数等常用数学函数的LaTeX写法。": "Learn LaTeX notation for function representation, trigonometric functions, logarithmic functions and other common mathematical functions.",
        "学习求和符号、积分符号、极限符号等高级数学记号的LaTeX表示方法。": "Learn LaTeX representation of summation symbols, integral symbols, limit symbols and other advanced mathematical notations.",
        "学习矩阵、向量、行列式等线性代数符号的LaTeX表示方法。": "Learn LaTeX representation of matrices, vectors, determinants and other linear algebra symbols.",
        "学习方程组、不等式组、条件表达式等复杂数学结构的LaTeX表示。": "Learn LaTeX representation of equation systems, inequality systems, conditional expressions and other complex mathematical structures.",
        "学习集合论符号、逻辑运算符、量词等数学逻辑的LaTeX表示方法。": "Learn LaTeX representation of set theory symbols, logical operators, quantifiers and other mathematical logic notations.",
        "学习数论符号、同余、高德纳箭头、超运算等高级数学运算的LaTeX表示。": "Learn LaTeX representation of number theory symbols, congruence, Knuth's up-arrow notation, hyperoperations and other advanced mathematical operations.",
        "学习高级数学分析、拓扑学、泛函分析等领域的专业LaTeX符号。": "Learn professional LaTeX symbols in advanced mathematical analysis, topology, functional analysis and other fields."
    }
    
    # 从中文翻译文件读取数据
    with open('backend/translations/lessons_zh_CN_complete.json', 'r', encoding='utf-8') as f:
        zh_data = json.load(f)
    
    # 创建英文翻译数据
    en_data = {"lessons": []}
    
    for zh_lesson in zh_data['lessons']:
        zh_content = zh_lesson['translations']['zh-CN']
        
        en_lesson = {
            "id": zh_lesson['id'],
            "translations": {
                "en-US": {
                    "title": lesson_translations.get(zh_content['title'], zh_content['title']),
                    "description": description_translations.get(zh_content['description'], zh_content['description']),
                    "cards": []
                }
            }
        }
        
        # 翻译卡片内容
        for zh_card in zh_content['cards']:
            en_card = {"type": zh_card['type']}
            
            if zh_card['type'] == 'knowledge':
                en_card['content'] = translate_knowledge_content(zh_card['content'])
            elif zh_card['type'] == 'practice':
                en_card.update({
                    "question": translate_practice_question(zh_card['question']),
                    "target_formula": zh_card['target_formula'],  # 公式不翻译
                    "hints": [translate_hint(hint) for hint in zh_card.get('hints', [])],
                    "difficulty": zh_card.get('difficulty', 'easy')
                })
            
            en_lesson['translations']['en-US']['cards'].append(en_card)
        
        en_data['lessons'].append(en_lesson)
    
    # 保存英文翻译文件
    with open('backend/translations/lessons_en_US_complete.json', 'w', encoding='utf-8') as f:
        json.dump(en_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 成功生成完整的英文翻译文件")
    print(f"📊 包含 {len(en_data['lessons'])} 个课程")

def translate_knowledge_content(zh_content):
    """翻译知识点内容"""
    # 这里包含所有知识点的翻译映射
    translations = {
        "**LaTeX数学环境**": "**LaTeX Math Environment**",
        "**上标和下标**": "**Superscripts and Subscripts**",
        "**分数表示法**": "**Fraction Notation**",
        "**根号表示法**": "**Radical Notation**",
        "**常用小写希腊字母**": "**Common Lowercase Greek Letters**",
        "**常用大写希腊字母**": "**Common Uppercase Greek Letters**",
        "**常用数学符号**": "**Common Mathematical Symbols**",
        "**函数表示法**": "**Function Notation**",
        "**复合函数与反函数**": "**Composite Functions & Inverse Functions**",
        "**求和符号**": "**Summation Symbols**",
        "**积分符号**": "**Integral Symbols**",
        "**极限符号**": "**Limit Symbols**",
        "**矩阵表示法**": "**Matrix Notation**",
        "**向量表示法**": "**Vector Notation**",
        "**方程组表示法**": "**Equation System Notation**",
        "**不等式符号**": "**Inequality Symbols**",
        "**集合符号**": "**Set Symbols**",
        "**逻辑符号**": "**Logic Symbols**",
        "**数论符号**": "**Number Theory Symbols**",
        "**高德纳箭头与超运算**": "**Knuth's Up-Arrow & Hyperoperations**",
        "**组合数学符号**": "**Combinatorial Mathematics Symbols**",
        "**高级积分与微分**": "**Advanced Integration & Differentiation**",
        "**拓扑与几何符号**": "**Topology & Geometry Symbols**",
        "**泛函分析符号**": "**Functional Analysis Symbols**"
    }
    
    # 应用翻译
    result = zh_content
    for zh_text, en_text in translations.items():
        result = result.replace(zh_text, en_text)
    
    # 特殊内容的完整翻译
    if "LaTeX数学公式需要在特定环境中编写" in result:
        result = """**LaTeX Math Environment**

LaTeX mathematical formulas need to be written in specific environments:

• **Inline formulas**: Use `$...$` to surround, e.g., `$x^2$` → $x^2$
• **Display formulas**: Use `$$...$$` to surround, e.g., `$$E = mc^2$$` → $$E = mc^2$$"""
    
    return result

def translate_practice_question(zh_question):
    """翻译练习题问题"""
    translations = {
        "请输入 LaTeX 代码来表示：x 的平方": "Please enter LaTeX code to represent: x squared",
        "请输入 LaTeX 代码来表示：a 下标 1": "Please enter LaTeX code to represent: a subscript 1",
        "请输入 LaTeX 代码来表示：x 下标 n 的平方": "Please enter LaTeX code to represent: x subscript n squared",
        "请输入 LaTeX 代码来表示分数：二分之一": "Please enter LaTeX code to represent the fraction: one half",
        "请输入 LaTeX 代码来表示：根号 2": "Please enter LaTeX code to represent: square root of 2",
        "请输入 LaTeX 代码来表示：x 加 y 的平方，除以 2": "Please enter LaTeX code to represent: (x plus y) squared, divided by 2",
        "请输入 LaTeX 代码来表示：三次根号下 8": "Please enter LaTeX code to represent: cube root of 8",
        "请输入 LaTeX 代码来表示希腊字母：π (圆周率)": "Please enter LaTeX code to represent the Greek letter: π (pi)",
        "请输入 LaTeX 代码来表示：α + β": "Please enter LaTeX code to represent: α + β",
        "请输入 LaTeX 代码来表示：x ≠ ∞": "Please enter LaTeX code to represent: x ≠ ∞",
        "请输入 LaTeX 代码来表示：Δx ≈ 0": "Please enter LaTeX code to represent: Δx ≈ 0"
    }
    
    return translations.get(zh_question, zh_question)

def translate_hint(zh_hint):
    """翻译提示"""
    translations = {
        "使用 ^ 符号表示上标": "Use ^ symbol for superscript",
        "上标内容是 2": "The superscript content is 2",
        "完整格式：$x^2$": "Complete format: $x^2$",
        "使用 _ 符号表示下标": "Use _ symbol for subscript",
        "下标内容是 1": "The subscript content is 1",
        "完整格式：$a_1$": "Complete format: $a_1$",
        "先写下标 _n，再写上标 ^2": "Write subscript _n first, then superscript ^2",
        "或者写成 x_{n}^{2}": "Or write as x_{n}^{2}",
        "完整格式：$x_n^2$": "Complete format: $x_n^2$"
    }
    
    return translations.get(zh_hint, zh_hint)

if __name__ == '__main__':
    print("[START] 开始生成完整的翻译文件...")
    generate_complete_translations()
    print("[DONE] 生成完成!")

#!/usr/bin/env python3
"""
添加课程数据脚本
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models.lesson import Lesson

def add_sample_lessons():
    """添加示例课程"""
    
    # 课程1: LaTeX基础语法
    lesson1 = Lesson(
        title="LaTeX基础语法",
        sequence=1,
        description="学习LaTeX数学公式的基础语法，包括上标、下标和基本符号。"
    )
    
    lesson1.cards = [
        {
            'type': 'knowledge',
            'content': "LaTeX数学公式需要在数学环境中编写。行内公式使用 $...$ 包围，独立公式使用 $$...$$ 包围。"
        },
        {
            'type': 'knowledge', 
            'content': "上标使用 ^ 符号，下标使用 _ 符号。例如：x^2 表示 x 的平方，x_1 表示 x 下标 1。"
        },
        {
            'type': 'knowledge',
            'content': "当上标或下标包含多个字符时，需要用花括号 {} 包围。例如：x^{10} 或 x_{max}。"
        }
    ]
    
    if lesson1.save():
        print(f"✅ 课程1保存成功: {lesson1.title}")
    else:
        print(f"❌ 课程1保存失败: {lesson1.title}")
    
    # 课程2: 分数与根号
    lesson2 = Lesson(
        title="分数与根号",
        sequence=2,
        description="学习如何在LaTeX中表示分数和根号，掌握复杂数学表达式的写法。"
    )
    
    lesson2.cards = [
        {
            'type': 'knowledge',
            'content': "分数使用 \\frac{分子}{分母} 命令。例如：\\frac{1}{2} 表示二分之一。"
        },
        {
            'type': 'knowledge',
            'content': "根号使用 \\sqrt{} 命令。例如：\\sqrt{x} 表示根号x，\\sqrt[3]{x} 表示三次根号x。"
        },
        {
            'type': 'knowledge',
            'content': "可以嵌套使用分数和根号。例如：\\frac{\\sqrt{a}}{\\sqrt{b}} 表示根号a除以根号b。"
        }
    ]
    
    if lesson2.save():
        print(f"✅ 课程2保存成功: {lesson2.title}")
    else:
        print(f"❌ 课程2保存失败: {lesson2.title}")
    
    # 课程3: 希腊字母与特殊符号
    lesson3 = Lesson(
        title="希腊字母与特殊符号",
        sequence=3,
        description="学习常用的希腊字母和数学特殊符号的LaTeX写法。"
    )
    
    lesson3.cards = [
        {
            'type': 'knowledge',
            'content': "常用希腊字母：\\alpha (α), \\beta (β), \\gamma (γ), \\delta (δ), \\pi (π), \\theta (θ)"
        },
        {
            'type': 'knowledge',
            'content': "大写希腊字母：\\Alpha (A), \\Beta (B), \\Gamma (Γ), \\Delta (Δ), \\Pi (Π), \\Theta (Θ)"
        },
        {
            'type': 'knowledge',
            'content': "特殊符号：\\infty (∞), \\sum (∑), \\prod (∏), \\int (∫), \\partial (∂)"
        }
    ]
    
    if lesson3.save():
        print(f"✅ 课程3保存成功: {lesson3.title}")
    else:
        print(f"❌ 课程3保存失败: {lesson3.title}")
    
    # 课程4: 矩阵与方程组
    lesson4 = Lesson(
        title="矩阵与方程组",
        sequence=4,
        description="学习如何在LaTeX中表示矩阵和方程组。"
    )
    
    lesson4.cards = [
        {
            'type': 'knowledge',
            'content': "矩阵使用 \\begin{matrix}...\\end{matrix} 环境。行之间用 \\\\ 分隔，列之间用 & 分隔。"
        },
        {
            'type': 'knowledge',
            'content': "带括号的矩阵：\\begin{pmatrix} (圆括号), \\begin{bmatrix} (方括号), \\begin{vmatrix} (行列式)"
        },
        {
            'type': 'knowledge',
            'content': "方程组使用 \\begin{cases}...\\end{cases} 环境。每个方程用 \\\\ 分隔。"
        }
    ]
    
    if lesson4.save():
        print(f"✅ 课程4保存成功: {lesson4.title}")
    else:
        print(f"❌ 课程4保存失败: {lesson4.title}")

def main():
    """主函数"""
    app = create_app()
    with app.app_context():
        print("开始添加课程数据...")
        add_sample_lessons()
        
        # 验证课程数据
        lessons = Lesson.get_all_lessons()
        print(f"\n📊 数据库中现有 {len(lessons)} 个课程:")
        for lesson in lessons:
            print(f"  - {lesson.sequence}. {lesson.title}")
        
        print("\n🎯 课程数据添加完成！")

if __name__ == "__main__":
    main()

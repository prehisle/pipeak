#!/usr/bin/env python3
"""
重新初始化课程数据
"""
import pymongo
from datetime import datetime
from bson import ObjectId

def reset_lessons():
    """重新初始化课程数据"""
    # 连接数据库
    client = pymongo.MongoClient('mongodb://user:password@192.168.1.4:27017/?authSource=admin')
    db = client['latex_trainer']
    
    # 删除所有现有课程
    result = db.lessons.delete_many({})
    print(f'删除了 {result.deleted_count} 个课程')
    
    # 创建新的课程数据 - 全面的数学公式练习体系
    lessons = [
        {
            '_id': ObjectId(),
            'title': '第1课：数学环境与基础语法',
            'sequence': 1,
            'description': '学习LaTeX数学公式的基础语法，掌握数学环境、上标、下标的使用方法。',
            'cards': [
                {
                    'type': 'knowledge',
                    'content': '**LaTeX数学环境**\n\nLaTeX数学公式需要在特定环境中编写：\n\n• **行内公式**：使用 `$...$` 包围，如 `$x^2$` → $x^2$\n• **独立公式**：使用 `$$...$$` 包围，如 `$$E = mc^2$$` → $$E = mc^2$$'
                },
                {
                    'type': 'knowledge',
                    'content': '**上标和下标**\n\n• 上标使用 `^` 符号：`$x^2$` → $x^2$\n• 下标使用 `_` 符号：`$x_1$` → $x_1$\n• 同时使用：`$x_1^2$` → $x_1^2$'
                },
                {
                    'type': 'knowledge',
                    'content': '**花括号的重要性**\n\n多字符的上标下标必须用花括号包围：\n\n• `$x^{10}$` → $x^{10}$ ✓ 正确\n• `$x^10$` → $x^10$ ✗ 错误\n• `$x_{max}$` → $x_{max}$ ✓ 正确\n• `$a^{n+1}$` → $a^{n+1}$ ✓ 正确'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示：x 的平方',
                    'target_formula': '$x^2$',
                    'hints': [
                        '使用 ^ 符号表示上标',
                        '上标内容是 2',
                        '完整格式：$x^2$'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示：a 下标 max',
                    'target_formula': '$a_{max}$',
                    'hints': [
                        '使用 _ 符号表示下标',
                        '多字符下标需要用花括号包围',
                        '完整格式：$a_{max}$'
                    ],
                    'difficulty': 'medium'
                }
            ],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            '_id': ObjectId(),
            'title': '分数与根号',
            'sequence': 2,
            'description': '学习如何在LaTeX中表示分数和根号，掌握复杂数学表达式的写法。',
            'cards': [
                {
                    'type': 'knowledge',
                    'content': '**分数表示法**\n\n使用 `\\frac{分子}{分母}` 命令：\n\n• `$\\frac{1}{2}$` → $\\frac{1}{2}$\n• `$\\frac{a+b}{c-d}$` → $\\frac{a+b}{c-d}$\n• `$\\frac{x^2}{y^3}$` → $\\frac{x^2}{y^3}$'
                },
                {
                    'type': 'knowledge',
                    'content': '**根号表示法**\n\n使用 `\\sqrt{}` 命令：\n\n• `$\\sqrt{x}$` → $\\sqrt{x}$ (平方根)\n• `$\\sqrt[3]{x}$` → $\\sqrt[3]{x}$ (三次根)\n• `$\\sqrt{x^2 + y^2}$` → $\\sqrt{x^2 + y^2}$'
                },
                {
                    'type': 'knowledge',
                    'content': '**分数与根号组合**\n\n可以嵌套使用：\n\n• `$\\frac{1}{\\sqrt{2}}$` → $\\frac{1}{\\sqrt{2}}$\n• `$\\sqrt{\\frac{a}{b}}$` → $\\sqrt{\\frac{a}{b}}$\n• `$\\frac{\\sqrt{a}}{\\sqrt{b}}$` → $\\frac{\\sqrt{a}}{\\sqrt{b}}$'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示分数：二分之一',
                    'target_formula': '$\\frac{1}{2}$',
                    'hints': [
                        '使用 \\frac{分子}{分母} 命令',
                        '分子是 1，分母是 2',
                        '完整格式：$\\frac{1}{2}$'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示：根号下 x 平方加 y 平方',
                    'target_formula': '$\\sqrt{x^2 + y^2}$',
                    'hints': [
                        '使用 \\sqrt{} 命令表示根号',
                        '根号内容是 x^2 + y^2',
                        '完整格式：$\\sqrt{x^2 + y^2}$'
                    ],
                    'difficulty': 'medium'
                }
            ],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            '_id': ObjectId(),
            'title': '希腊字母与特殊符号',
            'sequence': 3,
            'description': '学习常用的希腊字母和数学特殊符号的LaTeX写法。',
            'cards': [
                {
                    'type': 'knowledge',
                    'content': '常用小写希腊字母：$\\alpha$ (alpha), $\\beta$ (beta), $\\gamma$ (gamma), $\\delta$ (delta), $\\pi$ (pi), $\\theta$ (theta), $\\lambda$ (lambda), $\\mu$ (mu)'
                },
                {
                    'type': 'knowledge',
                    'content': '常用大写希腊字母：$\\Gamma$ (Gamma), $\\Delta$ (Delta), $\\Theta$ (Theta), $\\Lambda$ (Lambda), $\\Pi$ (Pi), $\\Sigma$ (Sigma), $\\Omega$ (Omega)'
                },
                {
                    'type': 'knowledge',
                    'content': '常用数学符号：$\\infty$ (无穷), $\\pm$ (正负), $\\times$ (乘号), $\\div$ (除号), $\\neq$ (不等于), $\\leq$ (小于等于), $\\geq$ (大于等于)'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示希腊字母：π (圆周率)',
                    'target_formula': '$\\pi$',
                    'hints': [
                        '希腊字母 π 的 LaTeX 命令是 \\pi',
                        '需要在数学环境中使用',
                        '完整格式：$\\pi$'
                    ],
                    'difficulty': 'easy'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示：α + β = γ',
                    'target_formula': '$\\alpha + \\beta = \\gamma$',
                    'hints': [
                        'α 是 \\alpha，β 是 \\beta，γ 是 \\gamma',
                        '希腊字母命令都以反斜杠开头',
                        '完整格式：$\\alpha + \\beta = \\gamma$'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示：x ≠ ∞',
                    'target_formula': '$x \\neq \\infty$',
                    'hints': [
                        '不等于符号是 \\neq',
                        '无穷符号是 \\infty',
                        '完整格式：$x \\neq \\infty$'
                    ],
                    'difficulty': 'medium'
                }
            ],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            '_id': ObjectId(),
            'title': '求和与积分',
            'sequence': 4,
            'description': '学习如何表示求和符号、积分符号和极限符号。',
            'cards': [
                {
                    'type': 'knowledge',
                    'content': '求和符号使用 \\sum 命令。例如：$\\sum_{i=1}^{n} x_i$ 表示从i=1到n的求和，$\\sum_{k=0}^{\\infty} \\frac{1}{k!}$ 表示无穷级数。'
                },
                {
                    'type': 'knowledge',
                    'content': '积分符号使用 \\int 命令。例如：$\\int_0^1 x^2 dx$ 表示定积分，$\\int f(x) dx$ 表示不定积分，$\\iint$ 表示二重积分。'
                },
                {
                    'type': 'knowledge',
                    'content': '极限符号使用 \\lim 命令。例如：$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$ 表示极限，$\\lim_{n \\to \\infty} \\frac{1}{n} = 0$ 表示数列极限。'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示：从 i=1 到 n 的求和',
                    'target_formula': '$\\sum_{i=1}^{n}$',
                    'hints': [
                        '求和符号使用 \\sum 命令',
                        '下标用 _ 表示，上标用 ^ 表示',
                        '完整格式：$\\sum_{i=1}^{n}$'
                    ],
                    'difficulty': 'medium'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示：从 0 到 1 的定积分',
                    'target_formula': '$\\int_0^1$',
                    'hints': [
                        '积分符号使用 \\int 命令',
                        '积分下限和上限分别用下标和上标表示',
                        '完整格式：$\\int_0^1$'
                    ],
                    'difficulty': 'medium'
                }
            ],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            '_id': ObjectId(),
            'title': '矩阵与方程组',
            'sequence': 5,
            'description': '学习如何在LaTeX中表示矩阵和方程组。',
            'cards': [
                {
                    'type': 'knowledge',
                    'content': '矩阵使用 \\begin{matrix}...\\end{matrix} 环境。例如：$$\\begin{matrix} a & b \\\\ c & d \\end{matrix}$$ 表示2x2矩阵。'
                },
                {
                    'type': 'knowledge',
                    'content': '带括号的矩阵：$$\\begin{pmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\\\ 7 & 8 & 9 \\end{pmatrix}$$ 使用pmatrix环境添加圆括号。'
                },
                {
                    'type': 'knowledge',
                    'content': '方程组使用 \\begin{cases}...\\end{cases} 环境。例如：$$\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}$$ 表示二元方程组。'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示一个 2×2 矩阵（带圆括号）',
                    'target_formula': '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$',
                    'hints': [
                        '使用 \\begin{pmatrix}...\\end{pmatrix} 环境',
                        '矩阵元素用 & 分隔，行用 \\\\\\\\ 分隔',
                        '完整格式：$\\begin{pmatrix} a & b \\\\\\\\ c & d \\end{pmatrix}$'
                    ],
                    'difficulty': 'hard'
                },
                {
                    'type': 'practice',
                    'question': '请输入 LaTeX 代码来表示一个简单的二元方程组',
                    'target_formula': '$\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}$',
                    'hints': [
                        '使用 \\begin{cases}...\\end{cases} 环境',
                        '方程之间用 \\\\\\\\ 分隔',
                        '完整格式：$\\begin{cases} x + y = 1 \\\\\\\\ x - y = 0 \\end{cases}$'
                    ],
                    'difficulty': 'hard'
                }
            ],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
    ]
    
    # 插入新课程
    result = db.lessons.insert_many(lessons)
    print(f'成功添加 {len(result.inserted_ids)} 个课程')
    
    # 验证插入
    count = db.lessons.count_documents({})
    print(f'当前课程总数: {count}')
    
    # 显示课程列表
    print('\n课程列表:')
    for lesson in db.lessons.find().sort('sequence', 1):
        print(f'{lesson["sequence"]}. {lesson["title"]} - {len(lesson["cards"])}个卡片')

if __name__ == "__main__":
    reset_lessons()

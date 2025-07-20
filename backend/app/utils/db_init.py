"""
数据库初始化脚本 - LaTeX 速成训练器
创建示例课程和练习数据
"""
from app.models.lesson import Lesson
from app.models.practice import Practice


def create_sample_lessons():
    """创建示例课程数据"""

    print("创建课程1: 基础环境与上下标")

    # 课程1: 基础环境与上下标
    lesson1 = Lesson(
        title="基础环境与上下标",
        sequence=1,
        description="学习LaTeX数学环境的基础语法，掌握上标和下标的使用方法。"
    )

    # 添加知识点卡片
    lesson1.cards.append({
        'type': 'knowledge',
        'content': "LaTeX数学公式需要在数学环境中编写。行内公式使用 $...$ 包围，独立公式使用 $$...$$ 包围。"
    })
    lesson1.cards.append({
        'type': 'knowledge',
        'content': "上标使用 ^ 符号，下标使用 _ 符号。例如：x^2 表示 x 的平方，x_1 表示 x 下标 1。"
    })
    lesson1.cards.append({
        'type': 'knowledge',
        'content': "当上标或下标包含多个字符时，需要用花括号 {} 包围。例如：x^{10} 或 x_{max}。"
    })
    
    # 创建练习题
    practice1_1 = Practice(
        prompt="请写出 x 的平方的LaTeX代码：",
        solution_regex=r"^\s*\$?\s*x\s*\^\s*\{\s*2\s*\}\s*\$?\s*$|^\s*\$?\s*x\s*\^\s*2\s*\$?\s*$",
        hints=[
            {"pattern": r"x\s*\*\s*2", "message": "提示：上标使用 ^ 符号，不是 * 符号。"},
            {"pattern": r"x\s*2", "message": "提示：需要使用 ^ 符号来表示上标。"},
            {"pattern": r"x\^2", "message": "很好！x^2 是正确的写法。"}
        ],
        difficulty_level=1,
        topic_tags=["superscript", "basic"]
    )
    if practice1_1.save():
        print("练习1_1保存成功")
        lesson1.cards.append({
            'type': 'practice',
            'practice_id': str(practice1_1._id)
        })

    practice1_2 = Practice(
        prompt="请写出 a 下标 max 的LaTeX代码：",
        solution_regex=r"^\s*\$?\s*a\s*_\s*\{\s*max\s*\}\s*\$?\s*$",
        hints=[
            {"pattern": r"a\s*_\s*max", "message": "提示：当下标包含多个字符时，需要用花括号 {} 包围。"},
            {"pattern": r"a\s*max", "message": "提示：需要使用 _ 符号来表示下标。"}
        ],
        difficulty_level=2,
        topic_tags=["subscript", "basic"]
    )
    if practice1_2.save():
        print("练习1_2保存成功")
        lesson1.cards.append({
            'type': 'practice',
            'practice_id': str(practice1_2._id)
        })

    if lesson1.save():
        print("课程1保存成功")
    
    print("创建课程2: 分数与根号")

    # 课程2: 分数与根号
    lesson2 = Lesson(
        title="分数与根号",
        sequence=2,
        description="学习如何在LaTeX中输入分数和根号，掌握 \\frac 和 \\sqrt 命令的使用。"
    )

    lesson2.cards.append({
        'type': 'knowledge',
        'content': "分数使用 \\frac{分子}{分母} 命令。例如：\\frac{1}{2} 表示二分之一。"
    })

    if lesson2.save():
        print("课程2保存成功")
    
    print("示例课程数据创建完成！")
    print(f"已创建 {Lesson.get_total_count()} 个课程")


def init_database():
    """初始化数据库"""
    print("开始初始化数据库...")
    
    # 创建示例课程
    create_sample_lessons()
    
    print("数据库初始化完成！")


if __name__ == "__main__":
    # 可以直接运行此脚本来初始化数据库
    from app import create_app
    
    app = create_app()
    with app.app_context():
        init_database()

"""
练习路由 - LaTeX 速成训练器
处理练习相关的API请求
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import re

from app.models.lesson import Lesson
from app.models.user import User

practice_bp = Blueprint('practice', __name__)


@practice_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_practice():
    """提交练习答案"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()

        # 验证必需字段
        required_fields = ['lesson_id', 'card_index', 'user_answer']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需字段: {field}'}), 400

        lesson_id = data['lesson_id']
        card_index = data['card_index']
        user_answer = data['user_answer'].strip()

        from app import get_db
        db = get_db()

        # 获取课程和练习题
        lesson = db.lessons.find_one({'_id': ObjectId(lesson_id)})
        if not lesson:
            return jsonify({'error': '课程不存在'}), 404

        if card_index >= len(lesson['cards']):
            return jsonify({'error': '卡片索引无效'}), 400

        card = lesson['cards'][card_index]
        if card['type'] != 'practice':
            return jsonify({'error': '该卡片不是练习题'}), 400

        # 检查答案正确性
        target_formula = card['target_formula']
        is_correct = check_latex_answer(user_answer, target_formula)

        # 保存练习记录
        practice_record = {
            'user_id': ObjectId(user_id),
            'lesson_id': ObjectId(lesson_id),
            'card_index': card_index,
            'user_answer': user_answer,
            'target_answer': target_formula,
            'is_correct': is_correct,
            'submitted_at': datetime.utcnow()
        }

        result = db.practice_records.insert_one(practice_record)
        practice_record_id = result.inserted_id

        # 更新用户进度
        update_user_progress(db, user_id, lesson_id, card_index, is_correct)

        # 集成复习系统：创建或更新复习记录
        from app.models.review import Review
        quality = 4 if is_correct else 1  # 正确答案质量较高，错误答案质量较低
        Review.create_or_update_review(user_id, str(practice_record_id), is_correct, quality)

        response_data = {
            'is_correct': is_correct,
            'target_answer': target_formula,
            'feedback': get_feedback(is_correct, user_answer, target_formula)
        }

        # 如果答案错误，提供提示
        if not is_correct:
            hints = card.get('hints', [])
            if hints:
                response_data['hint'] = hints[0]  # 提供第一个提示

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': f'提交练习时出错: {str(e)}'}), 500


@practice_bp.route('/hint', methods=['POST'])
@jwt_required()
def get_hint():
    """获取练习提示"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()

        lesson_id = data.get('lesson_id')
        card_index = data.get('card_index')
        hint_level = data.get('hint_level', 0)

        from app import get_db
        db = get_db()

        # 获取课程和练习题
        lesson = db.lessons.find_one({'_id': ObjectId(lesson_id)})
        if not lesson:
            return jsonify({'error': '课程不存在'}), 404

        card = lesson['cards'][card_index]
        if card['type'] != 'practice':
            return jsonify({'error': '该卡片不是练习题'}), 400

        hints = card.get('hints', [])
        if hint_level >= len(hints):
            return jsonify({'error': '没有更多提示'}), 400

        # 记录提示使用
        hint_record = {
            'user_id': ObjectId(user_id),
            'lesson_id': ObjectId(lesson_id),
            'card_index': card_index,
            'hint_level': hint_level,
            'used_at': datetime.utcnow()
        }

        db.hint_records.insert_one(hint_record)

        return jsonify({
            'hint': hints[hint_level],
            'hint_level': hint_level,
            'has_more_hints': hint_level + 1 < len(hints)
        }), 200

    except Exception as e:
        return jsonify({'error': f'获取提示时出错: {str(e)}'}), 500


@practice_bp.route('/progress/<lesson_id>', methods=['GET'])
@jwt_required()
def get_practice_progress(lesson_id):
    """获取用户在特定课程的练习进度"""
    try:
        user_id = get_jwt_identity()
        from app import get_db
        db = get_db()

        # 获取用户在该课程的所有练习记录
        records = list(db.practice_records.find({
            'user_id': ObjectId(user_id),
            'lesson_id': ObjectId(lesson_id)
        }).sort('submitted_at', -1))

        # 统计每个练习题的最佳成绩
        progress = {}
        for record in records:
            card_index = record['card_index']
            if card_index not in progress:
                progress[card_index] = {
                    'attempts': 0,
                    'best_result': False,
                    'last_attempt': record['submitted_at']
                }

            progress[card_index]['attempts'] += 1
            if record['is_correct']:
                progress[card_index]['best_result'] = True

        return jsonify({'progress': progress}), 200

    except Exception as e:
        return jsonify({'error': f'获取进度时出错: {str(e)}'}), 500


@practice_bp.route('/list', methods=['GET'])
@jwt_required()
def get_practice_list():
    """获取所有练习题列表"""
    try:
        user_id = get_jwt_identity()
        from app import get_db
        db = get_db()

        # 获取查询参数
        course_filter = request.args.get('course')
        difficulty_filter = request.args.get('difficulty')
        topic_filter = request.args.get('topic')

        # 获取所有课程中的练习题
        lessons = list(db.lessons.find({}).sort('sequence', 1))
        practice_list = []

        for lesson in lessons:
            for card_index, card in enumerate(lesson['cards']):
                if card['type'] == 'practice':
                    # 获取用户在此练习题的记录
                    user_record = db.practice_records.find_one({
                        'user_id': ObjectId(user_id),
                        'lesson_id': lesson['_id'],
                        'card_index': card_index
                    }, sort=[('submitted_at', -1)])

                    practice_item = {
                        'id': f"{lesson['_id']}_{card_index}",
                        'lesson_id': str(lesson['_id']),
                        'lesson_title': lesson['title'],
                        'card_index': card_index,
                        'question': card['question'],
                        'target_formula': card['target_formula'],
                        'difficulty': card.get('difficulty', 'medium'),
                        'hints': card.get('hints', []),
                        'completed': user_record['is_correct'] if user_record else False,
                        'attempts': len(list(db.practice_records.find({
                            'user_id': ObjectId(user_id),
                            'lesson_id': lesson['_id'],
                            'card_index': card_index
                        }))),
                        'last_attempt': user_record['submitted_at'] if user_record else None
                    }

                    # 应用筛选条件
                    if course_filter and str(lesson['_id']) != course_filter:
                        continue
                    if difficulty_filter and practice_item['difficulty'] != difficulty_filter:
                        continue

                    practice_list.append(practice_item)

        return jsonify({
            'practices': practice_list,
            'total': len(practice_list)
        }), 200

    except Exception as e:
        return jsonify({'error': f'获取练习题列表时出错: {str(e)}'}), 500


@practice_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_practice_stats():
    """获取用户练习统计"""
    try:
        user_id = get_jwt_identity()
        from app import get_db
        db = get_db()

        # 获取所有练习记录
        records = list(db.practice_records.find({
            'user_id': ObjectId(user_id)
        }))

        if not records:
            return jsonify({
                'total_practices': 0,
                'correct_count': 0,
                'accuracy_rate': 0,
                'total_attempts': 0,
                'difficulty_stats': {},
                'recent_activity': []
            }), 200

        # 统计基本数据
        total_attempts = len(records)
        correct_count = sum(1 for r in records if r['is_correct'])
        accuracy_rate = (correct_count / total_attempts * 100) if total_attempts > 0 else 0

        # 按难度统计
        difficulty_stats = {}
        lessons = {str(l['_id']): l for l in db.lessons.find({})}

        for record in records:
            lesson = lessons.get(str(record['lesson_id']))
            if lesson and record['card_index'] < len(lesson['cards']):
                card = lesson['cards'][record['card_index']]
                difficulty = card.get('difficulty', 'medium')

                if difficulty not in difficulty_stats:
                    difficulty_stats[difficulty] = {'total': 0, 'correct': 0}

                difficulty_stats[difficulty]['total'] += 1
                if record['is_correct']:
                    difficulty_stats[difficulty]['correct'] += 1

        # 计算每个难度的正确率
        for difficulty in difficulty_stats:
            stats = difficulty_stats[difficulty]
            stats['accuracy'] = (stats['correct'] / stats['total'] * 100) if stats['total'] > 0 else 0

        # 获取最近活动
        recent_records = sorted(records, key=lambda x: x['submitted_at'], reverse=True)[:10]
        recent_activity = []

        for record in recent_records:
            lesson = lessons.get(str(record['lesson_id']))
            if lesson:
                recent_activity.append({
                    'lesson_title': lesson['title'],
                    'is_correct': record['is_correct'],
                    'submitted_at': record['submitted_at'].isoformat()
                })

        # 统计独特练习题数量
        unique_practices = set()
        for record in records:
            unique_practices.add(f"{record['lesson_id']}_{record['card_index']}")

        return jsonify({
            'total_practices': len(unique_practices),
            'correct_count': correct_count,
            'accuracy_rate': round(accuracy_rate, 1),
            'total_attempts': total_attempts,
            'difficulty_stats': difficulty_stats,
            'recent_activity': recent_activity
        }), 200

    except Exception as e:
        return jsonify({'error': f'获取练习统计时出错: {str(e)}'}), 500


def check_latex_answer(user_answer, target_answer):
    """检查 LaTeX 答案是否正确 - 支持语义等价性检查"""

    def normalize_latex(latex_str):
        """增强的LaTeX标准化函数，支持更多等价形式"""
        if not latex_str:
            return ""

        try:
            # 移除首尾空格
            latex_str = latex_str.strip()

            # 移除美元符号（如果存在）
            latex_str = re.sub(r'^\$+|\$+$', '', latex_str)

            # 标准化上标和下标的花括号
            # x^2 -> x^{2}, x_1 -> x_{1}
            latex_str = re.sub(r'\^([a-zA-Z0-9])', r'^{\1}', latex_str)
            latex_str = re.sub(r'_([a-zA-Z0-9])', r'_{\1}', latex_str)

            # 标准化分数形式
            latex_str = re.sub(r'\\frac\s*\{\s*([^}]+)\s*\}\s*\{\s*([^}]+)\s*\}', r'\\frac{\1}{\2}', latex_str)

            # 标准化根号形式
            latex_str = re.sub(r'\\sqrt\s*\{\s*([^}]+)\s*\}', r'\\sqrt{\1}', latex_str)

            # 标准化数学函数名
            function_mappings = {
                ' sin ': ' \\sin ',
                ' cos ': ' \\cos ',
                ' tan ': ' \\tan ',
                ' cot ': ' \\cot ',
                ' sec ': ' \\sec ',
                ' csc ': ' \\csc ',
                ' ln ': ' \\ln ',
                ' log ': ' \\log ',
                ' exp ': ' \\exp ',
                ' sqrt ': ' \\sqrt ',
                # 处理开头和结尾的情况
                'sin(': '\\sin(',
                'cos(': '\\cos(',
                'tan(': '\\tan(',
                'ln(': '\\ln(',
                'log(': '\\log(',
                'exp(': '\\exp(',
                'sqrt(': '\\sqrt(',
            }

            # 添加空格以便匹配
            latex_str = ' ' + latex_str + ' '

            # 应用函数名映射
            for old, new in function_mappings.items():
                latex_str = latex_str.replace(old, new)

            # 移除添加的空格
            latex_str = latex_str.strip()

            # 标准化运算符
            operator_mappings = {
                '\\cdot': '*',
                '\\times': '*',
                '\\div': '/',
                '\\neq': '!=',
                '\\leq': '<=',
                '\\geq': '>=',
            }

            for old, new in operator_mappings.items():
                latex_str = latex_str.replace(old, new)

            # 标准化希腊字母和特殊符号的空格
            latex_str = re.sub(r'\\([a-zA-Z]+)\s+', r'\\\1 ', latex_str)

            # 标准化求和、积分等大型运算符
            latex_str = re.sub(r'\\sum\s*_\s*\{\s*([^}]+)\s*\}\s*\^\s*\{\s*([^}]+)\s*\}', r'\\sum_{\1}^{\2}', latex_str)
            latex_str = re.sub(r'\\int\s*_\s*\{\s*([^}]+)\s*\}\s*\^\s*\{\s*([^}]+)\s*\}', r'\\int_{\1}^{\2}', latex_str)
            latex_str = re.sub(r'\\lim\s*_\s*\{\s*([^}]+)\s*\}', r'\\lim_{\1}', latex_str)

            # 标准化矩阵和方程组环境
            latex_str = re.sub(r'\\begin\s*\{\s*([^}]+)\s*\}', r'\\begin{\1}', latex_str)
            latex_str = re.sub(r'\\end\s*\{\s*([^}]+)\s*\}', r'\\end{\1}', latex_str)

            # 处理常见的等价形式
            equivalence_mappings = {
                # 分数的不同写法
                '1/2': '\\frac{1}{2}',
                '(1)/(2)': '\\frac{1}{2}',
                # 平方根的不同写法
                'sqrt(x)': '\\sqrt{x}',
                'sqrt x': '\\sqrt{x}',
                # 指数的不同写法
                'e^x': '\\exp(x)',
                'exp(x)': '\\exp(x)',
            }

            for old, new in equivalence_mappings.items():
                latex_str = latex_str.replace(old, new)

            # 最终标准化：移除多余空格但保留必要结构
            latex_str = re.sub(r'\s+', ' ', latex_str)
            latex_str = latex_str.strip()

            # 对于最终比较，移除所有空格
            latex_str = re.sub(r'\s+', '', latex_str)

            return latex_str.lower()

        except Exception as e:
            print(f"ERROR in normalize_latex: {e}")
            # 如果出错，回退到简单处理
            return latex_str.strip().lower().replace(' ', '')

    try:
        user_normalized = normalize_latex(user_answer)
        target_normalized = normalize_latex(target_answer)

        print(f"DEBUG: 用户答案: '{user_answer}' -> 标准化: '{user_normalized}'")
        print(f"DEBUG: 目标答案: '{target_answer}' -> 标准化: '{target_normalized}'")

        # 直接比较标准化后的结果
        result = user_normalized == target_normalized
        print(f"DEBUG: 答案比较结果: {result}")

        return result

    except Exception as e:
        print(f"ERROR: 答案检查出错: {e}")
        # 出错时回退到简单比较
        try:
            simple_user = user_answer.strip().lower().replace(' ', '')
            simple_target = target_answer.strip().lower().replace(' ', '')
            return simple_user == simple_target
        except:
            return False


def get_feedback(is_correct, user_answer, target_answer):
    """生成反馈信息"""
    if is_correct:
        return "🎉 太棒了！答案完全正确！"
    else:
        return f"答案不正确。你的答案：{user_answer}，正确答案：{target_answer}"


def update_user_progress(db, user_id, lesson_id, card_index, is_correct):
    """更新用户学习进度"""
    # 查找或创建进度记录
    progress = db.user_progress.find_one({
        'user_id': ObjectId(user_id),
        'lesson_id': ObjectId(lesson_id)
    })

    if not progress:
        progress = {
            'user_id': ObjectId(user_id),
            'lesson_id': ObjectId(lesson_id),
            'cards_progress': {},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

    # 更新卡片进度
    if str(card_index) not in progress['cards_progress']:
        progress['cards_progress'][str(card_index)] = {
            'completed': False,
            'attempts': 0,
            'first_completed_at': None
        }

    card_progress = progress['cards_progress'][str(card_index)]
    card_progress['attempts'] += 1

    if is_correct and not card_progress['completed']:
        card_progress['completed'] = True
        card_progress['first_completed_at'] = datetime.utcnow()

    progress['updated_at'] = datetime.utcnow()

    # 保存进度
    db.user_progress.replace_one(
        {
            'user_id': ObjectId(user_id),
            'lesson_id': ObjectId(lesson_id)
        },
        progress,
        upsert=True
    )

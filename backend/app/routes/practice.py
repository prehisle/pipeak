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

        db.practice_records.insert_one(practice_record)

        # 更新用户进度
        update_user_progress(db, user_id, lesson_id, card_index, is_correct)

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


def check_latex_answer(user_answer, target_answer):
    """检查 LaTeX 答案是否正确"""
    # 标准化答案格式
    def normalize_latex(latex_str):
        # 移除多余空格
        latex_str = re.sub(r'\s+', '', latex_str)
        # 标准化常见变体
        latex_str = latex_str.replace('\\cdot', '*')
        return latex_str.lower()

    user_normalized = normalize_latex(user_answer)
    target_normalized = normalize_latex(target_answer)

    return user_normalized == target_normalized


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

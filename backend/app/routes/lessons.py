"""
课程路由 - LaTeX 速成训练器
处理课程相关的API请求
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from app.models.lesson import Lesson
from app.models.user import User

lessons_bp = Blueprint('lessons', __name__)


@lessons_bp.route('', methods=['GET', 'OPTIONS'])
@lessons_bp.route('/', methods=['GET', 'OPTIONS'])
def get_lessons():
    """获取课程列表"""
    # 处理 OPTIONS 预检请求
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        return response, 200
    
    # GET 请求需要认证
    from flask_jwt_extended import verify_jwt_in_request
    try:
        verify_jwt_in_request()
    except:
        return jsonify({'message': 'Authorization token is required'}), 401
    
    try:
        current_user_id = get_jwt_identity()
        user = User.find_by_id(current_user_id)

        if not user:
            return jsonify({'message': '用户不存在'}), 404

        # 获取语言参数
        lang = request.args.get('lang', 'zh-CN')

        # 获取所有课程
        lessons = Lesson.get_all_lessons()

        # 转换为字典格式并添加用户进度信息
        lessons_data = []
        for lesson in lessons:
            # 使用数据库中的翻译数据
            lesson_dict = lesson.to_dict(language=lang)
            lesson_dict['is_completed'] = user.is_lesson_completed(lesson._id)
            lesson_dict['is_unlocked'] = True  # 暂时所有课程都解锁，后续可以实现线性解锁
            lessons_data.append(lesson_dict)

        return jsonify({
            'lessons': lessons_data,
            'total_count': len(lessons_data)
        }), 200

    except Exception as e:
        return jsonify({'message': f'服务器错误: {str(e)}'}), 500

    except Exception as e:
        return jsonify({'message': f'服务器错误: {str(e)}'}), 500


# 旧的硬编码翻译函数已移除，现在使用数据库中的翻译数据


@lessons_bp.route('/<lesson_id>', methods=['GET'])
@jwt_required()
def get_lesson(lesson_id):
    """获取特定课程详情"""
    try:
        current_user_id = get_jwt_identity()
        user = User.find_by_id(current_user_id)

        if not user:
            return jsonify({'message': '用户不存在'}), 404

        # 支持两种格式的lesson_id：ObjectId 和 lesson-{sequence}
        lesson = None

        # 尝试作为ObjectId查找
        try:
            ObjectId(lesson_id)
            lesson = Lesson.find_by_id(lesson_id)
        except:
            # 如果不是ObjectId，尝试作为lesson-{sequence}格式解析
            if lesson_id.startswith('lesson-'):
                try:
                    sequence = int(lesson_id.replace('lesson-', ''))
                    lesson = Lesson.find_by_sequence(sequence)
                except ValueError:
                    pass

        if not lesson:
            return jsonify({'message': '课程不存在'}), 400

        # 转换为字典格式并添加用户进度信息
        lesson_dict = lesson.to_dict()
        lesson_dict['is_completed'] = user.is_lesson_completed(lesson._id)
        lesson_dict['is_unlocked'] = True  # 暂时所有课程都解锁

        return jsonify({
            'lesson': lesson_dict
        }), 200

    except Exception as e:
        return jsonify({'message': f'服务器错误: {str(e)}'}), 500


@lessons_bp.route('/<lesson_id>/complete', methods=['POST'])
@jwt_required()
def complete_lesson(lesson_id):
    """标记课程为已完成 - 需要验证所有练习题都已正确完成"""
    try:
        current_user_id = get_jwt_identity()
        user = User.find_by_id(current_user_id)

        if not user:
            return jsonify({'message': '用户不存在'}), 404

        # 支持两种格式的lesson_id：ObjectId 和 lesson-{sequence}
        lesson = None

        # 尝试作为ObjectId查找
        try:
            ObjectId(lesson_id)
            lesson = Lesson.find_by_id(lesson_id)
        except:
            # 如果不是ObjectId，尝试作为lesson-{sequence}格式解析
            if lesson_id.startswith('lesson-'):
                try:
                    sequence = int(lesson_id.replace('lesson-', ''))
                    lesson = Lesson.find_by_sequence(sequence)
                except ValueError:
                    pass

        if not lesson:
            return jsonify({'message': '课程不存在'}), 400

        # 验证用户是否完成了所有练习题
        from app import get_db
        db = get_db()

        # 获取课程中的所有练习题
        practice_cards = []
        for i, card in enumerate(lesson.cards):
            if card.get('type') == 'practice':
                practice_cards.append(i)

        if not practice_cards:
            # 如果没有练习题，可以直接完成
            if user.update_progress(str(lesson._id), completed=True):
                return jsonify({
                    'message': '课程完成状态已更新',
                    'lesson_id': lesson_id,
                    'completed': True
                }), 200
            else:
                return jsonify({'message': '更新失败'}), 500

        # 检查用户是否完成了所有练习题
        user_progress = db.user_progress.find_one({
            'user_id': ObjectId(current_user_id),
            'lesson_id': lesson._id
        })

        if not user_progress:
            return jsonify({
                'message': '请先完成所有练习题',
                'completed_practices': 0,
                'total_practices': len(practice_cards),
                'can_complete': False
            }), 400

        # 检查每个练习题是否都已正确完成
        completed_practices = 0
        for card_index in practice_cards:
            card_progress = user_progress['cards_progress'].get(str(card_index))
            if card_progress and card_progress.get('completed', False):
                completed_practices += 1

        # 必须完成所有练习题才能完成课程
        if completed_practices < len(practice_cards):
            return jsonify({
                'message': f'请完成所有练习题后再完成课程（已完成 {completed_practices}/{len(practice_cards)} 题）',
                'completed_practices': completed_practices,
                'total_practices': len(practice_cards),
                'can_complete': False
            }), 400

        # 所有练习题都已完成，可以完成课程
        if user.update_progress(str(lesson._id), completed=True):
            return jsonify({
                'message': '恭喜！课程已完成，您已掌握所有知识点',
                'lesson_id': lesson_id,
                'completed': True,
                'completed_practices': completed_practices,
                'total_practices': len(practice_cards)
            }), 200
        else:
            return jsonify({'message': '更新失败'}), 500

    except Exception as e:
        return jsonify({'message': f'服务器错误: {str(e)}'}), 500


@lessons_bp.route('/<lesson_id>/completion-status', methods=['GET'])
@jwt_required()
def get_lesson_completion_status(lesson_id):
    """获取课程完成状态和进度"""
    try:
        current_user_id = get_jwt_identity()

        # 支持两种格式的lesson_id：ObjectId 和 lesson-{sequence}
        lesson = None

        # 尝试作为ObjectId查找
        try:
            ObjectId(lesson_id)
            lesson = Lesson.find_by_id(lesson_id)
        except:
            # 如果不是ObjectId，尝试作为lesson-{sequence}格式解析
            if lesson_id.startswith('lesson-'):
                try:
                    sequence = int(lesson_id.replace('lesson-', ''))
                    lesson = Lesson.find_by_sequence(sequence)
                except ValueError:
                    pass

        if not lesson:
            return jsonify({'message': '课程不存在'}), 400

        from app import get_db
        db = get_db()

        # 获取课程中的所有练习题
        practice_cards = []
        for i, card in enumerate(lesson.cards):
            if card.get('type') == 'practice':
                practice_cards.append({
                    'index': i,
                    'title': card.get('title', f'练习题 {i+1}'),
                    'target_formula': card.get('target_formula', '')
                })

        # 获取用户进度
        user_progress = db.user_progress.find_one({
            'user_id': ObjectId(current_user_id),
            'lesson_id': lesson._id
        })

        completed_practices = []
        pending_practices = []

        for practice in practice_cards:
            card_index = practice['index']
            if user_progress:
                card_progress = user_progress['cards_progress'].get(str(card_index))
                if card_progress and card_progress.get('completed', False):
                    completed_practices.append({
                        **practice,
                        'completed_at': card_progress.get('first_completed_at'),
                        'attempts': card_progress.get('attempts', 0)
                    })
                else:
                    pending_practices.append({
                        **practice,
                        'attempts': card_progress.get('attempts', 0) if card_progress else 0
                    })
            else:
                pending_practices.append({
                    **practice,
                    'attempts': 0
                })

        total_practices = len(practice_cards)
        completed_count = len(completed_practices)
        can_complete = completed_count == total_practices and total_practices > 0

        # 检查用户是否已经完成了课程
        user = User.find_by_id(current_user_id)
        is_already_completed = user.is_lesson_completed(str(lesson._id)) if user else False

        return jsonify({
            'lesson_id': lesson_id,
            'lesson_title': lesson.title,
            'total_practices': total_practices,
            'completed_practices': completed_count,
            'can_complete': can_complete,
            'is_already_completed': is_already_completed,
            'completion_percentage': round((completed_count / total_practices * 100) if total_practices > 0 else 100, 1),
            'completed_practice_details': completed_practices,
            'pending_practice_details': pending_practices
        }), 200

    except Exception as e:
        return jsonify({'message': f'服务器错误: {str(e)}'}), 500

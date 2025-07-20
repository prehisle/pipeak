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


@lessons_bp.route('', methods=['GET'])
@lessons_bp.route('/', methods=['GET'])
@jwt_required()
def get_lessons():
    """获取课程列表"""
    try:
        current_user_id = get_jwt_identity()
        user = User.find_by_id(current_user_id)

        if not user:
            return jsonify({'message': '用户不存在'}), 404

        # 获取所有课程
        lessons = Lesson.get_all_lessons()

        # 转换为字典格式并添加用户进度信息
        lessons_data = []
        for lesson in lessons:
            lesson_dict = lesson.to_dict()
            lesson_dict['is_completed'] = user.is_lesson_completed(lesson._id)
            lesson_dict['is_unlocked'] = True  # 暂时所有课程都解锁，后续可以实现线性解锁
            lessons_data.append(lesson_dict)

        return jsonify({
            'lessons': lessons_data,
            'total_count': len(lessons_data)
        }), 200

    except Exception as e:
        return jsonify({'message': f'服务器错误: {str(e)}'}), 500


@lessons_bp.route('/<lesson_id>', methods=['GET'])
@jwt_required()
def get_lesson(lesson_id):
    """获取特定课程详情"""
    try:
        current_user_id = get_jwt_identity()
        user = User.find_by_id(current_user_id)

        if not user:
            return jsonify({'message': '用户不存在'}), 404

        # 验证lesson_id格式
        try:
            ObjectId(lesson_id)
        except:
            return jsonify({'message': '无效的课程ID'}), 400

        # 查找课程
        lesson = Lesson.find_by_id(lesson_id)
        if not lesson:
            return jsonify({'message': '课程不存在'}), 404

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
    """标记课程为已完成"""
    try:
        current_user_id = get_jwt_identity()
        user = User.find_by_id(current_user_id)

        if not user:
            return jsonify({'message': '用户不存在'}), 404

        # 验证lesson_id格式
        try:
            ObjectId(lesson_id)
        except:
            return jsonify({'message': '无效的课程ID'}), 400

        # 查找课程
        lesson = Lesson.find_by_id(lesson_id)
        if not lesson:
            return jsonify({'message': '课程不存在'}), 404

        # 更新用户进度
        if user.update_progress(lesson_id, completed=True):
            return jsonify({
                'message': '课程完成状态已更新',
                'lesson_id': lesson_id,
                'completed': True
            }), 200
        else:
            return jsonify({'message': '更新失败'}), 500

    except Exception as e:
        return jsonify({'message': f'服务器错误: {str(e)}'}), 500

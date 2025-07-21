"""
复习路由 - LaTeX 速成训练器
处理复习相关的API请求，实现基于SM-2算法的间隔复习系统
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timedelta

from app.models.review import Review
from app.models.lesson import Lesson

reviews_bp = Blueprint('reviews', __name__)


@reviews_bp.route('/today', methods=['GET'])
@jwt_required()
def get_today_reviews():
    """获取今日复习任务"""
    try:
        user_id = get_jwt_identity()

        # 获取到期的复习任务
        due_reviews = Review.get_due_reviews(user_id)

        # 构建返回数据，包含练习题详细信息
        reviews_data = []
        from app import get_db
        db = get_db()

        for review in due_reviews:
            # 通过practice记录找到对应的课程和卡片
            practice_record = db.practice_records.find_one({
                'user_id': ObjectId(user_id),
                '_id': ObjectId(review.practice_id)
            })

            if practice_record:
                # 获取课程信息
                lesson = db.lessons.find_one({'_id': practice_record['lesson_id']})
                if lesson and practice_record['card_index'] < len(lesson['cards']):
                    card = lesson['cards'][practice_record['card_index']]

                    reviews_data.append({
                        'review_id': str(review._id),
                        'practice_id': review.practice_id,
                        'lesson_id': str(lesson['_id']),
                        'lesson_title': lesson['title'],
                        'card_index': practice_record['card_index'],
                        'question': card.get('question', ''),
                        'target_formula': card.get('target_formula', ''),
                        'difficulty': card.get('difficulty', 'medium'),
                        'next_review_date': review.next_review_date.isoformat(),
                        'repetitions': review.repetitions,
                        'easiness_factor': review.easiness_factor
                    })

        # 获取复习统计
        stats = Review.get_review_stats(user_id)

        return jsonify({
            'reviews': reviews_data,
            'stats': stats,
            'total_due': len(reviews_data)
        }), 200

    except Exception as e:
        return jsonify({'error': f'获取复习任务失败: {str(e)}'}), 500


@reviews_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_review():
    """提交复习答案并更新复习计划"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()

        # 验证必需字段
        required_fields = ['review_id', 'user_answer', 'is_correct']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需字段: {field}'}), 400

        review_id = data['review_id']
        user_answer = data['user_answer']
        is_correct = data['is_correct']
        quality = data.get('quality', 3 if is_correct else 1)  # 默认质量评分

        # 获取复习记录
        review = Review.find_by_id(review_id)
        if not review:
            return jsonify({'error': '复习记录不存在'}), 404

        if review.user_id != user_id:
            return jsonify({'error': '无权限访问此复习记录'}), 403

        # 更新复习计划
        review.update_review_schedule(is_correct, quality)

        # 保存复习提交记录
        from app import get_db
        db = get_db()

        review_submission = {
            'user_id': ObjectId(user_id),
            'review_id': ObjectId(review_id),
            'practice_id': ObjectId(review.practice_id),
            'user_answer': user_answer,
            'is_correct': is_correct,
            'quality': quality,
            'submitted_at': datetime.utcnow(),
            'next_review_date': review.next_review_date,
            'easiness_factor': review.easiness_factor,
            'repetitions': review.repetitions
        }

        db.review_submissions.insert_one(review_submission)

        # 计算下次复习时间的友好显示
        next_review_friendly = get_friendly_time_delta(review.next_review_date)

        return jsonify({
            'success': True,
            'is_correct': is_correct,
            'next_review_date': review.next_review_date.isoformat(),
            'next_review_friendly': next_review_friendly,
            'repetitions': review.repetitions,
            'easiness_factor': round(review.easiness_factor, 2),
            'message': '复习完成！' if is_correct else '继续加油！'
        }), 200

    except Exception as e:
        return jsonify({'error': f'提交复习失败: {str(e)}'}), 500


@reviews_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_review_stats():
    """获取用户复习统计信息"""
    try:
        user_id = get_jwt_identity()

        # 获取基础统计
        stats = Review.get_review_stats(user_id)

        # 获取详细统计
        from app import get_db
        db = get_db()

        # 本周复习完成数
        week_ago = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = week_ago - timedelta(days=7)

        week_completed = db.review_submissions.count_documents({
            'user_id': ObjectId(user_id),
            'submitted_at': {'$gte': week_ago}
        })

        # 正确率统计
        total_submissions = db.review_submissions.count_documents({
            'user_id': ObjectId(user_id)
        })

        correct_submissions = db.review_submissions.count_documents({
            'user_id': ObjectId(user_id),
            'is_correct': True
        })

        accuracy_rate = (correct_submissions / total_submissions * 100) if total_submissions > 0 else 0

        # 学习强度分布
        mastery_distribution = db.reviews.aggregate([
            {'$match': {'user_id': ObjectId(user_id)}},
            {'$group': {
                '_id': {
                    '$switch': {
                        'branches': [
                            {'case': {'$lt': ['$repetitions', 2]}, 'then': 'learning'},
                            {'case': {'$lt': ['$repetitions', 4]}, 'then': 'familiar'},
                            {'case': {'$gte': ['$repetitions', 4]}, 'then': 'mastered'}
                        ],
                        'default': 'learning'
                    }
                },
                'count': {'$sum': 1}
            }}
        ])

        mastery_stats = {'learning': 0, 'familiar': 0, 'mastered': 0}
        for item in mastery_distribution:
            mastery_stats[item['_id']] = item['count']

        enhanced_stats = {
            **stats,
            'week_completed': week_completed,
            'total_submissions': total_submissions,
            'accuracy_rate': round(accuracy_rate, 1),
            'mastery_distribution': mastery_stats
        }

        return jsonify({'stats': enhanced_stats}), 200

    except Exception as e:
        return jsonify({'error': f'获取统计信息失败: {str(e)}'}), 500


def get_friendly_time_delta(future_date):
    """将时间差转换为友好的显示格式"""
    from datetime import timedelta

    now = datetime.utcnow()
    delta = future_date - now

    if delta.days == 0:
        return "今天"
    elif delta.days == 1:
        return "明天"
    elif delta.days < 7:
        return f"{delta.days}天后"
    elif delta.days < 30:
        weeks = delta.days // 7
        return f"{weeks}周后"
    elif delta.days < 365:
        months = delta.days // 30
        return f"{months}个月后"
    else:
        years = delta.days // 365
        return f"{years}年后"

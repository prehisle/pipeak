"""
复习路由 - LaTeX 速成训练器
处理复习相关的API请求
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

reviews_bp = Blueprint('reviews', __name__)


@reviews_bp.route('/today', methods=['GET'])
@jwt_required()
def get_today_reviews():
    """获取今日复习任务"""
    # TODO: 实现今日复习任务获取逻辑
    return jsonify({
        'message': '今日复习功能待实现',
        'reviews': []
    }), 200


@reviews_bp.route('/update', methods=['POST'])
@jwt_required()
def update_review():
    """更新复习记录"""
    # TODO: 实现复习记录更新逻辑
    return jsonify({
        'message': '复习更新功能待实现'
    }), 200

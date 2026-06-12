from flask import Blueprint, jsonify, request

from app.api.v1.users import schema, service
from app.auth import require_auth
from app.errors import ApiError

bp = Blueprint("users", __name__, url_prefix="/api/v1/users")


@bp.route("/me", methods=["GET"])
@require_auth
def get_current_user(current_user):
    """Get currently authenticated user."""
    response = schema.serialize_user(current_user)
    return jsonify({"data": response}), 200


@bp.route("/me", methods=["PATCH"])
@require_auth
def update_profile(current_user):
    """Update currently authenticated user's profile."""
    try:
        data = request.get_json() or {}
        payload = schema.parse_update_profile_payload(data)
        
        user = service.update_profile(current_user.id, payload["name"])
        response = schema.serialize_user(user)
        
        return jsonify({"data": response}), 200
    except ApiError as e:
        return jsonify({"error": e.to_dict()}), e.status_code


@bp.route("/me/password", methods=["PATCH"])
@require_auth
def change_password(current_user):
    """Change currently authenticated user's password."""
    try:
        data = request.get_json() or {}
        payload = schema.parse_password_change_payload(data)
        
        user = service.change_password(
            current_user.id, payload["current_password"], payload["new_password"]
        )
        response = schema.serialize_user(user)
        
        return jsonify({"data": response}), 200
    except ApiError as e:
        return jsonify({"error": e.to_dict()}), e.status_code

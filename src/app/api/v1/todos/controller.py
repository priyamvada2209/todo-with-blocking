from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.api.v1.todos import schema, service
from app.auth import require_auth
from app.db import get_session
from app.errors import ApiError

todos_bp = Blueprint("todos", __name__, url_prefix="/api/v1/todos")


@todos_bp.get("")
@require_auth
def get_todos(current_user):
    query = schema.parse_todos_query(request.args.to_dict(flat=True))
    session = get_session()

    todos = service.list_todos_for_date(session, current_user.id, query["date"])
    return jsonify({"data": [schema.serialize_todo(todo) for todo in todos]}), 200


@todos_bp.post("")
@require_auth
def create_todo(current_user):
    payload = schema.parse_create_payload(request.get_json(silent=True))
    session = get_session()

    todo = service.create_todo(
        session,
        user_id=current_user.id,
        task=payload["task"],
        todo_date=payload["date"],
        sites=payload["sites"],
    )
    return jsonify({"data": schema.serialize_todo(todo)}), 201


@todos_bp.patch("/<int:todo_id>/complete")
@require_auth
def complete_todo(todo_id: int, current_user):
    session = get_session()

    todo = service.mark_todo_completed(session, user_id=current_user.id, todo_id=todo_id)
    return jsonify({"data": schema.serialize_todo(todo)}), 200


@todos_bp.patch("/<int:todo_id>")
@require_auth
def update_todo(todo_id: int, current_user):
    payload = schema.parse_update_payload(request.get_json(silent=True))
    session = get_session()

    todo = service.update_todo(session, user_id=current_user.id, todo_id=todo_id, updates=payload)
    return jsonify({"data": schema.serialize_todo(todo)}), 200


@todos_bp.delete("/<int:todo_id>")
@require_auth
def delete_todo(todo_id: int, current_user):
    session = get_session()

    service.delete_todo(session, user_id=current_user.id, todo_id=todo_id)
    return "", 204


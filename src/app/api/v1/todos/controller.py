from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.api.v1.todos import schema, service
from app.db import get_session
from app.errors import ApiError

todos_bp = Blueprint("todos", __name__)


def _client_ip() -> str:
    forwarded_for = request.headers.get("X-Forwarded-For", "").strip()
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    if request.remote_addr:
        return request.remote_addr

    raise ApiError("Unable to determine request IP address.")


@todos_bp.get("/todos")
def get_todos():
    query = schema.parse_todos_query(request.args.to_dict(flat=True))
    ip_address = _client_ip()
    session = get_session()

    todos = service.list_todos_for_date(session, ip_address, query["date"])
    return jsonify({"data": [schema.serialize_todo(todo) for todo in todos]}), 200


@todos_bp.post("/todos")
def create_todo():
    payload = schema.parse_create_payload(request.get_json(silent=True))
    ip_address = _client_ip()
    session = get_session()

    todo = service.create_todo(
        session,
        ip_address=ip_address,
        task=payload["task"],
        todo_date=payload["date"],
        sites=payload["sites"],
    )
    return jsonify({"data": schema.serialize_todo(todo)}), 201


@todos_bp.patch("/todos/<int:todo_id>/complete")
def complete_todo(todo_id: int):
    ip_address = _client_ip()
    session = get_session()

    todo = service.mark_todo_completed(session, ip_address=ip_address, todo_id=todo_id)
    return jsonify({"data": schema.serialize_todo(todo)}), 200


@todos_bp.patch("/todos/<int:todo_id>")
def update_todo(todo_id: int):
    payload = schema.parse_update_payload(request.get_json(silent=True))
    ip_address = _client_ip()
    session = get_session()

    todo = service.update_todo(session, ip_address=ip_address, todo_id=todo_id, updates=payload)
    return jsonify({"data": schema.serialize_todo(todo)}), 200


@todos_bp.delete("/todos/<int:todo_id>")
def delete_todo(todo_id: int):
    ip_address = _client_ip()
    session = get_session()

    service.delete_todo(session, ip_address=ip_address, todo_id=todo_id)
    return "", 204

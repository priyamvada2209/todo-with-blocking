from __future__ import annotations

from datetime import date
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.errors import ApiError
from app.models.task import Task


def list_todos_for_date(session: Session, ip_address: str, todo_date: date) -> list[Task]:
    stmt = (
        select(Task)
        .where(Task.ip_address == ip_address, Task.date == todo_date)
        .order_by(Task.created_at.asc(), Task.id.asc())
    )
    return list(session.scalars(stmt).all())


def create_todo(
    session: Session,
    *,
    ip_address: str,
    task: str,
    todo_date: date,
    sites: list[str],
) -> Task:
    todo = Task(
        ip_address=ip_address,
        task=task,
        date=todo_date,
        sites=sites,
        is_completed=False,
    )
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo


def _get_todo_or_404(session: Session, *, ip_address: str, todo_id: int) -> Task:
    stmt = select(Task).where(Task.id == todo_id, Task.ip_address == ip_address)
    todo = session.scalar(stmt)
    if todo is None:
        raise ApiError("Todo not found.", status_code=404, code="not_found")
    return todo


def mark_todo_completed(session: Session, *, ip_address: str, todo_id: int) -> Task:
    todo = _get_todo_or_404(session, ip_address=ip_address, todo_id=todo_id)
    todo.is_completed = True
    session.commit()
    session.refresh(todo)
    return todo


def update_todo(
    session: Session,
    *,
    ip_address: str,
    todo_id: int,
    updates: dict[str, Any],
) -> Task:
    todo = _get_todo_or_404(session, ip_address=ip_address, todo_id=todo_id)

    for field_name, value in updates.items():
        setattr(todo, field_name, value)

    session.commit()
    session.refresh(todo)
    return todo


def delete_todo(session: Session, *, ip_address: str, todo_id: int) -> None:
    todo = _get_todo_or_404(session, ip_address=ip_address, todo_id=todo_id)
    session.delete(todo)
    session.commit()

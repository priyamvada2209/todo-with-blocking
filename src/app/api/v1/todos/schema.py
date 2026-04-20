from __future__ import annotations

from datetime import date, datetime
from typing import Any
from urllib.parse import urlparse

from app.errors import ApiError
from app.models.task import Task

_ALLOWED_CREATE_FIELDS = {"task", "date", "sites"}
_ALLOWED_UPDATE_FIELDS = {"task", "date", "sites"}


def _parse_iso_date(value: Any, field_name: str = "date") -> date:
    if not isinstance(value, str):
        raise ApiError(f"{field_name} must be a valid ISO date (YYYY-MM-DD).")

    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise ApiError(f"{field_name} must be a valid ISO date (YYYY-MM-DD).") from exc


def _parse_task(value: Any) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ApiError("task must be a non-empty string.")
    return value.strip()


def _is_valid_url(value: str) -> bool:
    parsed = urlparse(value)
    return bool(parsed.scheme and parsed.netloc)


def _parse_sites(value: Any) -> list[str]:
    if not isinstance(value, list):
        raise ApiError("sites must be an array of URLs.")

    normalized: list[str] = []
    for idx, site in enumerate(value):
        if not isinstance(site, str) or not _is_valid_url(site):
            raise ApiError(
                "sites must be an array of valid URLs.",
                details={"index": idx},
            )
        normalized.append(site)
    return normalized


def parse_todos_query(query_params: dict[str, Any]) -> dict[str, Any]:
    if "date" not in query_params:
        raise ApiError("date query parameter is required.")
    return {"date": _parse_iso_date(query_params.get("date"), "date")}


def parse_create_payload(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ApiError("Request body must be a JSON object.")

    unexpected = set(payload.keys()) - _ALLOWED_CREATE_FIELDS
    if unexpected:
        raise ApiError("Request contains unsupported fields.", details={"fields": sorted(unexpected)})

    if "task" not in payload:
        raise ApiError("task is required.")
    if "date" not in payload:
        raise ApiError("date is required.")

    return {
        "task": _parse_task(payload.get("task")),
        "date": _parse_iso_date(payload.get("date"), "date"),
        "sites": _parse_sites(payload["sites"]) if "sites" in payload else [],
    }


def parse_update_payload(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ApiError("Request body must be a JSON object.")
    if not payload:
        raise ApiError("At least one editable field must be provided.")

    unexpected = set(payload.keys()) - _ALLOWED_UPDATE_FIELDS
    if unexpected:
        raise ApiError("Request contains unsupported fields.", details={"fields": sorted(unexpected)})

    updates: dict[str, Any] = {}
    if "task" in payload:
        updates["task"] = _parse_task(payload.get("task"))
    if "date" in payload:
        updates["date"] = _parse_iso_date(payload.get("date"), "date")
    if "sites" in payload:
        updates["sites"] = _parse_sites(payload.get("sites"))

    if not updates:
        raise ApiError("At least one editable field must be provided.")
    return updates


def _iso_datetime(value: datetime | None) -> str | None:
    if value is None:
        return None
    return value.isoformat()


def serialize_todo(todo: Task) -> dict[str, Any]:
    return {
        "id": todo.id,
        "task": todo.task,
        "date": todo.date.isoformat(),
        "sites": todo.sites or [],
        "is_completed": todo.is_completed,
        "created_at": _iso_datetime(todo.created_at),
        "updated_at": _iso_datetime(todo.updated_at),
    }

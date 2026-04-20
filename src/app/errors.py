from __future__ import annotations

from typing import Any

from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException


class ApiError(Exception):
    def __init__(
        self,
        message: str,
        *,
        status_code: int = 400,
        code: str = "bad_request",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code
        self.details = details


def _error_payload(code: str, message: str, details: dict[str, Any] | None = None) -> dict[str, Any]:
    payload: dict[str, Any] = {"error": {"code": code, "message": message}}
    if details is not None:
        payload["error"]["details"] = details
    return payload


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ApiError)
    def handle_api_error(error: ApiError):  # type: ignore[override]
        return jsonify(_error_payload(error.code, error.message, error.details)), error.status_code

    @app.errorhandler(HTTPException)
    def handle_http_error(error: HTTPException):  # type: ignore[override]
        code = (error.name or "http_error").lower().replace(" ", "_")
        return jsonify(_error_payload(code, error.description)), error.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(_error: Exception):  # type: ignore[override]
        return jsonify(_error_payload("internal_server_error", "Internal server error.")), 500

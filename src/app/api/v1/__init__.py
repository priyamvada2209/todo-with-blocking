from flask import Flask

from app.api.v1.todos.controller import todos_bp


def register_v1_routes(app: Flask) -> None:
    app.register_blueprint(todos_bp)

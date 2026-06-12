from flask import Flask

from app.api.v1.auth import bp as auth_bp
from app.api.v1.users import bp as users_bp
from app.api.v1.todos.controller import todos_bp


def register_v1_routes(app: Flask) -> None:
    # Register blueprints without url_prefix override to use their own prefixes
    app.register_blueprint(auth_bp, url_prefix="/api/v1")
    app.register_blueprint(users_bp, url_prefix="/api/v1")
    app.register_blueprint(todos_bp, url_prefix="/api/v1")

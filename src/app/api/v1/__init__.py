from flask import Flask

from app.api.v1.auth import bp as auth_bp
from app.api.v1.users import bp as users_bp
from app.api.v1.todos.controller import todos_bp


def register_v1_routes(app: Flask) -> None:
    # Register blueprints using their own url_prefix definitions
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(todos_bp)

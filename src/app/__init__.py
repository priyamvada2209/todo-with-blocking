import os
from pathlib import Path

from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

from app.api.v1 import register_v1_routes
from app.config import Settings
from app.db import init_db, remove_session
from app.errors import register_error_handlers


def create_app() -> Flask:
    load_dotenv()
    settings = Settings.from_env()

    static_folder = Path(__file__).resolve().parent / "UI" / "dist"
    app = Flask(__name__, static_folder=str(static_folder), static_url_path="")
    
    # CORS configuration: allow credentials for cookie-based authentication
    CORS(
        app,
        supports_credentials=True,
        allow_headers=["Authorization", "Content-Type"],
    )
    
    app.config["JSON_SORT_KEYS"] = False
    app.config["DEBUG"] = settings.debug
    
    # Store settings in app config for access in middleware/utilities
    app.config["SETTINGS"] = settings

    init_db(settings.database_url)
    register_v1_routes(app)
    register_error_handlers(app)

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path: str):
        if path and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, "index.html")

    @app.teardown_appcontext
    def shutdown_session(exception: Exception | None = None) -> None:
        remove_session(exception)

    return app

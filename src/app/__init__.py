from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from app.api.v1 import register_v1_routes
from app.config import Settings
from app.db import init_db, remove_session
from app.errors import register_error_handlers


def create_app() -> Flask:
    load_dotenv()
    settings = Settings.from_env()

    app = Flask(__name__)
    CORS(app)
    app.config["JSON_SORT_KEYS"] = False
    app.config["DEBUG"] = settings.debug

    init_db(settings.database_url)
    register_v1_routes(app)
    register_error_handlers(app)

    @app.teardown_appcontext
    def shutdown_session(exception: Exception | None = None) -> None:
        remove_session(exception)

    return app

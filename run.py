from pathlib import Path
import sys

import os
from dotenv import load_dotenv

load_dotenv()


PROJECT_ROOT = Path(__file__).resolve().parent
SRC_PATH = PROJECT_ROOT / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from app import create_app

app = create_app()

host = os.getenv("HOST")
port = os.getenv("PORT")


if __name__ == "__main__":
    app.run(host=host, port=port, debug=True)

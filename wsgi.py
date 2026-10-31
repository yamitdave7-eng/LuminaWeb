"""Root WSGI entry point for hosting providers."""
import os
import sys
from pathlib import Path

SUB_DIR = Path(__file__).resolve().parent / "Flask-Stack-Webapp-main"
if str(SUB_DIR) not in sys.path:
    sys.path.insert(0, str(SUB_DIR))
os.chdir(SUB_DIR)

from backend import create_app  # noqa: E402

app = create_app()
application = app

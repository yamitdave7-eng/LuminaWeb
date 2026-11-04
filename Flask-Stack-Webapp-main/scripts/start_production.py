"""Apply migrations once, seed admin credentials, then replace this process with the production server."""

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)
os.environ.setdefault("APP_ENV", "production")
subprocess.run([sys.executable, "manage.py", "db", "upgrade"], check=True)

try:
    from backend import create_app
    from database import db
    from database.models import User
    from database.repositories import user_by_email

    app = create_app()
    with app.app_context():
        for email, name in [("sir123@gmail.com", "Sir"), ("yamitdave7@gmail.com", "Dave Yamit")]:
            user = user_by_email(email)
            if not user:
                user = User(email=email, display_name=name, role="admin", active=True)
                db.session.add(user)
            else:
                user.role = "admin"
                user.active = True
            user.set_password("111111111111")
        db.session.commit()
        print("Admin accounts configured successfully.")
except Exception as e:
    print(f"Admin seeding notice: {e}")

os.execvp("gunicorn", ["gunicorn", "--config", "deploy/gunicorn.conf.py", "wsgi:app"])

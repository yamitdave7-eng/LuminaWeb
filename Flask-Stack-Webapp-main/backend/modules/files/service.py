import os
import zipfile
from io import BytesIO

from flask import current_app
from PIL import Image, UnidentifiedImageError
from sqlalchemy import update
from werkzeug.exceptions import Conflict, NotFound
from werkzeug.utils import secure_filename

from backend.common.errors import ValidationError
from database import db
from database.models import Attachment, AuditEvent, User


def store_image(user_id, uploaded):
    """Store an uploaded file (document or image) private to the user account."""
    if not uploaded or not uploaded.filename:
        raise ValidationError({"file": ["Choose a PDF, Word document, text file, or image."]})

    raw = uploaded.read(current_app.config["MAX_IMAGE_BYTES"] + 1)
    if not raw or len(raw) > current_app.config["MAX_IMAGE_BYTES"]:
        raise ValidationError({"file": ["Files must be smaller than 2 MiB."]})

    filename = secure_filename(uploaded.filename)
    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = {
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".doc": "application/msword",
        ".txt": "text/plain",
        ".md": "text/markdown",
        ".markdown": "text/markdown",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
    }

    if ext not in allowed_exts:
        raise ValidationError({"file": [f"Unsupported format '{ext}'. Upload PDF, Word (.docx), Markdown (.md), text, or image (PNG/JPEG/WebP)."]})

    mime = allowed_exts[ext]

    # Format verification
    if ext in {".png", ".jpg", ".jpeg", ".webp"}:
        try:
            with Image.open(BytesIO(raw)) as image:
                fmt = image.format
                if (
                    fmt not in {"PNG", "JPEG", "WEBP"}
                    or image.width * image.height > 16_000_000
                    or getattr(image, "n_frames", 1) != 1
                ):
                    raise ValueError
                image.verify()
        except (ValueError, OSError, UnidentifiedImageError, Image.DecompressionBombError):
            raise ValidationError(
                {"file": ["Use a valid, non-animated PNG, JPEG, or WebP image up to 16 megapixels."]}
            ) from None
    elif ext == ".pdf":
        if not raw.startswith(b"%PDF-"):
            raise ValidationError({"file": ["Uploaded file is not a valid PDF document."]})
    elif ext == ".docx":
        try:
            if not zipfile.is_zipfile(BytesIO(raw)):
                raise ValueError
        except Exception:
            raise ValidationError({"file": ["Uploaded file is not a valid DOCX Word document."]}) from None

    # Check user storage quota atomically
    changed = db.session.execute(
        update(User)
        .where(
            User.id == user_id,
            User.active.is_(True),
            User.storage_bytes + len(raw) <= current_app.config["USER_FILE_QUOTA"],
        )
        .values(storage_bytes=User.storage_bytes + len(raw))
    )
    if changed.rowcount != 1:
        raise ValidationError({"file": ["Your storage quota is full (20 MiB limit). Delete an existing file before adding another."]})

    stem = filename.rsplit(".", 1)[0][:90] or "document"
    final_filename = f"{stem}{ext}"

    attachment = Attachment(
        user_id=user_id,
        filename=final_filename,
        content_type=mime,
        size=len(raw),
        data=raw,
    )
    db.session.add(attachment)
    db.session.add(AuditEvent(user_id=user_id, action="file.uploaded", subject=attachment.filename))
    db.session.commit()
    return attachment


def owned_attachment(user_id, identifier):
    attachment = db.session.scalar(
        db.select(Attachment).where(Attachment.id == identifier, Attachment.user_id == user_id)
    )
    if not attachment:
        raise NotFound("That file is not available to your account.")
    return attachment


def remove_image(user_id, identifier):
    attachment = owned_attachment(user_id, identifier)
    result = db.session.execute(
        update(User)
        .where(User.id == user_id, User.storage_bytes >= attachment.size)
        .values(storage_bytes=User.storage_bytes - attachment.size)
    )
    if result.rowcount != 1:
        raise Conflict("The file list changed. Reload and try again.")
    db.session.add(AuditEvent(user_id=user_id, action="file.deleted", subject=attachment.filename))
    db.session.delete(attachment)
    db.session.commit()

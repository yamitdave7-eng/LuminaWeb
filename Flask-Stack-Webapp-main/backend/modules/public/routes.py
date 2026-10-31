from flask import Blueprint, flash, redirect, render_template, request, url_for, send_from_directory

from backend.config import ROOT
from backend.extensions import limiter
from backend.modules.public.forms import ContactForm
from database import db
from database.models import Inquiry
from database.models.page import Page

bp = Blueprint("public", __name__)


@bp.get("/")
def home():
    """Public landing page with About section, feature showcase, and live preview."""
    try:
        pages = db.session.scalars(
            db.select(Page).where(Page.published.is_(True)).order_by(Page.updated_at.desc()).limit(12)
        ).all()
    except Exception:
        pages = []
    return render_template("public/home.html", pages=pages)


@bp.get("/standalone")
def standalone_preview():
    """Direct standalone prototype preview."""
    return send_from_directory(str(ROOT.parent), "index.html")


@bp.get("/style.css")
def serve_prism_css():
    """Serve style.css for the PRISM web application."""
    return send_from_directory(str(ROOT.parent), "style.css", mimetype="text/css")


@bp.get("/app.js")
def serve_prism_js():
    """Serve app.js for the LuminaEdu web application."""
    return send_from_directory(str(ROOT.parent), "app.js", mimetype="application/javascript")


@bp.get("/images/<path:filename>")
def serve_images(filename):
    """Serve images for the LuminaEdu web application."""
    return send_from_directory(str(ROOT.parent / "images"), filename)


@bp.get("/lumina-portal")
def lumina_portal():
    pages = db.session.scalars(
        db.select(Page).where(Page.published.is_(True)).order_by(Page.updated_at.desc()).limit(12)
    ).all()
    return render_template("public/home.html", pages=pages)


@bp.get("/pages/<slug>")
def page(slug):
    record = db.first_or_404(db.select(Page).where(Page.slug == slug, Page.published.is_(True)))
    return render_template("public/page.html", page=record)


@bp.route("/contact", methods=["GET", "POST"])
@limiter.limit("5 per hour", methods=["POST"])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        db.session.add(
            Inquiry(
                name=form.name.data.strip(), email=form.email.data.strip().casefold(), message=form.message.data.strip()
            )
        )
        db.session.commit()
        flash("Your message was received.", "success")
        return redirect(url_for("public.contact"), code=303)
    return render_template("public/contact.html", form=form), 422 if request.method == "POST" else 200


@bp.get("/privacy")
def privacy():
    return render_template("public/privacy.html")

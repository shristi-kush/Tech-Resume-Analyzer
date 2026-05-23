from flask import Flask
from flask_cors import CORS

from config import CORS_ORIGINS, MAX_CONTENT_LENGTH
from routes.api import api_bp
from services.database import init_db


def create_app():
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

    origins = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]
    CORS(app, resources={r"/api/*": {"origins": origins if origins != ["*"] else "*"}})

    init_db()
    app.register_blueprint(api_bp)

    @app.route("/")
    def index():
        return {
            "name": "AI Resume Analyzer API",
            "version": "1.0.0",
            "docs": "/api/v1/health",
        }

    return app


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=5000, debug=True)

from flask import Flask
from flask_cors import CORS

from config import Config
from db import db, bcrypt, jwt

# Routes
from app.routes.auth       import auth_bp
from app.routes.zones      import zones_bp
from app.routes.alertes    import alertes_bp
from app.routes.pompes     import pompes_bp
from app.routes.capteurs   import capteurs_bp
from app.routes.users      import users_bp
from app.routes.simulation import simulation_bp
from app.routes.logs       import logs_bp
from app.routes.messages   import messages_bp
from app.routes.citizen_alerts import citizen_alerts_bp
# from app.routes.sync       import sync_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

    # Blueprints
    app.register_blueprint(auth_bp,       url_prefix="/auth")
    app.register_blueprint(zones_bp,      url_prefix="/zones")
    app.register_blueprint(alertes_bp,    url_prefix="/alertes")
    app.register_blueprint(pompes_bp,     url_prefix="/pompes")
    app.register_blueprint(capteurs_bp,   url_prefix="/capteurs")
    app.register_blueprint(users_bp,      url_prefix="/users")
    app.register_blueprint(simulation_bp, url_prefix="/simulation")
    app.register_blueprint(logs_bp,       url_prefix="/logs")
    app.register_blueprint(messages_bp,   url_prefix="/messages")
    app.register_blueprint(citizen_alerts_bp, url_prefix="/api/alerts")
    # app.register_blueprint(sync_bp,       url_prefix="/system")

    return app

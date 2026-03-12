from flask import Flask
from app.routes.zones import zones_bp
from app.routes.alertes import alertes_bp

app = Flask(__name__)

app.register_blueprint(zones_bp)
app.register_blueprint(alertes_bp)

if __name__ == "__main__":
    app.run(debug=True)